from __future__ import annotations
import collections, json, random, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path('hearframe-grand-v4/ask')
BANK_PATH=ROOT/'reference-bank-v3.json'
REPORT_PATH=ROOT/'reference-bank-v3-report.json'
PLUS_REPORT=ROOT/'reference-bank-plus500-report.json'
API='https://commons.wikimedia.org/w/api.php'
UA='HearframePrototype/3.5 (incremental speech-video retrieval research; github.com/jamshih/html)'
BASELINE_TOTAL=10_100
TARGET_TOTAL=10_600
TARGET_ADD=500
REQUEST_GAP=.30
_last_request=0.0

# This expansion deliberately concentrates on people speaking in interviews and sports/
# entertainment contexts. Metadata discovery is not treated as word alignment: every
# selected reference still has to pass license, speech and forced-alignment validation.
BUCKETS=[
 ('celebrity-interviews',180,[
   'filetype:video "celebrity interview"','filetype:video "actor interview"','filetype:video "actress interview"',
   'filetype:video "singer interview"','filetype:video "musician interview"','filetype:video "filmmaker interview"',
   'filetype:video "comedian interview"','filetype:video interview']),
 ('sports-stars',150,[
   'filetype:video "athlete interview"','filetype:video "sports interview"','filetype:video "basketball interview"',
   'filetype:video "football interview"','filetype:video "soccer interview"','filetype:video "tennis interview"',
   'filetype:video "Olympic interview"','filetype:video "coach interview"','filetype:video "press conference"']),
 ('entertainment-talk',100,[
   'filetype:video "talk show" actor','filetype:video "talk show" singer','filetype:video celebrity conversation',
   'filetype:video actor Q&A','filetype:video singer Q&A','filetype:video musician Q&A','filetype:video filmmaker Q&A']),
 ('experts-public-figures',45,[
   'filetype:video scientist interview','filetype:video astronaut interview','filetype:video entrepreneur interview',
   'filetype:video CEO interview','filetype:video author interview','filetype:video journalist interview']),
 ('general-speech',25,[
   'filetype:video panel discussion','filetype:video presentation speaker','filetype:video English speech'])
]
PRIORITY={'celebrity-interviews':1.0,'sports-stars':1.0,'entertainment-talk':.98,'experts-public-figures':.92,'general-speech':.72,'fallback':.55}


def api(params,retries=7):
    global _last_request
    params={**params,'format':'json','formatversion':'2','maxlag':'5'}
    body=urllib.parse.urlencode(params).encode(); last=None
    for attempt in range(1,retries+1):
        gap=REQUEST_GAP-(time.monotonic()-_last_request)
        if gap>0: time.sleep(gap)
        try:
            req=urllib.request.Request(API,data=body,headers={'User-Agent':UA,'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded'},method='POST')
            _last_request=time.monotonic()
            with urllib.request.urlopen(req,timeout=75) as r: data=json.load(r)
            if data.get('error',{}).get('code')=='maxlag': raise RuntimeError('mediawiki-maxlag')
            return data
        except urllib.error.HTTPError as e:
            last=e; retry=e.headers.get('Retry-After') if e.headers else None
            if e.code==429: wait=float(retry) if retry and retry.replace('.','',1).isdigit() else min(45,3*(2**(attempt-1)))
            elif e.code in (500,502,503,504): wait=min(30,2*(2**(attempt-1)))
            else: raise
            print(f'Commons HTTP {e.code}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries: break
            time.sleep(wait+random.uniform(.1,.5))
        except Exception as e:
            last=e; wait=min(30,2*(2**(attempt-1)))
            print(f'Commons transient {type(e).__name__}: {e}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries: break
            time.sleep(wait+random.uniform(.1,.5))
    raise last or RuntimeError('Commons API failed')


def generator_pages(query,continuation=None):
    p={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':'6','gsrlimit':'500','gsrsort':'relevance','prop':'imageinfo','iiprop':'url|size|mime|mediatype'}
    if continuation: p.update(continuation)
    data=api(p)
    return data.get('query',{}).get('pages',[]),data.get('continue')


def record_from_page(page,bucket,query):
    title=page.get('title'); ii=(page.get('imageinfo') or [{}])[0]; source_url=ii.get('url')
    if not title or ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/') or not source_url: return None
    return {
      'title':title,
      'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':/()_-'),
      'sourceUrl':source_url,'mime':ii.get('mime'),'bytes':ii.get('size'),'width':ii.get('width'),'height':ii.get('height'),
      'discoveryBucket':bucket,'discoveryQuery':query,'speechPriority':PRIORITY.get(bucket,.5),
      'catalogStatus':'video-url-validated','licenseStatus':'validate-on-use','speechValidationStatus':'pending-lazy-index',
      'alignmentStatus':'pending-lazy-index','wordBoundaryStatus':'not-applicable-until-selected','expansionBatch':'plus500-v1'
    }


def ref_number(v):
    m=re.search(r'(\d+)$',str(v.get('referenceId') or ''))
    return int(m.group(1)) if m else 0


bank=json.loads(BANK_PATH.read_text())
videos=list(bank.get('videos') or [])
start_count=len(videos)
if start_count<BASELINE_TOTAL:
    raise SystemExit(f'Bank has only {start_count} references; expected at least {BASELINE_TOTAL} before +500 expansion')
if start_count>TARGET_TOTAL:
    raise SystemExit(f'Bank already exceeds the scoped target ({start_count}>{TARGET_TOTAL}); refusing to add unrelated extra references')

needed=TARGET_TOTAL-start_count
if needed==0:
    report={'version':'reference-bank-plus500-v1-report','baseCount':BASELINE_TOTAL,'startCount':start_count,'requestedAdd':TARGET_ADD,'addedThisRun':0,'totalCount':start_count,'targetTotal':TARGET_TOTAL,'pass':True,'note':'Incremental +500 bank already present; no duplicate expansion performed.'}
    PLUS_REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
    print(json.dumps(report,indent=2,ensure_ascii=False)); raise SystemExit(0)

seen_titles={v.get('title') for v in videos if v.get('title')}
seen_urls={v.get('sourceUrl') for v in videos if v.get('sourceUrl')}
next_ref=max([ref_number(v) for v in videos] or [len(videos)])+1
new=[]; bucket_counts=collections.Counter(); query_counts=collections.Counter(); rejected=collections.Counter()


def add_page(page,bucket,query):
    global next_ref
    title=page.get('title')
    if not title or title in seen_titles: return False
    rec=record_from_page(page,bucket,query)
    if not rec:
        seen_titles.add(title); rejected['not-direct-video']+=1; return False
    if rec['sourceUrl'] in seen_urls:
        seen_titles.add(title); rejected['duplicate-media-url']+=1; return False
    seen_titles.add(title); seen_urls.add(rec['sourceUrl'])
    rec['referenceId']=f'ref-{next_ref:05d}'; next_ref+=1
    new.append(rec); bucket_counts[bucket]+=1; query_counts[query]+=1
    return True


# Scale quotas down only if a partial prior +500 run already committed some entries.
quota_total=sum(q for _,q,_ in BUCKETS)
remaining=needed
for idx,(bucket,quota,queries) in enumerate(BUCKETS):
    if remaining<=0: break
    if idx==len(BUCKETS)-1:
        bucket_target=remaining
    else:
        bucket_target=min(remaining,round(needed*quota/quota_total))
    target_len=len(new)+bucket_target
    states={q:None for q in queries}; exhausted=set()
    while len(new)<target_len and len(exhausted)<len(queries):
        progressed=False
        for q in queries:
            if q in exhausted or len(new)>=target_len: continue
            pages,cont=generator_pages(q,states[q]); states[q]=cont; before=len(new)
            for page in pages:
                add_page(page,bucket,q)
                if len(new)>=target_len: break
            progressed=progressed or len(new)>before
            if not cont: exhausted.add(q)
        if not progressed and len(exhausted)==len(queries): break
    remaining=needed-len(new)
    print(bucket,bucket_counts[bucket],'target',bucket_target,'new total',len(new),flush=True)

# Fail-safe fill remains speech-oriented rather than generic random video.
fallback_queries=['filetype:video interview speaker','filetype:video press conference','filetype:video panel discussion','filetype:video speech English']
states={q:None for q in fallback_queries}; exhausted=set()
while len(new)<needed and len(exhausted)<len(fallback_queries):
    progressed=False
    for q in fallback_queries:
        if q in exhausted or len(new)>=needed: continue
        pages,cont=generator_pages(q,states[q]); states[q]=cont; before=len(new)
        for page in pages:
            add_page(page,'fallback',q)
            if len(new)>=needed: break
        progressed=progressed or len(new)>before
        if not cont: exhausted.add(q)
    if not progressed and len(exhausted)==len(fallback_queries): break

if len(new)!=needed:
    raise SystemExit(f'Only discovered {len(new)} of {needed} required incremental references; refusing to publish a partial +500 bank')

combined=videos+new
if len(combined)!=TARGET_TOTAL: raise SystemExit(f'count mismatch {len(combined)} != {TARGET_TOTAL}')
if len({v.get('title') for v in combined})!=len(combined): raise SystemExit('duplicate title in expanded bank')
if len({v.get('sourceUrl') for v in combined})!=len(combined): raise SystemExit('duplicate media URL in expanded bank')

bank['version']='reference-bank-v3.5'
bank['newReferenceCount']=TARGET_TOTAL-int(bank.get('legacyReferenceCount') or 100)
bank['count']=TARGET_TOTAL
bank['selection']='Existing verified/retrieval bank plus 500 incremental people-speaking references emphasizing celebrity interviews, sports stars, entertainment conversations, experts and speech.'
bank['retrievalPolicy']='sentence > phrase > AI-refined word; isolated words are fallback-only and must pass the hardened boundary critic before rendering'
bank['expansion']={'version':'plus500-v1','baseCount':start_count,'added':len(new),'targetTotal':TARGET_TOTAL,'speechValidation':'lazy-on-selection','licenseValidation':'on-selection','alignment':'lazy-on-selection'}
bank['videos']=combined
BANK_PATH.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))

samples={b:[v['title'] for v in new if v.get('discoveryBucket')==b][:8] for b in [x[0] for x in BUCKETS]+['fallback']}
report={
 'version':'reference-bank-plus500-v1-report','baseCount':start_count,'requestedAdd':TARGET_ADD,'addedThisRun':len(new),'totalCount':len(combined),'targetTotal':TARGET_TOTAL,
 'bucketCounts':dict(bucket_counts),'queryCounts':dict(query_counts),'sampleTitles':samples,'rejectedDuringDiscovery':sum(rejected.values()),'rejectionReasons':dict(rejected),
 'uniqueTitles':len({v.get('title') for v in combined}),'uniqueSourceUrls':len({v.get('sourceUrl') for v in combined}),
 'policy':{'priority':'celebrity interviews + sports stars + entertainment speech','license':'validate on use','speech':'validate before indexing','alignment':'forced-align only after selection','render':'sentence > phrase > hardened AI-refined word'},
 'pass':len(new)==needed and len(combined)==TARGET_TOTAL
}
PLUS_REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))

# Keep the canonical report honest about the current bank total while preserving its
# original discovery details.
canonical={}
if REPORT_PATH.exists(): canonical=json.loads(REPORT_PATH.read_text())
canonical.update({'version':'reference-bank-v3.5-report','legacyCount':int(bank.get('legacyReferenceCount') or 100),'newCount':TARGET_TOTAL-int(bank.get('legacyReferenceCount') or 100),'totalCount':TARGET_TOTAL,'targetNew':TARGET_TOTAL-int(bank.get('legacyReferenceCount') or 100),'plus500Report':'reference-bank-plus500-report.json','alignmentStatus':'Original aligned sample plus lazy alignment for retrieval references; isolated words require hardened AI boundary refinement before render.','pass':True})
REPORT_PATH.write_text(json.dumps(canonical,indent=2,ensure_ascii=False))
print(json.dumps(report,indent=2,ensure_ascii=False))

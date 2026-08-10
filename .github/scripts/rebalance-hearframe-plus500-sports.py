from __future__ import annotations
import collections, json, random, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path('hearframe-grand-v4/ask')
BANK_PATH=ROOT/'reference-bank-v3.json'
REPORT_PATH=ROOT/'reference-bank-v3-report.json'
PLUS_REPORT=ROOT/'reference-bank-plus500-report.json'
API='https://commons.wikimedia.org/w/api.php'
UA='HearframePrototype/3.5.1 (sports-focused incremental speech-video retrieval; github.com/jamshih/html)'
TARGET_TOTAL=10_600
TARGET_PLUS=500
MIN_INCREMENTAL_SPORTS=80
REQUEST_GAP=.30
_last_request=0.0

SPORT_QUERIES=[
 'filetype:video "Warrior Games"',
 'filetype:video "Invictus Games"',
 'filetype:video "Paralympic Games"',
 'filetype:video "Olympic athlete"',
 'filetype:video "athlete profile"',
 'filetype:video "player interview"',
 'filetype:video "sports press conference"',
 'filetype:video "post game interview"',
 'filetype:video "post-game interview"',
 'filetype:video "football player interview"',
 'filetype:video "basketball player interview"',
 'filetype:video "soccer player interview"',
 'filetype:video "tennis player interview"',
 'filetype:video "coach press conference"',
 'filetype:video athlete DVIDS',
 'filetype:video sports DVIDS',
]


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


def ref_num(v):
    m=re.search(r'(\d+)$',str(v.get('referenceId') or ''))
    return int(m.group(1)) if m else 0


def make_record(page,query,reference_id):
    title=page.get('title'); ii=(page.get('imageinfo') or [{}])[0]; source_url=ii.get('url')
    if not title or ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/') or not source_url: return None
    return {
      'referenceId':reference_id,'title':title,
      'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':/()_-'),
      'sourceUrl':source_url,'mime':ii.get('mime'),'bytes':ii.get('size'),'width':ii.get('width'),'height':ii.get('height'),
      'discoveryBucket':'sports-stars','discoveryQuery':query,'speechPriority':1.0,
      'catalogStatus':'video-url-validated','licenseStatus':'validate-on-use','speechValidationStatus':'pending-lazy-index',
      'alignmentStatus':'pending-lazy-index','wordBoundaryStatus':'not-applicable-until-selected','expansionBatch':'plus500-v1',
      'rebalanceBatch':'sports-v1'
    }


bank=json.loads(BANK_PATH.read_text())
videos=list(bank.get('videos') or [])
if len(videos)!=TARGET_TOTAL: raise SystemExit(f'Expected {TARGET_TOTAL} references before rebalance, found {len(videos)}')
plus=[v for v in videos if v.get('expansionBatch')=='plus500-v1']
if len(plus)!=TARGET_PLUS: raise SystemExit(f'Expected exactly {TARGET_PLUS} plus500-v1 entries, found {len(plus)}')
current_sports=sum(v.get('discoveryBucket')=='sports-stars' for v in plus)
need=max(0,MIN_INCREMENTAL_SPORTS-current_sports)
if need==0:
    print(json.dumps({'pass':True,'note':'sports minimum already satisfied','incrementalSports':current_sports,'totalCount':len(videos)},indent=2)); raise SystemExit(0)

# Replace only lower-priority entries from this same +500 batch. Existing 10K references
# and all non-Hearframe files remain untouched. General speech is removed first.
removal_priority={'general-speech':0,'fallback':1,'experts-public-figures':2,'entertainment-talk':3,'celebrity-interviews':4,'sports-stars':99}
removable=sorted([v for v in plus if v.get('discoveryBucket')!='sports-stars'],key=lambda v:(removal_priority.get(v.get('discoveryBucket'),50),-ref_num(v)))
if len(removable)<need: raise SystemExit(f'Not enough +500 entries available to rebalance {need} sports slots')
slots=removable[:need]
slot_ids=[v['referenceId'] for v in slots]
slot_id_set=set(slot_ids)
kept=[v for v in videos if v.get('referenceId') not in slot_id_set]
seen_titles={v.get('title') for v in kept if v.get('title')}
seen_urls={v.get('sourceUrl') for v in kept if v.get('sourceUrl')}

found=[]; rejected=collections.Counter(); query_counts=collections.Counter(); states={q:None for q in SPORT_QUERIES}; exhausted=set()
for q in SPORT_QUERIES:
    if len(found)>=need: break
    while len(found)<need and q not in exhausted:
        pages,cont=generator_pages(q,states[q]); states[q]=cont; before=len(found)
        for page in pages:
            title=page.get('title'); ii=(page.get('imageinfo') or [{}])[0]; source_url=ii.get('url')
            if not title or title in seen_titles: continue
            if ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/') or not source_url:
                rejected['not-direct-video']+=1; seen_titles.add(title); continue
            if source_url in seen_urls:
                rejected['duplicate-media-url']+=1; seen_titles.add(title); continue
            reference_id=slot_ids[len(found)]
            rec=make_record(page,q,reference_id)
            if not rec: continue
            seen_titles.add(title); seen_urls.add(source_url); found.append(rec); query_counts[q]+=1
            if len(found)>=need: break
        if not cont: exhausted.add(q)
        if len(found)==before and not cont: break

if len(found)!=need:
    raise SystemExit(f'Only found {len(found)} fresh sports references for {need} replacement slots; bank left unchanged')

combined=kept+found
combined.sort(key=ref_num)
if len(combined)!=TARGET_TOTAL: raise SystemExit('rebalance changed total count')
if len({v.get('title') for v in combined})!=TARGET_TOTAL: raise SystemExit('duplicate title after rebalance')
if len({v.get('sourceUrl') for v in combined})!=TARGET_TOTAL: raise SystemExit('duplicate media URL after rebalance')
plus_after=[v for v in combined if v.get('expansionBatch')=='plus500-v1']
bucket_counts=collections.Counter(v.get('discoveryBucket','unknown') for v in plus_after)
if bucket_counts['sports-stars']<MIN_INCREMENTAL_SPORTS: raise SystemExit('sports minimum still not met after replacement')

bank['version']='reference-bank-v3.5.1'
bank['count']=TARGET_TOTAL
bank['selection']='Existing bank plus 500 incremental people-speaking references, rebalanced to guarantee a meaningful sports-focused subset alongside interviews, entertainment, experts and speech.'
bank['expansion']={**(bank.get('expansion') or {}),'version':'plus500-v1.1','sportsMinimum':MIN_INCREMENTAL_SPORTS,'sportsActual':bucket_counts['sports-stars'],'rebalancedSlots':need}
bank['videos']=combined
BANK_PATH.write_text(json.dumps(bank,ensure_ascii=False,separators=(',',':')))

report={
 'version':'reference-bank-plus500-v1.1-report','baseCount':TARGET_TOTAL-TARGET_PLUS,'requestedAdd':TARGET_PLUS,'totalCount':TARGET_TOTAL,'targetTotal':TARGET_TOTAL,
 'incrementalCount':len(plus_after),'bucketCounts':dict(bucket_counts),'sportsMinimum':MIN_INCREMENTAL_SPORTS,'sportsActual':bucket_counts['sports-stars'],
 'replacedEntries':need,'sportsQueryCounts':dict(query_counts),'sportsSamples':[v['title'] for v in plus_after if v.get('discoveryBucket')=='sports-stars'][:15],
 'uniqueTitles':len({v.get('title') for v in combined}),'uniqueSourceUrls':len({v.get('sourceUrl') for v in combined}),
 'policy':{'priority':'interviews + sports stars + entertainment speech','license':'validate on use','speech':'validate before indexing','alignment':'forced-align only after selection','render':'sentence > phrase > hardened AI-refined word'},
 'pass':len(combined)==TARGET_TOTAL and len(plus_after)==TARGET_PLUS and bucket_counts['sports-stars']>=MIN_INCREMENTAL_SPORTS
}
PLUS_REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
canonical=json.loads(REPORT_PATH.read_text()) if REPORT_PATH.exists() else {}
canonical.update({'version':'reference-bank-v3.5.1-report','totalCount':TARGET_TOTAL,'plus500Report':'reference-bank-plus500-report.json','plus500SportsMinimum':MIN_INCREMENTAL_SPORTS,'plus500SportsActual':bucket_counts['sports-stars'],'pass':True})
REPORT_PATH.write_text(json.dumps(canonical,indent=2,ensure_ascii=False))
print(json.dumps(report,indent=2,ensure_ascii=False))

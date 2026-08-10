from __future__ import annotations
import collections, html, json, random, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path('hearframe-grand-v4/ask')
BASE=json.loads((ROOT/'reference-videos.json').read_text())
OUT=ROOT/'reference-bank-v3.json'; REPORT=ROOT/'reference-bank-v3-report.json'
API='https://commons.wikimedia.org/w/api.php'
UA='HearframePrototype/3.3 (licensed speech-video corpus research; github.com/jamshih/html)'
TARGET_NEW=10_000; TARGET_TOTAL=len(BASE.get('videos',[]))+TARGET_NEW
REQUEST_GAP=.42; _last_request=0.0

BUCKETS=[
 ('interviews',2600,['filetype:video interview','filetype:video "press conference"','filetype:video "post-match"','filetype:video "Q&A"','filetype:video "talk show"','filetype:video conversation']),
 ('sports',2200,['filetype:video athlete','filetype:video basketball','filetype:video football','filetype:video soccer','filetype:video tennis','filetype:video baseball','filetype:video boxing','filetype:video Olympic','filetype:video swimmer','filetype:video cyclist','filetype:video coach']),
 ('entertainment',2000,['filetype:video actor','filetype:video actress','filetype:video singer','filetype:video musician','filetype:video rapper','filetype:video comedian','filetype:video filmmaker','filetype:video celebrity']),
 ('experts-public-figures',1500,['filetype:video scientist','filetype:video astronaut','filetype:video entrepreneur','filetype:video CEO','filetype:video author','filetype:video professor','filetype:video doctor','filetype:video journalist']),
 ('general-speech',1700,['filetype:video speech','filetype:video panel','filetype:video presentation','filetype:video English','filetype:video people speaking'])
]
PRIORITY={'interviews':1.0,'sports':.96,'entertainment':.96,'experts-public-figures':.9,'general-speech':.7,'fallback':.5}

def api(params,retries=7):
    global _last_request
    params={**params,'format':'json','formatversion':'2','maxlag':'5'}
    encoded=urllib.parse.urlencode(params).encode(); last=None
    for attempt in range(1,retries+1):
        gap=REQUEST_GAP-(time.monotonic()-_last_request)
        if gap>0: time.sleep(gap)
        try:
            req=urllib.request.Request(API,data=encoded,headers={'User-Agent':UA,'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded'},method='POST')
            _last_request=time.monotonic()
            with urllib.request.urlopen(req,timeout=90) as r: data=json.load(r)
            if data.get('error',{}).get('code')=='maxlag': raise RuntimeError('mediawiki-maxlag')
            return data
        except urllib.error.HTTPError as e:
            last=e; retry=e.headers.get('Retry-After') if e.headers else None
            if e.code==429: wait=float(retry) if retry and retry.replace('.','',1).isdigit() else min(60,3*(2**(attempt-1)))
            elif e.code in (500,502,503,504): wait=min(40,2*(2**(attempt-1)))
            else: raise
            print(f'Commons HTTP {e.code}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries:break
            time.sleep(wait+random.uniform(.1,.7))
        except Exception as e:
            last=e; wait=min(40,2*(2**(attempt-1)))
            print(f'Commons transient {type(e).__name__}: {e}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries:break
            time.sleep(wait+random.uniform(.1,.7))
    raise last or RuntimeError('Commons API failed')

def strip_html(s):
    if not s:return ''
    return ' '.join(html.unescape(re.sub(r'<[^>]+>',' ',s)).replace('\n',' ').split())

def generator_pages(query,continuation=None):
    p={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':'6','gsrlimit':'500','gsrsort':'relevance','prop':'imageinfo','iiprop':'url|size|mime|mediatype|extmetadata'}
    if continuation:p.update(continuation)
    data=api(p)
    return data.get('query',{}).get('pages',[]),data.get('continue')

def record_from_page(page,bucket,query):
    title=page.get('title'); ii=(page.get('imageinfo') or [{}])[0]
    if not title or ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/'):return None,'not-video'
    meta=ii.get('extmetadata') or {}; mv=lambda k:(meta.get(k) or {}).get('value','')
    license_name=strip_html(mv('LicenseShortName') or mv('UsageTerms')); source_url=ii.get('url')
    if not license_name or not source_url:return None,'missing-license-or-url'
    return {
      'title':title,'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':/()_-'),
      'sourceUrl':source_url,'mime':ii.get('mime'),'bytes':ii.get('size'),'width':ii.get('width'),'height':ii.get('height'),
      'license':license_name,'licenseUrl':strip_html(mv('LicenseUrl')),'artist':strip_html(mv('Artist'))[:700],
      'credit':strip_html(mv('Credit'))[:700],'description':strip_html(mv('ImageDescription'))[:1000],
      'discoveryBucket':bucket,'discoveryQuery':query,'speechPriority':PRIORITY.get(bucket,.5),
      'catalogStatus':'metadata-validated','alignmentStatus':'pending-lazy-index','originPreflight':'deferred-to-indexer'
    },None

seen_titles={v.get('title') for v in BASE.get('videos',[]) if v.get('title')}; seen_urls={v.get('sourceUrl') for v in BASE.get('videos',[]) if v.get('sourceUrl')}
new=[]; rejected=collections.Counter(); bucket_counts=collections.Counter(); query_counts=collections.Counter()

def add_page(page,bucket,query):
    title=page.get('title')
    if not title or title in seen_titles:return False
    rec,reason=record_from_page(page,bucket,query)
    if not rec:
        rejected[reason]+=1;seen_titles.add(title);return False
    if rec['sourceUrl'] in seen_urls:
        rejected['duplicate-media-url']+=1;seen_titles.add(title);return False
    seen_titles.add(title);seen_urls.add(rec['sourceUrl'])
    rec['referenceId']=f'ref-{len(BASE.get("videos",[]))+len(new)+1:05d}'
    new.append(rec);bucket_counts[bucket]+=1;query_counts[query]+=1;return True

# Round-robin within each content family so celebrity/sports/interview material remains
# prominent rather than allowing one broad search phrase to dominate the bank.
for bucket,quota,queries in BUCKETS:
    target=min(TARGET_NEW,len(new)+quota);states={q:None for q in queries};exhausted=set()
    while len(new)<target and len(exhausted)<len(queries):
        progressed=False
        for q in queries:
            if q in exhausted or len(new)>=target:continue
            pages,cont=generator_pages(q,states[q]);states[q]=cont
            before=len(new)
            for page in pages:
                add_page(page,bucket,q)
                if len(new)>=target:break
            progressed=progressed or len(new)>before
            if not cont:exhausted.add(q)
        if not progressed and len(exhausted)==len(queries):break
    print(bucket,bucket_counts[bucket],'target',quota,'total',len(new),flush=True)

# Any query overlap/shortfall is filled with the Commons-wide video pool. These remain
# lower-priority retrieval candidates and never overwrite the higher-priority buckets.
cont=None
while len(new)<TARGET_NEW:
    pages,cont=generator_pages('filetype:video',cont)
    before=len(new)
    for page in pages:
        add_page(page,'fallback','filetype:video')
        if len(new)>=TARGET_NEW:break
    print('fallback total',len(new),flush=True)
    if not cont and len(new)<TARGET_NEW:raise SystemExit(f'Commons generic video search exhausted at {len(new)} new valid videos')
    if len(new)==before and not cont:raise SystemExit('Commons fallback made no progress')

new=new[:TARGET_NEW];combined=list(BASE.get('videos',[]))+new
if len(new)!=TARGET_NEW or len(combined)!=TARGET_TOTAL:raise SystemExit(f'count mismatch new={len(new)} total={len(combined)}')
if len({v['title'] for v in combined})!=len(combined):raise SystemExit('duplicate title in combined bank')
if len({v['sourceUrl'] for v in combined})!=len(combined):raise SystemExit('duplicate media URL in combined bank')
licenses=collections.Counter(v.get('license') for v in new)
samples={b:[v['title'] for v in new if v.get('discoveryBucket')==b][:8] for b in ['interviews','sports','entertainment','experts-public-figures','general-speech','fallback']}
payload={'version':'reference-bank-v3','source':'Wikimedia Commons','legacyReferenceCount':len(BASE.get('videos',[])),'newReferenceCount':len(new),'count':len(combined),'selection':'Legacy verified 100 plus 10,000 additional Commons video files metadata-validated from interview, sports, entertainment, expert/public-figure and general-speech discovery pools.','retrievalPolicy':'Prefer intact sentence/phrase clips. If a standalone word is required, forced-align it then pass its actual rendered candidate windows through the Gemini audio precision critic before rendering.','alignmentStatus':'The original 100-video sample corpus is aligned/indexed. The additional 10,000 are a metadata-validated retrieval bank and are aligned lazily when selected; they are not falsely labeled as already word-aligned.','videos':combined}
OUT.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
report={'version':'reference-bank-v3-report','legacyCount':len(BASE.get('videos',[])),'newCount':len(new),'totalCount':len(combined),'targetNew':TARGET_NEW,'metadataValidatedNew':len(new),'alignmentStatus':payload['alignmentStatus'],'bucketCounts':dict(bucket_counts),'queryCounts':dict(query_counts),'sampleTitles':samples,'topLicenses':licenses.most_common(20),'rejectedDuringMetadata':sum(rejected.values()),'rejectionReasons':dict(rejected),'uniqueTitles':len({v['title'] for v in combined}),'uniqueSourceUrls':len({v['sourceUrl'] for v in combined}),'pass':len(new)==TARGET_NEW and len(combined)==TARGET_TOTAL}
REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps(report,indent=2,ensure_ascii=False))

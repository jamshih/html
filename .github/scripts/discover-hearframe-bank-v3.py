from __future__ import annotations
import collections, json, random, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path('hearframe-grand-v4/ask')
BASE=json.loads((ROOT/'reference-videos.json').read_text())
OUT=ROOT/'reference-bank-v3.json'; REPORT=ROOT/'reference-bank-v3-report.json'
API='https://commons.wikimedia.org/w/api.php'
UA='HearframePrototype/3.4 (speech-video retrieval research; github.com/jamshih/html)'
TARGET_NEW=10_000; TARGET_TOTAL=len(BASE.get('videos',[]))+TARGET_NEW
REQUEST_GAP=.28; _last_request=0.0

BUCKETS=[
 ('interviews',2600,['filetype:video interview','filetype:video "press conference"','filetype:video "post-match"','filetype:video "Q&A"','filetype:video "talk show"','filetype:video conversation']),
 ('sports',2200,['filetype:video athlete','filetype:video basketball','filetype:video football','filetype:video soccer','filetype:video tennis','filetype:video baseball','filetype:video boxing','filetype:video Olympic','filetype:video coach']),
 ('entertainment',2000,['filetype:video actor','filetype:video actress','filetype:video singer','filetype:video musician','filetype:video rapper','filetype:video comedian','filetype:video filmmaker','filetype:video celebrity']),
 ('experts-public-figures',1500,['filetype:video scientist','filetype:video astronaut','filetype:video entrepreneur','filetype:video CEO','filetype:video author','filetype:video professor','filetype:video doctor','filetype:video journalist']),
 ('general-speech',1700,['filetype:video speech','filetype:video panel','filetype:video presentation','filetype:video English','filetype:video people speaking'])
]
PRIORITY={'interviews':1.0,'sports':.96,'entertainment':.96,'experts-public-figures':.9,'general-speech':.7,'fallback':.5}

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
            if attempt==retries:break
            time.sleep(wait+random.uniform(.1,.5))
        except Exception as e:
            last=e; wait=min(30,2*(2**(attempt-1)))
            print(f'Commons transient {type(e).__name__}: {e}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries:break
            time.sleep(wait+random.uniform(.1,.5))
    raise last or RuntimeError('Commons API failed')

def generator_pages(query,continuation=None):
    p={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':'6','gsrlimit':'500','gsrsort':'relevance','prop':'imageinfo','iiprop':'url|size|mime|mediatype'}
    if continuation:p.update(continuation)
    data=api(p)
    return data.get('query',{}).get('pages',[]),data.get('continue')

def record_from_page(page,bucket,query):
    title=page.get('title'); ii=(page.get('imageinfo') or [{}])[0]; source_url=ii.get('url')
    if not title or ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/') or not source_url:return None
    return {'title':title,'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':/()_-'),'sourceUrl':source_url,'mime':ii.get('mime'),'bytes':ii.get('size'),'width':ii.get('width'),'height':ii.get('height'),'discoveryBucket':bucket,'discoveryQuery':query,'speechPriority':PRIORITY.get(bucket,.5),'catalogStatus':'video-url-validated','licenseStatus':'validate-on-use','alignmentStatus':'pending-lazy-index'}

seen_titles={v.get('title') for v in BASE.get('videos',[]) if v.get('title')};seen_urls={v.get('sourceUrl') for v in BASE.get('videos',[]) if v.get('sourceUrl')}
new=[];bucket_counts=collections.Counter();query_counts=collections.Counter();rejected=collections.Counter()
def add_page(page,bucket,query):
    title=page.get('title')
    if not title or title in seen_titles:return False
    rec=record_from_page(page,bucket,query)
    if not rec:seen_titles.add(title);rejected['not-direct-video']+=1;return False
    if rec['sourceUrl'] in seen_urls:seen_titles.add(title);rejected['duplicate-media-url']+=1;return False
    seen_titles.add(title);seen_urls.add(rec['sourceUrl']);rec['referenceId']=f'ref-{len(BASE.get("videos",[]))+len(new)+1:05d}';new.append(rec);bucket_counts[bucket]+=1;query_counts[query]+=1;return True

for bucket,quota,queries in BUCKETS:
    target=min(TARGET_NEW,len(new)+quota);states={q:None for q in queries};exhausted=set()
    while len(new)<target and len(exhausted)<len(queries):
        progressed=False
        for q in queries:
            if q in exhausted or len(new)>=target:continue
            pages,cont=generator_pages(q,states[q]);states[q]=cont;before=len(new)
            for page in pages:
                add_page(page,bucket,q)
                if len(new)>=target:break
            progressed=progressed or len(new)>before
            if not cont:exhausted.add(q)
        if not progressed and len(exhausted)==len(queries):break
    print(bucket,bucket_counts[bucket],'requested',quota,'bank total',len(new),flush=True)

cont=None
while len(new)<TARGET_NEW:
    pages,cont=generator_pages('filetype:video',cont);before=len(new)
    for page in pages:
        add_page(page,'fallback','filetype:video')
        if len(new)>=TARGET_NEW:break
    print('fallback bank total',len(new),flush=True)
    if not cont and len(new)<TARGET_NEW:raise SystemExit(f'Commons generic video search exhausted at {len(new)}')
    if len(new)==before and not cont:raise SystemExit('Commons fallback made no progress')

new=new[:TARGET_NEW];combined=list(BASE.get('videos',[]))+new
if len(new)!=TARGET_NEW or len(combined)!=TARGET_TOTAL:raise SystemExit(f'count mismatch new={len(new)} total={len(combined)}')
if len({v['title'] for v in combined})!=len(combined):raise SystemExit('duplicate title')
if len({v['sourceUrl'] for v in combined})!=len(combined):raise SystemExit('duplicate media url')
samples={b:[v['title'] for v in new if v.get('discoveryBucket')==b][:10] for b in ['interviews','sports','entertainment','experts-public-figures','general-speech','fallback']}
alignment='Original 100 reference sample is WhisperX/word indexed. New 10,000 are direct-video retrieval references and are speech-detected/forced-aligned lazily when selected. Any isolated word must then pass Gemini audio-boundary refinement before rendering.'
license_policy='Because the 10K bank is only discovery metadata, license/attribution is fetched and validated from the Commons file page at selection time before a clip is eligible for production rendering.'
payload={'version':'reference-bank-v3.4','source':'Wikimedia Commons','legacyReferenceCount':len(BASE.get('videos',[])),'newReferenceCount':len(new),'count':len(combined),'retrievalPolicy':'sentence > phrase > AI-refined word','alignmentStatus':alignment,'licensePolicy':license_policy,'videos':combined}
OUT.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')))
report={'version':'reference-bank-v3.4-report','legacyCount':len(BASE.get('videos',[])),'newCount':len(new),'totalCount':len(combined),'targetNew':TARGET_NEW,'directVideoUrlValidatedNew':len(new),'bucketCounts':dict(bucket_counts),'queryCounts':dict(query_counts),'sampleTitles':samples,'rejectedDuringDiscovery':sum(rejected.values()),'rejectionReasons':dict(rejected),'uniqueTitles':len({v['title'] for v in combined}),'uniqueSourceUrls':len({v['sourceUrl'] for v in combined}),'alignmentStatus':alignment,'licensePolicy':license_policy,'pass':len(new)==TARGET_NEW and len(combined)==TARGET_TOTAL}
REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps(report,indent=2,ensure_ascii=False))

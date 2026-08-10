from __future__ import annotations
import collections, html, json, random, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path('hearframe-grand-v4/ask')
BASE=json.loads((ROOT/'reference-videos.json').read_text())
OUT=ROOT/'reference-bank-v3.json'
REPORT=ROOT/'reference-bank-v3-report.json'
API='https://commons.wikimedia.org/w/api.php'
UA='HearframePrototype/3.1 (licensed speech-video corpus research; github.com/jamshih/html)'
TARGET_NEW=10_000
TARGET_TOTAL=len(BASE.get('videos',[]))+TARGET_NEW
REQUEST_GAP=.38
_last_request=0.0

BUCKETS=[
 ('interviews',2600,[
   'filetype:video interview','filetype:video "press conference"','filetype:video "post-match"',
   'filetype:video "post match"','filetype:video "Q&A"','filetype:video "talk show"','filetype:video conversation']),
 ('sports',2200,[
   'filetype:video athlete','filetype:video basketball','filetype:video football','filetype:video soccer',
   'filetype:video tennis','filetype:video baseball','filetype:video boxing','filetype:video Olympic',
   'filetype:video swimmer','filetype:video cyclist','filetype:video coach']),
 ('entertainment',2000,[
   'filetype:video actor','filetype:video actress','filetype:video singer','filetype:video musician',
   'filetype:video rapper','filetype:video comedian','filetype:video filmmaker','filetype:video celebrity']),
 ('experts-public-figures',1500,[
   'filetype:video scientist','filetype:video astronaut','filetype:video entrepreneur','filetype:video CEO',
   'filetype:video author','filetype:video professor','filetype:video doctor','filetype:video journalist']),
 ('general-speech',1700,[
   'filetype:video speech','filetype:video panel','filetype:video presentation','filetype:video English',
   'filetype:video people speaking'])
]
PRIORITY={'interviews':1.0,'sports':.96,'entertainment':.96,'experts-public-figures':.9,'general-speech':.7,'fallback':.5}

def api(params,retries=8):
    global _last_request
    params={**params,'format':'json','formatversion':'2','maxlag':'5'}
    url=API+'?'+urllib.parse.urlencode(params)
    last=None
    for attempt in range(1,retries+1):
        gap=REQUEST_GAP-(time.monotonic()-_last_request)
        if gap>0: time.sleep(gap)
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
            _last_request=time.monotonic()
            with urllib.request.urlopen(req,timeout=75) as r:
                data=json.load(r)
            if isinstance(data,dict) and data.get('error',{}).get('code')=='maxlag':
                raise RuntimeError('mediawiki-maxlag')
            return data
        except urllib.error.HTTPError as e:
            last=e
            retry=e.headers.get('Retry-After') if e.headers else None
            if e.code==429:
                wait=float(retry) if retry and retry.replace('.','',1).isdigit() else min(75,4*(2**(attempt-1)))
            elif e.code in (500,502,503,504):
                wait=min(45,2*(2**(attempt-1)))
            else:
                raise
            print(f'Commons HTTP {e.code}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries: break
            time.sleep(wait+random.uniform(.1,.8))
        except Exception as e:
            last=e
            wait=min(45,2*(2**(attempt-1)))
            print(f'Commons API transient {type(e).__name__}: {e}; retry {attempt}/{retries} in {wait:.1f}s',flush=True)
            if attempt==retries: break
            time.sleep(wait+random.uniform(.1,.8))
    raise last or RuntimeError('Commons API failed')

def strip_html(s):
    if not s:return ''
    return ' '.join(html.unescape(re.sub(r'<[^>]+>',' ',s)).replace('\n',' ').split())

def search(query,max_results,already):
    found=[]; cont=None
    while len(found)<max_results:
        p={'action':'query','list':'search','srsearch':query,'srnamespace':'6','srlimit':'500','srprop':'','srsort':'relevance'}
        if cont:p.update(cont)
        data=api(p)
        rows=data.get('query',{}).get('search',[])
        if not rows:break
        for row in rows:
            title=row.get('title')
            if title and title not in already:
                already.add(title);found.append(title)
                if len(found)>=max_results:break
        cont=data.get('continue')
        if not cont:break
    return found

base_titles={v.get('title') for v in BASE.get('videos',[]) if v.get('title')}
all_titles=set(base_titles); discovered=[]; provenance={}
for bucket,quota,queries in BUCKETS:
    bucket_titles=[]
    per_query=max(250,(quota+len(queries)-1)//len(queries)+120)
    for q in queries:
        for title in search(q,per_query,all_titles):
            provenance[title]={'bucket':bucket,'query':q};bucket_titles.append(title)
            if len(bucket_titles)>=quota:break
        if len(bucket_titles)>=quota:break
    if len(bucket_titles)<quota:
        # Use multiple broad bucket synonyms rather than hammering the first query again.
        for q in queries:
            if len(bucket_titles)>=quota:break
            for title in search(q,quota-len(bucket_titles),all_titles):
                provenance[title]={'bucket':bucket,'query':q};bucket_titles.append(title)
    discovered.extend(bucket_titles[:quota])
    print(bucket,len(bucket_titles[:quota]),flush=True)

# Keep a metadata-validation reserve. This also fills bucket shortfalls without changing
# the fact that high-priority interview/sport/entertainment results appear first.
reserve_target=TARGET_NEW+2500
if len(discovered)<reserve_target:
    need=reserve_target-len(discovered)
    for title in search('filetype:video',need,all_titles):
        provenance[title]={'bucket':'fallback','query':'filetype:video'};discovered.append(title)

candidate_titles=discovered
new=[]; rejected=[]
seen_urls={v.get('sourceUrl') for v in BASE.get('videos',[]) if v.get('sourceUrl')}
for off in range(0,len(candidate_titles),50):
    if len(new)>=TARGET_NEW:break
    chunk=candidate_titles[off:off+50]
    data=api({'action':'query','prop':'imageinfo','titles':'|'.join(chunk),'iiprop':'url|size|mime|mediatype|extmetadata'})
    pages={p.get('title'):p for p in data.get('query',{}).get('pages',[])}
    for title in chunk:
        if len(new)>=TARGET_NEW:break
        page=pages.get(title) or {}
        ii=(page.get('imageinfo') or [{}])[0]
        if ii.get('mediatype')!='VIDEO' or not str(ii.get('mime','')).startswith('video/'):
            rejected.append({'title':title,'reason':'not-video'});continue
        meta=ii.get('extmetadata') or {}
        def mv(k): return (meta.get(k) or {}).get('value','')
        license_name=strip_html(mv('LicenseShortName') or mv('UsageTerms'))
        source_url=ii.get('url')
        if not license_name or not source_url:
            rejected.append({'title':title,'reason':'missing-license-or-url'});continue
        if source_url in seen_urls:
            rejected.append({'title':title,'reason':'duplicate-media-url'});continue
        seen_urls.add(source_url)
        prov=provenance.get(title,{'bucket':'fallback','query':'filetype:video'})
        new.append({
          'referenceId':f'ref-{len(BASE.get("videos",[]))+len(new)+1:05d}',
          'title':title,
          'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':/()_-'),
          'sourceUrl':source_url,'mime':ii.get('mime'),'bytes':ii.get('size'),'width':ii.get('width'),'height':ii.get('height'),
          'license':license_name,'licenseUrl':strip_html(mv('LicenseUrl')),'artist':strip_html(mv('Artist')),'credit':strip_html(mv('Credit')),
          'description':strip_html(mv('ImageDescription')),'discoveryBucket':prov['bucket'],'discoveryQuery':prov['query'],
          'speechPriority':PRIORITY.get(prov['bucket'],.5),'catalogStatus':'metadata-validated','originPreflight':'deferred-to-indexer'
        })
    if off%500==0: print('enriched',off,'valid',len(new),'rejected',len(rejected),flush=True)

if len(new)!=TARGET_NEW:
    raise SystemExit(f'Only {len(new)} new metadata-valid videos; need {TARGET_NEW}. Candidate titles={len(candidate_titles)} rejected={len(rejected)}')

combined=list(BASE.get('videos',[]))+new
if len(combined)!=TARGET_TOTAL: raise SystemExit(f'combined count {len(combined)} != {TARGET_TOTAL}')
if len({v['sourceUrl'] for v in combined})!=len(combined): raise SystemExit('duplicate media URL in combined bank')

bucket_counts=collections.Counter(v.get('discoveryBucket','legacy-100') for v in new)
license_counts=collections.Counter(v.get('license') for v in new)
payload={
 'version':'reference-bank-v3','source':'Wikimedia Commons','legacyReferenceCount':len(BASE.get('videos',[])),'newReferenceCount':len(new),'count':len(combined),
 'selection':'Legacy verified 100 plus 10,000 additional Commons video files discovered with interview, sports, entertainment, expert/public-figure and general-speech queries. Every new entry exposes direct video media plus explicit Commons license metadata. Media decoding/speech validation is deferred to the word/segment indexer.',
 'retrievalPolicy':'Prefer intact sentence/phrase clips; use AI-refined single-word clips only when no larger constructible chunk is available.',
 'videos':combined
}
OUT.write_text(json.dumps(payload,indent=2,ensure_ascii=False))
report={
 'version':'reference-bank-v3-report','legacyCount':len(BASE.get('videos',[])),'newCount':len(new),'totalCount':len(combined),'targetNew':TARGET_NEW,
 'metadataValidatedNew':len(new),'originPreflight':'deferred-to-indexer','bucketCounts':dict(bucket_counts),'topLicenses':license_counts.most_common(20),
 'rejectedDuringMetadata':len(rejected),'uniqueTitles':len({v['title'] for v in combined}),'uniqueSourceUrls':len({v['sourceUrl'] for v in combined}),
 'pass':len(new)==TARGET_NEW and len(combined)==TARGET_TOTAL
}
REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps(report,indent=2))

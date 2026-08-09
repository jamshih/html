from __future__ import annotations
import html, json, re, time, urllib.parse, urllib.request
from pathlib import Path

OUT = Path('hearframe-grand-v4/ask/reference-videos.json')
REPORT = Path('hearframe-grand-v4/ask/reference-video-report.json')
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'HearframePrototype/2.0 (English speech corpus research; github.com/jamshih/html)'
CATEGORY = 'Category:Videos in American English'
TARGET = 100


def api(params):
    params = {**params, 'format':'json', 'formatversion':'2'}
    url = API + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent':UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.load(r)


def strip_html(s):
    if not s: return ''
    return html.unescape(re.sub(r'<[^>]+>', ' ', s)).replace('\n',' ').strip()

# Pull more candidates than we need so MIME/license filtering can still yield 100.
titles=[]; cont=None
while len(titles) < 180:
    p={'action':'query','list':'categorymembers','cmtitle':CATEGORY,'cmnamespace':'6','cmtype':'file','cmlimit':'500'}
    if cont: p.update(cont)
    data=api(p)
    for row in data.get('query',{}).get('categorymembers',[]):
        t=row['title']
        if t not in titles: titles.append(t)
    cont=data.get('continue')
    if not cont: break

items=[]
for off in range(0,len(titles),50):
    chunk=titles[off:off+50]
    data=api({'action':'query','prop':'imageinfo','titles':'|'.join(chunk),'iiprop':'url|size|mime|mediatype|extmetadata'})
    for page in data.get('query',{}).get('pages',[]):
        ii=(page.get('imageinfo') or [{}])[0]
        if ii.get('mediatype') != 'VIDEO': continue
        mime=ii.get('mime','')
        if not mime.startswith('video/'): continue
        meta=ii.get('extmetadata') or {}
        def mv(k): return (meta.get(k) or {}).get('value','')
        license_name=strip_html(mv('LicenseShortName') or mv('UsageTerms'))
        source_url=ii.get('url')
        if not license_name or not source_url: continue
        items.append({
            'title':page['title'],
            'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(page['title'].replace(' ','_'), safe=':/()_-'),
            'sourceUrl':source_url,
            'mime':mime,
            'bytes':ii.get('size'),
            'width':ii.get('width'),
            'height':ii.get('height'),
            'license':license_name,
            'licenseUrl':strip_html(mv('LicenseUrl')),
            'artist':strip_html(mv('Artist')),
            'credit':strip_html(mv('Credit')),
            'description':strip_html(mv('ImageDescription')),
            'categories':[CATEGORY.replace('Category:','')],
            'catalogVerification':'Wikimedia Commons imageinfo URL + VIDEO mediatype + explicit license metadata'
        })
    if len(items)>=TARGET: break
    time.sleep(.15)

selected=items[:TARGET]
for i,item in enumerate(selected,1): item['referenceId']=f'ref-{i:03d}'
if len(selected)!=TARGET:
    raise SystemExit(f'Only {len(selected)} API-verified reference videos; need {TARGET}')
if len({x['title'] for x in selected}) != TARGET or len({x['sourceUrl'] for x in selected}) != TARGET:
    raise SystemExit('reference catalog contains duplicates')

payload={
    'version':'references-v3',
    'source':'Wikimedia Commons',
    'category':CATEGORY,
    'count':TARGET,
    'selection':'100 distinct video files from the American-English video category with VIDEO mediatype, direct media URL, and explicit Commons license metadata. Media decoding is validated separately by the 10-shard word-index build.',
    'videos':selected
}
report={
    'count':TARGET,
    'candidateCount':len(items),
    'uniqueTitles':len({x['title'] for x in selected}),
    'uniqueSourceUrls':len({x['sourceUrl'] for x in selected}),
    'allHaveLicense':all(bool(x['license']) for x in selected),
    'allHaveMediaUrl':all(bool(x['sourceUrl']) for x in selected),
    'mediaDecodeValidation':'delegated to reference word-index workflow',
    'pass':True
}
OUT.write_text(json.dumps(payload,indent=2,ensure_ascii=False))
REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps({'count':TARGET,'candidateCount':len(items),'first':selected[0]['title'],'last':selected[-1]['title'],'pass':True},indent=2))

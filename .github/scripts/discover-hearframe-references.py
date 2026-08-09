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

# Pull extra candidates so MIME/license/preflight filtering can still yield 100.
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
        # Commons files have explicit file-page licenses; keep unknowns out of the corpus.
        if not license_name: continue
        items.append({
            'title':page['title'],
            'pageUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(page['title'].replace(' ','_'), safe=':/()_-'),
            'sourceUrl':ii.get('url'),
            'mime':mime,
            'bytes':ii.get('size'),
            'width':ii.get('width'),
            'height':ii.get('height'),
            'license':license_name,
            'licenseUrl':strip_html(mv('LicenseUrl')),
            'artist':strip_html(mv('Artist')),
            'credit':strip_html(mv('Credit')),
            'description':strip_html(mv('ImageDescription')),
            'categories':[CATEGORY.replace('Category:','')]
        })
    if len(items)>=TARGET+20: break
    time.sleep(.25)

# Verify the origin actually responds. Range keeps this very cheap and does not download the videos.
verified=[]; failures=[]
for item in items:
    if len(verified)>=TARGET: break
    try:
        req=urllib.request.Request(item['sourceUrl'],headers={'User-Agent':UA,'Range':'bytes=0-4095'})
        with urllib.request.urlopen(req,timeout=30) as r:
            status=getattr(r,'status',200); sample=r.read(4096)
        if status not in (200,206) or len(sample)<128:
            raise RuntimeError(f'HTTP {status}, {len(sample)} bytes')
        item['preflight']='ok'
        item['referenceId']=f'ref-{len(verified)+1:03d}'
        verified.append(item)
    except Exception as e:
        failures.append({'title':item['title'],'error':str(e)})
    time.sleep(.12)

if len(verified)!=TARGET:
    raise SystemExit(f'Only {len(verified)} verified reference videos; need {TARGET}. Failures: {failures[:8]}')

payload={
    'version':'references-v2',
    'source':'Wikimedia Commons',
    'category':CATEGORY,
    'count':len(verified),
    'selection':'First 100 distinct video files in the American-English video category that expose explicit Commons license metadata and pass a byte-range origin preflight.',
    'videos':verified
}
OUT.write_text(json.dumps(payload,indent=2,ensure_ascii=False))
REPORT.write_text(json.dumps({'count':len(verified),'candidateCount':len(items),'preflightFailures':failures,'allReachable':len(verified)==TARGET},indent=2,ensure_ascii=False))
print(json.dumps({'count':len(verified),'candidateCount':len(items),'failures':len(failures),'first':verified[0]['title'],'last':verified[-1]['title']},indent=2))

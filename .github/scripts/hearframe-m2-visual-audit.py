#!/usr/bin/env python3
from __future__ import annotations
import json, os, re, shlex, subprocess, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
ASK=ROOT/'hearframe-grand-v4/ask'
READY=json.loads((ASK/'m2-ready-references.json').read_text())
OVERRIDES_PATH=ASK/'m2-visual-review-overrides.json'
OUT=ASK/'m2-full-visual-audit.json'
SHEETS=ASK/'m2-visual-sheets'; SHEETS.mkdir(exist_ok=True)
FRAME_CACHE=ROOT/'.hearframe-m2-visual-frames'; FRAME_CACHE.mkdir(exist_ok=True)

HARD_TITLE=re.compile(r'\b(zoom|teams|webex|google meet|webinar|screen.?share|screen recording|podcast|trailer|commercial|promo(?:tional)?|gameplay|animation)\b',re.I)
NEWS_TITLE=re.compile(r'\b(news package|reporter package|newscast|news report)\b',re.I)
FACE=cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml')

def run(cmd,timeout=50):
    p=subprocess.run([str(x) for x in cmd],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,timeout=timeout)
    return p

def windows(ref):
    ws=ref.get('sampleWindows') or []
    if not ws:return []
    if len(ws)<=4:return ws
    idx=[0,round((len(ws)-1)*.33),round((len(ws)-1)*.67),len(ws)-1]
    return [ws[i] for i in sorted(set(idx))]

def extract_pair(ref,win,slot):
    rid=ref['referenceId']; t=max(0,float(win.get('start') or 0)-.22)
    stem=FRAME_CACHE/f'{rid}-{slot}'
    a=Path(str(stem)+'-01.jpg'); b=Path(str(stem)+'-02.jpg')
    if a.exists() and b.exists():return [a,b],None
    for old in (a,b):
        try:old.unlink()
        except FileNotFoundError:pass
    pat=str(stem)+'-%02d.jpg'
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-rw_timeout','20000000','-ss',f'{t:.3f}','-i',ref['sourceUrl'],
         '-t','0.85','-vf','fps=2,scale=640:-2:force_original_aspect_ratio=decrease','-frames:v','2','-q:v','4',pat]
    try:p=run(cmd,55)
    except subprocess.TimeoutExpired:return [],'frame_seek_timeout'
    got=[x for x in (a,b) if x.exists()]
    if not got:return [],'frame_decode_failed:'+(p.stderr[-180:] if p.stderr else '')
    if len(got)==1:
        # A single real decoded frame is still evidence, but motion cannot be proven.
        return got,'only_one_frame'
    return got,None

def metrics(path):
    im=cv2.imread(str(path))
    if im is None:return None
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    faces=FACE.detectMultiScale(g,1.1,5,minSize=(30,30))
    area=max([w*h for _,_,w,h in faces],default=0)/(im.shape[0]*im.shape[1])
    edge=cv2.Canny(g,75,180)
    bottom=edge[int(edge.shape[0]*.72):]
    center=edge[int(edge.shape[0]*.20):int(edge.shape[0]*.68)]
    return {'image':im,'gray':g,'brightness':float(g.mean()),'sharpness':float(cv2.Laplacian(g,cv2.CV_64F).var()),
            'faceCount':len(faces),'largestFaceArea':float(area),'bottomEdge':float((bottom>0).mean()),'centerEdge':float((center>0).mean())}

def audit(ref):
    title=ref.get('title') or ''
    if HARD_TITLE.search(title) or NEWS_TITLE.search(title):
        return {'referenceId':ref['referenceId'],'title':title,'pageUrl':ref.get('pageUrl'),'sourceUrl':ref.get('sourceUrl'),'sourceKind':ref.get('sourceKind'),
                'machineStatus':'REJECT','machineReasons':['hard_metadata_reject_before_positive_visual_review'],'samples':[]}
    samples=[]; decoded=[]; errs=[]
    for i,w in enumerate(windows(ref)):
        paths,err=extract_pair(ref,w,i)
        if err:errs.append({'slot':i,'error':err})
        ms=[metrics(p) for p in paths]; ms=[m for m in ms if m]
        if ms:
            # Keep first actual frame as contact sheet evidence; paired frame for local motion.
            motion=None
            if len(ms)>1 and ms[0]['gray'].shape==ms[1]['gray'].shape:motion=float(cv2.absdiff(ms[0]['gray'],ms[1]['gray']).mean())
            m=ms[0]; decoded.append((paths[0],m,motion))
            samples.append({'time':round(float(w.get('start') or 0),3),'label':w.get('label'),'score':w.get('score'),'frame':str(paths[0].relative_to(ROOT)),
                            'faceCount':m['faceCount'],'largestFaceArea':round(m['largestFaceArea'],4),'brightness':round(m['brightness'],1),
                            'sharpness':round(m['sharpness'],1),'motion':round(motion,3) if motion is not None else None,
                            'bottomEdgeRatio':round(m['bottomEdge'],4),'centerEdgeRatio':round(m['centerEdge'],4)})
    reasons=[]; status='REVIEW'
    if len(decoded)<3:
        status='REJECT';reasons.append('fewer_than_3_aligned_region_frames_decoded')
    else:
        face_good=sum(1 for _,m,_ in decoded if m['largestFaceArea']>=.006)
        multi=sum(1 for _,m,_ in decoded if m['faceCount']>=4)
        motions=[x for _,_,x in decoded if x is not None]
        low_detail=sum(1 for _,m,_ in decoded if m['sharpness']<16)
        dark=sum(1 for _,m,_ in decoded if m['brightness']<14 or m['brightness']>244)
        bottom_heavy=sum(1 for _,m,_ in decoded if m['bottomEdge']>max(.15,m['centerEdge']*2.2))
        if dark>=3: status='REJECT';reasons.append('mostly_black_or_blown_out')
        if multi>=3: status='REJECT';reasons.append('persistent_multi_face_grid_or_crowd_layout')
        if face_good<3:
            reasons.append('visible_speaker_not_consistently_machine_verified')
        if motions and float(np.median(motions))<.28:
            reasons.append('near_static_visual_requires_human_review')
        if low_detail>=3:reasons.append('low_detail_or_soft_source')
        if bottom_heavy>=3:reasons.append('possible_large_baked_lower_graphics_or_subtitles')
        strong=(face_good>=3 and multi==0 and dark==0 and low_detail<=1 and bottom_heavy<=1 and (not motions or float(np.median(motions))>=.28))
        if strong and status!='REJECT':
            # Deliberately REVIEW until a human/vision pass inspects the sheet.
            status='REVIEW';reasons.append('strong_machine_candidate_pending_manual_frame_review')
        elif status!='REJECT' and not reasons:
            reasons.append('manual_frame_review_required')
    return {'referenceId':ref['referenceId'],'title':title,'pageUrl':ref.get('pageUrl'),'sourceUrl':ref.get('sourceUrl'),'sourceKind':ref.get('sourceKind'),
            'machineStatus':status,'machineReasons':reasons,'sampleErrors':errs,'samples':samples}

def make_sheets(rows):
    # Only evidence-bearing rows; 10 refs/page, 4 aligned-region frames/ref.
    evidence=[r for r in rows if r.get('samples')]
    for p in SHEETS.glob('sheet-*.jpg'):p.unlink()
    for pi in range(0,len(evidence),10):
        block=evidence[pi:pi+10]; canvas=np.zeros((len(block)*190,1280,3),np.uint8)
        for ri,r in enumerate(block):
            y=ri*190
            cv2.putText(canvas,f"{r['referenceId']}  {r['machineStatus']}  {(r['title'] or '')[:82]}",(8,y+17),cv2.FONT_HERSHEY_SIMPLEX,.42,(255,255,255),1,cv2.LINE_AA)
            for si,s in enumerate((r.get('samples') or [])[:4]):
                im=cv2.imread(str(ROOT/s['frame']))
                if im is None:continue
                thumb=cv2.resize(im,(310,160)); x=si*320
                canvas[y+25:y+185,x:x+310]=thumb
                cv2.putText(canvas,f"{s['time']:.1f}s f={s['faceCount']} a={s['largestFaceArea']:.3f}",(x+4,y+180),cv2.FONT_HERSHEY_SIMPLEX,.35,(255,255,255),1,cv2.LINE_AA)
        cv2.imwrite(str(SHEETS/f'sheet-{pi//10+1:02d}.jpg'),canvas,[int(cv2.IMWRITE_JPEG_QUALITY),88])

def main():
    refs=READY['references']
    if not READY.get('traceComplete') or len(refs)!=131:raise SystemExit(f'exact_131_gate_failed:{len(refs)}')
    rows=[]
    with ThreadPoolExecutor(max_workers=8) as ex:
        fut={ex.submit(audit,r):r['referenceId'] for r in refs}
        for n,f in enumerate(as_completed(fut),1):
            r=f.result();rows.append(r);print(f"[{n}/{len(refs)}] {r['referenceId']} {r['machineStatus']} {';'.join(r['machineReasons'])}",flush=True)
    rows.sort(key=lambda r:r['referenceId'])
    make_sheets(rows)
    overrides={}
    if OVERRIDES_PATH.exists():
        o=json.loads(OVERRIDES_PATH.read_text());overrides=o.get('overrides') or {}
    counts={'APPROVE':0,'REVIEW':0,'REJECT':0}
    for r in rows:
        ov=overrides.get(r['referenceId'])
        if ov:
            st=ov['status'];r['status']=st;r['manualReview']=ov
        else:
            r['status']='REJECT' if r['machineStatus']=='REJECT' else 'REVIEW'
            r['manualReview']=None
        counts[r['status']]+=1
    out={'version':'hearframe-m2-full-visual-audit-v1','sourceSet':'exact 131 counted English/alignment-ready refs from production-stitch-index-report',
         'policy':'Actual aligned-region frames are decoded for every non-metadata-hard-rejected source. Machine QA may reject or nominate REVIEW, but never auto-APPROVE. APPROVE requires a persisted manual frame-review override.',
         'reviewedCount':len(rows),'counts':counts,'approvedReferenceIds':[r['referenceId'] for r in rows if r['status']=='APPROVE'],
         'target':50,'targetMet':counts['APPROVE']>=50,'rows':rows}
    OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'reviewed':len(rows),'counts':counts,'sheets':len(list(SHEETS.glob('sheet-*.jpg'))),'targetMet':out['targetMet']},indent=2))

if __name__=='__main__':main()

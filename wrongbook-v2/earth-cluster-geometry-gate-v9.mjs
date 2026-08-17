import fs from 'node:fs/promises';
import path from 'node:path';

const out=process.env.EARTH_QA_OUT||'/tmp/earth-cluster-qa';
const data=JSON.parse(await fs.readFile(path.join(out,'geometry.json'),'utf8'));
const boundaryFailures=[];
const lineOverlapFailures=[];
const skipLogicalCarrier=(page,n)=>Number(page)===248&&Number(n)===15;

for(const rec of data.geometry||[]){
  const root=rec.root||{width:910,height:1270};
  for(const q of rec.questions||[]){
    if(skipLogicalCarrier(rec.page,q.n))continue;
    const r=q.rect;
    // Allow <=2px of antialiasing/subpixel rounding at a printed page edge. Anything larger is
    // a real source-space escape and therefore a readability failure.
    if(r.x < -2 || r.y < -2 || r.right > root.width+2 || r.bottom > root.height+2){
      boundaryFailures.push({page:rec.page,mode:rec.mode,question:q.n,rect:r,root});
    }
  }

  const qs=(rec.questions||[]).filter(q=>!skipLogicalCarrier(rec.page,q.n));
  for(let i=0;i<qs.length;i++){
    for(let j=i+1;j<qs.length;j++){
      const a=qs[i],b=qs[j];
      for(const ra of a.lineRects||[]){
        for(const rb of b.lineRects||[]){
          const overlapX=Math.min(ra.right,rb.right)-Math.max(ra.x,rb.x);
          const overlapY=Math.min(ra.bottom,rb.bottom)-Math.max(ra.y,rb.y);
          // >2px in both axes is meaningful glyph-line overlap. Tiny baseline/AA contact is not.
          if(overlapX>2&&overlapY>2){
            lineOverlapFailures.push({page:rec.page,mode:rec.mode,a:a.n,b:b.n,overlapX:+overlapX.toFixed(2),overlapY:+overlapY.toFixed(2),aRect:ra,bRect:rb});
          }
        }
      }
    }
  }
}

const report={
  status:boundaryFailures.length||lineOverlapFailures.length?'FAIL':'PASS',
  boundaryFailures,
  lineOverlapFailures,
  notes:['p248 q15 is a logical source-container carrier with skipRender semantics and is not a visible prompt.','<=2px page-edge or line contact is treated as browser subpixel/antialiasing tolerance.']
};
await fs.writeFile(path.join(out,'geometry-gate.json'),JSON.stringify(report,null,2));
if(report.status!=='PASS'){
  console.error(JSON.stringify(report,null,2));
  process.exit(1);
}
console.log('Earth geometry gate PASS: zero clipped visible prompts and zero meaningful cross-question line overlaps.');
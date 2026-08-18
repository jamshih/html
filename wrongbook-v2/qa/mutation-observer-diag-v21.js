// QA-only diagnostic. Captures repeated mutation targets, then disconnects only observers at an impossible idle rate.
(function(){
  const Native=window.MutationObserver;
  if(!Native||window.__qaMutationObserverDiagInstalled)return;
  window.__qaMutationObserverDiagInstalled=true;
  window.__qaMutationObserverLoops=[];
  window.__qaMutationObserverStats=[];
  let seq=0;
  const nodeLabel=n=>{if(!n)return'null';if(n.nodeType===3)return`#text(${String(n.textContent||'').slice(0,40)})`;if(n.nodeType!==1)return`node:${n.nodeType}`;const id=n.id?`#${n.id}`:'',cls=typeof n.className==='string'&&n.className.trim()?'.'+n.className.trim().split(/\s+/).slice(0,4).join('.'):'',data=n.getAttribute?.('data-action')?`[data-action=${n.getAttribute('data-action')}]`:n.getAttribute?.('data-problem')?`[data-problem=${n.getAttribute('data-problem')}]`:'';return `${n.tagName?.toLowerCase()||'el'}${id}${cls}${data}`};
  const recordSig=r=>`${r.type}:${nodeLabel(r.target)}:add(${[...r.addedNodes].map(nodeLabel).join('|')}):rm(${[...r.removedNodes].map(nodeLabel).join('|')})`;
  function Wrapped(callback){
    const id=++seq,createdAt=(new Error(`MutationObserver#${id}`)).stack||'',times=[],sigs=new Map();
    const stat={id,callbacks:0,records:0,suppressed:false,createdAt,topMutations:[]};window.__qaMutationObserverStats.push(stat);
    const observer=new Native((records,self)=>{
      const now=performance.now();stat.callbacks++;stat.records+=records.length;times.push(now);while(times.length&&now-times[0]>600)times.shift();
      for(const r of records){const sig=recordSig(r);sigs.set(sig,(sigs.get(sig)||0)+1)}
      stat.topMutations=[...sigs.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([signature,count])=>({count,signature}));
      if(times.length>24){stat.suppressed=true;window.__qaMutationObserverLoops.push({id,callbacks:stat.callbacks,records:stat.records,rateWindow:times.length,createdAt,topMutations:stat.topMutations});self.disconnect();return}
      callback(records,self);
    });
    return observer;
  }
  Wrapped.prototype=Native.prototype;Object.setPrototypeOf(Wrapped,Native);window.MutationObserver=Wrapped;
})();

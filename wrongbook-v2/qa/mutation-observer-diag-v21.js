// QA-only diagnostic. Disconnects only observers that self-trigger at an impossible idle rate.
(function(){
  const Native=window.MutationObserver;
  if(!Native||window.__qaMutationObserverDiagInstalled)return;
  window.__qaMutationObserverDiagInstalled=true;
  window.__qaMutationObserverLoops=[];
  window.__qaMutationObserverStats=[];
  let seq=0;
  function Wrapped(callback){
    const id=++seq,createdAt=(new Error(`MutationObserver#${id}`)).stack||'',times=[];
    const stat={id,callbacks:0,records:0,suppressed:false,createdAt};window.__qaMutationObserverStats.push(stat);
    const observer=new Native((records,self)=>{
      const now=performance.now();stat.callbacks++;stat.records+=records.length;times.push(now);while(times.length&&now-times[0]>600)times.shift();
      if(times.length>24){stat.suppressed=true;window.__qaMutationObserverLoops.push({id,callbacks:stat.callbacks,records:stat.records,rateWindow:times.length,createdAt});self.disconnect();return}
      callback(records,self);
    });
    return observer;
  }
  Wrapped.prototype=Native.prototype;
  Object.setPrototypeOf(Wrapped,Native);
  window.MutationObserver=Wrapped;
})();

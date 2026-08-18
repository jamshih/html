// Wrongbook — route interactive AI calls through the current low-latency Flash-Lite backend.
(function(){
  if(window.__wrongbookAiFastRouteV1)return;
  window.__wrongbookAiFastRouteV1=true;
  if(typeof apiCall!=='function')return;
  const base=apiCall;
  const FAST='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-ai-fast';
  const handled=new Set(['/analyze','/tutor','/revise']);

  async function fastCall(path,body){
    const started=performance.now();
    const res=await fetch(FAST,{method:'POST',headers:{'content-type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({...body,action:path.slice(1),clientPreprocess:window.__wrongbookLastImagePreprocess||null})});
    const data=await res.json().catch(()=>({error:'invalid_response'}));
    window.__wrongbookLastAiRoute={path,backend:'wrongbook-ai-fast',model:data?.model||null,serverLatencyMs:data?.latencyMs||null,totalLatencyMs:Math.round(performance.now()-started),ok:res.ok};
    if(!res.ok)throw new Error(data.detail||data.error||('HTTP '+res.status));
    return data;
  }

  const routed=async function(path,body){
    if(!handled.has(path))return base(path,body);
    try{return await fastCall(path,body)}catch(err){
      console.warn('[wrongbook fast route] falling back to legacy endpoint',err);
      window.__wrongbookLastAiRoute={...(window.__wrongbookLastAiRoute||{}),fallback:true};
      return base(path,body);
    }
  };
  try{apiCall=routed}catch{}
  window.apiCall=routed;
  window.__wrongbookAiFastRouteQA=()=>({loaded:true,handled:[...handled],backend:FAST,last:window.__wrongbookLastAiRoute||null,fallbackEnabled:true});
})();
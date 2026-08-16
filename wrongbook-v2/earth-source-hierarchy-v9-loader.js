// Late loader: V9 must wrap the complete V6/V7 stack, never run underneath legacy refinements.
(function(){
 const files=['earth-source-hierarchy-v9.js','earth-rbush-v9.js','earth-source-hierarchy-v9-renderer.js','earth-layout-qa-v9.js','earth-layout-debug-v9.js'];
 function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`./${src}`;s.onload=resolve;s.onerror=()=>reject(new Error(`failed ${src}`));document.body.appendChild(s)})}
 async function boot(){if(window.V9_EARTH_BOOTED)return;window.V9_EARTH_BOOTED=true;const css=document.createElement('link');css.rel='stylesheet';css.href='./earth-source-hierarchy-v9.css';document.head.appendChild(css);for(const f of files)await script(f);}
 if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>boot().catch(console.error),{once:true});else boot().catch(console.error);
})();

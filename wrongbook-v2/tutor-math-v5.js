// Wrongbook V5 tutor math rendering.
// Keeps AI copy escaped/safe, then lets KaTeX auto-render TeX delimiters inside tutor-only UI.
const V5_TUTOR_MATH_VERSION='2026-08-17-tutor-math-v5b';
const V5_KATEX_VERSION='0.16.11';

(function(){
  if(window.__v5TutorMathBooted)return;window.__v5TutorMathBooted=true;

  const style=document.createElement('style');
  style.id='v5TutorMathStyle';
  style.textContent=`
    .v5-tutor-dock .katex{font-size:1.02em}
    .v5-tutor-dock .katex-display{margin:.58em 0;overflow-x:auto;overflow-y:hidden;padding:.12em 0;text-align:center}
    .v5-tutor-stage>p .katex-display{font-size:1.08em}
    .v3-guide-caption .katex{font-size:.95em}
    .tutor-answer .katex-display,.tutor-step .katex-display{margin:.5em 0}
    @media (max-width:720px){.v5-tutor-dock .katex{font-size:.98em}.v5-tutor-dock .katex-display{margin:.45em 0}}
  `;
  document.head.appendChild(style);

  function loadCss(){
    if(document.getElementById('v5TutorKatexCss'))return;
    const link=document.createElement('link');
    link.id='v5TutorKatexCss';link.rel='stylesheet';
    link.href=`https://cdn.jsdelivr.net/npm/katex@${V5_KATEX_VERSION}/dist/katex.min.css`;
    document.head.appendChild(link);
  }

  function loadScript(id,src){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){
        if(existing.dataset.loaded==='1')return resolve();
        existing.addEventListener('load',()=>resolve(),{once:true});
        existing.addEventListener('error',()=>reject(new Error('math_renderer_load_failed')),{once:true});
        return;
      }
      const script=document.createElement('script');script.id=id;script.src=src;script.async=true;
      script.addEventListener('load',()=>{script.dataset.loaded='1';resolve()},{once:true});
      script.addEventListener('error',()=>reject(new Error('math_renderer_load_failed')),{once:true});
      document.head.appendChild(script);
    });
  }

  async function ensureKatex(){
    if(typeof window.renderMathInElement==='function')return true;
    loadCss();
    try{
      if(typeof window.katex!=='object')await loadScript('v5TutorKatexJs',`https://cdn.jsdelivr.net/npm/katex@${V5_KATEX_VERSION}/dist/katex.min.js`);
      if(typeof window.renderMathInElement!=='function')await loadScript('v5TutorKatexAutoRender',`https://cdn.jsdelivr.net/npm/katex@${V5_KATEX_VERSION}/dist/contrib/auto-render.min.js`);
      return typeof window.renderMathInElement==='function';
    }catch(e){console.warn('[wrongbook] KaTeX unavailable; keeping readable TeX fallback',e);return false}
  }

  function containsMathDelimiter(text=''){
    return /\\\(|\\\[|\$\$|\$(?!\s|$)/.test(String(text));
  }

  // Gemini sometimes puts a fraction inside inline $...$ even when it is the main equation.
  // Promote those fractions to display math so numerator/denominator stay legible on tablet/mobile.
  function normalizeTutorMathSource(text=''){
    return String(text).replace(/\$([^$\n]*\\frac[^$\n]*)\$/g,(_,body)=>`\\[${body.trim()}\\]`);
  }

  const SELECTORS=[
    '.v5-tutor-stage p',
    '.v5-tutor-stage-head strong',
    '.v3-guide-caption',
    '.tutor-answer',
    '.tutor-step',
    '.callout'
  ].join(',');

  let rendering=false;
  async function renderTutorMath(root=document){
    if(rendering)return false;
    const ok=await ensureKatex();if(!ok)return false;
    rendering=true;
    try{
      const scope=root?.querySelectorAll?root:document;
      scope.querySelectorAll(SELECTORS).forEach(el=>{
        if(el.querySelector('.katex'))return;
        const source=el.textContent||'';if(!containsMathDelimiter(source))return;
        const normalized=normalizeTutorMathSource(source);if(normalized!==source)el.textContent=normalized;
        try{
          window.renderMathInElement(el,{
            delimiters:[
              {left:'\\[',right:'\\]',display:true},
              {left:'$$',right:'$$',display:true},
              {left:'\\(',right:'\\)',display:false},
              {left:'$',right:'$',display:false}
            ],
            throwOnError:false,
            strict:'ignore',
            ignoredTags:['script','noscript','style','textarea','pre','code','option']
          });
        }catch(e){console.warn('[wrongbook] tutor math render failed',e)}
      });
      return true;
    }finally{rendering=false}
  }

  window.v5RenderTutorMath=renderTutorMath;
  window.v5TutorMathState=function(){return{version:V5_TUTOR_MATH_VERSION,katexVersion:V5_KATEX_VERSION,ready:typeof window.renderMathInElement==='function'}};

  // Wrap the final app renderer so every new tutor response is typeset immediately.
  if(typeof render==='function'&&!window.__v5TutorMathRenderWrapped){
    window.__v5TutorMathRenderWrapped=true;const baseRender=render;
    render=function(){const out=baseRender.apply(this,arguments);requestAnimationFrame(()=>renderTutorMath(document));return out};
  }

  // Captions and replay text can change without a full app render.
  const app=document.getElementById('app');
  if(app&&typeof MutationObserver==='function'){
    let queued=false;
    const observer=new MutationObserver(()=>{
      if(queued||rendering)return;queued=true;
      requestAnimationFrame(()=>{queued=false;renderTutorMath(document)});
    });
    observer.observe(app,{subtree:true,childList:true,characterData:true});
    window.__v5TutorMathObserver=observer;
  }

  requestAnimationFrame(()=>renderTutorMath(document));
})();

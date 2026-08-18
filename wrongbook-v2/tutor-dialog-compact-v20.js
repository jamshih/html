// Wrong Book V20 — compact tutor dialog with larger reading text and no single-step dead space.
(function(){
  const VERSION='2026-08-18-tutor-dialog-compact-v20';
  if(window.__wrongbookTutorDialogCompactV20===VERSION)return;
  window.__wrongbookTutorDialogCompactV20=VERSION;

  const STYLE_ID='wrongbookTutorDialogCompactV20Style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    /* Desktop: stop treating the tutor as a near full-width sheet. Keep it centered and readable. */
    @media(min-width:701px){
      .v3-paper .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
        left:0!important;
        right:0!important;
        width:min(760px,72vw)!important;
        max-width:min(760px,72vw)!important;
        min-width:0!important;
        margin:0 auto!important;
        padding:13px 15px 14px!important;
        gap:10px!important;
        max-height:min(430px,calc(100vh - 150px))!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        border-radius:16px!important;
      }
    }

    /* Larger typography: use the smaller surface to create a reading-focused hierarchy. */
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v6-tutor-collapse-summary{
      font-size:15px!important;
      line-height:1.25!important;
      font-weight:820!important;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-mode-switch{gap:5px!important;padding:4px!important;border-radius:11px!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-mode-switch button{
      min-height:38px!important;
      padding:7px 12px!important;
      font-size:14px!important;
      line-height:1.2!important;
      border-radius:9px!important;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-stage-head{min-height:34px!important;gap:9px!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-stage-head>span{
      font-size:12.5px!important;
      line-height:1.15!important;
      padding:6px 9px!important;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-stage-head strong{font-size:13px!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-stage>p{
      font-size:16.5px!important;
      line-height:1.62!important;
      font-weight:650!important;
      color:var(--ink,#2B2D29)!important;
      letter-spacing:.005em!important;
      text-wrap:pretty;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-actions{gap:8px!important;padding-top:4px!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-actions .primary-btn,
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-actions .soft-btn{
      min-height:42px!important;
      padding:9px 14px!important;
      font-size:14px!important;
      line-height:1.2!important;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-link-btn{
      min-height:40px!important;
      padding:8px 7px!important;
      font-size:13.5px!important;
      line-height:1.2!important;
    }
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-empty strong{font-size:15px!important;line-height:1.35!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-empty span{font-size:12.5px!important;line-height:1.45!important;margin-top:4px!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-empty .primary-btn{font-size:14px!important;min-height:42px!important}

    /* Multi-step sessions stay dimensionally stable for V16 in-place paging, but are substantially denser. */
    .v5-tutor-stage.v16-stable-stage.wb-v20-has-nav{
      height:304px!important;
      min-height:304px!important;
      max-height:304px!important;
      grid-template-rows:34px 126px 60px 72px!important;
      gap:4px!important;
    }
    .v5-tutor-stage.v16-stable-stage.wb-v20-has-nav>p{
      min-height:126px!important;
      height:126px!important;
      max-height:126px!important;
      padding:8px 0 6px!important;
      overflow:auto!important;
    }
    .v5-tutor-stage.v16-stable-stage.wb-v20-has-nav>.v5-tutor-actions{
      min-height:72px!important;
      height:72px!important;
      max-height:72px!important;
      overflow:auto!important;
    }

    /* A 1/1 tutor has no navigator. Do not reserve an invisible navigator row or a fake fixed-height frame. */
    .v5-tutor-stage.v16-stable-stage.wb-v20-single-step{
      height:auto!important;
      min-height:0!important;
      max-height:300px!important;
      display:grid!important;
      grid-template-rows:auto auto auto!important;
      align-content:start!important;
      gap:10px!important;
      overflow:visible!important;
    }
    .v5-tutor-stage.v16-stable-stage.wb-v20-single-step>p{
      min-height:0!important;
      height:auto!important;
      max-height:170px!important;
      margin:0!important;
      padding:8px 0 4px!important;
      overflow:auto!important;
      scrollbar-gutter:auto!important;
    }
    .v5-tutor-stage.v16-stable-stage.wb-v20-single-step>.v5-tutor-actions{
      min-height:0!important;
      height:auto!important;
      max-height:none!important;
      overflow:visible!important;
    }

    /* Keep the navigator compact relative to the larger text. */
    .v5-tutor-dock:not(.v6-tutor-collapsed) .v16-canonical-nav{margin:4px auto 6px!important}

    @media(max-width:700px){
      .v5-tutor-dock:not(.v6-tutor-collapsed){padding:11px 12px 12px!important;gap:9px!important}
      .v5-tutor-dock:not(.v6-tutor-collapsed) .v6-tutor-collapse-summary{font-size:14.5px!important}
      .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-mode-switch button{font-size:13.5px!important}
      .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-stage>p{font-size:15.5px!important;line-height:1.58!important}
      .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-actions .primary-btn,
      .v5-tutor-dock:not(.v6-tutor-collapsed) .v5-tutor-actions .soft-btn{font-size:13.5px!important}
      .v5-tutor-stage.v16-stable-stage.wb-v20-has-nav{height:326px!important;min-height:326px!important;max-height:326px!important;grid-template-rows:34px 146px 54px 80px!important}
      .v5-tutor-stage.v16-stable-stage.wb-v20-has-nav>p{height:146px!important;min-height:146px!important;max-height:146px!important}
      .v5-tutor-stage.v16-stable-stage.wb-v20-single-step{max-height:330px!important}
      .v5-tutor-stage.v16-stable-stage.wb-v20-single-step>p{max-height:190px!important}
    }
  `;
  document.head.appendChild(style);

  function classify(){
    document.querySelectorAll('.v5-tutor-stage.v16-stable-stage').forEach(stage=>{
      const nav=stage.querySelector(':scope > .v16-canonical-nav');
      stage.classList.toggle('wb-v20-has-nav',Boolean(nav));
      stage.classList.toggle('wb-v20-single-step',!nav);
    });
  }

  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;classify()})}
  function mount(){
    const app=document.getElementById('app');if(!app)return setTimeout(mount,40);
    new MutationObserver(queue).observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',queue,{passive:true});
    classify();
  }
  mount();

  window.wrongbookTutorDialogCompactQA=function(){
    classify();
    const dock=document.querySelector('.v5-tutor-dock:not(.v6-tutor-collapsed)');
    if(!dock)return{version:VERSION,pass:true,tutorOpen:false};
    const stage=dock.querySelector('.v5-tutor-stage'),prompt=stage?.querySelector(':scope > p'),action=dock.querySelector('.v5-tutor-actions button'),mode=dock.querySelector('.v5-tutor-mode-switch button');
    const dr=dock.getBoundingClientRect(),sr=stage?.getBoundingClientRect(),pr=prompt?.getBoundingClientRect();
    const desktop=!matchMedia('(max-width:700px)').matches;
    const dockFont=prompt?parseFloat(getComputedStyle(prompt).fontSize)||0:0;
    const actionFont=action?parseFloat(getComputedStyle(action).fontSize)||0:0;
    const modeFont=mode?parseFloat(getComputedStyle(mode).fontSize)||0:0;
    const hasNav=Boolean(stage?.querySelector(':scope > .v16-canonical-nav'));
    const classified=Boolean(stage&&(hasNav?stage.classList.contains('wb-v20-has-nav'):stage.classList.contains('wb-v20-single-step')));
    let deadSpace=0;
    if(stage){
      const visible=[...stage.children].filter(el=>getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0);
      const last=visible.at(-1)?.getBoundingClientRect();if(last)deadSpace=Math.max(0,sr.bottom-last.bottom);
    }
    const widthOk=!desktop||dr.width<=762;
    const heightOk=dr.height<=432;
    const promptReadable=!prompt||dockFont>=15.5;
    const controlsReadable=(!action||actionFont>=13)&&(!mode||modeFont>=13);
    const singleStepNoVoid=hasNav||deadSpace<=28;
    const promptNotClipped=!prompt||pr.height>0;
    return{version:VERSION,pass:Boolean(widthOk&&heightOk&&promptReadable&&controlsReadable&&classified&&singleStepNoVoid&&promptNotClipped),tutorOpen:true,desktop,dockWidth:Math.round(dr.width),dockHeight:Math.round(dr.height),stageHeight:Math.round(sr?.height||0),promptFont:dockFont,actionFont,modeFont,hasNavigator:hasNav,classified,deadSpace:Math.round(deadSpace),widthOk,heightOk,promptReadable,controlsReadable,singleStepNoVoid,promptNotClipped};
  };

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const result=window.wrongbookTutorDialogCompactQA?.();
      window.__wrongbookTutorDialogCompactV20QA=result;
      if(result?.tutorOpen===false&&tries<20)return scheduleQA(tries+1);
      if(result&&!result.pass)console.warn('[Wrongbook tutor compact V20 QA failed]',result);
    },160);
  }
  scheduleQA();
})();
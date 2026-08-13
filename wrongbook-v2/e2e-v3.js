// Runs only with ?e2e=1. Normal users never execute this flow.
(async()=>{
  if(!new URLSearchParams(location.search).has('e2e'))return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const results=[];const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const mobile=()=>innerWidth<=860;
  const navigatePage=async page=>{
    if(mobile()){
      const more=document.querySelector('.mobile-nav [data-action="toggleMenu"]');if(!more)throw new Error('mobile More button missing');more.click();await sleep(120);const drawer=document.querySelector('.mobile-drawer');check(`mobile drawer opens for ${page}`,drawer?.classList.contains('open'));const target=drawer?.querySelector(`[data-page="${page}"]`);if(!target)throw new Error(`mobile drawer page missing: ${page}`);target.click();await sleep(260);
    }else{const target=document.querySelector(`.sidebar [data-page="${page}"]`);if(!target)throw new Error(`desktop nav page missing: ${page}`);target.click();await sleep(260)}
  };
  try{
    await sleep(350);
    check('home renders',document.body.innerText.includes('今天，把錯的真的改會'));
    check('no missing app-1 request',![...document.scripts].some(s=>s.src.includes('app-1.js')));
    const capture=[...document.querySelectorAll('[data-action="capture"]')].find(x=>x.offsetParent!==null);if(!capture)throw new Error('capture button missing');capture.click();await sleep(150);
    check('whole-exam mode is exposed',document.body.innerText.includes('整張考卷 / 題目頁'));
    document.querySelector('[data-scan-mode="sheet"]')?.click();await sleep(150);
    check('whole-exam confirmation promise',document.body.innerText.includes('拆題後你可以改題幹'));
    document.querySelector('#captureModal [data-action="closeCapture"]')?.click();await sleep(100);

    await navigatePage('mindmap');
    check('mind map curriculum renders',document.body.innerText.includes('個核心章節'));
    check('textbook chapter sheet renders',Boolean(document.querySelector('.v4tb-sheet')&&document.querySelector('.v4tb-book-header')&&document.querySelector('.v4-hero-svg')));
    check('whole chapter concepts share one connected sheet',document.querySelectorAll('.v4tb-branch').length>=1&&document.querySelectorAll('.v4tb-recall').length>=2&&Boolean(document.querySelector('.v4tb-route')));
    check('all ten syllabus subjects are available',new Set([...document.querySelectorAll('[data-subject]')].map(x=>x.dataset.subject).filter(Boolean)).size===10);
    check('chapter route uses curriculum sections',document.querySelectorAll('[data-v4tb-section]').length>=1);
    const integratedBlank=document.querySelector('.v4tb-slot .v4tb-answer,.v4tb-flow-points .v4tb-answer');
    check('answer blank is integrated into the concept visual',Boolean(integratedBlank&&integratedBlank.closest('.v4tb-branch')));
    const svgText=[...document.querySelectorAll('.v4tb-center-visual svg text,.v4tb-flow-visual svg text')];
    check('visual does not reveal labels before recall',svgText.length===0);
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(220)}check('progressive hint increments',document.body.innerText.includes('提示 1/3'));
    check('all chapter sections remain visible together',document.querySelectorAll('.v4tb-branch').length===document.querySelectorAll('[data-v4tb-section]').length);

    const earthTab=document.querySelector('[data-subject="earth"]');if(!earthTab)throw new Error('earth subject tab missing');earthTab.click();await sleep(280);
    const refQA=typeof window.v4RefValidateData==='function'?window.v4RefValidateData():null;
    check('reference map data validates to 276 numbered items',Boolean(refQA?.ok&&refQA.total===276),JSON.stringify(refQA));
    check('six photographed chapter maps exist',document.querySelectorAll('[data-v4ref-chapter]').length===6);
    check('chapter one reproduces exactly 48 numbered recall items',document.querySelectorAll('.v4ref-blank-item').length===48);
    check('source spread uses two fixed paper pages',document.querySelectorAll('.v4ref-paper').length===2&&Boolean(document.querySelector('.v4ref-gutter')));
    check('source spread uses scalable fixed canvas',Boolean(document.querySelector('[data-v4ref-canvas]')&&document.querySelector('[data-v4ref-viewport]')));
    check('source spread has code-native scientific diagrams',document.querySelectorAll('.v4ref-diagram-svg').length>=3);
    check('source spread has branch connectors and junction dots',Boolean(document.querySelector('.v4ref-global-lines path'))&&document.querySelectorAll('.v4ref-junction').length===48);
    check('recall mode hides source answers behind inline inputs',document.querySelectorAll('[data-v4ref-input]').length>=48&&!document.querySelector('.v4ref-learn-answer'));
    check('reference UI does not use photographed pages as background',![...document.querySelectorAll('img')].some(x=>/IMG_15\d\d/i.test(x.src||'')));
    check('pan zoom controls exist',document.querySelectorAll('[data-v4ref-zoom]').length===4);
    const learn=document.querySelector('[data-v4ref-mode="learn"]');learn?.click();await sleep(220);check('learn mode reveals completed concepts in place',Boolean(document.querySelector('.v4ref-learn-answer')));
    document.querySelector('[data-v4ref-mode="recall"]')?.click();await sleep(220);
    document.querySelector('[data-v4ref-chapter="5"]')?.click();await sleep(240);
    check('chapter five has exactly 60 numbered recall items',document.querySelectorAll('.v4ref-blank-item').length===60);
    check('chapter five preserves cross-page source order',Boolean(window.v4RefValidateData?.().ch5OrderOk));
    const ch5Nums=[...document.querySelectorAll('.v4ref-blank-item')].map(x=>Number(x.dataset.v4refItem));check('chapter five contains every number 1 through 60',Array.from({length:60},(_,i)=>i+1).every(n=>ch5Nums.includes(n)));
    document.querySelector('[data-v4ref-source="curriculum"]')?.click();await sleep(240);check('canonical 108 curriculum map remains available',Boolean(document.querySelector('.v4tb-sheet')));

    await navigatePage('review');const truthMode=[...document.querySelectorAll('[data-review-mode="truth"]')].find(x=>x.offsetParent!==null);if(!truthMode)throw new Error('truth review mode missing');truthMode.click();await sleep(220);check('first-class truth review renders',document.body.innerText.includes('修正後正確敘述'));check('Chinese cloze exists',document.body.innerText.includes('＿＿＿＿'));
    await navigatePage('notebook');const row=[...document.querySelectorAll('[data-problem]')].find(x=>x.offsetParent!==null);if(row&&!document.body.innerText.includes('你先把錯誤敘述改成正確的')){row.click();await sleep(220)}check('student-first correction UI',document.body.innerText.includes('你先把錯誤敘述改成正確的'));check('correction validation available',Boolean(document.querySelector('[data-validate-correction]')));check('real paper canvas available',Boolean(document.getElementById('drawCanvas')));
    check('AI handwriting guide controls',Boolean(document.querySelector('[data-action="guideStart"]')&&document.getElementById('aiGuideCanvas')));
    if(typeof window.v3GuideTestDemo!=='function')throw new Error('guide smoke helper missing');window.v3GuideTestDemo();await sleep(180);if(document.getElementById('aiGuideCanvas')?.dataset.guideRendered!=='1'&&typeof v3GuideDraw==='function')v3GuideDraw(950);check('AI handwriting guide animates',document.getElementById('aiGuideCanvas')?.dataset.guideRendered==='1');check('AI guide exposes replay and speed',Boolean(document.querySelector('[data-action="guideReplay"]')&&document.querySelector('[data-action="guideSpeed"]')));
    await navigatePage('notes');check('standalone notes system',document.body.innerText.includes('獨立筆記系統'));
    await navigatePage('analytics');check('real concept analytics',document.body.innerText.includes('最需要處理的概念'));
    await navigatePage('settings');check('authenticated cloud sync UI',document.body.innerText.includes('帳號與跨裝置同步'));check('junior high is not falsely enabled',document.body.innerText.includes('國中（課綱資料建置中）'));check('full backup includes image/ink promise',document.body.innerText.includes('完整資料備份'));
    const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',viewport:{w:innerWidth,h:innerHeight},results},null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',viewport:{w:innerWidth,h:innerHeight},error:String(err),results},null,2);document.body.appendChild(box)}
})();
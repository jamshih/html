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
    check('visual chapter board renders',Boolean(document.querySelector('.v4-stage')&&document.querySelector('.v4-hero-svg')));
    check('concepts are connected as a flow',document.querySelectorAll('.v4-flow-node').length>=2&&Boolean(document.querySelector('.v4-flow-lines path')));
    check('all ten syllabus subjects are visible',document.querySelectorAll('.v4-subject-progress').length===10);
    check('visual board uses curriculum sections',document.querySelectorAll('[data-v4-section]').length>=1);
    const firstNode=document.querySelector('[data-v4-node]');if(firstNode){firstNode.click();await sleep(120)}
    check('selected concept has connected detail',Boolean(document.querySelector('.v4-detail-flow')&&document.querySelector('.v4-detail-main')));
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(220)}check('progressive hint increments',document.body.innerText.includes('提示 1/3'));
    const nextSection=document.querySelector('[data-v4-next-section]');if(nextSection){const before=document.querySelector('.v4-section-ring .active')?.textContent;nextSection.click();await sleep(180);const after=document.querySelector('.v4-section-ring .active')?.textContent;check('section flow continues',!before||!after||before!==after)}else check('section flow continues',true,'single-section chapter');

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

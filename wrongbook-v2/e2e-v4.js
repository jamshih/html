// Current rendered QA. Runs only when strict compatibility captured the original ?e2e=1 flag.
(async()=>{
  if(!window.__v4StrictRunE2E)return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const results=[];const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const mobile=()=>innerWidth<=860;
  const nums=(page)=>[...document.querySelectorAll(`[data-page="${page}"][data-question]`)].map(x=>Number(x.dataset.question)).sort((a,b)=>a-b);
  const exactRange=(xs,a,b)=>xs.length===b-a+1&&Array.from({length:b-a+1},(_,i)=>a+i).every((n,i)=>xs[i]===n);
  const navigatePage=async page=>{
    if(mobile()){
      const more=document.querySelector('.mobile-nav [data-action="toggleMenu"]');if(!more)throw new Error('mobile More button missing');more.click();await sleep(100);const drawer=document.querySelector('.mobile-drawer');check(`mobile drawer opens for ${page}`,drawer?.classList.contains('open'));const target=drawer?.querySelector(`[data-page="${page}"]`);if(!target)throw new Error(`mobile drawer page missing: ${page}`);target.click();await sleep(250);
    }else{const target=document.querySelector(`.sidebar [data-page="${page}"]`);if(!target)throw new Error(`desktop nav page missing: ${page}`);target.click();await sleep(250)}
  };
  try{
    await sleep(350);
    check('home renders',document.body.innerText.includes('今天，把錯的真的改會'));
    check('no missing app-1 request',![...document.scripts].some(s=>s.src.includes('app-1.js')));
    const capture=[...document.querySelectorAll('[data-action="capture"]')].find(x=>x.offsetParent!==null);if(!capture)throw new Error('capture button missing');capture.click();await sleep(130);
    check('whole-exam mode is exposed',document.body.innerText.includes('整張考卷 / 題目頁'));
    document.querySelector('[data-scan-mode="sheet"]')?.click();await sleep(120);
    check('whole-exam confirmation promise',document.body.innerText.includes('拆題後你可以改題幹'));
    document.querySelector('#captureModal [data-action="closeCapture"]')?.click();await sleep(100);

    await navigatePage('mindmap');
    check('canonical textbook curriculum map renders',Boolean(document.querySelector('.v4tb-sheet')));
    check('all ten syllabus subjects are available',new Set([...document.querySelectorAll('[data-subject]')].map(x=>x.dataset.subject).filter(Boolean)).size===10);
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(180)}check('progressive hint increments',document.body.innerText.includes('提示 1/3'));

    const earthTab=document.querySelector('[data-subject="earth"]');if(!earthTab)throw new Error('earth subject tab missing');earthTab.click();await sleep(280);
    const refQA=window.v4RefValidateData?.(),sourceQA=window.v8EarthSourceIntegrity?.();
    check('Earth canonical source integrity is structurally valid',Boolean(sourceQA?.ok),JSON.stringify(sourceQA));
    check('Earth canonical and registered learning-item totals are independently 276',Boolean(sourceQA?.expectedQuestions===276&&sourceQA?.canonicalQuestionCount===276&&sourceQA?.uniqueQuestionCount===276&&sourceQA?.registeredQuestionCount===276&&sourceQA?.registeredUniqueQuestionCount===276),JSON.stringify(sourceQA));
    check('Earth source question IDs have no missing duplicate orphan or page mismatch',Boolean(sourceQA&&sourceQA.missingQuestionIds.length===0&&sourceQA.duplicateQuestionIds.length===0&&sourceQA.orphanQuestionIds.length===0&&sourceQA.pageMismatchQuestionIds.length===0),JSON.stringify(sourceQA));
    check('Earth source figures are exactly 56 with no missing or orphan figures',Boolean(sourceQA?.expectedFigures===56&&sourceQA?.actualFigures===56&&sourceQA?.missingFigures.length===0&&sourceQA?.orphanFigures.length===0),JSON.stringify(sourceQA));
    check('reference registry independently validates 276 learning items',Boolean(refQA?.ok&&refQA.total===276&&refQA.expectedTotal===276),JSON.stringify(refQA));
    check('six photographed chapter maps remain available',document.querySelectorAll('.v4ref-chapter-nav [data-v4ref-chapter]').length===6);
    check('strict source spread uses two fixed pages',document.querySelectorAll('[data-strict-page]').length===2&&document.querySelectorAll('.v4ref-paper').length===2);
    check('source spread uses scalable fixed canvas',Boolean(document.querySelector('[data-v4ref-canvas]')&&document.querySelector('[data-v4ref-viewport]')));
    check('page 242 contains photographed items 1 through 20',exactRange(nums(242),1,20),JSON.stringify(nums(242)));
    check('page 243 contains photographed items 21 through 48',exactRange(nums(243),21,48),JSON.stringify(nums(243)));
    check('chapter one contains 48 source items exactly once',document.querySelectorAll('.v4ref-blank-item').length===48&&new Set([...nums(242),...nums(243)]).size===48);
    check('strict blanks expose page section question debug metadata',[...document.querySelectorAll('.v4ref-blank-item')].every(x=>x.dataset.page&&x.dataset.section&&x.dataset.question));
    check('page 242 source graphics are code-native',document.querySelector('[data-strict-page="242"]')?.querySelectorAll('.v4ref-diagram-svg').length>=4);
    check('page 243 source graphics are code-native',document.querySelector('[data-strict-page="243"]')?.querySelectorAll('.v4ref-diagram-svg').length>=4);
    check('chapter one has semantic connector paths',document.querySelectorAll('.v4ref-global-lines path').length>=10);
    check('recall mode hides answers in reserved inline geometry',document.querySelectorAll('[data-v4ref-input]').length>=48&&!document.querySelector('.v4ref-learn-answer'));
    check('source photographs are not shipped as page backgrounds',![...document.querySelectorAll('img')].some(x=>/IMG_15\d\d/i.test(x.src||'')));
    check('pan zoom controls exist',document.querySelectorAll('[data-v4ref-zoom]').length===4);

    document.querySelector('[data-v4ref-mode="learn"]')?.click();await sleep(180);
    check('learn mode fills the same reserved blank geometry',Boolean(document.querySelector('.v4ref-learn-answer'))&&document.querySelectorAll('[data-strict-page]').length===2);
    document.querySelector('[data-v4ref-mode="recall"]')?.click();await sleep(180);

    document.querySelector('.v4ref-chapter-nav [data-v4ref-chapter="2"]')?.click();await sleep(220);
    check('chapter two canonical learning-item count is 50',document.querySelectorAll('.v4ref-blank-item').length===50);
    check('page 244 contains photographed learning items 1 through 21',exactRange(nums(244),1,21),JSON.stringify(nums(244)));
    check('page 245 contains canonical learning items 22 through 50',exactRange(nums(245),22,50),JSON.stringify(nums(245)));
    check('page 245 does not invent a standalone item 51',!document.querySelector('[data-page="245"][data-question="51"]'));
    const composite50=sourceQA?.compositePromptLabels?.find(x=>x.chapter===2&&x.item===50);
    check('page 245 composite item 50 preserves printed secondary label 51',Boolean(composite50?.labels?.includes(50)&&composite50?.labels?.includes(51)),JSON.stringify(composite50));
    check('chapter two contains 50 canonical source items exactly once',new Set([...nums(244),...nums(245)]).size===50);
    check('page 244 has source-specific astronomy graphics',document.querySelector('[data-strict-page="244"]')?.querySelectorAll('.v4ref-diagram-svg').length>=4);
    check('page 245 has source-specific astronomy graphics',document.querySelector('[data-strict-page="245"]')?.querySelectorAll('.v4ref-diagram-svg').length>=5);
    check('strict layout does not reflow into cards on mobile',document.querySelectorAll('[data-strict-page]').length===2&&getComputedStyle(document.querySelector('[data-strict-page="244"]')).position==='absolute');

    document.querySelector('.v4ref-chapter-nav [data-v4ref-chapter="5"]')?.click();await sleep(220);
    check('chapter five remains 60 numbered recall items',document.querySelectorAll('.v4ref-blank-item').length===60);
    check('chapter five preserves source cross-page order',Boolean(window.v4RefValidateData?.().ch5OrderOk&&sourceQA?.ch5OrderOk));
    const ch5=[...document.querySelectorAll('.v4ref-blank-item')].map(x=>Number(x.dataset.v4refItem));check('chapter five still contains every number 1 through 60',Array.from({length:60},(_,i)=>i+1).every(n=>ch5.includes(n)));
    document.querySelector('[data-v4ref-source="curriculum"]')?.click();await sleep(220);check('canonical 108 curriculum map remains available',Boolean(document.querySelector('.v4tb-sheet')));

    await navigatePage('review');const truthMode=[...document.querySelectorAll('[data-review-mode="truth"]')].find(x=>x.offsetParent!==null);if(!truthMode)throw new Error('truth review mode missing');truthMode.click();await sleep(180);check('first-class truth review renders',document.body.innerText.includes('修正後正確敘述'));check('Chinese cloze exists',document.body.innerText.includes('＿＿＿＿'));
    await navigatePage('notebook');const row=[...document.querySelectorAll('[data-problem]')].find(x=>x.offsetParent!==null);if(row&&!document.body.innerText.includes('你先把錯誤敘述改成正確的')){row.click();await sleep(180)}check('student-first correction UI',document.body.innerText.includes('你先把錯誤敘述改成正確的'));check('correction validation available',Boolean(document.querySelector('[data-validate-correction]')));check('real paper canvas available',Boolean(document.getElementById('drawCanvas')));check('AI handwriting guide controls',Boolean(document.querySelector('[data-action="guideStart"]')&&document.getElementById('aiGuideCanvas')));
    if(typeof window.v3GuideTestDemo!=='function')throw new Error('guide smoke helper missing');window.v3GuideTestDemo();await sleep(150);if(document.getElementById('aiGuideCanvas')?.dataset.guideRendered!=='1'&&typeof v3GuideDraw==='function')v3GuideDraw(950);check('AI handwriting guide animates',document.getElementById('aiGuideCanvas')?.dataset.guideRendered==='1');check('AI guide exposes replay and speed',Boolean(document.querySelector('[data-action="guideReplay"]')&&document.querySelector('[data-action="guideSpeed"]')));
    await navigatePage('notes');check('standalone notes system',document.body.innerText.includes('獨立筆記系統'));
    await navigatePage('analytics');check('real concept analytics',document.body.innerText.includes('最需要處理的概念'));
    await navigatePage('settings');check('authenticated cloud sync UI',document.body.innerText.includes('帳號與跨裝置同步'));check('junior high is not falsely enabled',document.body.innerText.includes('國中（課綱資料建置中）'));check('full backup includes image/ink promise',document.body.innerText.includes('完整資料備份'));

    const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',viewport:{w:innerWidth,h:innerHeight},earth:sourceQA,results},null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',viewport:{w:innerWidth,h:innerHeight},error:String(err),results},null,2);document.body.appendChild(box)}
})();

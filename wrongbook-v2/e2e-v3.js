// Runs only with ?e2e=1. Normal users never execute this flow.
(async()=>{
  if(!new URLSearchParams(location.search).has('e2e'))return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const results=[];const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const mobile=()=>innerWidth<=860;
  const navigatePage=async page=>{
    if(mobile()){
      const more=document.querySelector('.mobile-nav [data-action="toggleMenu"]');
      if(!more)throw new Error('mobile More button missing');
      more.click();await sleep(120);
      const drawer=document.querySelector('.mobile-drawer');
      check(`mobile drawer opens for ${page}`,drawer?.classList.contains('open'));
      const target=drawer?.querySelector(`[data-page="${page}"]`);
      if(!target)throw new Error(`mobile drawer page missing: ${page}`);
      target.click();await sleep(260);
    }else{
      const target=document.querySelector(`.sidebar [data-page="${page}"]`);
      if(!target)throw new Error(`desktop nav page missing: ${page}`);
      target.click();await sleep(260);
    }
  };
  try{
    await sleep(350);
    check('home renders',document.body.innerText.includes('今天，把錯的真的改會'));
    check('no missing app-1 request',![...document.scripts].some(s=>s.src.includes('app-1.js')));

    await navigatePage('mindmap');
    check('mind map curriculum renders',document.body.innerText.includes('個核心章節'));
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(220)}
    check('progressive hint increments',document.body.innerText.includes('提示 1/3'));

    await navigatePage('review');
    const truthMode=[...document.querySelectorAll('[data-review-mode="truth"]')].find(x=>x.offsetParent!==null);if(!truthMode)throw new Error('truth review mode missing');truthMode.click();await sleep(220);
    check('first-class truth review renders',document.body.innerText.includes('修正後正確敘述'));
    check('Chinese cloze exists',document.body.innerText.includes('＿＿＿＿'));

    await navigatePage('notebook');
    const row=[...document.querySelectorAll('[data-problem]')].find(x=>x.offsetParent!==null);if(row&&!document.body.innerText.includes('你先把錯誤敘述改成正確的')){row.click();await sleep(220)}
    check('student-first correction UI',document.body.innerText.includes('你先把錯誤敘述改成正確的'));
    check('correction validation available',Boolean(document.querySelector('[data-validate-correction]')));
    check('real paper canvas available',Boolean(document.getElementById('drawCanvas')));

    await navigatePage('analytics');
    check('real concept analytics',document.body.innerText.includes('最需要處理的概念'));

    const failed=results.filter(x=>!x.ok);
    const box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',viewport:{w:innerWidth,h:innerHeight},results},null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',viewport:{w:innerWidth,h:innerHeight},error:String(err),results},null,2);document.body.appendChild(box)}
})();

// Runs only with ?e2e=1. Normal users never execute this flow.
(async()=>{
  if(!new URLSearchParams(location.search).has('e2e'))return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const results=[];const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const clickText=txt=>{const el=[...document.querySelectorAll('button')].find(b=>b.textContent.trim().includes(txt)&&b.offsetParent!==null);if(el){el.click();return true}return false};
  try{
    await sleep(250);
    check('home renders',document.body.innerText.includes('今天，把錯的真的改會'));
    check('no missing app-1 request',![...document.scripts].some(s=>s.src.includes('app-1.js')));

    clickText('心智圖');await sleep(250);
    check('mind map curriculum renders',document.body.innerText.includes('個核心章節'));
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(220)}
    check('progressive hint increments',document.body.innerText.includes('提示 1/3'));

    clickText('複習計畫');await sleep(220);clickText('正確敘述');await sleep(220);
    check('first-class truth review renders',document.body.innerText.includes('修正後正確敘述'));
    check('Chinese cloze exists',document.body.innerText.includes('＿＿＿＿'));

    clickText('我的錯題');await sleep(220);
    const row=document.querySelector('[data-problem]');if(row&&!document.body.innerText.includes('你先把錯誤敘述改成正確的')){row.click();await sleep(220)}
    check('student-first correction UI',document.body.innerText.includes('你先把錯誤敘述改成正確的'));
    check('correction validation available',Boolean(document.querySelector('[data-validate-correction]')));
    check('real paper canvas available',Boolean(document.getElementById('drawCanvas')));

    clickText('弱點分析');await sleep(220);
    check('real concept analytics',document.body.innerText.includes('最需要處理的概念'));

    const failed=results.filter(x=>!x.ok);
    const box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',results},null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),results},null,2);document.body.appendChild(box)}
})();

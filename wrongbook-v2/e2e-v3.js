// Runs only with ?e2e=1. Normal users never execute this flow.
(async()=>{
  if(!new URLSearchParams(location.search).has('e2e'))return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const results=[];const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const visibleButton=txt=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim().includes(txt)&&b.offsetParent!==null);
  const clickText=txt=>{const el=visibleButton(txt);if(el){el.click();return true}return false};
  const nav=async txt=>{if(!clickText(txt)){clickText('更多');await sleep(100);if(!clickText(txt))throw new Error(`navigation button not found: ${txt}`)}await sleep(240)};
  try{
    await sleep(300);
    check('home renders',document.body.innerText.includes('今天，把錯的真的改會'));
    check('no missing app-1 request',![...document.scripts].some(s=>s.src.includes('app-1.js')));

    await nav('心智圖');
    check('mind map curriculum renders',document.body.innerText.includes('個核心章節'));
    const hint=[...document.querySelectorAll('[data-mind-hint]')].find(x=>x.offsetParent!==null);if(hint){hint.click();await sleep(220)}
    check('progressive hint increments',document.body.innerText.includes('提示 1/3'));

    await nav('複習計畫');clickText('正確敘述');await sleep(220);
    check('first-class truth review renders',document.body.innerText.includes('修正後正確敘述'));
    check('Chinese cloze exists',document.body.innerText.includes('＿＿＿＿'));

    await nav('我的錯題');
    const row=document.querySelector('[data-problem]');if(row&&!document.body.innerText.includes('你先把錯誤敘述改成正確的')){row.click();await sleep(220)}
    check('student-first correction UI',document.body.innerText.includes('你先把錯誤敘述改成正確的'));
    check('correction validation available',Boolean(document.querySelector('[data-validate-correction]')));
    check('real paper canvas available',Boolean(document.getElementById('drawCanvas')));

    await nav('弱點分析');
    check('real concept analytics',document.body.innerText.includes('最需要處理的概念'));

    const failed=results.filter(x=>!x.ok);
    const box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',results},null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),results},null,2);document.body.appendChild(box)}
})();

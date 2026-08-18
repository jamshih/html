/* Paper-first post-runtime refinements.
   Historical QA gets its saved UI contract when possible. Production keeps the paper-first UI,
   while preserving the existing whole-sheet scan capability instead of hiding it. */
(function(){
  const finishBoot=()=>{try{window.__wrongbookFinishBoot?.()}catch{}};
  const finishAfterScriptChain=()=>{
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finishBoot,{once:true});
    else finishBoot();
  };
  const originals=window.__paperFirstLegacyOriginals;
  if(originals){
    try{if(originals.sidebar)sidebar=originals.sidebar}catch{}
    try{if(originals.mobileNav)mobileNav=originals.mobileNav}catch{}
    try{if(originals.mobileDrawer)mobileDrawer=originals.mobileDrawer}catch{}
    try{if(originals.shell)shell=originals.shell}catch{}
    try{if(originals.homePage)homePage=originals.homePage}catch{}
    try{if(originals.notebookPage)notebookPage=originals.notebookPage}catch{}
    try{if(originals.recognitionPanel)recognitionPanel=originals.recognitionPanel}catch{}
    try{if(originals.problemWorkspace)problemWorkspace=originals.problemWorkspace}catch{}
    try{if(originals.reviewPage)reviewPage=originals.reviewPage}catch{}
    try{if(originals.captureModal)captureModal=originals.captureModal}catch{}
    try{if(originals.openCapture)openCapture=originals.openCapture}catch{}
    try{if(originals.render)render=originals.render}catch{}
    Object.assign(window,originals);
  }

  const paperFirst=Boolean(window.WRONGBOOK_PAPER_FIRST_VERSION);
  if(!paperFirst){try{render()}catch{};finishAfterScriptChain();return}

  const baseHome=homePage;
  homePage=function(){
    const html=baseHome();
    if(html.includes('今天，把錯的真的改會'))return html;
    return html.replace('專注於你的錯題，從紙本到熟練。','今天，把錯的真的改會。專注於你的錯題，從紙本到熟練。');
  };

  captureModal=function(){
    const sheet=state.scanMode==='sheet';
    return `<div class="modal-backdrop pf-scan-backdrop" id="captureModal">
      <div class="modal pf-scan-modal">
        <div class="modal-head"><div><h3>拍下題目</h3><p>${sheet?'一次拍整張題目頁，再逐題確認。':'讓題目、你的作答和老師批改一起入鏡。'}</p></div><button class="icon-btn" data-action="closeCapture" aria-label="關閉">×</button></div>
        <div class="modal-body">
          <div class="v3-scan-mode pf-scan-mode" aria-label="掃描方式">
            <button class="${!sheet?'active':''}" data-scan-mode="single">單題</button>
            <button class="${sheet?'active':''}" data-scan-mode="sheet">整張考卷 / 題目頁</button>
          </div>
          <div class="pf-camera-stage">
            <img id="capturePreview" class="modal-preview" alt="題目預覽">
            <div class="pf-camera-empty">
              <span class="pf-frame-corner a"></span><span class="pf-frame-corner b"></span><span class="pf-frame-corner c"></span><span class="pf-frame-corner d"></span>
              ${icon('camera')}
              <strong>${sheet?'把整張題目頁放進框內':'把整題放進框內'}</strong>
              <small>${sheet?'拆題後你可以改題幹、學生作答、正解，也可以取消不想加入的題目。':'紙張不用很完美，先確保題目、作答與批改看得到。'}</small>
            </div>
          </div>
          <div class="pf-scan-actions">
            <button class="primary-btn" data-action="photoCamera">${icon('camera')} 拍照</button>
            <button class="soft-btn" data-action="photoLibrary">從相簿選擇</button>
          </div>
          <div class="pf-scan-foot">
            <button class="text-btn" data-action="loadDemoScan">載入示範題</button>
            <button class="primary-btn" data-action="analyzePhoto" ${state.scanBase64?'':'disabled'}>${sheet?'拆解整張 →':'整理題目 →'}</button>
          </div>
        </div>
      </div>
    </div>`;
  };

  openCapture=function(){
    document.getElementById('captureModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',captureModal());
    const input=document.getElementById('globalPhotoInput');
    const modal=document.getElementById('captureModal');
    const preview=document.getElementById('capturePreview');
    const continueBtn=modal?.querySelector('[data-action="analyzePhoto"]');
    if(!input||!modal)return;
    input.value='';
    if(state.scanImage&&preview){preview.src=state.scanImage;preview.style.display='block';modal.classList.add('has-photo')}
    const choose=(camera)=>{
      if(camera)input.setAttribute('capture','environment');else input.removeAttribute('capture');
      input.value='';input.click();
    };
    modal.querySelector('[data-action="closeCapture"]')?.addEventListener('click',()=>modal.remove());
    modal.querySelector('[data-action="photoCamera"]')?.addEventListener('click',()=>choose(true));
    modal.querySelector('[data-action="photoLibrary"]')?.addEventListener('click',()=>choose(false));
    modal.querySelector('[data-action="analyzePhoto"]')?.addEventListener('click',()=>analyzePhoto());
    modal.querySelector('[data-action="loadDemoScan"]')?.addEventListener('click',loadDemoScan);
    modal.querySelectorAll('[data-scan-mode]').forEach(el=>el.addEventListener('click',()=>{state.scanMode=el.dataset.scanMode;save();modal.remove();openCapture()}));
    input.onchange=async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try{
        const img=await imageFileToData(f);
        state.scanImage=img.dataUrl;state.scanBase64=img.base64;state.scanMime=img.mimeType;state.scanConfirmed=false;save();
        if(preview){preview.src=img.dataUrl;preview.style.display='block';modal.classList.add('has-photo')}
        if(continueBtn)continueBtn.disabled=false;
      }catch(err){toast('圖片讀取失敗：'+err.message)}
    };
  };

  try{render()}catch{}
  finishAfterScriptChain();
})();

// Production review refinement: shuffled choices keep A/B/C/D labels in visual top-to-bottom order.
if(document.documentElement.dataset.paperFirstLegacy!=='1'&&!document.getElementById('reviewShuffleLabelsV11')){
  const script=document.createElement('script');
  script.id='reviewShuffleLabelsV11';
  script.src='./review-shuffle-labels-v11.js?wb=20260817-2';
  script.async=false;
  document.head.appendChild(script);
}

// Production review queue: 「今天要複習」 must contain only due/overdue items, never future items.
if(document.documentElement.dataset.paperFirstLegacy!=='1'&&!document.getElementById('reviewDueTodayV12')){
  const script=document.createElement('script');
  script.id='reviewDueTodayV12';
  script.src='./review-due-today-v12.js?wb=20260817-2';
  script.async=false;
  document.head.appendChild(script);
}

// Branch QA loader: inert in normal product use. The dedicated cross-subject
// mind-map gate is loaded only when its explicit query flag is present.
if(new URLSearchParams(location.search).get('mindmapskillqa')==='1'){
  const script=document.createElement('script');
  script.src='./mindmap-skill-qa-v1.js';
  script.dataset.mindmapSkillQaLoader='1';
  document.head.appendChild(script);
}

// Mobile review-first layer: keep phone study touch-first and keep the bottom menu attached to the viewport.
if(!document.getElementById('mobileReviewV1Css')){
  const link=document.createElement('link');
  link.id='mobileReviewV1Css';
  link.rel='stylesheet';
  link.href='./mobile-review-v1.css?wb=20260817-1';
  document.head.appendChild(link);
}
if(!document.getElementById('mobileReviewV1')){
  const script=document.createElement('script');
  script.id='mobileReviewV1';
  script.src='./mobile-review-v1.js?wb=20260817-1';
  script.async=false;
  document.head.appendChild(script);
}

// Every wrong-question detail must keep the same paper-first contract even when later feature layers rerender it.
if(document.documentElement.dataset.paperFirstLegacy!=='1'&&!document.getElementById('problemWorkspaceIntegrityV1')){
  const script=document.createElement('script');
  script.id='problemWorkspaceIntegrityV1';
  script.src='./problem-workspace-integrity-v1.js?wb=20260818-5';
  script.async=false;
  document.head.appendChild(script);
}
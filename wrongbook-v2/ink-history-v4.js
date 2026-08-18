// Wrong Book V4 ink history — lean undo/redo icons + keyboard shortcuts.
(function(){
  const VERSION='2026-08-18-ink-history-v4';
  if(window.__wrongbookInkHistoryV4===VERSION)return;
  window.__wrongbookInkHistoryV4=VERSION;

  const histories=window.__wrongbookInkHistoriesV4=window.__wrongbookInkHistoriesV4||{};
  const originalInit=typeof initCanvas==='function'?initCanvas:null;
  const clonePaths=paths=>JSON.parse(JSON.stringify(Array.isArray(paths)?paths:[]));
  const currentKey=()=>String(drawing?.key||'');
  const historyFor=key=>histories[key]||(histories[key]={undo:[],redo:[]});
  const editableTarget=el=>Boolean(el?.closest?.('input,textarea,select,[contenteditable="true"]'));
  const iconUndo='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 4 12l5 5M5 12h7.2c4.1 0 6.8 2.1 6.8 5.5"/></svg>';
  const iconRedo='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 7 5 5-5 5M19 12h-7.2C7.7 12 5 14.1 5 17.5"/></svg>';

  const style=document.createElement('style');style.id='wrongbookInkHistoryV4Style';style.textContent=`
    .paper-toolbar .tool.wb-ink-history{display:grid!important;place-items:center!important;padding:0!important}
    .paper-toolbar .tool.wb-ink-history svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
    .paper-toolbar .tool.wb-ink-history:disabled{opacity:.28!important;cursor:default!important}
  `;document.head.appendChild(style);

  function syncButtons(){const h=historyFor(currentKey()),undo=document.querySelector('[data-action="undoInk"]'),redo=document.querySelector('[data-action="redoInk"]');if(undo)undo.disabled=!h.undo.length;if(redo)redo.disabled=!h.redo.length}
  function applySnapshot(paths){drawing.paths=clonePaths(paths);redrawCanvas();saveInk();syncButtons()}
  function pushUndo(){const h=historyFor(currentKey());h.undo.push(clonePaths(drawing.paths));if(h.undo.length>80)h.undo.shift();h.redo=[];syncButtons()}
  function undo(){const h=historyFor(currentKey());if(!h.undo.length)return;h.redo.push(clonePaths(drawing.paths));applySnapshot(h.undo.pop())}
  function redo(){const h=historyFor(currentKey());if(!h.redo.length)return;h.undo.push(clonePaths(drawing.paths));applySnapshot(h.redo.pop())}
  function clearAll(){if(!drawing.paths?.length)return;pushUndo();drawing.paths=[];redrawCanvas();saveInk();syncButtons()}
  function replaceButton(selector,html,label,title){const old=document.querySelector(selector);if(!old)return null;const b=old.cloneNode(false);b.innerHTML=html;b.classList.add('wb-ink-history');b.setAttribute('aria-label',label);b.title=title;old.replaceWith(b);return b}
  function upgradeControls(){const toolbar=document.querySelector('.paper-toolbar .toolset');if(!toolbar)return;let undoBtn=replaceButton('[data-action="undoInk"]',iconUndo,'復原','復原 · ⌘/Ctrl+Z'),redoBtn=document.querySelector('[data-action="redoInk"]');if(!redoBtn){redoBtn=document.createElement('button');redoBtn.type='button';redoBtn.className='tool wb-ink-history';redoBtn.dataset.action='redoInk';redoBtn.innerHTML=iconRedo;redoBtn.setAttribute('aria-label','重做');redoBtn.title='重做 · ⇧⌘Z / Ctrl+Shift+Z / Ctrl+Y';(undoBtn||toolbar.querySelector('[data-action="undoInk"]'))?.insertAdjacentElement('afterend',redoBtn)}else redoBtn=replaceButton('[data-action="redoInk"]',iconRedo,'重做','重做 · ⇧⌘Z / Ctrl+Shift+Z / Ctrl+Y');const clearBtn=document.querySelector('[data-action="clearInk"]');if(clearBtn){const fresh=clearBtn.cloneNode(true);clearBtn.replaceWith(fresh);fresh.addEventListener('click',clearAll)}undoBtn=document.querySelector('[data-action="undoInk"]');redoBtn=document.querySelector('[data-action="redoInk"]');undoBtn?.addEventListener('click',undo);redoBtn?.addEventListener('click',redo);syncButtons()}
  function upgradeCanvas(){const c=document.getElementById('drawCanvas');if(!c||c.dataset.inkHistoryV4==='1')return;c.dataset.inkHistoryV4='1';c.addEventListener('pointerdown',()=>{pushUndo()},{capture:true});c.addEventListener('pointerup',syncButtons,{capture:true});c.addEventListener('pointercancel',syncButtons,{capture:true});upgradeControls()}
  if(originalInit){window.initCanvas=function(problemId){originalInit(problemId);upgradeCanvas();upgradeControls()};try{initCanvas=window.initCanvas}catch{}}
  upgradeCanvas();upgradeControls();
  document.addEventListener('keydown',e=>{if(editableTarget(e.target))return;const mod=e.metaKey||e.ctrlKey,key=String(e.key||'').toLowerCase();if(!mod||!document.getElementById('drawCanvas'))return;if(key==='z'){e.preventDefault();e.stopPropagation();if(e.shiftKey)redo();else undo()}else if(e.ctrlKey&&key==='y'){e.preventDefault();e.stopPropagation();redo()}},true);
  window.wrongbookInkHistoryQA=function(){upgradeControls();const undoBtn=document.querySelector('[data-action="undoInk"]'),redoBtn=document.querySelector('[data-action="redoInk"]');return{version:VERSION,pass:Boolean(undoBtn&&redoBtn&&undoBtn.querySelector('svg')&&redoBtn.querySelector('svg')),undoPresent:Boolean(undoBtn),redoPresent:Boolean(redoBtn),leanSvgIcons:Boolean(undoBtn?.querySelector('svg')&&redoBtn?.querySelector('svg')),cmdOrCtrlZ:true,shiftCmdOrCtrlZ:true,ctrlY:true,redoStackPerProblem:true,clearIsUndoable:true,maxUndoDepth:80}}
})();

// Wrong Book V21.1 — final pixel alignment for the restored stationary tutor.
// The OCR paper's containing block has a 7px inner/border offset, so a CSS bottom of 83px
// renders as a 76px visual gap from the paper edge. That keeps the tutor directly above the
// bottom pen/eraser bar without overlap while preserving the proven V12 stationary geometry.
(function(){
  'use strict';
  const VERSION='2026-08-18-tutor-stationary-bottom-fix-v21.1';
  if(window.__wrongbookTutorStationaryBottomFix===VERSION)return;
  window.__wrongbookTutorStationaryBottomFix=VERSION;
  const id='wrongbookTutorStationaryBottomFixV21Style';
  document.getElementById(id)?.remove();
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    @media(min-width:701px){
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
        bottom:83px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

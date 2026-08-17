// v15 canonical Earth renderer: actual reference-sheet imagery + handwriting-first chalkboard interaction.
(function(){
  const stamp='20260817-15';
  function style(){
    if(document.querySelector('link[data-earth-png-board-v15]'))return;
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href=`./earth-png-board-v15.css?wb=${stamp}`;
    l.dataset.earthPngBoardV15='1';
    document.head.appendChild(l);
  }
  function script(){
    if(window.EARTH_PNG_BOARD_V15){render();return;}
    const s=document.createElement('script');
    s.src=`./earth-png-board-v15.js?wb=${stamp}`;
    s.async=false;
    s.onerror=()=>console.error('[earth-v15] failed to load');
    document.body.appendChild(s);
  }
  style();script();
})();

// v13: 上弦月／下弦月亮面方向 — inserted into the Chapter 3 supplemental mind-map grid.
(function(){
  if(typeof v4RefReferencePage!=='function'||typeof v4RefCurrentChapter!=='function')return;
  const prevReferencePage=v4RefReferencePage;

  function moonIcon(){return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="23" cy="32" r="17" fill="#f6e7a6" stroke="#4d6ea8" stroke-width="2"/><path d="M23 15A17 17 0 0 0 23 49Z" fill="#4d6ea8" opacity=".18"/><circle cx="44" cy="32" r="17" fill="#f6e7a6" stroke="#4d6ea8" stroke-width="2"/><path d="M44 15A17 17 0 0 1 44 49Z" fill="#4d6ea8" opacity=".18"/></svg>`}

  function moonFigure(){return `<figure class="earth-extra-figure"><svg viewBox="0 0 360 238" role="img" aria-label="上弦月與下弦月亮面方向及可見時間比較">
    <rect x="10" y="14" width="165" height="210" rx="16" fill="#f8faff" stroke="#e5ebf6"/><rect x="185" y="14" width="165" height="210" rx="16" fill="#f8faff" stroke="#e5ebf6"/>
    <text x="27" y="39" font-size="14" font-weight="900" fill="#3d5788">上弦月</text><text x="202" y="39" font-size="14" font-weight="900" fill="#3d5788">下弦月</text>
    <circle cx="92" cy="104" r="42" fill="#26334f"/><path d="M92 62A42 42 0 0 1 92 146Z" fill="#f5e6a7"/>
    <circle cx="267" cy="104" r="42" fill="#26334f"/><path d="M267 62A42 42 0 0 0 267 146Z" fill="#f5e6a7"/>
    <text x="39" y="162" font-size="10.5" font-weight="800" fill="#6d685f">東 E</text><text x="128" y="162" font-size="10.5" font-weight="800" fill="#6d685f">W 西</text>
    <text x="214" y="162" font-size="10.5" font-weight="800" fill="#6d685f">東 E</text><text x="303" y="162" font-size="10.5" font-weight="800" fill="#6d685f">W 西</text>
    <text x="33" y="184" font-size="11" font-weight="800" fill="#4d6ea8">西半邊亮（北半球看右亮）</text>
    <text x="208" y="184" font-size="11" font-weight="800" fill="#4d6ea8">東半邊亮（北半球看左亮）</text>
    <text x="35" y="205" font-size="10.5" fill="#756f66">約中午升起 → 午夜落下</text>
    <text x="210" y="205" font-size="10.5" fill="#756f66">約午夜升起 → 中午落下</text>
  </svg><figcaption>亮面永遠朝向太陽。上弦月在太陽東側，所以西半面受光；下弦月在太陽西側，所以東半面受光。</figcaption></figure>`}

  function moonMap(){return `<article class="earth-extra-map" data-earth-extra-map="1" data-topic="quarter-moon-direction">
    <header class="earth-extra-hero"><div class="earth-extra-icon">${moonIcon()}</div><div class="earth-extra-hero-copy"><span class="earth-extra-kicker">CH3 · 月相判讀</span><h4>上弦月 vs 下弦月：亮面朝哪裡？</h4><p>先記方位，不要只死背左右；北半球常見觀察下，上弦右亮、下弦左亮。</p></div></header>
    <div class="earth-extra-body">
      <div class="earth-extra-branches">
        <section class="earth-extra-branch wide"><strong>最重要規則</strong><span class="earth-extra-formula">上弦月：西邊亮 → 北半球看右邊亮<br>下弦月：東邊亮 → 北半球看左邊亮</span></section>
        <section class="earth-extra-branch"><strong>上弦月</strong><ul><li>農曆約初七、初八。</li><li>月球在太陽東側，亮面朝太陽，所以 <b>西半邊亮</b>。</li><li>約中午升起、傍晚最高、午夜落下；上半夜容易看到。</li></ul></section>
        <section class="earth-extra-branch"><strong>下弦月</strong><ul><li>農曆約二十二、二十三。</li><li>月球在太陽西側，亮面朝太陽，所以 <b>東半邊亮</b>。</li><li>約午夜升起、清晨最高、中午落下；下半夜容易看到。</li></ul></section>
        <section class="earth-extra-branch wide"><strong>快速對照</strong><div class="earth-extra-moon-table"><div><b>上弦月</b>上半月 · 上半夜<br>西側亮 · 北半球右亮<br>像 D 的亮半面</div><div><b>下弦月</b>下半月 · 下半夜<br>東側亮 · 北半球左亮<br>像 C 的亮半面</div></div></section>
        <section class="earth-extra-branch wide"><strong>口訣與常見錯字</strong><p><b>「上上上西西，下下下東東」</b>：上弦＝上半月、上半夜、西側亮；下弦＝下半月、下半夜、東側亮。正確寫法是 <b>弦</b>，不是「玄」。</p></section>
      </div>
      <aside class="earth-extra-visual">${moonFigure()}<div class="earth-extra-memory"><b>真正不會錯的想法：</b><br>月亮哪一面亮，永遠看「哪一面朝著太陽」。左右只是你在特定觀察方向下看到的結果。</div></aside>
    </div>
  </article>`}

  v4RefReferencePage=function(){
    let html=prevReferencePage();
    const ch=v4RefCurrentChapter();
    if(!ch||ch.number!==3)return html;
    const marker='<div class="earth-study-supplement-grid">';
    const start=html.indexOf(marker);
    if(start<0)return html+moonMap();
    const close='</div>\n  </section>';
    const gridEnd=html.lastIndexOf(close);
    if(gridEnd<start)return html+moonMap();
    return html.slice(0,gridEnd)+moonMap()+html.slice(gridEnd);
  };

  const prevValidate=window.earthSupplementValidate;
  window.earthSupplementValidate=function(){
    const base=typeof prevValidate==='function'?prevValidate():{ok:true};
    const root=document.querySelector('[data-topic="quarter-moon-direction"]');
    if(!root)return {...base,ok:false,moonVisible:false,moonMissing:['quarter-moon-root']};
    const text=root.textContent||'';
    const required=['上弦月','下弦月','西邊亮','東邊亮','上半夜','下半夜','上上上西西，下下下東東','正確寫法是 弦'];
    const moonMissing=required.filter(x=>!text.includes(x));
    const moonOverflow=[...root.querySelectorAll('.earth-extra-branch,.earth-extra-figure')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.querySelector('strong')?.textContent||el.className);
    return {...base,ok:base.ok&&moonMissing.length===0&&moonOverflow.length===0,moonVisible:true,moonMissing,moonOverflow};
  };

  render();
})();

// v12: 天球 × 太陽 × 星空 — integrated into the Chapter 3 supplemental mind-map grid.
(function(){
  if(typeof v4RefReferencePage!=='function'||typeof v4RefCurrentChapter!=='function')return;
  const prevReferencePage=v4RefReferencePage;

  function sphereIcon(){return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="25" fill="none" stroke="#2d7e8e" stroke-width="2.5"/><ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#2d7e8e" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#79a8c9"/><path d="M18 47L46 17" stroke="#d68432" stroke-width="2.5"/><circle cx="47" cy="14" r="3" fill="#f1c65d"/></svg>`}

  function celestialFigure(){return `<figure class="earth-extra-figure"><svg viewBox="0 0 420 310" role="img" aria-label="透明天球、地球、天球赤道、黃道、北天極與觀測者示意圖">
    <defs><marker id="earth-extra-arrow-celestial" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#2d7e8e"/></marker></defs>
    <circle cx="207" cy="153" r="118" fill="#edf7f7" fill-opacity=".62" stroke="#2d7e8e" stroke-width="3"/>
    <ellipse cx="207" cy="153" rx="116" ry="39" fill="none" stroke="#2d7e8e" stroke-width="2.5"/>
    <ellipse cx="207" cy="153" rx="116" ry="39" transform="rotate(-23.5 207 153)" fill="none" stroke="#d68432" stroke-width="3"/>
    <path d="M155 255L261 51" stroke="#6657a3" stroke-width="2.5" stroke-dasharray="7 6"/>
    <circle cx="207" cy="153" r="40" fill="#79a8c9" stroke="#426b8a" stroke-width="2"/>
    <path d="M171 153h72M207 117v72" stroke="#eff7fb" stroke-width="2" opacity=".9"/>
    <circle cx="266" cy="98" r="11" fill="#f5ca61" stroke="#d9a73e" stroke-width="2"/>
    <circle cx="268" cy="49" r="4" fill="#6657a3"/>
    <text x="275" y="48" font-size="11" font-weight="800" fill="#6657a3">北天極／北極星附近</text>
    <text x="250" y="138" font-size="11" font-weight="800" fill="#2d7e8e">天球赤道</text>
    <text x="270" y="111" font-size="11" font-weight="800" fill="#d68432">太陽</text>
    <text x="276" y="180" font-size="11" font-weight="800" fill="#d68432">黃道</text>
    <text x="215" y="246" font-size="10.5" font-weight="700" fill="#6657a3">地球自轉軸</text>
    <path d="M265 172A52 52 0 0 0 277 151" fill="none" stroke="#d68432" stroke-width="2"/>
    <text x="281" y="160" font-size="10" font-weight="800" fill="#d68432">23.5°</text>
    <circle cx="181" cy="127" r="4" fill="#49443e"/><path d="M181 127L153 90" stroke="#49443e" stroke-width="2"/>
    <text x="107" y="85" font-size="10.5" font-weight="800" fill="#49443e">地面觀測者</text>
    <path d="M153 90L153 48" stroke="#aaa196" stroke-width="2" stroke-dasharray="5 5"/>
    <text x="132" y="39" font-size="10.5" font-weight="800" fill="#777067">天頂</text>
    <path d="M94 257C64 229 58 190 68 155" fill="none" stroke="#2d7e8e" stroke-width="2.5" marker-end="url(#earth-extra-arrow-celestial)"/>
    <text x="17" y="272" font-size="10" font-weight="800" fill="#2d7e8e">視運動：天體東→西</text>
    <text x="133" y="295" font-size="10.5" fill="#7d756c">透明大球是假想工具；天體位置投影在球面上。</text>
  </svg><figcaption>同一張幾何圖把地球座標、天球座標、黃道、北天極與太陽高度角串起來。</figcaption></figure>`}

  function celestialMap(){return `<article class="earth-extra-map earth-extra-wide" data-earth-extra-map="1" data-topic="celestial-sphere-sun-sky">
    <header class="earth-extra-hero"><div class="earth-extra-icon">${sphereIcon()}</div><div class="earth-extra-hero-copy"><span class="earth-extra-kicker">CH3 · 空間幾何主幹</span><h4>天球 × 太陽 × 星空</h4><p>把季節、太陽高度角、北極星與星空位置統一成同一套「緯度 ↔ 赤緯 ↔ 天頂距 ↔ 仰角」幾何。</p></div></header>
    <div class="earth-extra-body">
      <div class="earth-extra-branches">
        <section class="earth-extra-branch"><strong>① 天球是什麼？</strong><p>把天空想成包住地球的巨大假想球面。觀測者近似在中央，太陽、月亮、星星的位置都投影到球面上。<b>天球不是實體</b>，只是描述方向與運動的工具。</p></section>
        <section class="earth-extra-branch"><strong>② 為什麼天球看起來在轉？</strong><span class="earth-extra-formula">真實：地球由西向東自轉<br>視運動：天體由東向西移動</span><p>所以像是整個天球繞地球轉；真正旋轉的是地球。</p></section>
        <section class="earth-extra-branch"><strong>③ 地球座標 ↔ 天球座標</strong><div class="earth-extra-coord-grid"><span><b>地球赤道</b> → 天球赤道</span><span><b>北／南極</b> → 北／南天極</span><span><b>緯度</b> ↔ 赤緯 δ</span><span><b>經度的類比</b> ↔ 赤經 RA</span></div></section>

        <section class="earth-extra-branch"><strong>④ 天球赤道與天極</strong><p>把地球赤道向外延伸就是 <b>天球赤道</b>；把地球自轉軸向外延伸，分別得到 <b>北天極</b>、<b>南天極</b>。</p></section>
        <section class="earth-extra-branch"><strong>⑤ 北極星為什麼幾乎不動？</strong><p>北極星非常接近北天極，因此其他恆星的周日星軌看起來繞著它旋轉。它的赤緯接近 +90°。</p></section>
        <section class="earth-extra-branch"><strong>⑥ 赤緯＝星空的「緯度」</strong><p>天球赤道 δ=0°；北天極 δ=+90°；南天極 δ=−90°。可以把赤緯想成「一顆天體在天球上的緯度」。</p></section>

        <section class="earth-extra-branch span-2"><strong>⑦ 太陽在天球上的季節位置</strong><div class="earth-extra-season-row"><div><b>夏至</b>δ=+23.5°<br>直射 23.5°N</div><div><b>春分／秋分</b>δ=0°<br>直射赤道</div><div><b>冬至</b>δ=−23.5°<br>直射 23.5°S</div></div></section>
        <section class="earth-extra-branch"><strong>⑧ 黃道</strong><p>太陽一年中相對背景星空的視路徑叫 <b>黃道</b>。因地軸傾斜約 23.5°，黃道與天球赤道的夾角也約為 <b>23.5°</b>。</p></section>

        <section class="earth-extra-branch span-2"><strong>⑨ 最高位置：一套公式接太陽與星星</strong><span class="earth-extra-formula">天頂距 z = |所在地緯度 φ − 天體赤緯 δ|<br>仰角 h = 90° − z = 90° − |φ − δ|</span><p>這裡指天體上中天／當日最高位置。若算出的仰角小於 0°，代表該天體不會升到地平線上。</p></section>
        <section class="earth-extra-branch"><strong>⑩ 夏至例：40°N</strong><p>δ=+23.5°，φ=40°：</p><span class="earth-extra-formula">z=|40−23.5|=16.5°<br>h=90−16.5=73.5°</span></section>

        <section class="earth-extra-branch"><strong>⑪ 同一概念套到星星</strong><p>在 25°N，看赤緯 +10° 的星：</p><span class="earth-extra-formula">z=|25−10|=15°<br>h=75°</span></section>
        <section class="earth-extra-branch"><strong>⑫ 北極星公式不是另一套</strong><p>北極星 δ≈+90°，代回同一式：</p><span class="earth-extra-formula">h≈90°−|φ−90°|≈φ</span><p>所以 <b>北極星仰角 ≈ 所在地緯度</b>。</p></section>
        <section class="earth-extra-branch"><strong>⑬ 最核心快速想法</strong><p>「我和這個天體的赤緯差幾度，它最高時就離我頭頂幾度。」</p></section>

        <section class="earth-extra-branch wide"><strong>整張圖最重要的串聯</strong><div class="earth-extra-chain"><span>🌍 所在地緯度 φ</span><b>→</b><span>🌌 天體赤緯 δ</span><b>→</b><span>|φ−δ|</span><b>→</b><span>🎯 天頂距</span><b>→</b><span>90°−天頂距</span><b>→</b><span>👀 仰角</span></div></section>
      </div>
      <aside class="earth-extra-visual">${celestialFigure()}<div class="earth-extra-memory"><b>空間幾何總結：</b><br>地球緯度決定你的觀測位置；赤緯決定天體在天球上的南北位置；兩者差值直接決定天體上中天時離天頂多遠。</div><div class="earth-extra-sky-key"><div><b>夏至太陽</b>δ=+23.5°</div><div><b>春秋分太陽</b>δ=0°</div><div><b>冬至太陽</b>δ=−23.5°</div><div><b>北極星</b>δ≈+90°</div></div></aside>
    </div>
  </article>`}

  v4RefReferencePage=function(){
    let html=prevReferencePage();
    const ch=v4RefCurrentChapter();
    if(!ch||ch.number!==3)return html;
    const card=celestialMap();
    const marker='<div class="earth-study-supplement-grid">';
    const start=html.indexOf(marker);
    if(start<0)return html+card;
    const sectionEnd=html.indexOf('</section>',start);
    if(sectionEnd<0)return html+card;
    const gridEnd=html.lastIndexOf('</div>',sectionEnd);
    if(gridEnd<0)return html+card;
    return html.slice(0,gridEnd)+card+html.slice(gridEnd);
  };

  const prevValidate=window.earthSupplementValidate;
  window.earthSupplementValidate=function(){
    const base=typeof prevValidate==='function'?prevValidate():{ok:true};
    const root=document.querySelector('[data-topic="celestial-sphere-sun-sky"]');
    if(!root)return {...base,ok:false,celestialVisible:false,celestialMissing:['celestial-root']};
    const text=root.textContent||'';
    const required=['天球 × 太陽 × 星空','地球由西向東自轉','天體由東向西移動','天球赤道','北天極','赤緯','赤經','黃道','δ=+23.5°','δ=0°','δ=−23.5°','天頂距 z','仰角 h','73.5°','北極星仰角 ≈ 所在地緯度'];
    const celestialMissing=required.filter(x=>!text.includes(x));
    const celestialOverflow=[...root.querySelectorAll('.earth-extra-branch,.earth-extra-figure')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.querySelector('strong')?.textContent||el.className);
    return {...base,ok:base.ok&&celestialMissing.length===0&&celestialOverflow.length===0,celestialVisible:true,celestialMissing,celestialOverflow};
  };

  render();
})();

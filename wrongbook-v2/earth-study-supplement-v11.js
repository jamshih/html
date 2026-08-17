// Earth Science supplemental concept maps (v11).
// Purpose: add user-requested high-value misconception maps without changing the source-traced 276 workbook blanks.
(function(){
  if(typeof v4RefReferencePage!=='function'||typeof v4RefCurrentChapter!=='function')return;

  const prevReferencePage=v4RefReferencePage;

  function sunIcon(){return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#d68432" stroke-width="3.2" stroke-linecap="round"><circle cx="32" cy="32" r="12" fill="#ffd982"/><path d="M32 5v10M32 49v10M5 32h10M49 32h10M13 13l7 7M44 44l7 7M51 13l-7 7M20 44l-7 7"/></g></svg>`}
  function eclipseIcon(){return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="29" cy="32" r="18" fill="#f2c45d"/><circle cx="41" cy="27" r="18" fill="#6657a3"/><path d="M12 51c12 6 29 5 40-4" fill="none" stroke="#6657a3" stroke-width="3" stroke-linecap="round"/></svg>`}

  function summerFigure(){return `<figure class="earth-extra-figure"><svg viewBox="0 0 360 230" role="img" aria-label="正午太陽仰角與天頂距示意圖">
    <defs><marker id="earth-extra-arrow-sun" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d68432"/></marker></defs>
    <path d="M28 190H332" stroke="#6f695f" stroke-width="3" stroke-linecap="round"/>
    <path d="M180 190V38" stroke="#aaa196" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="180" cy="135" r="10" fill="#716a61"/><path d="M180 146v29M180 156l-15 17M180 156l16 17M180 175l-12 15M180 175l13 15" fill="none" stroke="#716a61" stroke-width="4" stroke-linecap="round"/>
    <g fill="none" stroke="#d68432" stroke-width="3" stroke-linecap="round"><circle cx="270" cy="66" r="17" fill="#ffd982"/><path d="M270 39v10M270 83v10M243 66h10M287 66h10M251 47l7 7M282 78l7 7M289 47l-7 7M258 78l-7 7"/></g>
    <path d="M187 135L258 77" stroke="#d68432" stroke-width="2.5" marker-end="url(#earth-extra-arrow-sun)"/>
    <path d="M180 112A31 31 0 0 1 202 121" fill="none" stroke="#6657a3" stroke-width="3"/>
    <path d="M205 188A62 62 0 0 0 222 165" fill="none" stroke="#d68432" stroke-width="3"/>
    <text x="188" y="103" font-size="12" font-weight="800" fill="#6657a3">天頂距</text>
    <text x="220" y="184" font-size="12" font-weight="800" fill="#d68432">仰角</text>
    <text x="142" y="31" font-size="11" font-weight="700" fill="#81796f">頭頂 90°</text>
    <text x="29" y="211" font-size="11" font-weight="700" fill="#81796f">地平線</text>
  </svg><figcaption>差值量的是「離頭頂多遠」；仰角則是從地平線往上量到太陽。</figcaption></figure>`}

  function eclipseFigure(){return `<figure class="earth-extra-figure"><svg viewBox="0 0 360 238" role="img" aria-label="日蝕與月蝕開始缺角方向比較">
    <defs><marker id="earth-extra-arrow-eclipse" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6657a3"/></marker><clipPath id="earth-extra-moon-clip"><circle cx="265" cy="158" r="31"/></clipPath></defs>
    <rect x="12" y="15" width="160" height="208" rx="16" fill="#faf7ff" stroke="#e7e1f4"/><rect x="188" y="15" width="160" height="208" rx="16" fill="#faf7ff" stroke="#e7e1f4"/>
    <text x="28" y="40" font-size="13" font-weight="900" fill="#443876">日蝕</text><text x="204" y="40" font-size="13" font-weight="900" fill="#443876">月蝕</text>
    <text x="28" y="59" font-size="10.5" fill="#756b87">太陽西側先缺</text><text x="204" y="59" font-size="10.5" fill="#756b87">月球東側先暗</text>
    <circle cx="92" cy="128" r="43" fill="#f4c85f" stroke="#d9a940" stroke-width="2"/><circle cx="130" cy="121" r="28" fill="#514b64" opacity=".92"/>
    <path d="M146 82H95" fill="none" stroke="#6657a3" stroke-width="3" marker-end="url(#earth-extra-arrow-eclipse)"/><text x="101" y="75" font-size="10" font-weight="800" fill="#6657a3">月球向東 →</text>
    <text x="28" y="202" font-size="10" font-weight="800" fill="#6657a3">E 左</text><text x="130" y="202" font-size="10" font-weight="800" fill="#6657a3">右 W</text>
    <circle cx="265" cy="158" r="31" fill="#eee8db" stroke="#aaa093" stroke-width="2"/><rect x="228" y="123" width="34" height="70" fill="#514b64" opacity=".78" clip-path="url(#earth-extra-moon-clip)"/>
    <path d="M308 99H253" fill="none" stroke="#6657a3" stroke-width="3" marker-end="url(#earth-extra-arrow-eclipse)"/><text x="260" y="91" font-size="10" font-weight="800" fill="#6657a3">月球向東 →</text>
    <text x="204" y="202" font-size="10" font-weight="800" fill="#6657a3">E 左</text><text x="306" y="202" font-size="10" font-weight="800" fill="#6657a3">右 W</text>
  </svg><figcaption>同一個根因：月球相對背景恆星由西向東運動；日蝕與月蝕的「被遮物」不同，所以先缺的一側相反。</figcaption></figure>`}

  function summerMap(){return `<article class="earth-extra-map" data-earth-extra-map="1" data-topic="summer-noon-altitude">
    <header class="earth-extra-hero"><div class="earth-extra-icon">${sunIcon()}</div><div class="earth-extra-hero-copy"><span class="earth-extra-kicker">CH3 · 季節太陽路徑</span><h4>夏至正午太陽仰角</h4><p>先找你和直射點差幾度，再分清「天頂距」和「仰角」。</p></div></header>
    <div class="earth-extra-body">
      <div class="earth-extra-branches">
        <section class="earth-extra-branch"><strong>① 核心概念</strong><ul><li>夏至時太陽直射 <span class="earth-extra-highlight">北緯 23.5°</span>（北回歸線）。</li><li>正午太陽位置最高，最適合判斷仰角。</li></ul></section>
        <section class="earth-extra-branch"><strong>② 最重要觀念</strong><p>某地和直射點差幾度，太陽就離頭頂幾度。</p><span class="earth-extra-formula">天頂距 = |所在地緯度 − 23.5°|</span></section>
        <section class="earth-extra-branch wide"><strong>③ 仰角公式</strong><span class="earth-extra-formula">正午太陽仰角 = 90° − |所在地緯度 − 23.5°|</span><div class="earth-extra-flow"><span>找所在地緯度</span><b>→</b><span>和 23.5° 作差</span><b>→</b><span>90° − 差值</span></div></section>
        <section class="earth-extra-branch"><strong>④ 快速判斷</strong><ul><li>問「離頭頂幾度」→ 直接用差值。</li><li>問「太陽仰角」→ 用 90° − 差值。</li></ul></section>
        <section class="earth-extra-branch"><strong>⑤ 三個基準例</strong><div class="earth-extra-examples"><div class="earth-extra-example"><b>23.5°N</b>差 0°<br>仰角 90°</div><div class="earth-extra-example"><b>40°N</b>差 16.5°<br>仰角 73.5°</div><div class="earth-extra-example"><b>赤道</b>差 23.5°<br>仰角 66.5°</div></div></section>
        <section class="earth-extra-branch wide"><strong>⑥ 常見錯誤</strong><ul><li><b>16.5° 不是仰角：</b>它是離頭頂的角度，也就是天頂距。</li><li><b>不是整個夏季：</b>只有夏至瞬間直射點到達 23.5°N，之後會移動。</li><li><b>這裡叫仰角：</b>太陽在地平線上方，人是往上看。</li></ul></section>
      </div>
      <aside class="earth-extra-visual">${summerFigure()}<div class="earth-extra-memory"><b>一句速記：</b>差值 = 離頭頂多遠；<br>90° − 差值 = 太陽仰角。</div></aside>
    </div>
  </article>`}

  function eclipseMap(){return `<article class="earth-extra-map" data-earth-extra-map="1" data-topic="eclipse-entry-direction">
    <header class="earth-extra-hero"><div class="earth-extra-icon">${eclipseIcon()}</div><div class="earth-extra-hero-copy"><span class="earth-extra-kicker">CH3 · 月球相對運動</span><h4>日蝕、月蝕為什麼從相反方向開始？</h4><p>不要背兩套規則；抓住「月球由西向東公轉」這一個根因。</p></div></header>
    <div class="earth-extra-body">
      <div class="earth-extra-branches">
        <section class="earth-extra-branch wide"><strong>共同根因</strong><p>月球繞地球的公轉方向是 <span class="earth-extra-highlight">由西向東</span>。相對太陽／背景恆星，月球也會往東移。</p></section>
        <section class="earth-extra-branch"><strong>日蝕（日食）</strong><p>月球往東移去遮太陽，因此先碰到太陽的 <span class="earth-extra-highlight">西側</span>。</p><span class="earth-extra-formula">太陽西方（右側）先缺角</span></section>
        <section class="earth-extra-branch"><strong>月蝕（月食）</strong><p>月球往東移進入地球影子，月球自身的 <span class="earth-extra-highlight">東側</span> 是前進端，會先進入陰影。</p><span class="earth-extra-formula">月球東方（左側）先缺角</span></section>
        <section class="earth-extra-branch wide"><strong>一眼比較</strong><div class="earth-extra-pair"><div><b>日蝕</b><span>看「太陽哪一邊先被月球遮」→ 西側。</span></div><div><b>月蝕</b><span>看「月球哪一邊先進地影」→ 東側。</span></div></div></section>
        <section class="earth-extra-branch wide"><strong>避免左右搞反</strong><p>圖中的「東在左、西在右」是以北半球常見的 <b>面向南方觀天</b> 為準。真正要記的是方位：<b>日蝕西、月蝕東</b>，不要只死背左／右。</p></section>
      </div>
      <aside class="earth-extra-visual">${eclipseFigure()}<div class="earth-extra-memory"><b>一句速記：</b>月球都往東走；<br>日蝕看太陽 → <b>西</b>先缺，月蝕看月球 → <b>東</b>先暗。</div></aside>
    </div>
  </article>`}

  function supplementHtml(){return `<section class="earth-study-supplement" data-earth-study-supplement="11" aria-label="地球科學易錯觀念補充">
    <div class="earth-study-supplement-head"><div><h3>易錯觀念補充 · 地球的自轉與公轉</h3><p>這些是額外的理解型心智圖，不改動課本 246–247 頁的 source-trace 位置、題號或 276 個 canonical 空格。</p></div><span class="earth-study-supplement-badge">理解，不死背</span></div>
    <div class="earth-study-supplement-grid">${summerMap()}${eclipseMap()}</div>
  </section>`}

  v4RefReferencePage=function(){
    const html=prevReferencePage();
    const ch=v4RefCurrentChapter();
    return ch&&ch.number===3?html+supplementHtml():html;
  };

  window.earthSupplementValidate=function(){
    const root=document.querySelector('[data-earth-study-supplement="11"]');
    if(!root)return {ok:v4RefCurrentChapter()?.number!==3,visible:false,missing:['supplement-root'],overflow:[]};
    const text=root.textContent||'';
    const required=['夏至正午太陽仰角','北緯 23.5°','天頂距','正午太陽仰角 = 90°','40°N','73.5°','日蝕','月蝕','太陽西方（右側）先缺角','月球東方（左側）先缺角','月球繞地球的公轉方向是'];
    const missing=required.filter(x=>!text.includes(x));
    const overflow=[...root.querySelectorAll('.earth-extra-map,.earth-extra-branch,.earth-extra-figure')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.dataset.topic||el.querySelector('strong')?.textContent||el.className);
    return {ok:missing.length===0&&overflow.length===0,visible:true,topics:[...root.querySelectorAll('[data-topic]')].map(x=>x.dataset.topic),missing,overflow};
  };

  render();
})();

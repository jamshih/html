// Source-trace v6 scaffold for pages 242–245: reuse the already hand-authored photographed-page geometry,
// while keeping semantic-v5 only as hidden learning data. No semantic auto-layout is used on these pages.
const v6SemanticPageHtml=v5PageHtml;
const v6SemanticEdgeLayer=v5EdgeLayer;
function v6StrictSourcePage(ch,page,mode){
  const fn={242:window.v4Strict242,243:window.v4Strict243,244:window.v4Strict244,245:window.v4Strict245}[page];
  if(typeof fn!=='function') return null;
  let html=fn(ch,mode);
  html=html.replace('class="v4strict-page','class="v4strict-page v5-page source-traced-page')
           .replace(`data-strict-page="${page}"`,`data-strict-page="${page}" data-semantic-page="${page}" data-source-trace-page="${page}"`)
           .replaceAll('class="v4strict-q','class="v4strict-q v5-recall');
  if(page===245) html=html.replace(/<div class="v4strict-q v5-recall[^"]*"[^>]*data-question="51"[^>]*>[\s\S]*?<\/div>/,'');
  html=html.replace('</section>',`<img class="v5qa-source-photo" data-v5qa-source-page="${page}" alt=""></section>`);
  return html;
}
v5PageHtml=function(ch,sem,page,mode){
  if(page>=242&&page<=245){const strict=v6StrictSourcePage(ch,page,mode);if(strict)return strict;}
  return v6SemanticPageHtml(ch,sem,page,mode);
};
v5EdgeLayer=function(sem){
  if(sem.number===1||sem.number===2)return '';
  return v6SemanticEdgeLayer(sem);
};
window.V6_STRICT_SOURCE_PAGES=[242,243,244,245];
// Pages 250–253 are loaded once, explicitly, by index.html after pages 246–249.
// Do not inject earth-source-trace-tail-loader-v6.js here: doing so executes those
// page scripts twice and causes duplicate top-level declarations without adding content.
render();
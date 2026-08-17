// Page 253 human-readability repair. The source photograph is authoritative.
// This layer changes only page-253 cluster geometry/connector ownership; prompts and answers stay canonical.
(function(){
  const M=window.SOURCE_PROMPTS_V7||{};
  const recs=M[253]||[];
  const q43=recs.find(r=>Number(r.number)===43);
  const q44=recs.find(r=>Number(r.number)===44);
  if(q43){
    q43.blankWidths=[52,52,52];
    q43.template='波速因而變 <b class="v4strict-num">(43)</b> {{0}} → 波長變 {{1}}<br>→ 波高變 {{2}} → 碎浪';
  }
  if(q44){
    q44.blankWidths=[55,55];
    q44.template='波前進方向往 <b class="v4strict-num">(44)</b> {{0}} 速區偏折 → 浪往海岬匯聚<br>→ 海岬處侵蝕作用較 {{1}}';
  }

  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;

  function ownPrompt(page,n,cluster,left,width){
    const el=page.querySelector(`[data-question="${n}"]`);
    if(!el)return;
    el.dataset.sourceClusterOwner=cluster;
    el.dataset.visualOwner='earth-cluster-layout-v10-p253';
    if(left!=null)el.style.setProperty('left',`${left}px`,'important');
    if(width!=null){
      el.style.setProperty('width',`${width}px`,'important');
      el.style.setProperty('max-width','none','important');
    }
  }

  function repair253(t){
    const page=t.content.querySelector('[data-source-trace-page="253"],[data-strict-page="253"]');
    const lines=page?.querySelector('.v6-p253-lines');
    if(!page||!lines)return;

    lines.dataset.sourceObject='p253-source-connectors';
    lines.dataset.sourceRole='connector-group';
    lines.dataset.sourceClusterOwner='p253-climate-ocean-system';
    lines.dataset.visualOwner='earth-cluster-layout-v10-p253';

    // The source prints q43/q44 as two-line rows to the right of a single local branch.
    ownPrompt(page,43,'p253-wave-nearshore',420,400);
    ownPrompt(page,44,'p253-wave-nearshore',420,400);
    ownPrompt(page,45,'p253-wave-nearshore',420,440);

    // Replace the legacy global routes with source-owned local branches that stay in whitespace.
    lines.innerHTML=`
      <defs>
        <marker id="p253green-v10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10Z" fill="#5b9357"/>
        </marker>
      </defs>

      <g class="v10-p253-climate-lines" fill="none" stroke="#dd7b35" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M90 100V432" stroke-width="7"/>
        <path d="M90 178H532V196H542" stroke-width="4"/>
        <path d="M90 228H372V220H542V146" stroke-width="4"/>
        <path d="M90 344H270" stroke-width="4"/>
        <path d="M90 423H300" stroke-width="4"/>
      </g>
      <g class="v10-p253-climate-nodes" fill="#fff" stroke="#666" stroke-width="3">
        <circle cx="90" cy="136" r="7"/><circle cx="90" cy="237" r="7"/>
        <circle cx="90" cy="432" r="7"/><circle cx="542" cy="237" r="7"/>
      </g>

      <g class="v10-p253-ocean-lines" fill="none" stroke="#5b9357" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M90 570V1048" stroke-width="7"/>
        <path d="M90 612H280M90 805H165M90 910H160M90 1048H165" stroke-width="5"/>

        <path d="M280 565V755M280 612H302M280 665H330M280 742H330" stroke-width="4"/>
        <path d="M330 636V755M330 636H410M330 704H410M330 755H410" stroke-width="4"/>

        <path d="M160 784H422V852H160" stroke-width="3" stroke-dasharray="8 6"/>

        <path d="M160 878V1008M160 878H168M160 1008H405" stroke-width="4"/>
        <path d="M405 870V1040M405 890H416M405 930H416M405 975H416M405 1040H416" stroke-width="4"/>

        <path d="M165 1048H185M185 1048V1238M185 1098H205M185 1148H205M185 1190H205M185 1230H205" stroke-width="4"/>
      </g>
      <g class="v10-p253-ocean-nodes" fill="#fff" stroke="#666" stroke-width="3">
        <circle cx="90" cy="611" r="7"/><circle cx="90" cy="805" r="7"/>
        <circle cx="90" cy="910" r="7"/><circle cx="90" cy="1048" r="7"/>
      </g>`;
  }

  window.v5PageHtml=function(ch,sem,page,mode){
    const html=prev(ch,sem,page,mode);
    if(page!==253)return html;
    const t=document.createElement('template');
    t.innerHTML=html;
    repair253(t);
    return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
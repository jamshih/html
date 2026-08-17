// Page 253 human-readability repair. The source photograph is authoritative.
// This layer changes connector routing only; prompts/answers/figures remain owned by the existing source renderer.
(function(){
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;

  function repair253(t){
    const page=t.content.querySelector('[data-source-trace-page="253"],[data-strict-page="253"]');
    const lines=page?.querySelector('.v6-p253-lines');
    if(!page||!lines)return;

    lines.dataset.sourceObject='p253-source-connectors';
    lines.dataset.sourceRole='connector-group';
    lines.dataset.sourceClusterOwner='p253-climate-ocean-system';
    lines.dataset.visualOwner='earth-cluster-layout-v10-p253';

    // Re-route the simplified v6 branches to the photographed page-253 corridors.
    // Long branches terminate immediately before prompt rectangles instead of running through glyphs.
    lines.innerHTML=`
      <defs>
        <marker id="p253green-v10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10Z" fill="#5b9357"/>
        </marker>
      </defs>

      <!-- climate / greenhouse spine: source nodes around y=136,237,432 -->
      <g class="v10-p253-climate-lines" fill="none" stroke="#dd7b35" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M90 100V432" stroke-width="7"/>
        <path d="M90 136H542M90 237H542M90 327H270M90 432H412" stroke-width="4"/>
        <path d="M542 237V146" stroke-width="4"/>
      </g>
      <g class="v10-p253-climate-nodes" fill="#fff" stroke="#666" stroke-width="3">
        <circle cx="90" cy="136" r="7"/><circle cx="90" cy="237" r="7"/>
        <circle cx="90" cy="432" r="7"/><circle cx="542" cy="237" r="7"/>
      </g>

      <!-- ocean main spine and the three source-owned concept nodes -->
      <g class="v10-p253-ocean-lines" fill="none" stroke="#5b9357" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M90 570V1048" stroke-width="7"/>
        <path d="M90 611H280M90 805H165M90 910H160M90 1048H165" stroke-width="5"/>

        <!-- wind/current cluster: local bracket remains left of q37-q40 text -->
        <path d="M280 565V755M280 611H302M280 665H330M280 742H330" stroke-width="4"/>
        <path d="M330 636V755M330 636H410M330 704H410M330 755H410" stroke-width="4"/>

        <!-- q41 source dashed enclosure; border surrounds the row instead of crossing it -->
        <path d="M165 786H420V850H165" stroke-width="3" stroke-dasharray="8 6"/>

        <!-- wave cluster: left ownership bracket + right local teaching bracket.
             Horizontal runs use whitespace corridors immediately above prompt rows. -->
        <path d="M160 884V1007M160 884H182M160 930H350M160 1007H350" stroke-width="4"/>
        <path d="M400 870V1039M400 890H407M400 930H355M400 975H355M400 1039H355" stroke-width="4"/>

        <!-- tide cluster: short branch stubs only; prompt prose owns the space to the right -->
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
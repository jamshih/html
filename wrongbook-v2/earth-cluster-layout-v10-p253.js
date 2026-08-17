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

    // The v6 approximation used long global horizontals through prompt glyphs. Keep the source
    // hierarchy, but route every long run through whitespace immediately above/below text rows.
    lines.innerHTML=`
      <defs>
        <marker id="p253green-v10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10Z" fill="#5b9357"/>
        </marker>
      </defs>

      <!-- Climate spine. q27 occupies y136-174, q28 y186-224, q31 y229-267,
           q30 y301-339, q32 y396-414 and q36 begins y431. Long runs therefore use the
           photographed gaps rather than the prompt baselines. -->
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

      <!-- Ocean main spine and local child brackets. -->
      <g class="v10-p253-ocean-lines" fill="none" stroke="#5b9357" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M90 570V1048" stroke-width="7"/>
        <path d="M90 612H280M90 805H165M90 910H160M90 1048H165" stroke-width="5"/>

        <!-- Wind/current cluster stays entirely left of q37-q40. -->
        <path d="M280 565V755M280 612H302M280 665H330M280 742H330" stroke-width="4"/>
        <path d="M330 636V755M330 636H410M330 704H410M330 755H410" stroke-width="4"/>

        <!-- q41 enclosure: border surrounds the two-line row, never bisects it. -->
        <path d="M160 784H422V852H160" stroke-width="3" stroke-dasharray="8 6"/>

        <!-- Wave ownership bracket. The explanatory copy occupies x170-400 around y900-950;
             do not draw a horizontal through it. Connect the left and right subclusters by going
             below the copy and staying left of q43-q45 prompt rectangles. -->
        <path d="M160 878V1008M160 878H168M160 1008H350" stroke-width="4"/>
        <path d="M350 1008V870H400M400 870V1040M400 890H407M400 930H355M400 975H355M400 1040H355" stroke-width="4"/>

        <!-- Tide cluster: source-like short stubs only. -->
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
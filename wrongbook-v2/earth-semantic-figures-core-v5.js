// Semantic-first renderer: every line, figure and blank has a scientific parent/reason.
const v5BaseBind=bind;

function v5S(s=''){return v4RefEsc(s)}
function v5Svg(content,view='0 0 300 180',extra=''){return `<svg class="v4ref-diagram-svg v5-figure-svg ${extra}" viewBox="${view}" aria-hidden="true"><defs><marker id="v5arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker><marker id="v5arrw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#fff"/></marker></defs>${content}</svg>`}
function v5Txt(x,y,t,cls=''){return `<text x="${x}" y="${y}" class="${cls}">${v5S(t)}</text>`}
function v5Axes(x0,y0,x1,y1,xlab='',ylab=''){return `<g class="v5-axes"><path d="M${x0} ${y0}H${x1}M${x0} ${y0}V${y1}"/>${v5Txt(x1-20,y0+18,xlab,'tiny')}${v5Txt(x0-2,y1-5,ylab,'tiny')}</g>`}
function v5Arrow(x1,y1,x2,y2,cls=''){return `<path class="v5-arrow ${cls}" d="M${x1} ${y1}L${x2} ${y2}" marker-end="url(#v5arr)"/>`}
const V5_RENDERERS={};

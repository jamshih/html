// Small in-repo RBush-style R-tree used by Earth V9 layout QA (no network/runtime dependency).
(function(){
 const bbox=items=>items.reduce((b,x)=>({minX:Math.min(b.minX,x.minX),minY:Math.min(b.minY,x.minY),maxX:Math.max(b.maxX,x.maxX),maxY:Math.max(b.maxY,x.maxY)}),{minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity});
 const intersects=(a,b)=>b.minX<=a.maxX&&b.maxX>=a.minX&&b.minY<=a.maxY&&b.maxY>=a.minY;
 const area=b=>Math.max(0,b.maxX-b.minX)*Math.max(0,b.maxY-b.minY);
 const extend=(a,b)=>({minX:Math.min(a.minX,b.minX),minY:Math.min(a.minY,b.minY),maxX:Math.max(a.maxX,b.maxX),maxY:Math.max(a.maxY,b.maxY)});
 class Node{constructor(children=[],leaf=true){this.children=children;this.leaf=leaf;this.height=1;this.update()}update(){const b=bbox(this.children);Object.assign(this,b)}}
 class RBushV9{
  constructor(maxEntries=9){this._max=Math.max(4,maxEntries);this.clear()}
  clear(){this.data=new Node([],true);return this}
  all(){const out=[],stack=[this.data];while(stack.length){const n=stack.pop();if(n.leaf)out.push(...n.children);else stack.push(...n.children)}return out}
  load(items){for(const x of items)this.insert(x);return this}
  insert(item){if(!item)return this;const path=[],node=this._choose(this.data,item,path);node.children.push(item);node.update();for(let i=path.length-1;i>=0;i--){path[i].update();if(path[i].children.length>this._max)this._split(path,i)}if(this.data.children.length>this._max)this._splitRoot();return this}
  search(box){const out=[],stack=[this.data];while(stack.length){const n=stack.pop();if(!intersects(n,box))continue;if(n.leaf){for(const x of n.children)if(intersects(x,box))out.push(x)}else for(const c of n.children)if(intersects(c,box))stack.push(c)}return out}
  collides(box){return this.search(box).length>0}
  _choose(node,item,path){while(!node.leaf){path.push(node);let best=null,bestEnl=Infinity,bestArea=Infinity;for(const c of node.children){const a=area(c),e=area(extend(c,item))-a;if(e<bestEnl||(e===bestEnl&&a<bestArea)){best=c;bestEnl=e;bestArea=a}}node=best}path.push(node);return node}
  _split(path,i){const node=path[i],kids=node.children.slice();const [a,b]=this._partition(kids,node.leaf);if(i===0){this.data=new Node([a,b],false);this.data.height=a.height+1;this.data.update();return}const parent=path[i-1],idx=parent.children.indexOf(node);parent.children.splice(idx,1,a,b);parent.leaf=false;parent.update()}
  _splitRoot(){const [a,b]=this._partition(this.data.children.slice(),this.data.leaf);this.data=new Node([a,b],false);this.data.height=a.height+1;this.data.update()}
  _partition(items,leaf){let s1=0,s2=1,waste=-Infinity;for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const w=area(extend(items[i],items[j]))-area(items[i])-area(items[j]);if(w>waste){waste=w;s1=i;s2=j}}const A=[items[s1]],B=[items[s2]],rest=items.filter((_,i)=>i!==s1&&i!==s2);while(rest.length){let pick=0,diff=-Infinity,side='A';for(let i=0;i<rest.length;i++){const ba=bbox(A),bb=bbox(B),ea=area(extend(ba,rest[i]))-area(ba),eb=area(extend(bb,rest[i]))-area(bb),d=Math.abs(ea-eb);if(d>diff){diff=d;pick=i;side=ea<=eb?'A':'B'}}(side==='A'?A:B).push(rest.splice(pick,1)[0])}const na=new Node(A,leaf),nb=new Node(B,leaf);na.height=nb.height=leaf?1:(A[0].height||1)+1;return[na,nb]}
 }
 window.RBushV9=RBushV9;
})();

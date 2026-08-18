import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const file=process.argv[2]||'wrongbook-v2/tikz-spatial-geometry-v1.js';
const source=fs.readFileSync(file,'utf8');

globalThis.window=globalThis;
globalThis.state={subject:'math'};
globalThis.document={
  getElementById(){return null},
  querySelector(){return null},
  querySelectorAll(){return[]},
  addEventListener(){},
  body:{},
};
globalThis.MutationObserver=class{observe(){}};
globalThis.requestAnimationFrame=()=>0;
globalThis.setTimeout=()=>0;

vm.runInThisContext(source,{filename:file});
const t=globalThis.__wrongbookTikzSpatialTest;
assert.ok(t,'test API is exposed');

const fixture={subject:'math',problemText:'空間中有兩點 A(1, 5, -4)、B(-14, 15, 6)，已知點 P(-5, r, s) 在 AB 上，若平面通過 P 點且與直線 AB 垂直，若此平面方程式為 3x + by + cz + d = 0。'};
assert.equal(t.matches(fixture),true,'spatial line-plane fixture must trigger');
const model=t.modelFor(fixture);
assert.deepEqual(model.a,['1','5','-4']);
assert.deepEqual(model.b,['-14','15','6']);
assert.deepEqual(model.p,['-5','r','s']);
assert.equal(model.line,'AB');
assert.equal(Number(model.ratio.toFixed(2)),0.4,'P placement should use the known x-coordinate ratio');

assert.equal(t.matches({subject:'biology',problemText:fixture.problemText}),false,'non-math subject must not trigger');
assert.equal(t.matches({subject:'math',problemText:'A(1,2) 與 B(3,4) 的距離為何？'}),false,'ordinary coordinate problems must not trigger the plane template');
assert.match(source,/data-wb-tikz-spatial/);
assert.match(source,/wbTikzPlane/);
assert.match(source,/90°/);
assert.match(source,/geminiLayoutUsed:false/);
assert.match(source,/generativeImageUsed:false/);
assert.match(source,/\.v5-tutor-stage>\.v8-ai-diagram\[data-wb-tikz-spatial/,'source tutor diagram is hidden');
assert.match(source,/\.v9-sheet-ai-card:has\(\.v8-ai-diagram\[data-wb-tikz-spatial/,'worksheet clone owns the visible diagram');

console.log(JSON.stringify({pass:true,fixtureDetected:true,ratio:model.ratio,points:{A:model.a,B:model.b,P:model.p},deterministic:true,generativeImage:false,geminiLayout:false},null,2));

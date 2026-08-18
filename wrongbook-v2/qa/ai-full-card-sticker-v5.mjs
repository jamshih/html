import fs from 'node:fs';

const scope=fs.readFileSync(new URL('../ai-diagram-scope-guard-v3.js',import.meta.url),'utf8');
const sticker=fs.readFileSync(new URL('../ai-diagram-sticker-v5.js',import.meta.url),'utf8');
const compat=fs.readFileSync(new URL('../ai-diagram-scope-guard-v2.js',import.meta.url),'utf8');

const checks={
  v9OuterCardExplicit:scope.includes("label.closest('.v9-sheet-ai-card')"),
  fullScopeMarker:scope.includes("wbAiStickerScope=FULL"),
  noTightRuntime:!sticker.includes('wbAiDiagramScope===\'tight\'')&&!sticker.includes('hasSmallerCompleteCard'),
  onlyFullSelector:sticker.includes("const CARD='[data-wb-ai-sticker-scope=\"full\"]'"),
  documentCapture:sticker.includes("document.addEventListener('pointerdown'")&&sticker.includes('e.stopImmediatePropagation()'),
  nestedLegacyRemoved:sticker.includes("querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3,.wb-ai-sticker-v4')"),
  legacyV4Blocked:compat.includes('window.__wrongbookAiDiagramStickerV4=true'),
  v3ThenV5:compat.indexOf('ai-diagram-scope-guard-v3.js')<compat.indexOf('ai-diagram-sticker-v5.js')
};

for(const [name,ok] of Object.entries(checks))console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(Object.values(checks).some(x=>!x))process.exit(1);

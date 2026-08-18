import fs from 'node:fs';
import assert from 'node:assert/strict';

const file=process.argv[2]||'wrongbook-v2/ocr-clean-question-display-v1.js';
const source=fs.readFileSync(file,'utf8');

assert.match(source,/ocr-clean-question-display-v3-tutor/,'OCR renderer version should include the tutor restoration');
assert.match(source,/function tutorMarkup\(p\)/,'OCR renderer must own an explicit tutor markup helper');
assert.match(source,/typeof v3GuideMarkup==='function'\?v3GuideMarkup\(p\):''/,'OCR renderer must reuse the staged tutor renderer');
assert.match(source,/\$\{tutor\}<div class="ocrq-toolbar">/,'Tutor markup must be mounted immediately before the OCR worksheet toolbar');
assert.match(source,/data-action="aiOnPaper"/,'Existing on-paper AI action must remain available');
assert.match(source,/\.ocrq-sheet \.v5-tutor-dock,\.ocrq-sheet \.v3-guide-dock/,'Runtime QA must verify that the actual tutor dock exists');
assert.match(source,/pass:Boolean\(!tutorExpected\|\|tutorDockPresent\)/,'Runtime QA must fail when a scanned worksheet loses its tutor dock');
assert.match(source,/return basePaperPanel\(p\)/,'Non-scan worksheets must keep the existing renderer');

console.log(JSON.stringify({
  pass:true,
  regression:'OCR worksheet cannot keep only the AI toolbar button while dropping the tutor dock',
  stagedTutorReused:true,
  tutorMountedBeforeToolbar:true,
  nonScanPathPreserved:true
},null,2));

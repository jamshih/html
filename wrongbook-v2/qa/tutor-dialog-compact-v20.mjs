import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const ui=read('tutor-dialog-compact-v20.js');
const bootstrap=read('native-question-capture-source-align-v1.js');

const checks={
  desktopWidthCap:ui.includes('width:min(760px,72vw)!important'),
  desktopHeightCap:ui.includes('max-height:min(430px,calc(100vh - 150px))!important'),
  promptFontRaised:ui.includes('font-size:16.5px!important'),
  controlFontRaised:ui.includes('font-size:14px!important'),
  singleStepClassification:ui.includes('wb-v20-single-step')&&ui.includes('wb-v20-has-nav'),
  singleStepAutoHeight:ui.includes('height:auto!important')&&ui.includes('grid-template-rows:auto auto auto!important'),
  noSingleStepNavigatorVoid:ui.includes('singleStepNoVoid')&&ui.includes('deadSpace<=28'),
  runtimeQa:ui.includes('wrongbookTutorDialogCompactQA'),
  loadedAfterStableTutor:bootstrap.indexOf('tutor-dialog-compact-v20.js')>bootstrap.indexOf('tutor-nav-paint-lock-v18.js'),
  loadedBeforeInkHistory:bootstrap.indexOf('tutor-dialog-compact-v20.js')<bootstrap.indexOf('ink-history-v4.js')
};
for(const [name,ok] of Object.entries(checks))console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(Object.values(checks).some(Boolean)===false||Object.values(checks).some(ok=>!ok))process.exit(1);

import fs from 'node:fs';
import vm from 'node:vm';

const root='wrongbook-v2';
const runtime=fs.readFileSync(`${root}/native-question-capture-v1.js`,'utf8');
const index=fs.readFileSync(`${root}/index.html`,'utf8');
const sw=fs.readFileSync(`${root}/sw.js`,'utf8');

for(const needle of [
  'nqcTargetSelector',
  'rgba(47,103,205,.32)',
  '先圈出題目',
  'wbPreprocessImageFile',
  '題目期待格式',
  'data-nqc-answer',
  'sourceFigureBase64',
  "spec.sourceFaithful!==true",
  "Number(spec.confidence||0)<.7",
  'AI 無法可靠重繪這張題圖，因此保留原圖，不會猜。'
]) if(!runtime.includes(needle)) throw new Error(`runtime missing required behavior: ${needle}`);

const state={scan:null,scanStudent:[],scanCorrect:[],scanSelection:null,scanImage:'',scanDisplayImage:''};
const context={
  console,
  window:{},
  state,
  openCapture(){},
  paperPanel(){return 'paper'},
  recognitionPanel(){return 'recognition'},
  scanToProblem(){return {id:'scan-preview',problemText:'',regions:[]}},
  bind(){},
  render(){},
  save(){},
  esc:v=>String(v),
  SUPABASE_PUBLISHABLE_KEY:'qa-key',
  setTimeout,
  clearTimeout,
  FileReader:function(){},
  File:function(){},
  Image:function(){},
  URL,
  document:{getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]},createElement(){return{}},body:{appendChild(){}}},
};
context.window=context;
vm.createContext(context);
vm.runInContext(runtime,context,{filename:'native-question-capture-v1.js'});

const infer=context.wbInferAnswerSchema;
if(typeof infer!=='function')throw new Error('answer schema inference was not exported');
const tuple=infer('若此平面方程式為 3x + by + cz + d = 0，則 (r, s, d)=？','written',['(-7, 2, 33)'],['(-4, 11, -5)']);
if(tuple.kind!=='tuple')throw new Error(`Q10 fixture misclassified as ${tuple.kind}`);
if(JSON.stringify(tuple.labels)!==JSON.stringify(['r','s','d']))throw new Error(`Q10 labels wrong: ${JSON.stringify(tuple.labels)}`);
if(tuple.arity!==3)throw new Error(`Q10 arity wrong: ${tuple.arity}`);
if(JSON.stringify(tuple.studentParts)!==JSON.stringify(['-7','2','33']))throw new Error(`Q10 student parts wrong: ${JSON.stringify(tuple.studentParts)}`);
const choice=infer('下列何者正確？','single_choice',['B'],['C']);
if(choice.kind!=='single_choice')throw new Error('real choice question must keep choice UI');

const qa=context.wrongbookNativeQuestionCaptureQA();
if(qa.brushOpacity!==.32||qa.diagramFaithfulnessThreshold!==.7||!qa.diagramFallbackToSource)throw new Error(`runtime QA contract failed: ${JSON.stringify(qa)}`);

const runtimeAt=index.indexOf('native-question-capture-v1.js');
const alignAt=index.indexOf('native-question-capture-source-align-v1.js');
if(runtimeAt<0||alignAt<runtimeAt)throw new Error('native capture/alignment runtimes are not loaded in final order');
for(const asset of ['native-question-capture-v1.css','native-question-capture-v1.js','native-question-capture-source-align-v1.js'])if(!sw.includes(asset))throw new Error(`service worker missing ${asset}`);
if(!index.includes('2026-08-18-native-question-capture-2'))throw new Error('production build marker was not bumped');

console.log('native question capture QA PASS',JSON.stringify({tuple,choice,qa}));

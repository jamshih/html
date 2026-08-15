import fs from 'node:fs';
const key=fs.readFileSync('.github/scripts/wrongbook-v5-qa-v2.mjs','utf8').match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
if(!key) throw new Error('missing publishable key');
const url='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-guide-ai';
const body={problemText:'物體受水平外力 6 N 且保持靜止。學生選 A：靜摩擦力一定等於最大靜摩擦力。',studentAnswer:['A'],correctAnswer:['B'],subject:'物理',concepts:[{nameZh:'靜摩擦力'}],regions:[{id:'stem',kind:'key_phrase',text:'保持靜止',bbox:{x:20,y:18,width:20,height:7},confidence:.98}],mode:'instructive',requestType:'start',question:'先診斷我錯在哪裡，只給下一步提示。'};
const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify(body)});const raw=await r.text();console.log('HTTP',r.status);console.log(raw);if(r.ok)process.exit(2);if(!raw.includes('providerBody'))process.exit(3);
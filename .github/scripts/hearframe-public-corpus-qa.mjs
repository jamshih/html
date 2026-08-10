import fs from 'node:fs';
const base='https://hearframe-grand-hello-world-v4.onrender.com';
const result={checkedAt:new Date().toISOString(),base,page:null,vocabulary:null,pass:false};
try{
  const pageRes=await fetch(base+'/ai-refine.html?v=public-corpus-qa',{cache:'no-store'});
  const page=await pageRes.text();
  result.page={status:pageRes.status,hasCorpusStatus:page.includes('id="corpusStatus"'),loadsVocabulary:page.includes("./ask/corpus-vocabulary.json"),stillDefaultHelloWorld:page.includes('<textarea id="words">hello world</textarea>')};
  if(pageRes.status!==200||!result.page.hasCorpusStatus||!result.page.loadsVocabulary||result.page.stillDefaultHelloWorld) throw new Error('public ai-refine page is not the real-corpus build');
  const vocabRes=await fetch(base+'/ask/corpus-vocabulary.json?v=public-corpus-qa',{cache:'no-store'});
  const vocab=await vocabRes.json();
  result.vocabulary={status:vocabRes.status,version:vocab.version,sourceCount:vocab.sourceCount,processedSources:vocab.processedSources,uniqueWordCount:vocab.uniqueWordCount,availableWordsCount:Array.isArray(vocab.availableWords)?vocab.availableWords.length:0,preferredPhraseCount:Array.isArray(vocab.preferredPhrases)?vocab.preferredPhrases.length:0};
  if(vocabRes.status!==200||result.vocabulary.availableWordsCount<1000||vocab.uniqueWordCount!==result.vocabulary.availableWordsCount) throw new Error('public vocabulary is incomplete');
  result.pass=true;
}catch(e){result.error=String(e?.stack||e)}
fs.writeFileSync('hearframe-grand-v4/public-corpus-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exitCode=1;

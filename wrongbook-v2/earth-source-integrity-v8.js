// Earth source integrity v8: independently cross-check photographed prompt manifests,
// reference/semantic learning-item registries, page placement, and source-figure inventory.
// A numbered blank inside a composite printed prompt is not automatically a separate learning item.
(function(){
  const CHAPTER_PAGES={1:[242,243],2:[244,245],3:[246,247],4:[248,249],5:[250,251],6:[252,253]};
  const EXPECTED_COUNTS={1:48,2:50,3:41,4:27,5:60,6:50};
  const EXPECTED_QUESTIONS=276,EXPECTED_FIGURES=56;
  const key=(chapter,n)=>`${chapter}:${Number(n)}`;
  const range=n=>Array.from({length:n},(_,i)=>i+1);
  const uniq=a=>[...new Set(a)];

  function auditSequence(numbers,expected){
    const actual=numbers.map(Number),set=new Set(actual),want=range(expected);
    return {
      actual:actual.length,
      unique:set.size,
      missing:want.filter(n=>!set.has(n)),
      duplicates:uniq(actual.filter((n,i)=>actual.indexOf(n)!==i)),
      extra:uniq(actual.filter(n=>n<1||n>expected))
    };
  }

  function sourceManifestItems(chapter){
    const out=[];
    for(const page of CHAPTER_PAGES[chapter]||[]){
      for(const item of (window.SOURCE_PROMPTS_V7?.[page]||[]))out.push({chapter,page,item});
    }
    return out;
  }

  function printedLabels(record){
    const item=record.item||{},labels=[Number(item.number)];
    for(const n of item.sourceNumbers||[])labels.push(Number(n));
    const re=/v4strict-num[^>]*>\((\d+)\)</g;let m;
    while((m=re.exec(String(item.template||''))))labels.push(Number(m[1]));
    return uniq(labels.filter(Number.isFinite));
  }

  function v8EarthSourceIntegrity(){
    const report={
      expectedQuestions:EXPECTED_QUESTIONS,
      canonicalQuestionCount:0,
      uniqueQuestionCount:0,
      registeredQuestionCount:0,
      registeredUniqueQuestionCount:0,
      missingQuestionIds:[],duplicateQuestionIds:[],orphanQuestionIds:[],pageMismatchQuestionIds:[],
      expectedFigures:EXPECTED_FIGURES,actualFigures:0,missingFigures:[],orphanFigures:[],
      printedBlankLabelCount:0,compositePromptLabels:[],chapters:[],pageCounts:{},ch5OrderOk:false,ok:false
    };
    const canonicalKeys=[],registeredKeys=[],printedKeys=[];

    for(let chapter=1;chapter<=6;chapter++){
      const expected=EXPECTED_COUNTS[chapter],source=sourceManifestItems(chapter);
      const ref=window.EARTH_REFERENCE_MAPS?.find?.(x=>x.number===chapter);
      const registered=ref&&typeof window.v4RefAllItems==='function'?window.v4RefAllItems(ref):[];
      const sourceNums=source.map(x=>Number(x.item.number)),registeredNums=registered.map(x=>Number(x.number));
      const s=auditSequence(sourceNums,expected),r=auditSequence(registeredNums,expected);
      source.forEach(x=>{canonicalKeys.push(key(chapter,x.item.number));const labels=printedLabels(x);labels.forEach(n=>printedKeys.push(key(chapter,n)));if(labels.length>1)report.compositePromptLabels.push({chapter,page:x.page,item:Number(x.item.number),labels});});
      registered.forEach(x=>registeredKeys.push(key(chapter,x.number)));
      const sourceByNumber=new Map(source.map(x=>[Number(x.item.number),x]));
      const refByNumber=new Map(registered.map(x=>[Number(x.number),x]));
      for(const n of range(expected)){
        const a=sourceByNumber.get(n),b=refByNumber.get(n),k=key(chapter,n);
        if(!a||!b)report.orphanQuestionIds.push(k);
        else if(Number(b.page)!==Number(a.page))report.pageMismatchQuestionIds.push(`${k}:${a.page}->${b.page}`);
      }
      report.missingQuestionIds.push(...s.missing.map(n=>key(chapter,n)),...r.missing.map(n=>`registered:${key(chapter,n)}`));
      report.duplicateQuestionIds.push(...s.duplicates.map(n=>key(chapter,n)),...r.duplicates.map(n=>`registered:${key(chapter,n)}`));
      report.chapters.push({chapter,pages:CHAPTER_PAGES[chapter],expected,canonical:s,registered:r});
      for(const page of CHAPTER_PAGES[chapter])report.pageCounts[page]=(window.SOURCE_PROMPTS_V7?.[page]||[]).length;
    }

    report.canonicalQuestionCount=canonicalKeys.length;
    report.uniqueQuestionCount=new Set(canonicalKeys).size;
    report.registeredQuestionCount=registeredKeys.length;
    report.registeredUniqueQuestionCount=new Set(registeredKeys).size;
    report.printedBlankLabelCount=new Set(printedKeys).size;

    const figureInventory=window.V5_SOURCE_FIGURE_INVENTORY||{};
    const expectedFigureKeys=[];
    for(const [page,ids] of Object.entries(figureInventory))for(const id of ids||[])expectedFigureKeys.push(`${page}:${id}`);
    const actualFigureKeys=[];
    for(const sem of window.EARTH_SEMANTIC_MAPS||[])for(const f of sem.figures||[])actualFigureKeys.push(`${f.sourcePage}:${f.id}`);
    const expectedFigureSet=new Set(expectedFigureKeys),actualFigureSet=new Set(actualFigureKeys);
    report.actualFigures=actualFigureKeys.length;
    report.missingFigures=expectedFigureKeys.filter(k=>!actualFigureSet.has(k));
    report.orphanFigures=actualFigureKeys.filter(k=>!expectedFigureSet.has(k));

    const ch5=window.EARTH_REFERENCE_MAPS?.find?.(x=>x.number===5),order=ch5?.sourceOrder||[];
    report.ch5OrderOk=order.length===60&&order.slice(0,17).every((n,i)=>n===i+1)&&order.slice(17,47).every((n,i)=>n===i+18)&&order.slice(47).every((n,i)=>n===i+48);

    report.ok=
      report.canonicalQuestionCount===EXPECTED_QUESTIONS&&
      report.uniqueQuestionCount===EXPECTED_QUESTIONS&&
      report.registeredQuestionCount===EXPECTED_QUESTIONS&&
      report.registeredUniqueQuestionCount===EXPECTED_QUESTIONS&&
      report.missingQuestionIds.length===0&&report.duplicateQuestionIds.length===0&&
      report.orphanQuestionIds.length===0&&report.pageMismatchQuestionIds.length===0&&
      expectedFigureKeys.length===EXPECTED_FIGURES&&report.actualFigures===EXPECTED_FIGURES&&
      report.missingFigures.length===0&&report.orphanFigures.length===0&&report.ch5OrderOk;
    return report;
  }

  window.v8EarthSourceIntegrity=v8EarthSourceIntegrity;
  window.V8_EARTH_EXPECTED_QUESTIONS=EXPECTED_QUESTIONS;
  window.V8_EARTH_EXPECTED_FIGURES=EXPECTED_FIGURES;
})();

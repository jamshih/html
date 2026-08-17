// Verified 108-curriculum gap repair discovered during Clearnote cross-checking.
// This file adds only official-scope concepts that were underrepresented in the
// curated non-Earth corpus. It does not import public-note text wholesale.
(function(){
  if(globalThis.WRONGBOOK_CURRICULUM_ENRICHMENT_V1)return;
  globalThis.WRONGBOOK_CURRICULUM_ENRICHMENT_V1='2026-08-17';

  function addSection(subjectId,chapterId,section){
    const subject=CURRICULUM_TW?.[subjectId],chapter=subject?.chapters?.find(ch=>ch.id===chapterId);
    if(!chapter||chapter.sections?.some(s=>s.id===section.id))return false;
    const normalized=typeof twTaiwanizeValue==='function'?twTaiwanizeValue(section):section;
    chapter.sections=[...(chapter.sections||[]),normalized];
    return true;
  }

  // Official high-school Biology scope explicitly includes animal reproduction and
  // embryonic development, plus plant reproduction. The existing corpus covered
  // cell division well but did not give these organism-level topics their own owner.
  addSection('biology','bio-animal',twS('reproduction','動物的生殖與胚胎發育',[
    twP('gamete-meiosis','動物形成單套染色體的配子通常需經哪種細胞分裂？','減數分裂','配子的染色體套數要比二倍體體細胞少一半。'),
    twP('fertilization-ploidy','受精對染色體套數的核心結果？','恢復二倍體','兩個單套配子結合形成二倍體受精卵。'),
    twP('embryo-mitosis','受精卵早期增加細胞數主要靠哪種細胞分裂？','有絲分裂','先增加細胞數，再逐步形成不同組織。'),
    twP('differentiation','胚胎發育中形成不同細胞類型的過程稱為？','細胞分化','細胞數增加和細胞功能分化是不同概念。')
  ]));

  addSection('biology','bio-plant',twS('reproduction','植物的生殖',[
    twP('pollination','被子植物的授粉是什麼？','花粉傳到柱頭','授粉發生在配子真正結合之前。'),
    twP('plant-fertilization','被子植物的受精是什麼？','精細胞與卵細胞結合','授粉不等於受精。'),
    twP('seed-fruit','被子植物受精後，胚珠與子房通常分別發育成什麼？','胚珠形成種子，子房形成果實','把花的構造和果實、種子的來源連起來。')
  ]));
})();

for(const s of SUBJECTS){
  const c=CURRICULUM_TW[s.id];
  if(c) s.chapters=c.chapters.map(ch=>ch.title);
}

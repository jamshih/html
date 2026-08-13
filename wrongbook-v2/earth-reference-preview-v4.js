// Visual-QA-only query route. Normal navigation is unchanged.
if(new URLSearchParams(location.search).has('refpreview')){
  state.page='mindmap';
  state.subject='earth';
  state.earthMindSource='reference';
  state.refEarthChapter=Number(new URLSearchParams(location.search).get('chapter')||1);
  state.refEarthStudyMode=new URLSearchParams(location.search).get('mode')||'recall';
  render();
}

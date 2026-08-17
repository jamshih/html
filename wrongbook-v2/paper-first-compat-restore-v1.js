/* Restore the exact pre-redesign function contract only inside historical QA harnesses.
   This runs after the paper-first runtime and before legacy E2E scripts. */
(function(){
  const originals=window.__paperFirstLegacyOriginals;
  if(!originals)return;
  try{if(originals.sidebar)sidebar=originals.sidebar}catch{}
  try{if(originals.mobileNav)mobileNav=originals.mobileNav}catch{}
  try{if(originals.mobileDrawer)mobileDrawer=originals.mobileDrawer}catch{}
  try{if(originals.shell)shell=originals.shell}catch{}
  try{if(originals.homePage)homePage=originals.homePage}catch{}
  try{if(originals.notebookPage)notebookPage=originals.notebookPage}catch{}
  try{if(originals.recognitionPanel)recognitionPanel=originals.recognitionPanel}catch{}
  try{if(originals.problemWorkspace)problemWorkspace=originals.problemWorkspace}catch{}
  try{if(originals.reviewPage)reviewPage=originals.reviewPage}catch{}
  try{if(originals.captureModal)captureModal=originals.captureModal}catch{}
  try{if(originals.openCapture)openCapture=originals.openCapture}catch{}
  try{if(originals.render)render=originals.render}catch{}
  Object.assign(window,originals);
  try{render()}catch{}
})();
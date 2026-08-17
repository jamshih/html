// Wrongbook V5 tutor pre-capture bridge.
// Critical fix: tutor-stages-v5 sets loading state and calls render() before it asks
// for a visual. That destroys/recreates drawCanvas, so the newly-created canvas can
// be blank when the request snapshot is taken even though the student has visible ink.
// Capture the full workspace + handwriting zoom BEFORE any tutor render, then serve
// those frozen images to the existing tutor/vision pipeline for the duration of the call.
const V5_TUTOR_PRECAPTURE_VERSION='2026-08-17-tutor-precapture-v5';
window.__v5TutorCapture=window.__v5TutorCapture||null;
window.__v5TutorCaptureLast=window.__v5TutorCaptureLast||null;

function v5TutorCaptureClone(v){return v?{...v}:null}

async function v5TutorTakePrecapture(kind){
  const p=typeof selectedProblem==='function'?selectedProblem():null;if(!p)return null;
  let workspace=null,zoom=null;
  try{if(typeof v3WorkspaceImage==='function')workspace=await v3WorkspaceImage()}catch(e){console.warn('tutor precapture workspace failed',e)}
  try{if(typeof v5VisionHandwritingZoom==='function')zoom=await v5VisionHandwritingZoom()}catch(e){console.warn('tutor precapture zoom failed',e)}
  const paths=(typeof drawing==='object'&&Array.isArray(drawing?.paths))?drawing.paths:[];
  let pointCount=0;for(const path of paths)pointCount+=Array.isArray(path?.pts)?path.pts.length:0;
  const snap={
    version:V5_TUTOR_PRECAPTURE_VERSION,
    problemId:p.id,
    kind:String(kind||''),
    capturedAt:new Date().toISOString(),
    workspace:v5TutorCaptureClone(workspace),
    zoom:v5TutorCaptureClone(zoom),
    pathCount:paths.length,
    pointCount,
    hadInk:Boolean(paths.length&&pointCount)
  };
  window.__v5TutorCapture=snap;window.__v5TutorCaptureLast={...snap,workspace:workspace?{mimeType:workspace.mimeType,width:workspace.width,height:workspace.height,hasPhoto:workspace.hasPhoto,base64Length:workspace.base64?.length||0}:null,zoom:zoom?{mimeType:zoom.mimeType,width:zoom.width,height:zoom.height,bounds:zoom.bounds,base64Length:zoom.base64?.length||0}:null};
  return snap;
}

// v5TutorCall's internal v5TutorVisual() happens after render(). Return the frozen
// pre-render workspace instead of reading the newly recreated blank DOM canvas.
if(typeof v5TutorVisual==='function'&&!window.__v5TutorPrecaptureVisualWrapped){
  window.__v5TutorPrecaptureVisualWrapped=true;const baseTutorVisual=v5TutorVisual;
  v5TutorVisual=function(){
    const p=typeof selectedProblem==='function'?selectedProblem():null,snap=window.__v5TutorCapture;
    if(snap?.workspace?.base64&&snap.problemId===p?.id)return Promise.resolve(v5TutorCaptureClone(snap.workspace));
    return baseTutorVisual.apply(this,arguments);
  };
}

// The vision bridge also asks for a handwriting zoom after render(). Freeze that too.
if(typeof v5VisionHandwritingZoom==='function'&&!window.__v5TutorPrecaptureZoomWrapped){
  window.__v5TutorPrecaptureZoomWrapped=true;const baseVisionZoom=v5VisionHandwritingZoom;
  v5VisionHandwritingZoom=async function(){
    const p=typeof selectedProblem==='function'?selectedProblem():null,snap=window.__v5TutorCapture;
    if(snap?.zoom?.base64&&snap.problemId===p?.id)return v5TutorCaptureClone(snap.zoom);
    return baseVisionZoom.apply(this,arguments);
  };
}

// Outermost wrapper: snapshot first, before any loading render can replace drawCanvas.
if(typeof v5TutorCall==='function'&&!window.__v5TutorPrecaptureCallWrapped){
  window.__v5TutorPrecaptureCallWrapped=true;const baseTutorCall=v5TutorCall;
  v5TutorCall=async function(kind,opts){
    const p=typeof selectedProblem==='function'?selectedProblem():null;
    await v5TutorTakePrecapture(kind);
    try{return await baseTutorCall.call(this,kind,opts)}
    finally{
      const snap=window.__v5TutorCapture;
      if(!p||snap?.problemId===p.id)window.__v5TutorCapture=null;
    }
  };
}

window.v5TutorCaptureState=function(){return window.__v5TutorCaptureLast?{...window.__v5TutorCaptureLast}:null};

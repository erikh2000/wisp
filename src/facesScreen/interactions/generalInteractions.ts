import {
  UNSPECIFIED,
  bindSetDisabled,
  findCanvasComponentForPartType, 
  findPartTypeForCanvasComponent, 
  getHead,
  getPartLoader,
  getPartUiManager, 
  initCore, 
  isHeadReady
} from "./coreUtil";
import {centerCanvasComponent} from "common/canvasComponentUtil";
import {initFaceEvents} from "facesCommon/interactions/faceEventUtil";
import {loadDefaultFace, loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {
  getRevisionManager,
  Revision,
  setUpRevisionForNewFace,
  updateForFaceRelatedRevision,
  updateForStaticFaceRevision
} from "./revisionUtil";
import {initViewSettings} from "./viewSettingsInteractions";
import {PartType} from "facesScreen/PartSelector";
import {TestVoiceType} from 'facesScreen/testVoices/TestVoiceType';
import {getActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import PartLoader from "ui/partAuthoring/PartLoader";
import PartUiManager from "ui/partAuthoring/PartUiManager";

import {
  CanvasComponent,
  Emotion,
  EYES_PART_TYPE,
  EXTRA_PART_TYPE,
  HEAD_PART_TYPE,
  LidLevel,
  MOUTH_PART_TYPE,
  NOSE_PART_TYPE
} from "sl-web-face";

export type InitResults = {
  onFaceCanvasMouseMove:any,
  onFaceCanvasMouseDown:any,
  onFaceCanvasMouseUp:any,
  faceName:string
}

let _isInitialized = false;

function _onPartMoved(component:CanvasComponent, x:number, y:number, setRevision:any):boolean {
  updateForFaceRelatedRevision({}, setRevision);
  return true;
}

export function onPartTypeChange(partType:PartType, setRevision:any) {
  const head = getHead();
  updateForStaticFaceRevision({partType}, setRevision);
  const partUiManager = getPartUiManager();
  const nextFocusPart = findCanvasComponentForPartType(head, partType);
  if (partUiManager) {
    if (nextFocusPart) {
      partUiManager.setFocus(nextFocusPart);
    } else {
      partUiManager.clearFocus();
    }
  }
}

function _onPartFocused(component:CanvasComponent|null, setRevision:any):boolean {
  if (!component) return true;
  if (!isHeadReady()) return false;
  const head = getHead();
  const revisionManager = getRevisionManager();
  const currentPartType = revisionManager.currentRevision?.partType;
  const partType = findPartTypeForCanvasComponent(component, head.children);
  if (partType !== currentPartType) updateForStaticFaceRevision({partType}, setRevision);
  return true;
}

function _onPartResized(setRevision:any):boolean {
  updateForFaceRelatedRevision({}, setRevision);
  return true;
}

function _addDocumentMouseUpListener(onMouseUp:(event:any) => void) {
  document.addEventListener("mouseup", onMouseUp);
}

function _removeDocumentMouseUpListener(onMouseUp:(event:any) => void) {
  document.removeEventListener("mouseup", onMouseUp);
}

function _onFaceCanvasMouseMove(event:any) { getPartUiManager().onMouseMove(event); }

function _updateLoadablePartsForType(partTypeName:string, setEyeParts:any, setExtraParts:any, setHeadParts:any, setMouthParts:any, setNoseParts:any) {
  const partLoader = getPartLoader();
  switch(partTypeName) {
    case NOSE_PART_TYPE:
      setNoseParts([...partLoader.noses]);
      break;

    case MOUTH_PART_TYPE:
      setMouthParts([...partLoader.mouths]);
      break;

    case EYES_PART_TYPE:
      setEyeParts([...partLoader.eyes]);
      break;

    case EXTRA_PART_TYPE:
      setExtraParts([...partLoader.extras]);
      break;

    case HEAD_PART_TYPE:
      setHeadParts([...partLoader.heads]);
      break;
  }
}

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
async function _initForSubsequentMount(_setDisabled:any, setEyeParts:any, setExtraParts:any, setHeadParts:any, setMouthParts:any, setNoseParts:any) {
  await bindSetDisabled(_setDisabled);
  const partLoader = getPartLoader();
  setNoseParts([...partLoader.noses]);
  setMouthParts([...partLoader.mouths]);
  setEyeParts([...partLoader.eyes]);
  setExtraParts([...partLoader.extras]);
  setHeadParts([...partLoader.heads]);
}

export async function init(setRevision:any, setEyeParts:any, setExtraParts:any, setHeadParts:any, setMouthParts:any, setNoseParts:any, _setDisabled:any):Promise<InitResults> {
  
  function onFaceCanvasMouseUp(event:any) { getPartUiManager().onMouseUp(event); }
  function onFaceCanvasMouseDown(event:any) { getPartUiManager().onMouseDown(event); }
  function onPartFocused(part:CanvasComponent|null) { _onPartFocused(part, setRevision); }
  function onPartMoved(part:CanvasComponent, x:number, y:number) { return _onPartMoved(part, x, y, setRevision); }
  function onPartResized(part:CanvasComponent, _x:number, _y:number, _width:number, _height:number) { return _onPartResized(setRevision); }
  function onPartLoaderUpdated(partTypeName:string, _partName:string) { _updateLoadablePartsForType(partTypeName, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts); }
  
  const initResults:InitResults = { onFaceCanvasMouseMove:_onFaceCanvasMouseMove, onFaceCanvasMouseDown, onFaceCanvasMouseUp, faceName:UNSPECIFIED_NAME };
  _addDocumentMouseUpListener(onFaceCanvasMouseUp);
  
  const revisionManager = getRevisionManager();
  revisionManager.disablePersistence();
  
  initResults.faceName = await getActiveFaceName();
  
  if (_isInitialized) {
    await _initForSubsequentMount(_setDisabled, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts);
    revisionManager.enablePersistence();
    return initResults
  }
  
  const head = await loadFaceFromName(initResults.faceName) ?? await loadDefaultFace();
  const partUiManager = new PartUiManager(onPartFocused, onPartMoved, onPartResized);
  await partUiManager.trackPartsForFace(head);
  partUiManager.setFocus(head);
  const partLoader = new PartLoader(onPartLoaderUpdated);
  await partLoader.loadManifest('/parts/part-manifest.yml');
  initCore(head, partUiManager, partLoader, _setDisabled);
  const [faceEventManager, faceId] = initFaceEvents(head);
  await initViewSettings('/speech/test-voices/test-voice-manifest.yml', faceEventManager, faceId);

  revisionManager.enablePersistence();
  setUpRevisionForNewFace(head, setRevision);
  
  _isInitialized = true;
  
  return initResults;
}

export function deinit() {
  if (!isInitialized) return;
  _removeDocumentMouseUpListener(_onFaceCanvasMouseMove);
}

export function isInitialized() { return _isInitialized; }

export function onDrawFaceCanvas(context:CanvasRenderingContext2D) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const head = getHead();
  centerCanvasComponent(head, canvasWidth, canvasHeight);
  head.render(context);
}

export function getRevisionForMount():Revision {
  const revisionManager = getRevisionManager();
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    partType: PartType.HEAD,
    testVoice: TestVoiceType.MUTED,
    headComponent: null,
    eyesPartNo: UNSPECIFIED,
    extraSlotPartNos: [],
    headPartNo: UNSPECIFIED,
    nosePartNo: UNSPECIFIED,
    mouthPartNo: UNSPECIFIED
  };
  revisionManager.add(revision);
  return revision;
}
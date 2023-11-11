import {
  bindSetDisabled,
  findPartTypeForCanvasComponent, 
  getHead,
  getPartLoader,
  getPartUiManager, 
  initCore, 
  isHeadReady
} from "./coreUtil";
import {initFaceEvents} from "facesCommon/interactions/faceEventUtil";
import {loadDefaultFace, loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import FacesScreenSettings from "facesScreen/FacesScreenSettings";
import {
  getRevisionManager,
  setUpRevisionForNewFace,
  updateForFaceRelatedRevision,
  updateForAuthoringRevision, initRevisionManager
} from "./revisionUtil";
import {getDefaultScreenSettings, initViewSettings, updateScreenSettings} from "./viewSettingsInteractions";
import {getFaceCount} from "persistence/faces";
import {getActiveFaceName, getActiveProjectName, UNSPECIFIED_NAME} from "persistence/projects";
import {getFacesScreenSettings} from "persistence/settings";
import PartLoader from "ui/partAuthoring/PartLoader";
import PartUiManager from "ui/partAuthoring/PartUiManager";

import {
  CanvasComponent,
  EYES_PART_TYPE,
  EXTRA_PART_TYPE,
  HEAD_PART_TYPE,
  MOUTH_PART_TYPE,
  NOSE_PART_TYPE
} from "sl-web-face";
import {MouseEventHandler} from "react";

export type InitResults = {
  onFaceCanvasMouseMove:MouseEventHandler<HTMLCanvasElement>,
  onFaceCanvasMouseDown:MouseEventHandler<HTMLCanvasElement>,
  onFaceCanvasMouseUp:MouseEventHandler<HTMLCanvasElement>,
  faceCount:number,
  faceName:string,
  screenSettings:FacesScreenSettings
}

let initializedProjectName = UNSPECIFIED_NAME;

function _onPartMoved(component:CanvasComponent, x:number, y:number, setRevision:any):boolean {
  updateForFaceRelatedRevision({}, setRevision);
  return true;
}

function _onPartFocused(component:CanvasComponent|null, setRevision:any):boolean {
  if (!component) return true;
  if (!isHeadReady()) return false;
  const head = getHead();
  const revisionManager = getRevisionManager();
  const currentPartType = revisionManager.currentRevision?.partType;
  const partType = findPartTypeForCanvasComponent(component, head.children);
  if (partType !== currentPartType) updateForAuthoringRevision({partType}, setRevision);
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
async function _initForSubsequentMount(_setDisabled:any, setEyeParts:any, setExtraParts:any, setHeadParts:any, 
                                       setMouthParts:any, setNoseParts:any, screenSettings:FacesScreenSettings) {
  await bindSetDisabled(_setDisabled);
  const partLoader = getPartLoader();
  setNoseParts([...partLoader.noses]);
  setMouthParts([...partLoader.mouths]);
  setEyeParts([...partLoader.eyes]);
  setExtraParts([...partLoader.extras]);
  setHeadParts([...partLoader.heads]);
  updateScreenSettings(screenSettings);
}

async function _loadScreenSettings():Promise<FacesScreenSettings> {
  return await getFacesScreenSettings() ?? getDefaultScreenSettings();
}

function _isInitialized() {
  return initializedProjectName === getActiveProjectName();
}

function _setInitialized() {
  initializedProjectName = getActiveProjectName();
}

export async function init(setRevision:any, setEyeParts:any, setExtraParts:any, setHeadParts:any, setMouthParts:any, setNoseParts:any, _setDisabled:any):Promise<InitResults> {
  
  function onFaceCanvasMouseUp(event:any) { getPartUiManager().onMouseUp(event); }
  function onFaceCanvasMouseDown(event:any) { getPartUiManager().onMouseDown(event); }
  function onPartFocused(part:CanvasComponent|null) { _onPartFocused(part, setRevision); }
  function onPartMoved(part:CanvasComponent, x:number, y:number) { return _onPartMoved(part, x, y, setRevision); }
  function onPartResized(part:CanvasComponent, _x:number, _y:number, _width:number, _height:number) { return _onPartResized(setRevision); }
  function onPartLoaderUpdated(partTypeName:string, _partName:string) { _updateLoadablePartsForType(partTypeName, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts); }
  
  const screenSettings:FacesScreenSettings = await _loadScreenSettings();
  
  const faceCount = await getFaceCount();
  const initResults:InitResults = { onFaceCanvasMouseMove:_onFaceCanvasMouseMove, onFaceCanvasMouseDown, 
    onFaceCanvasMouseUp, faceName:UNSPECIFIED_NAME, faceCount, screenSettings };
  _addDocumentMouseUpListener(onFaceCanvasMouseUp);
  
  initResults.faceName = await getActiveFaceName();
  
  if (_isInitialized()) {
    await _initForSubsequentMount(_setDisabled, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts, screenSettings);
    return initResults;
  }
  
  const head = await loadFaceFromName(initResults.faceName) ?? await loadDefaultFace();
  const partUiManager = new PartUiManager(onPartFocused, onPartMoved, onPartResized);
  await partUiManager.trackPartsForFace(head);
  partUiManager.setFocus(head);
  const partLoader = new PartLoader(onPartLoaderUpdated);
  await partLoader.loadManifest('${process.env.PUBLIC_URL}/parts/part-manifest.yml');
  initCore(head, partUiManager, partLoader, _setDisabled);
  initRevisionManager(head);
  const [faceEventManager, faceId] = initFaceEvents(head);
  await initViewSettings('${process.env.PUBLIC_URL}/speech/test-voices/test-voice-manifest.yml', faceEventManager, faceId, screenSettings);
  
  setUpRevisionForNewFace(head, setRevision);
  
  _setInitialized();
  
  return initResults;
}

export function deinit() {
  if (!_isInitialized()) return;
  _removeDocumentMouseUpListener(_onFaceCanvasMouseMove);
}
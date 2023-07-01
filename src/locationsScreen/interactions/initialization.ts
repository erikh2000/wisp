import {getBackgroundImageBitmap} from "./backgroundImageInteractions";
import {bindSetDisabled, initCore} from "./coreUtil";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {getLocation, getLocationCount} from "persistence/locations";
import {
  getActiveLocationName,
  getActiveProjectName,
  UNSPECIFIED_NAME
} from "persistence/projects";
import {getRevisionManager, UNSELECTED} from "./revisionUtil";
import PartUiManager, {IPartFocusedCallback} from "ui/partAuthoring/PartUiManager";
import {onPartFocused, onPartMoved, onPartResized} from "./placementInteractions";
import FacePlacement from "persistence/types/FacePlacement";
import LocationFaces from "./LocationFaces";
import {getPartUiManager} from "./coreUtil";

import { CanvasComponent } from "sl-web-face";
import {IPartMovedCallback} from "../../ui/partAuthoring/moveOperation";
import {IPartResizedCallback} from "../../ui/partAuthoring/resizeOperation";

export type InitResults = {
  locationName:string,
  locationCount:number,
  onCanvasMouseDown:Function,
  onCanvasMouseMove:Function,
  onCanvasMouseUp:Function,
  backgroundImage:ImageBitmap|null
}

let initializedProjectName = UNSPECIFIED_NAME;

function _isInitialized() {
  return initializedProjectName === getActiveProjectName();
}

function _setInitialized() {
  initializedProjectName = getActiveProjectName();
}

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
async function _initForSubsequentMount(setDisabled:Function, _onPartFocused:IPartFocusedCallback, 
    _onPartMoved:IPartMovedCallback, _onPartResized:IPartResizedCallback):Promise<ImageBitmap|null> {
  bindSetDisabled(setDisabled);
  const partUiManager = getPartUiManager();
  partUiManager.bindOnPartFocused(_onPartFocused);
  partUiManager.bindOnPartMoved(_onPartMoved);
  partUiManager.bindOnPartResized(_onPartResized);
  const revisionManager = getRevisionManager();
  const backgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
  return await getBackgroundImageBitmap(backgroundImageKey);
}

function _startLoadingLocationFaces(facePlacements:FacePlacement[], partUiManager:PartUiManager):LocationFaces {
  const locationFaces:LocationFaces = {};
  for(let faceNo = 0; faceNo < facePlacements.length; ++faceNo) {
    const facePlacement = facePlacements[faceNo];
    locationFaces[facePlacement.characterName] = null;
    loadFaceFromName(facePlacement.characterName).then(face => {
      if (!face) return;
      if (facePlacement.width !== face.width || facePlacement.height !== face.height) face.resize(facePlacement.width, facePlacement.height);
      face.x = facePlacement.x;
      face.y = facePlacement.y;
      locationFaces[facePlacement.characterName] = face;
      partUiManager.addPart(face, {isMovable:true, isResizable:true, resizeChildren:true, constrainAspectRatio:true})
        .then(() => {});
    });
  }
  return locationFaces;
}

export async function init(setDisabled:Function, _setRevision:Function):Promise<InitResults> {
  function onCanvasMouseUp(event:any) { getPartUiManager().onMouseUp(event); }
  function onCanvasMouseDown(event:any) { getPartUiManager().onMouseDown(event); }
  function onCanvasMouseMove(event:any) { getPartUiManager().onMouseMove(event); }
  function _onPartFocused(part:CanvasComponent|null) { onPartFocused(part, _setRevision); }
  function _onPartMoved(part:CanvasComponent, x:number, y:number) { return onPartMoved(part, x, y, _setRevision); }
  function _onPartResized(part:CanvasComponent, x:number, y:number, w:number, h:number) { return onPartResized(part, x, y, w, h, _setRevision); }
  
  const locationName = await getActiveLocationName();
  const locationCount = await getLocationCount();
  const initResults:InitResults = { locationName, locationCount, backgroundImage:null, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp };

  if (_isInitialized()) {
    initResults.backgroundImage = await _initForSubsequentMount(setDisabled, _onPartFocused, _onPartMoved, _onPartResized);
    return initResults
  }

  const partUiManager = new PartUiManager(_onPartFocused, _onPartMoved, _onPartResized);
  await initCore(setDisabled, partUiManager);

  if (locationName === UNSPECIFIED_NAME) {
    _setInitialized();
    return initResults;
  }

  const revisionManager = getRevisionManager();
  const location = await getLocation(locationName);
  if (location) {
    const locationFaces = _startLoadingLocationFaces(location.facePlacements, partUiManager);
    const nextRevision = { location, locationFaces, selectedFaceNo:UNSELECTED };
    initResults.backgroundImage = await getBackgroundImageBitmap(location.backgroundImageKey);
    revisionManager.clear(nextRevision);
  }
  _setRevision(revisionManager.currentRevision);

  _setInitialized();
  return initResults;
}
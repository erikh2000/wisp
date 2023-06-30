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
import PartUiManager from "ui/partAuthoring/PartUiManager";
import {onPartFocused, onPartMoved, onPartResized} from "./placementInteractions";
import FacePlacement from "persistence/types/FacePlacement";
import LocationFaces from "./LocationFaces";
import {getPartUiManager} from "./coreUtil";

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
async function _initForSubsequentMount(setDisabled:Function):Promise<ImageBitmap|null> {
  bindSetDisabled(setDisabled);
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
      face.x = facePlacement.x;
      face.y = facePlacement.y;
      if (facePlacement.w !== face.width || facePlacement.h !== face.height) face.resize(facePlacement.w, facePlacement.h);
      locationFaces[facePlacement.characterName] = face;
      partUiManager.addPart(face, true, true);
    });
  }
  return locationFaces;
}

export async function init(setDisabled:Function, _setRevision:Function):Promise<InitResults> {
  function onCanvasMouseUp(event:any) { getPartUiManager().onMouseUp(event); }
  function onCanvasMouseDown(event:any) { getPartUiManager().onMouseDown(event); }
  function onCanvasMouseMove(event:any) { getPartUiManager().onMouseMove(event); }
  
  const locationName = await getActiveLocationName();
  const locationCount = await getLocationCount();
  const initResults:InitResults = { locationName, locationCount, backgroundImage:null, onCanvasMouseDown, onCanvasMouseMove, onCanvasMouseUp };

  if (_isInitialized()) {
    initResults.backgroundImage = await _initForSubsequentMount(setDisabled);
    return initResults
  }

  const partUiManager = new PartUiManager(onPartFocused, onPartMoved, onPartResized);
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
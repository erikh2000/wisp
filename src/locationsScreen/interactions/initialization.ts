import {bindSetDisabled, initCore} from "./coreUtil";
import {getLocation, getLocationCount, getLocationImage} from "persistence/locations";
import {
  getActiveLocationName,
  getActiveProjectName,
  UNSPECIFIED_NAME
} from "persistence/projects";
import {getRevisionManager, UNSELECTED} from "./revisionUtil";

import { pngBytesToImageBitmap } from 'sl-web-face';

type InitResults = {
  locationName:string,
  locationCount:number,
  backgroundImage:ImageBitmap|null
}

let initializedProjectName = UNSPECIFIED_NAME;

function _isInitialized() {
  return initializedProjectName === getActiveProjectName();
}

function _setInitialized() {
  initializedProjectName = getActiveProjectName();
}

async function _getBackgroundImageBitmap(backgroundImageKey:string):Promise<ImageBitmap|null> {
  if (backgroundImageKey === UNSPECIFIED_NAME) return null;
  const imageBytes = await getLocationImage(backgroundImageKey);
  return imageBytes ? await pngBytesToImageBitmap(imageBytes) : null;
}

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
async function _initForSubsequentMount(setDisabled:Function):Promise<ImageBitmap|null> {
  bindSetDisabled(setDisabled);
  const revisionManager = getRevisionManager();
  const backgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
  return await _getBackgroundImageBitmap(backgroundImageKey);
}

export async function init(setDisabled:Function, _setRevision:Function):Promise<InitResults> {
  const locationName = await getActiveLocationName();
  const locationCount = await getLocationCount();
  const initResults:InitResults = { locationName, locationCount, backgroundImage:null };

  if (_isInitialized()) {
    initResults.backgroundImage = await _initForSubsequentMount(setDisabled);
    return initResults
  }

  await initCore(setDisabled);

  if (locationName === UNSPECIFIED_NAME) {
    _setInitialized();
    return initResults;
  }

  const revisionManager = getRevisionManager();
  const location = await getLocation(locationName);
  if (location) {
    const nextRevision = { location, selectedFaceNo:UNSELECTED };
    initResults.backgroundImage = await _getBackgroundImageBitmap(location.backgroundImageKey);
    revisionManager.clear(nextRevision);
  }
  _setRevision(revisionManager.currentRevision);

  _setInitialized();
  return initResults;
}
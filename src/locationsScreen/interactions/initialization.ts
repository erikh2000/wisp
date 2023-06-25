import {getBackgroundImageBitmap} from "./backgroundImageInteractions";
import {bindSetDisabled, initCore} from "./coreUtil";
import {getLocation, getLocationCount} from "persistence/locations";
import {
  getActiveLocationName,
  getActiveProjectName,
  UNSPECIFIED_NAME
} from "persistence/projects";
import {getRevisionManager, UNSELECTED} from "./revisionUtil";

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

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
async function _initForSubsequentMount(setDisabled:Function):Promise<ImageBitmap|null> {
  bindSetDisabled(setDisabled);
  const revisionManager = getRevisionManager();
  const backgroundImageKey = revisionManager.currentRevision.location.backgroundImageKey;
  return await getBackgroundImageBitmap(backgroundImageKey);
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
    initResults.backgroundImage = await getBackgroundImageBitmap(location.backgroundImageKey);
    revisionManager.clear(nextRevision);
  }
  _setRevision(revisionManager.currentRevision);

  _setInitialized();
  return initResults;
}
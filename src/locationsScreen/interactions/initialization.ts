import {bindSetDisabled, initCore} from "./coreUtil";
import {getActiveProjectName, UNSPECIFIED_NAME} from "persistence/projects";

type InitResults = {
  locationName:string,
  locationCount:number
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
function _initForSubsequentMount(setDisabled:Function) {
  bindSetDisabled(setDisabled);
}

function _hackLocationName() { return 'default'; }

export async function init(setDisabled:Function, _setRevision:Function):Promise<InitResults> {
  const locationName = _hackLocationName(); // TODO
  const locationCount = 1; // TODO
  const initResults:InitResults = { locationName, locationCount };

  if (_isInitialized()) {
    _initForSubsequentMount(setDisabled);
    return initResults
  }

  await initCore(setDisabled);

  if (locationName === UNSPECIFIED_NAME) {
    _setInitialized();
    return initResults;
  }

  /* TODO add first revision */

  _setInitialized();
  return initResults;
}
import {getActiveFaceName, getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {initFaceEvents} from 'facesCommon/interactions/faceEventUtil';
import {getSpiel} from "persistence/spiels";
import {bindSetDisabled, initCore} from "spielsScreen/interactions/coreUtil";
import {bindSetTranscriptLines, initTranscript} from "./transcriptInteractions";
import {getRevisionManager} from "./revisionUtil";

let isInitialized = false;

export type InitResults = {
  faceName:string,
  spielName:string
};

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(setTranscriptLines:Function, setDisabled:Function) {
  bindSetTranscriptLines(setTranscriptLines);
  bindSetDisabled(setDisabled);
}

async function _loadSpielFromName(spielName:string):Promise<string> {
  if (spielName === UNSPECIFIED_NAME) return '';
  return await getSpiel(spielName);
}

export async function init(setTranscriptLines:Function, setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const faceName = await getActiveFaceName();
  const spielName = await getActiveSpielName();
  const initResults:InitResults = { faceName, spielName };
  
  if (isInitialized) {
    _initForSubsequentMount(setTranscriptLines, setDisabled);
    return initResults; 
  }
  
  const spielText = await _loadSpielFromName(spielName);
  const headComponent = await loadFaceFromName(faceName);
  initFaceEvents(headComponent);
  await initCore(headComponent, setDisabled);
  initTranscript(setTranscriptLines);
  const revision = { spielText };
  setRevision(revision);
  getRevisionManager().add(revision);

  isInitialized = true;
  return initResults;
}
import {getActiveFaceName} from "persistence/projects";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {initFaceEvents} from 'facesCommon/interactions/faceEventUtil';
import {initCore} from "spielsScreen/interactions/coreUtil";
import {bindSetTranscriptLines, initTranscript} from "./transcriptInteractions"; // TODO delete

let isInitialized = false;

export type InitResults = {
  faceName:string
};

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(setTranscriptLines:any) {
  bindSetTranscriptLines(setTranscriptLines);
}

export async function init(setTranscriptLines:any):Promise<InitResults> {
  const faceName = await getActiveFaceName();
  const initResults:InitResults = {
    faceName
  };
  
  if (isInitialized) {
    _initForSubsequentMount(setTranscriptLines)
    return initResults; 
  }
  
  const headComponent = await loadFaceFromName(faceName);
  initFaceEvents(headComponent);
  await initCore(headComponent);
  initTranscript(setTranscriptLines);

  isInitialized = true;
  return initResults;
}
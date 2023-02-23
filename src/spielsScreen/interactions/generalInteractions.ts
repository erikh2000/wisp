import {initTest} from "./testInteractions";
import {getActiveFaceName, getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {initFaceEvents} from 'facesCommon/interactions/faceEventUtil';
import {getSpiel} from "persistence/spiels";
import {bindSetDisabled, initCore} from "spielsScreen/interactions/coreUtil";
import {bindSetTranscriptLines, initTranscript} from "./transcriptInteractions";
import {getRevisionManager} from "./revisionUtil";

import { Spiel, importSpielFile } from 'sl-spiel';
import { init as initWebSpeech } from 'sl-web-speech';

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

async function _loadSpielFromName(spielName:string):Promise<Spiel> {
  if (spielName === UNSPECIFIED_NAME) return new Spiel();
  const spielText = await getSpiel(spielName);
  return importSpielFile(spielText);
}

export async function init(setTranscriptLines:Function, setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const faceName = await getActiveFaceName();
  const spielName = await getActiveSpielName();
  const initResults:InitResults = { faceName, spielName };
  const revisionManager = getRevisionManager();
  revisionManager.disablePersistence();
  
  if (isInitialized) {
    _initForSubsequentMount(setTranscriptLines, setDisabled);
    revisionManager.enablePersistence();
    return initResults; 
  }
  
  const spiel = await _loadSpielFromName(spielName);
  const headComponent = await loadFaceFromName(faceName);
  initFaceEvents(headComponent);
  await initCore(headComponent, setDisabled);
  await initWebSpeech();
  initTranscript(setTranscriptLines);

  revisionManager.enablePersistence();
  const revision = { spiel };
  setRevision(revision);
  revisionManager.add(revision);
  
  await initTest()

  isInitialized = true;
  return initResults;
}
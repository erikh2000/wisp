import {getDefaultScreenSettings, initTest} from "./testInteractions";
import {getActiveFaceName, getActiveProjectName, getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {loadDefaultFace, loadFaceFromNameIfModified} from "facesCommon/interactions/fileInteractions";
import {initFaceEvents} from 'facesCommon/interactions/faceEventUtil';
import {getSpielsScreenSettings} from "persistence/settings";
import {getSpiel, getSpielCount} from "persistence/spiels";
import SpielsScreenSettings from "spielsScreen/SpielsScreenSettings";
import {bindSetDisabled, initCore, setHead} from "spielsScreen/interactions/coreUtil";
import {bindSetTranscriptLines, initTranscript} from "./transcriptInteractions";
import {getRevisionManager, initRevisionManager} from "./revisionUtil";

import { Spiel, importSpielFile } from 'sl-spiel';
import { init as initWebSpeech } from 'sl-web-speech';


let initializedProjectName = UNSPECIFIED_NAME;

function _isInitialized() {
  return initializedProjectName === getActiveProjectName();
}

function _setInitialized() {
  initializedProjectName = getActiveProjectName();
}

export type InitResults = {
  faceName:string,
  spielName:string,
  spielCount:number,
  screenSettings:SpielsScreenSettings
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

type FaceLoadTimes = { [faceName:string]:number };
const faceLoadTimes:FaceLoadTimes = {};

function _getLastFaceLoadTime(faceName:string) {
  return faceLoadTimes[faceName] ?? 0;  
}

function _updateLastFaceLoadTime(faceName:string) {
  faceLoadTimes[faceName] = Date.now();
}

async function _loadScreenSettings():Promise<SpielsScreenSettings> {
  return await getSpielsScreenSettings() ?? getDefaultScreenSettings();
}

export async function init(setTranscriptLines:Function, setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const faceName = await getActiveFaceName();
  const spielName = await getActiveSpielName();
  const spielCount = await getSpielCount();
  const screenSettings = await _loadScreenSettings();
  const initResults:InitResults = { faceName, spielName, spielCount, screenSettings };

  let nextHeadComponent = await loadFaceFromNameIfModified(faceName, _getLastFaceLoadTime(faceName));
  
  if (_isInitialized()) {
    _initForSubsequentMount(setTranscriptLines, setDisabled);
    if (nextHeadComponent) setHead(nextHeadComponent);
    return initResults;
  }
  
  const spiel = await _loadSpielFromName(spielName);
  const headComponent = nextHeadComponent ?? await loadDefaultFace();
  _updateLastFaceLoadTime(faceName);
  initFaceEvents(headComponent);
  await initCore(headComponent, setDisabled);
  await initWebSpeech();
  initTranscript(setTranscriptLines);

  initRevisionManager(spiel);
  setRevision(getRevisionManager().currentRevision);
  
  await initTest()

  _setInitialized();
  return initResults;
}
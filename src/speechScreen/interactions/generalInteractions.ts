import {bindSetDisabled, initCore} from "./coreUtil";
import {getSpiel} from "persistence/spiels";
import {getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";

import { Spiel, importSpielFile } from 'sl-spiel';
import {getRevisionManager} from "./revisionUtil";
import {spielToSpeechTable} from "../speechTable/speechTableUtil";

export type InitResults = {
  spielName:string
}

let isInitialized = false;

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(setDisabled:Function) {
  bindSetDisabled(setDisabled);
}

async function _loadSpielFromName(spielName:string):Promise<Spiel> {
  if (spielName === UNSPECIFIED_NAME) return new Spiel();
  const spielText = await getSpiel(spielName);
  return importSpielFile(spielText);
}

export async function init(setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const spielName = await getActiveSpielName();
  const initResults:InitResults = { spielName };
  
  const revisionManager = getRevisionManager();
  revisionManager.disablePersistence();
  
  if (isInitialized) {
    _initForSubsequentMount(setDisabled);
    revisionManager.enablePersistence();
    return initResults;
  }

  await initCore(setDisabled);
  const spiel = await _loadSpielFromName(spielName)
  const speechTable = spielToSpeechTable(spiel);
  
  const revision = { speechTable };
  revisionManager.add(revision);
  revisionManager.enablePersistence();
  setRevision(revisionManager.currentRevision);
  
  isInitialized = true;
  return initResults;
}
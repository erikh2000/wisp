import {bindSetDisabled, initCore} from "./coreUtil";
import {getRevisionManager, Revision} from "./revisionUtil";
import RevisionManager from "documents/RevisionManager";
import {getSpiel} from "persistence/spiels";
import {getActiveSpielName, UNSPECIFIED_NAME} from "persistence/projects";
import {getUniqueCharacterNames, spielToSpeechTable} from "speechScreen/speechTable/speechTableUtil";

import { Spiel, importSpielFile } from 'sl-spiel';

export type InitResults = {
  spielName:string,
  characterNames:string[]
}

let isInitialized = false;

/* Handle any initialization needed for mount after a previous initialization was completed. This will cover
   refreshing any module-scope vars that stored instances tied to a React component's lifetime and calling setters
   to on React components to synchronize their state with module-scope vars. */
function _initForSubsequentMount(revisionManager:RevisionManager<Revision>, setDisabled:Function) {
  bindSetDisabled(setDisabled);
  // If I later find there is state in revisions that needs to be kept, change the code here to add it to a first revision.
  revisionManager.clear();
}

async function _loadSpielFromName(spielName:string):Promise<Spiel> {
  if (spielName === UNSPECIFIED_NAME) return new Spiel();
  const spielText = await getSpiel(spielName);
  return importSpielFile(spielText);
}

export async function init(setDisabled:Function, setRevision:Function):Promise<InitResults> {
  const spielName = await getActiveSpielName();
  const initResults:InitResults = { spielName, characterNames:[] };
  
  const revisionManager = getRevisionManager();
  revisionManager.disablePersistence();
  
  if (isInitialized) {
    _initForSubsequentMount(revisionManager, setDisabled);
    // Unlike other screen, don't return here, because need to load the spiel fresh from persistence in case a change
    // on spiels screen was made.
  }

  await initCore(setDisabled);
  const spiel = await _loadSpielFromName(spielName)
  const speechTable = spielToSpeechTable(spiel);
  initResults.characterNames = getUniqueCharacterNames(speechTable);
  
  const revision = { speechTable };
  revisionManager.add(revision);
  revisionManager.enablePersistence();
  setRevision(revisionManager.currentRevision);
  
  isInitialized = true;
  return initResults;
}
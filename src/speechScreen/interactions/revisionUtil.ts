import RevisionManager from "documents/RevisionManager";
import {spielToSpeechTable, updateSpeechTableWithTakes} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable, {duplicateSpeechTable} from "speechScreen/speechTable/types/SpeechTable";

import { importSpielFile } from 'sl-spiel';

export type Revision = {
  speechTable: SpeechTable;
}

async function onPersistRevision(_revision:Revision):Promise<void> {
  // For now, there is nothing to persist.
}

let revisionManager:RevisionManager<Revision>|null = null;

export function getRevisionManager():RevisionManager<Revision> {
  if (!revisionManager) throw Error("Call initRevisionManager() first");
  return revisionManager; 
}

export function initRevisionManager(speechTable:SpeechTable) {
  const initialRevision = { speechTable };
  revisionManager = new RevisionManager<Revision>(initialRevision, onPersistRevision);
}

export function getRevisionForMount():Revision {
  return revisionManager ? revisionManager.currentRevision : { speechTable: { rows:[] } };
}

export function updateRevisionForSpeechTable(speechTable:SpeechTable, setRevision:Function) {
  const _revisionManager = getRevisionManager();
  const nextSpeechTable = duplicateSpeechTable(speechTable);
  _revisionManager.addChanges({speechTable:nextSpeechTable});
  setRevision(_revisionManager.currentRevision);
}

export async function setUpRevisionForNewSpiel(spielName:string, spielText:string, setRevision:any) {
  const spiel = importSpielFile(spielText);
  const speechTable = spielToSpeechTable(spiel);
  await updateSpeechTableWithTakes(spielName, speechTable);
  const nextRevision:Revision = { speechTable };
  getRevisionManager().clear(nextRevision);
  setRevision(nextRevision);
}
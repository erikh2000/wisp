import RevisionManager from "documents/RevisionManager";
import {spielToSpeechTable, updateSpeechTableWithTakes} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable, {duplicateSpeechTable} from "speechScreen/speechTable/types/SpeechTable";

import { importSpielFile } from 'sl-spiel';

export type Revision = {
  speechTable: SpeechTable;
}

async function onPersistRevision(revision:Revision):Promise<void> {
  // TODO
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function getRevisionManager() { return revisionManager; }

export function getRevisionForMount():Revision {
  const revision = revisionManager.currentRevision;
  if (revision) return revision;
  const newRevision = { speechTable: { rows:[] } };
  revisionManager.add(newRevision);
  return newRevision;
}

export function updateRevisionForSpeechTable(speechTable:SpeechTable, setRevision:Function) {
  const nextSpeechTable = duplicateSpeechTable(speechTable);
  revisionManager.addChanges({speechTable:nextSpeechTable});
  setRevision(revisionManager.currentRevision);
}

export async function setUpRevisionForNewSpiel(spielName:string, spielText:string, setRevision:any) {
  const spiel = importSpielFile(spielText);
  const speechTable = spielToSpeechTable(spiel);
  await updateSpeechTableWithTakes(spielName, speechTable);
  const nextRevision:Revision = { speechTable };
  revisionManager.clear();
  revisionManager.add(nextRevision);
  setRevision(nextRevision);
}
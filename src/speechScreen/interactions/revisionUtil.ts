import RevisionManager from "documents/RevisionManager";
import SpeechTable, {duplicateSpeechTable} from "speechScreen/speechTable/types/SpeechTable";

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
import {getRevisionManager, Revision} from "./revisionUtil";
import {deleteAllTakesForSpiel, getTake} from "persistence/speech";
import {UNSPECIFIED_NAME} from "persistence/projects";
import RevisionManager from "documents/RevisionManager";
import {
  duplicateSpeechTable,
  getDialogTextKeyInfoFromSpeechTable,
  updateSpeechTableWithTakes
} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";

import {stopAll, playAudioBuffer, wavBytesToAudioBuffer} from 'sl-web-audio';

export async function deleteAllTakes(spielName:string, setRevision:Function, setModalDialog:Function) {
  const speechTable = _getRevisionSpeechTable(getRevisionManager());
  const dialogueTextKeyInfos = getDialogTextKeyInfoFromSpeechTable(spielName, speechTable, UNSPECIFIED_NAME);
  await deleteAllTakesForSpiel(dialogueTextKeyInfos);
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}

export function refreshTable(spielName:string, setRevision:Function) {
  return _updateSpeechTableTakesAndRevision(spielName, setRevision);
}
export async function playTakeWave(wavKey:string) {
  const wavBytes = await getTake(wavKey);
  const audioBuffer = wavBytesToAudioBuffer(wavBytes);
  stopAll();
  playAudioBuffer(audioBuffer);
}

function _getRevisionSpeechTable(revisionManager:RevisionManager<Revision>):SpeechTable {
  const revision = revisionManager.currentRevision;
  if (!revision) throw Error("No revision");
  return duplicateSpeechTable(revision.speechTable);
}

async function _updateSpeechTableTakesAndRevision(spielName:string, setRevision:Function) {
  const revisionManager = getRevisionManager();
  const speechTable = _getRevisionSpeechTable(revisionManager);
  await updateSpeechTableWithTakes(spielName, speechTable);
  revisionManager.addChanges({speechTable});
  setRevision(revisionManager.currentRevision);
}

export function onCompleteRecording(spielName:string, setRevision:Function, setModalDialog:Function) {
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}

export function onCancelRecording(spielName:string, setRevision:Function, setModalDialog:Function) {
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}
import {getRevisionManager, Revision} from "./revisionUtil";
import {
  deleteAllTakesForSpiel,
  deleteTake,
  getTake,
  saveTakeBytes,
  takeKeyToFinalKey
} from "persistence/speech";
import {UNSPECIFIED_NAME} from "persistence/projects";
import RevisionManager from "documents/RevisionManager";
import TrimSpeechDialog from "speechScreen/dialogs/TrimSpeechDialog";
import {
  duplicateSpeechTable,
  getDialogTextKeyInfoFromSpeechTable,
  updateSpeechTableWithTakes
} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";

import { audioBufferAndCuesToWavBytes, stopAll, playAudioBuffer, WavCue, wavBytesToAudioBuffer } from 'sl-web-audio';
import {LipzEvent} from 'sl-web-speech';

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

export async function deleteAllTakes(spielName:string, setRevision:Function, setModalDialog:Function) {
  const speechTable = _getRevisionSpeechTable(getRevisionManager());
  const dialogueTextKeyInfos = getDialogTextKeyInfoFromSpeechTable(spielName, speechTable, UNSPECIFIED_NAME);
  await deleteAllTakesForSpiel(dialogueTextKeyInfos);
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}

export async function onDeleteTake(takeWavKey:string, spielName:string, setRevision:Function, setModalDialog:Function) {
  await deleteTake(takeWavKey);
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}

export async function onFinalizeTake(takeWavKey:string, setModalDialog:Function, setActiveTakeWavKey:Function) {
  setModalDialog(TrimSpeechDialog.name);
  setActiveTakeWavKey(takeWavKey);
}

function lipzEventsToWavCues(lipzEvents:LipzEvent[]):WavCue[] {
  return lipzEvents.map((lipzEvent:LipzEvent) => {
    return { label:lipzEvent.phoneme, position:lipzEvent.getTime() * 1000};
  });
}

export async function onCompleteFinalization(takeWavKey:string|null, audioBuffer:AudioBuffer|null, 
    lipzEvents:LipzEvent[], spielName:string, setRevision:Function, setModalDialog:Function) {
  if (!takeWavKey || !audioBuffer) return;
  const wavBytes = await audioBufferAndCuesToWavBytes(audioBuffer, lipzEventsToWavCues(lipzEvents));
  const finalWavKey = takeKeyToFinalKey(takeWavKey);
  await saveTakeBytes(finalWavKey, wavBytes);
  await _updateSpeechTableTakesAndRevision(spielName, setRevision);
  setModalDialog(null);
}

export async function loadTakeWave(wavKey:string):Promise<AudioBuffer> {
  const wavBytes = await getTake(wavKey);
  return await wavBytesToAudioBuffer(wavBytes);
}

export async function playTakeWave(wavKey:string) {
  const audioBuffer = await loadTakeWave(wavKey);
  stopAll();
  playAudioBuffer(audioBuffer);
}

export function onCompleteRecording(spielName:string, setRevision:Function, setModalDialog:Function) {
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}

export function onCancelRecording(spielName:string, setRevision:Function, setModalDialog:Function) {
  _updateSpeechTableTakesAndRevision(spielName, setRevision).then(() => {});
  setModalDialog(null);
}
import {fillTemplate} from "./pathUtil";
import {SPEECH_TAKE_PATH_TEMPLATE, SPEECH_TAKE_KEY_TEMPLATE} from "./keyPaths";
import {MIMETYPE_AUDIO_WAV} from "./mimeTypes";
import {deleteAllKeysAtPath, deleteByKey, getAllKeysAtPath, getBytes, setBytes} from "./pathStore";
import {getActiveProjectName, UNSPECIFIED_NAME} from "./projects";
import {DialogTextKeyInfo} from "../speechScreen/speechTable/speechTableUtil";

function _removeNonAlphaNumeric(text:string):string {
  return text.replace(/[^a-zA-Z0-9]/g, '');
}
function _getFirstThreeWords(dialogueText:string):string {
  const words = dialogueText.split(' ').map(word => {
    word = word.trim();
    if (word.endsWith('/')) word = word.slice(0, word.length - 1);
    return _removeNonAlphaNumeric(word.toLowerCase());
  });
  return words.slice(0, 3).join(' ').trim();
}
function _getTakeKey(projectName:string, spielName:string, characterName:string, speechId:string, dialogueText:string, takeNo:number):string {
  const firstThreeWords = _getFirstThreeWords(dialogueText);
  return fillTemplate(SPEECH_TAKE_KEY_TEMPLATE, {projectName, spielName, characterName, speechId, firstThreeWords, takeNo});
}

function _isKeyForTake(key:string):boolean {
  let lastSeparatorPos = key.lastIndexOf('/');
  if (lastSeparatorPos === -1) lastSeparatorPos = 0;
  const takeNo = key.slice(lastSeparatorPos + 1);
  return takeNo.startsWith('take');
}

export function isKeyForFinal(key:string):boolean {
  return key.endsWith('/final');
}

export async function getTakeKeys(spielName:string, characterName:string, speechId:string, dialogueText:string, projectName:string = getActiveProjectName()):Promise<string[]> {
  const firstThreeWords = _getFirstThreeWords(dialogueText);
  const speechTakePath = fillTemplate(SPEECH_TAKE_PATH_TEMPLATE, {projectName, spielName, characterName, speechId, firstThreeWords});
  const keys = await getAllKeysAtPath(speechTakePath);
  return keys.filter(key => _isKeyForTake(key) || isKeyForFinal(key));
}
  
export async function getTakeCount(spielName:string, characterName:string, speechId:string, dialogueText:string, projectName:string = getActiveProjectName()):Promise<number> {
  return (await getTakeKeys(spielName, characterName, speechId, dialogueText, projectName)).length;
}

export async function addTake(spielName:string, characterName:string, speechId:string, dialogueText:string, wavBytes:Uint8Array, projectName:string = getActiveProjectName()):Promise<void> {
  const takeCount = await getTakeCount(spielName, characterName, speechId, dialogueText, projectName);
  const speechTakeKey = _getTakeKey(projectName, spielName, characterName, speechId, dialogueText, takeCount+1);
  await setBytes(speechTakeKey, wavBytes, MIMETYPE_AUDIO_WAV);
}

export async function getTake(key:string):Promise<Uint8Array> {
  const bytes = await getBytes(key);
  if (!bytes) throw new Error(`No take found for key ${key}`);
  return bytes;
}

export async function deleteAllTakesForSpiel(dialogueTextKeyInfos:DialogTextKeyInfo[], projectName:string = getActiveProjectName()):Promise<void> {
  const paths:string[] = dialogueTextKeyInfos.map((keyInfo) => {
    const { spielName, characterName, speechId, dialogueText } = keyInfo;
    const firstThreeWords = _getFirstThreeWords(dialogueText);
    const useProjectName = keyInfo.projectName === UNSPECIFIED_NAME ? projectName : keyInfo.projectName;
    return fillTemplate(SPEECH_TAKE_PATH_TEMPLATE, {projectName:useProjectName, spielName, characterName, speechId, firstThreeWords});
  });
  
  const deletePromises:Promise<void>[] = paths.map(path => deleteAllKeysAtPath(path));
  await Promise.all(deletePromises);
}

export async function deleteTake(key:string):Promise<void> {
  await deleteByKey(key);
}

export function takeKeyToFinalKey(key:string):string {
  const lastSeparatorPos = key.lastIndexOf('/');
  if (lastSeparatorPos === -1) throw new Error(`Invalid take key ${key}`);
  return key.slice(0, lastSeparatorPos) + '/final';
}

export async function makeTakeFinal(key:string):Promise<void> {
  const finalKey = takeKeyToFinalKey(key);
  const bytes = await getTake(key);
  await setBytes(finalKey, bytes, MIMETYPE_AUDIO_WAV);
}

export async function saveTakeBytes(key:string, bytes:Uint8Array):Promise<void> {
  await setBytes(key, bytes, MIMETYPE_AUDIO_WAV);
}
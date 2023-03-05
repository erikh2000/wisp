import {fillTemplate} from "./pathUtil";
import {SPEECH_PATH_TEMPLATE, SPEECH_TAKE_PATH_TEMPLATE} from "./keyPaths";
import {MIMETYPE_AUDIO_WAV} from "./mimeTypes";
import {getAllKeysAtPath, getBytes, setBytes} from "./pathStore";
import {getActiveProjectName} from "./projects";

function _getFirstThreeWords(dialogueText:string):string {
  const words = dialogueText.split(' ').map(word => {
    word = word.trim();
    if (word.endsWith('/')) word = word.slice(0, word.length - 1);
    return word.trim();
  });
  return words.slice(0, 3).join(' ');
}
function _getTakeKey(projectName:string, spielName:string, characterName:string, speechId:string, dialogueText:string, takeNo:number):string {
  const firstThreeWords = _getFirstThreeWords(dialogueText);
  return fillTemplate(SPEECH_TAKE_PATH_TEMPLATE, {projectName, spielName, characterName, speechId, firstThreeWords, takeNo});
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
  const speechPath = fillTemplate(SPEECH_PATH_TEMPLATE, {projectName, spielName, characterName, speechId});
  const keys = await getAllKeysAtPath(speechPath);
  return keys.filter(key => _isKeyForTake(key));
}
  
async function _getTakeCount(spielName:string, characterName:string, speechId:string, dialogueText:string, projectName:string = getActiveProjectName()):Promise<number> {
  return (await getTakeKeys(spielName, characterName, speechId, dialogueText, projectName)).length;
}

export async function addTake(spielName:string, characterName:string, speechId:string, dialogueText:string, audioBuffer:AudioBuffer, projectName:string = getActiveProjectName()):Promise<void> {
  const takeCount = await _getTakeCount(spielName, characterName, speechId, dialogueText, projectName);
  const speechTakeKey = _getTakeKey(projectName, spielName, characterName, speechId, dialogueText, takeCount);
  const wavBytes = new Uint8Array([0,1,2,3,4,5]); // TODO - need to convert an audiobuffer to WAV format bytes.
  return setBytes(speechTakeKey, wavBytes, MIMETYPE_AUDIO_WAV);
}
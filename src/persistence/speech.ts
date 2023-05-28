import {fillTemplate} from "./pathUtil";
import {
  SPEECH_TAKE_PATH_TEMPLATE,
  SPEECH_TAKE_KEY_TEMPLATE,
  SPEECH_FINAL_KEY_TEMPLATE,
  SPEECH_ID_REGEX
} from "./keyPaths";
import {MIMETYPE_AUDIO_WAV} from "./mimeTypes";
import {
  deleteAllKeysAtPath,
  deleteByKey,
  getAllKeysAtPath,
  getAllKeysMatchingRegex,
  getBytes,
  setBytes
} from "./pathStore";
import {getActiveProjectName, UNSPECIFIED_NAME} from "./projects";
import {DialogTextKeyInfo} from "../speechScreen/speechTable/speechTableUtil";
import {getAllSpielKeys, getSpielByKey, spielKeyToName} from "./spiels";

import {Spiel, SpielLine, importSpielFile} from 'sl-spiel';

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

function _getFinalKey(projectName:string, spielName:string, characterName:string, speechId:string, dialogueText:string):string {
  const firstThreeWords = _getFirstThreeWords(dialogueText);
  return fillTemplate(SPEECH_FINAL_KEY_TEMPLATE, {projectName, spielName, characterName, speechId, firstThreeWords});
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

export async function getTake(key:string):Promise<Uint8Array|null> {
  return await getBytes(key);
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

export async function saveTakeBytes(key:string, bytes:Uint8Array):Promise<void> {
  await setBytes(key, bytes, MIMETYPE_AUDIO_WAV);
}

export async function getFinalTake(spielName:string, characterName:string, speechId:string, dialogueText:string, 
    projectName = getActiveProjectName()):Promise<Uint8Array|null> {
  const key = _getFinalKey(projectName, spielName, characterName, speechId, dialogueText);
  return await getTake(key);
}

function _spielLineToSpeechPaths(line:SpielLine, spielName:string, projectName:string):string[] {
  const { character, dialogue } = line;
  const speechPaths:string[] = [];
  for(let dialogueI = 0; dialogueI < dialogue.length; ++dialogueI) {
    const dialogueText = dialogue[dialogueI];
    const speechId = line.speechIds[dialogueI];
    const firstThreeWords = _getFirstThreeWords(dialogueText);
    const speechPath = fillTemplate(SPEECH_TAKE_PATH_TEMPLATE, {projectName, spielName, characterName:character, speechId, firstThreeWords});
    speechPaths.push(speechPath);
  }
  return speechPaths;
}

function _getAllSpeechPathsForSpiel(spiel:Spiel, spielName:string, projectName:string):string[] {
  let speechPaths:string[] = [];
  for(let nodeI = 0; nodeI < spiel.nodes.length; ++nodeI) {
    const node = spiel.nodes[nodeI];
    speechPaths = speechPaths.concat(_spielLineToSpeechPaths(node.line, spielName, projectName));
    for(let replyI = 0; replyI < node.replies.length; ++replyI) {
      const reply = node.replies[replyI];
      speechPaths = speechPaths.concat(_spielLineToSpeechPaths(reply.line, spielName, projectName));
    }
  }
  for(let rootReplyI = 0; rootReplyI < spiel.rootReplies.length; ++rootReplyI) {
    const rootReply = spiel.rootReplies[rootReplyI];
    speechPaths = speechPaths.concat(_spielLineToSpeechPaths(rootReply.line, spielName, projectName));
  }
  return speechPaths;
}

function _getAllSpeechKeys():Promise<string[]> {
  return getAllKeysMatchingRegex(SPEECH_ID_REGEX);
}

function _doesSpeechKeyMatchPaths(speechKey:string, speechPaths:string[]):boolean {
  for(const speechPath of speechPaths) {
    if (speechKey.startsWith(speechPath)) return true;
  }
  return false;
}

export async function deleteUnusedSpeech(projectName:string = getActiveProjectName()):Promise<void> {
  const allSpeechPaths:string[] = [];
  const spielKeys:string[] = await getAllSpielKeys();
  for(let spielKeyI = 0; spielKeyI < spielKeys.length; ++spielKeyI) {
    const spielKey = spielKeys[spielKeyI];
    const spielName = spielKeyToName(spielKey);
    const spielYaml = await getSpielByKey(spielKey);
    const spiel:Spiel = importSpielFile(spielYaml);
    const spielSpeechPaths:string[] = _getAllSpeechPathsForSpiel(spiel, spielName, projectName);
    allSpeechPaths.push(...spielSpeechPaths);
  }
  const speechKeys:string[] = await _getAllSpeechKeys();
  speechKeys.forEach(speechKey => {
    if (!_doesSpeechKeyMatchPaths(speechKey, allSpeechPaths)) deleteTake(speechKey);
  });
}
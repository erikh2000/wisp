import { Emotion as SpielEmotion } from 'sl-spiel';
import {bytesToBase64} from "../common/base64Util";

export function getSubtle():SubtleCrypto {
  const subtle = global.crypto && global.crypto.subtle;
  if (!subtle) throw Error('Browser does not implement Web Crypto.');
  if (!subtle.importKey || !subtle.deriveKey || !subtle.decrypt || !subtle.encrypt || !subtle.exportKey) throw Error('Web Crypto on this browser does not implement required APIs.');
  return subtle;
}

const SEPARATOR_CHAR = 0;
const SEPARATOR_SIZE = 1;
const EMOTION_SIZE = 1;
function _generateSpeechIdBytes(spielName:string, characterName:string, emotion:SpielEmotion, dialogue:string):Uint8Array {
  const byteCount = spielName.length + characterName.length + EMOTION_SIZE + dialogue.length + (SEPARATOR_SIZE * 3);
  const bytes = new Uint8Array(byteCount);
  let i = 0;
  for (let j = 0; j < spielName.length; ++j) { bytes[i++] = spielName.charCodeAt(j); }
  bytes[i++] = SEPARATOR_CHAR;
  for (let j = 0; j < characterName.length; ++j) { bytes[i++] = characterName.charCodeAt(j); }
  bytes[i++] = SEPARATOR_CHAR;
  bytes[i++] = emotion;
  bytes[i++] = SEPARATOR_CHAR;
  for (let j = 0; j < dialogue.length; ++j) { bytes[i++] = dialogue.charCodeAt(j); }
  return bytes;
}

// Use a hash function to generate a unique ID based on spielName, characterName, emotion, and dialogue.
export async function generateSpeechId(spielName:string, characterName:string, emotion:SpielEmotion, dialogue:string):Promise<string> {
  const subtle = getSubtle();
  const bytes = _generateSpeechIdBytes(spielName, characterName, emotion, dialogue);
  const arrayBuffer = await subtle.digest("SHA-1", bytes);
  const hash = bytesToBase64(new Uint8Array(arrayBuffer));
  console.log(hash);
  return hash;
}

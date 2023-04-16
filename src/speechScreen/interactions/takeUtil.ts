import {getTake} from "persistence/speech";

import {stopAll, playAudioBuffer, wavBytesToAudioBuffer} from 'sl-web-audio';

export async function playTakeWave(wavKey:string) {
  const wavBytes = await getTake(wavKey);
  const audioBuffer = wavBytesToAudioBuffer(wavBytes);
  stopAll();
  playAudioBuffer(audioBuffer);
}
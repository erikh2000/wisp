import { getFinalTake } from "persistence/speech";

import { SpeechAudio } from 'sl-web-face';
import { LipzEvent, textToViseme } from 'sl-web-speech';
import { wavBytesToAudioBufferAndCues, WavCue } from "sl-web-audio";

// TODO - refactor?
function _wavCuesToLipzEvents(cues:WavCue[]):LipzEvent[] {
  const lipzEvents:LipzEvent[] = [];
  for(const cue of cues) {
    const viseme = textToViseme(cue.label);
    const lipzEvent = new LipzEvent(cue.position, viseme);
    lipzEvents.push(lipzEvent);
  }
  return lipzEvents;
}

class SpeechAudioIndex {
  async findSpeechAudio(spielName:string, characterName:string, speechId:string, dialogueText:string):Promise<SpeechAudio|null> {
    const wavBytes = await getFinalTake(spielName, characterName, speechId, dialogueText);
    if (!wavBytes) return null;
    const [audioBuffer, cues] = await wavBytesToAudioBufferAndCues(wavBytes);
    const lipzEvents = _wavCuesToLipzEvents(cues);
    return new SpeechAudio(audioBuffer, lipzEvents);
  }
}

export default SpeechAudioIndex;
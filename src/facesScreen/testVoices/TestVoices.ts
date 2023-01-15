import TestVoiceType from "facesScreen/testVoices/TestVoiceType";

import {Emotion, SpeechAudio} from "sl-web-face";

export type PerEmotionSpeech = {
  variations:SpeechAudio[],
  nextVariationNo:number
}

export type PerVoiceSpeech = [
  neutral:PerEmotionSpeech, confused:PerEmotionSpeech, sad:PerEmotionSpeech, afraid:PerEmotionSpeech,
  evil:PerEmotionSpeech, suspicious:PerEmotionSpeech, amused:PerEmotionSpeech, happy:PerEmotionSpeech,
  thinking:PerEmotionSpeech, angry:PerEmotionSpeech, irritated:PerEmotionSpeech
];

class TestVoices {
  private perVoiceSpeech:PerVoiceSpeech[];
  private lastSpeechAudio:SpeechAudio|null;

  constructor(perVoiceSpeech:PerVoiceSpeech[]) {
    this.perVoiceSpeech = perVoiceSpeech;
    this.lastSpeechAudio = null;
  }

  private _getSpeechAudio(testVoiceType:TestVoiceType, emotion:Emotion):SpeechAudio|null {
    const _perVoiceSpeech = this.perVoiceSpeech[testVoiceType];
    const emotionI = emotion as number;
    const perEmotionSpeech = _perVoiceSpeech[emotionI];
    const variationNo = perEmotionSpeech.nextVariationNo;
    perEmotionSpeech.nextVariationNo = (++(perEmotionSpeech.nextVariationNo) % perEmotionSpeech.variations.length);
    return perEmotionSpeech.variations[variationNo];
  }

  play(testVoiceType:TestVoiceType, emotion:Emotion) {
    if (this.lastSpeechAudio) {
      this.lastSpeechAudio.stop();
      this.lastSpeechAudio = null;
    }
    const speechAudio = this._getSpeechAudio(testVoiceType, emotion);
    if (speechAudio) speechAudio.play();
    this.lastSpeechAudio = speechAudio;
  }
}

export default TestVoices;
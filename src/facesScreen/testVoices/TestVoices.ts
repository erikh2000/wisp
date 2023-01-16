import TestVoiceType from "facesScreen/testVoices/TestVoiceType";

import {Emotion, FaceEventManager, SpeechAudio} from "sl-web-face";

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
  private _perVoiceSpeech:PerVoiceSpeech[];
  private _lastSpeechAudio:SpeechAudio|null;
  private _faceEventManager:FaceEventManager;
  private _faceId:number;

  constructor(perVoiceSpeech:PerVoiceSpeech[], faceEventManager:FaceEventManager, faceId:number) {
    this._perVoiceSpeech = perVoiceSpeech;
    this._lastSpeechAudio = null;
    this._faceEventManager = faceEventManager;
    this._faceId = faceId;
  }

  private _getSpeechAudio(testVoiceType:TestVoiceType, emotion:Emotion):SpeechAudio|null {
    const perVoiceSpeech = this._perVoiceSpeech[testVoiceType];
    const emotionI = emotion as number;
    const perEmotionSpeech = perVoiceSpeech[emotionI];
    const variationNo = perEmotionSpeech.nextVariationNo;
    perEmotionSpeech.nextVariationNo = (++(perEmotionSpeech.nextVariationNo) % perEmotionSpeech.variations.length);
    return perEmotionSpeech.variations[variationNo];
  }

  play(testVoiceType:TestVoiceType, emotion:Emotion) {
    if (this._lastSpeechAudio) {
      this._lastSpeechAudio.stop();
      this._lastSpeechAudio = null;
    }
    const speechAudio = this._getSpeechAudio(testVoiceType, emotion);
    this._lastSpeechAudio = speechAudio;
    if (!speechAudio) return;
    speechAudio.setSpeakingFace(this._faceEventManager, this._faceId); // Not necessary to set every time, but simpler to do it this way than waiting for async loading in TestVoiceLoader.
    speechAudio.play();
  }
}

export default TestVoices;
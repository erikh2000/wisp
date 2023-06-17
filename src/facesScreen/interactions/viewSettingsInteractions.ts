import FacesScreenSettings from "facesScreen/FacesScreenSettings";
import TestVoiceType from "facesScreen/testVoices/TestVoiceType";
import TestVoices from "facesScreen/testVoices/TestVoices";
import TestVoiceLoader from "facesScreen/testVoices/TestVoiceLoader";
import {setFacesScreenSettings} from "persistence/settings";

import {Emotion, FaceEventManager, LidLevel} from "sl-web-face";

let testVoices:TestVoices|null = null;
let _screenSettings:FacesScreenSettings|null = null;
let _faceEventManager:FaceEventManager|null = null;
let _faceId:number = -1;

function _getTestVoiceType():TestVoiceType {
  return _screenSettings ? _screenSettings.testVoice : TestVoiceType.MUTED;
}

function _playTestVoiceForEmotion(emotion:Emotion) {
  const testVoice = _getTestVoiceType();
  if (!testVoices || testVoice === TestVoiceType.MUTED) return;
  testVoices.play(testVoice, emotion);
}

export function getDefaultScreenSettings() {
  return {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    testVoice: TestVoiceType.MUTED
  };
}

export function updateScreenSettings(screenSettings:FacesScreenSettings) {
  _screenSettings = screenSettings;
}

export async function initViewSettings(testVoiceManifestUrl:string, faceEventManager:FaceEventManager, faceId:number, screenSettings:FacesScreenSettings) {
  const testVoiceLoader = new TestVoiceLoader();
  testVoices = await testVoiceLoader.loadManifest(testVoiceManifestUrl, faceEventManager, faceId);
  updateScreenSettings(screenSettings);
  _faceEventManager = faceEventManager;
  _faceId = faceId;
}

export function onTestVoiceChange(testVoice:TestVoiceType, setScreenSettings:Function) {
  if (!_screenSettings) throw Error('Unexpected');
  _screenSettings.testVoice = testVoice;
  setScreenSettings({..._screenSettings});
  setFacesScreenSettings(_screenSettings).then(() => {});
}

export function onEmotionClick(emotion:Emotion) {
  _playTestVoiceForEmotion(emotion);
}

export function onLidLevelChange(lidLevel:LidLevel, setScreenSettings:Function) {
  if (!_screenSettings || !_faceEventManager) throw Error('Unexpected');
  _screenSettings.lidLevel = lidLevel;
  _faceEventManager.setLidLevel(_faceId, lidLevel);
  setScreenSettings(_screenSettings);
  setFacesScreenSettings(_screenSettings).then(() => {});
}
export function onEmotionChange(emotion:Emotion, setScreenSettings:Function) {
  if (!_screenSettings || !_faceEventManager) throw Error('Unexpected');
  _screenSettings.emotion = emotion;
  _faceEventManager.setEmotion(_faceId, emotion);
  setScreenSettings({..._screenSettings});
  setFacesScreenSettings(_screenSettings).then(() => {});
}

export function getTestVoiceCredits():string|undefined {
  const testVoice = _getTestVoiceType();
  switch (testVoice) {
    case TestVoiceType.MALE: return 'Voice acting by Geoffrey M. Butler';
    case TestVoiceType.FEMALE: return 'Voice acting by Chelsea Blackwell';
    default: return undefined;
  }
}
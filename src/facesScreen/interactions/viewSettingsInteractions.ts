import TestVoiceType from "facesScreen/testVoices/TestVoiceType";
import {getRevisionManager, updateForStaticFaceRevision} from "./revisionUtil";
import TestVoices from "facesScreen/testVoices/TestVoices";
import TestVoiceLoader from "facesScreen/testVoices/TestVoiceLoader";

import {Emotion, LidLevel} from "sl-web-face";

let testVoices:TestVoices|null = null;

function _getTestVoiceType():TestVoiceType {
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  if (!currentRevision) return TestVoiceType.MUTED;
  return currentRevision.testVoice;
}

function _playTestVoiceForEmotion(emotion:Emotion) {
  const testVoice = _getTestVoiceType();
  if (!testVoices || testVoice === TestVoiceType.MUTED) return;
  testVoices.play(testVoice, emotion);
}

export async function initViewSettings(testVoiceManifestUrl:string) {
  const testVoiceLoader = new TestVoiceLoader();
  testVoices = await testVoiceLoader.loadManifest(testVoiceManifestUrl);
} 

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  updateForStaticFaceRevision({testVoice}, setRevision);
}

export function onEmotionClick(emotion:Emotion) {
  _playTestVoiceForEmotion(emotion);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  updateForStaticFaceRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  updateForStaticFaceRevision({lidLevel}, setRevision);
}

export function getTestVoiceCredits():string|undefined {
  const testVoice = _getTestVoiceType();
  switch (testVoice) {
    case TestVoiceType.MALE: return 'Voice acting by Geoffrey M. Butler.';
    case TestVoiceType.FEMALE: return 'Voice acting by Chelsea Blackwell.';
    default: return undefined;
  }
}
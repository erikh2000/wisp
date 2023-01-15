import TestVoiceType from "facesScreen/testVoices/TestVoiceType";
import {getRevisionManager, updateForStaticFaceRevision} from "./revisionUtil";
import TestVoices from "facesScreen/testVoices/TestVoices";
import TestVoiceLoader from "facesScreen/testVoices/TestVoiceLoader";

import {Emotion, LidLevel} from "sl-web-face";

let testVoices:TestVoices|null = null;

function _playTestVoiceForEmotion(emotion:Emotion) {
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  if (!testVoices || !currentRevision) return;
  const testVoice:TestVoiceType = currentRevision.testVoice;
  if (testVoice === TestVoiceType.MUTED) return;
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
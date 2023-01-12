import {TestVoiceType} from "facesScreen/view/TestVoiceSelector";
import {updateForStaticFaceRevision} from "./revisionUtil";
import {Emotion, LidLevel} from "sl-web-face";

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  updateForStaticFaceRevision({testVoice}, setRevision);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  updateForStaticFaceRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  updateForStaticFaceRevision({lidLevel}, setRevision);
}
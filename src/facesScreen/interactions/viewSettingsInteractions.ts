import {TestVoiceType} from "facesScreen/TestVoiceSelector";
import {updateForFaceRelatedRevision} from "./revisionUtil";
import {Emotion, LidLevel} from "sl-web-face";

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  updateForFaceRelatedRevision({testVoice}, setRevision);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  updateForFaceRelatedRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  updateForFaceRelatedRevision({lidLevel}, setRevision);
}
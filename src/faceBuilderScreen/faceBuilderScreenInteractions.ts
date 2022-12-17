import {
  AttentionController,
  BlinkController,
  CanvasComponent,
  Emotion,
  LidLevel,
  loadFaceFromUrl, publishEvent, Topic
} from "sl-web-face";
import {PartType} from "./PartSelector";
import {loadSelectionBox} from "./SelectionBoxCanvasComponent";
import {TestVoiceType} from "./TestVoiceSelector";
import RevisionManager from "documents/RevisionManager";

export type FaceScreenRevision = {
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType
};

let head:CanvasComponent|null = null;
let selectionBox:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();
const revisionManager:RevisionManager<FaceScreenRevision> = new RevisionManager<FaceScreenRevision>();

export async function init():Promise<void> {
  if (isInitialized) return;
  head = await loadFaceFromUrl('/faces/billy.yml');
  const initData = {width:head.width, height:head.height};
  selectionBox = await loadSelectionBox(initData);
  selectionBox.setParent(head);
  blinkController.start();
  attentionController.start();
  isInitialized = true;
}

function _publishFaceEventsForRevision(revision:FaceScreenRevision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

export function onUndo(setRevision:any) {
  const nextRevision = revisionManager.prev();
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function onRedo(setRevision:any) {
  const nextRevision = revisionManager.next();
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function isHeadReady():boolean {
  return isInitialized && head !== null;
} 
function _getHeadIfReady():CanvasComponent|null {
  return isHeadReady() ? head : null;
}

function _centerCanvasComponent(component:CanvasComponent, canvasWidth:number, canvasHeight:number) {
  const componentWidth = component.width, componentHeight = component.height;
  component.offsetX = Math.round((canvasWidth - componentWidth) / 2);
  component.offsetY = Math.round((canvasHeight - componentHeight) / 2);
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const head = _getHeadIfReady();
  if (!head) return;
  _centerCanvasComponent(head, canvasWidth, canvasHeight);
  head.renderWithChildren(context);
}

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  revisionManager.addChanges({testVoice});
  setRevision(revisionManager.currentRevision);
}

function _updateForFaceRelatedRevision(changes:any, setRevision:any) {
  revisionManager.addChanges(changes);
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  _updateForFaceRelatedRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  _updateForFaceRelatedRevision({lidLevel}, setRevision);
}

export function onPartTypeChange(partType:PartType, setRevision:any) {
  revisionManager.addChanges({partType});
  setRevision(revisionManager.currentRevision);
}

export function getRevisionForMount():FaceScreenRevision {
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    partType: PartType.HEAD,
    testVoice: TestVoiceType.MUTED
  };
  revisionManager.add(revision);
  return revision;
}

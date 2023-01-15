import {PartType} from "facesScreen/PartSelector";
import {TestVoiceType} from "facesScreen/testVoices/TestVoiceType";

import {
  CanvasComponent,
  Emotion,
  LidLevel,
  publishEvent,
  Topic
} from "sl-web-face";
import RevisionManager from "documents/RevisionManager";
import {
  findCanvasComponentForPartType,
  getHead,
  getPartUiManager,
  performDisablingOperation,
  setHead
} from "./coreUtil";
import {updateSelectionBoxesToMatchFace} from "ui/partAuthoring/SelectionBoxCanvasComponent";

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>();

export type Revision = {
  headComponent:CanvasComponent|null, 
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType,
  eyesPartNo:number,
  headPartNo:number,
  mouthPartNo:number,
  nosePartNo:number,
  extraSlotPartNos:number[]
};

export function getRevisionManager() { return revisionManager; }

function _publishFaceEventsForRevision(revision:Revision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

async function _updateEverythingToMatchRevision(revision:Revision|null, setRevision:any) {
  if (!revision) return;
  const head = revision.headComponent?.duplicate();
  if (!head) throw Error('Unexpected');
  setHead(head);
  const partUiManager = getPartUiManager();
  await partUiManager.trackPartsForFace(head);
  updateSelectionBoxesToMatchFace(head);
  _publishFaceEventsForRevision(revision);
  const nextFocusPart = findCanvasComponentForPartType(head, revision.partType);
  if (nextFocusPart) partUiManager.setFocus(nextFocusPart);
  setRevision(revision);
}

export function onUndo(setRevision:any) {
  performDisablingOperation(async () => _updateEverythingToMatchRevision(revisionManager.prev(), setRevision));
}

export function onRedo(setRevision:any) {
  performDisablingOperation(async () => _updateEverythingToMatchRevision(revisionManager.next(), setRevision));
}

export function updateForFaceRelatedRevision(changes:any, setRevision:any) {
  const head = getHead();
  const headComponent = head.duplicate();
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({headComponent, ...changes});
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function updateForStaticFaceRevision(changes:any, setRevision:any) {
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({...changes});
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}
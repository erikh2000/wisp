import {PartType} from "facesScreen/PartSelector";
import {TestVoiceType} from "facesScreen/TestVoiceSelector";

import {
  createFaceDocument,
  Emotion,
  FaceDocument,
  LidLevel,
  publishEvent,
  Topic,
  updateFaceFromDocument
} from "sl-web-face";
import RevisionManager from "documents/RevisionManager";
import {
  findCanvasComponentForPartType,
  getHead,
  getPartUiManager,
  performDisablingOperation,
  setHead
} from "./coreUtil";
import {updateSelectionBoxesToMatchFace} from "../../ui/partAuthoring/SelectionBoxCanvasComponent";

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>();

export type Revision = {
  document:FaceDocument|null, // A null document indicates no document is loaded. Used only for initial revision. 
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType,
  eyesPartNo:number,
  headPartNo:number,
  mouthPartNo:number,
  nosePartNo:number
};

export function getRevisionManager() { return revisionManager; }

function _publishFaceEventsForRevision(revision:Revision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

async function _updateEverythingToMatchRevision(revision:Revision|null, setRevision:any) {
  if (!revision) return;
  const head = getHead();
  const partUiManager = getPartUiManager();
  if (revision.document) {
    const nextHead = await updateFaceFromDocument(head, revision.document);
    if (head !== nextHead) setHead(nextHead);
  }
  await partUiManager.trackPartsForFace(head);
  updateSelectionBoxesToMatchFace(head);
  _publishFaceEventsForRevision(revision);
  const nextFocusPart = findCanvasComponentForPartType(head, revision.partType);
  if (partUiManager && nextFocusPart) partUiManager.setFocus(nextFocusPart);
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
  const document = createFaceDocument(head);
  const revisionManager = getRevisionManager();
  revisionManager.addChanges({document, ...changes});
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}
import {
  findCanvasComponentForPartType,
  getHead, getPartLoader,
  getPartUiManager,
  performDisablingOperation,
  setHead
} from "./coreUtil";
import {setEmotion, setLidLevel} from "facesCommon/interactions/faceEventUtil";
import RevisionManager from "documents/RevisionManager";
import {PartType} from "facesScreen/PartSelector";
import {TestVoiceType} from "facesScreen/testVoices/TestVoiceType";
import {setFaceDefinition} from "persistence/faces";
import {getActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import {updateSelectionBoxesToMatchFace} from "ui/partAuthoring/SelectionBoxCanvasComponent";

import {CanvasComponent, createFaceDocument, Emotion, FaceDocument, LidLevel} from "sl-web-face";
import { stringify } from 'yaml';
import {findLoadablePartNo, findLoadablePartNosForExtras} from "./partChooserInteractions";

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

async function onPersistRevision(revision:Revision):Promise<void> {
  if (!revision.headComponent) return;
  const faceDocument:FaceDocument = createFaceDocument(revision.headComponent);
  const faceDefYaml = stringify(faceDocument);
  const activeFaceName = await getActiveFaceName();
  if (activeFaceName === UNSPECIFIED_NAME) return;
  await setFaceDefinition(activeFaceName, faceDefYaml);
}

const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>(onPersistRevision);

export function getRevisionManager() { return revisionManager; }

function _publishFaceEventsForRevision(revision:Revision) {
  setEmotion(revision.emotion);
  setLidLevel(revision.lidLevel);
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

export function setUpRevisionForNewFace(headComponent:CanvasComponent, setRevision:any) {
  const partLoader = getPartLoader();
  const nextRevision:Revision = {
    emotion:Emotion.NEUTRAL,
    partType:PartType.HEAD,
    lidLevel:LidLevel.NORMAL,
    testVoice:TestVoiceType.MUTED,
    headComponent: headComponent.duplicate(),
    eyesPartNo: findLoadablePartNo(partLoader.eyes, headComponent, PartType.EYES),
    nosePartNo: findLoadablePartNo(partLoader.noses, headComponent, PartType.NOSE),
    mouthPartNo: findLoadablePartNo(partLoader.mouths, headComponent, PartType.MOUTH),
    headPartNo: findLoadablePartNo(partLoader.heads, headComponent, PartType.HEAD),
    extraSlotPartNos: findLoadablePartNosForExtras(partLoader.extras, headComponent)
  }
  revisionManager.clear();
  revisionManager.add(nextRevision);
  setRevision(nextRevision);
}
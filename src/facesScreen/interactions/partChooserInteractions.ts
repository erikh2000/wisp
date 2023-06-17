import {
  findCanvasComponentForPartType, findExtraCanvasComponent,
  getHead,
  getPartUiManager,
  performDisablingOperation,
  setHead,
  UNSPECIFIED
} from "./coreUtil";
import {updateForFaceRelatedRevision} from "./revisionUtil";
import {PartType} from "facesScreen/PartSelector";
import HeadChooser from "facesScreen/partChoosers/HeadChooser";
import ExtraChooser from "facesScreen/partChoosers/ExtraChooser";
import EyesChooser from "facesScreen/partChoosers/EyesChooser";
import MouthChooser from "facesScreen/partChoosers/MouthChooser";
import NoseChooser from "facesScreen/partChoosers/NoseChooser";
import {LoadablePart} from "ui/partAuthoring/PartLoader";

import {
  CanvasComponent,
  EXTRA_PART_TYPE,
  HEAD_PART_TYPE,
  loadComponentFromPartUrl,
  replaceComponentFromPartUrl,
} from "sl-web-face";

function _reparentHeadParts(oldHead:CanvasComponent, newHead:CanvasComponent) {
  const children = oldHead.findNonUiChildren();
  for(let i = 0; i < children.length; ++i) {
    children[i].setParent(newHead);
  }
}

function _removePart(headComponent:CanvasComponent, revisionPartNoName:string, partType:PartType, setRevision:any) {
  const component = findCanvasComponentForPartType(headComponent, partType);
  if (!component) return;
  component.setParent(null);
  const changes = {[revisionPartNoName]:UNSPECIFIED};
  performDisablingOperation(async () => {
    updateForFaceRelatedRevision(changes, setRevision);
  }).then(() => {});
}

function _removeExtra(headComponent:CanvasComponent, extraSlotNo:number, extraSlotPartNos:number[], setRevision:any) {
  const component = findExtraCanvasComponent(headComponent, extraSlotNo);
  if (!component) return;
  component.setParent(null);
  const nextExtraSlotPartNos = extraSlotPartNos.filter((_ignored, slotNo) => slotNo !== extraSlotNo);
  const changes = {extraPartNos:nextExtraSlotPartNos};
  performDisablingOperation(async () => {
    updateForFaceRelatedRevision(changes, setRevision);
  }).then(() => {});
}

async function _onPartChanged(revisionPartNoName:string, parts:LoadablePart[], partNo:number, partType:PartType, setModalDialog:any, setRevision:any) {
  return await performDisablingOperation(async () => {
    
    setModalDialog(null);
    const partUrl = parts[partNo].url;
    const head = getHead();
    const partUiManager = getPartUiManager();

    const currentComponent = findCanvasComponentForPartType(head, partType);
    if (currentComponent) {
      const initDataOverrides = (partType === PartType.EYES) ? {irisColor: currentComponent.initData.irisColor} : undefined; 
      const replacedComponent = await replaceComponentFromPartUrl(currentComponent, partUrl, initDataOverrides);
      if (replacedComponent.partType === HEAD_PART_TYPE) {
        _reparentHeadParts(head, replacedComponent);
        setHead(replacedComponent);
      }
    } else {
      const newComponent = await loadComponentFromPartUrl(partUrl, head.skinTone, head.hairColor);
      if (newComponent.partType !== HEAD_PART_TYPE) newComponent.setParent(head);
    }
    await partUiManager.trackPartsForFace(getHead());
    updateForFaceRelatedRevision({[revisionPartNoName]:partNo}, setRevision);
  }).then(() => {});
}

async function _onExtraChanged(extraSlotNo:number, extraParts:LoadablePart[], extraSlotPartNos:number[], partNo:number, setModalDialog:any, setRevision:any) {
  return await performDisablingOperation(async () => {
    setModalDialog(null);
    const partUrl = extraParts[partNo].url;
    const head = getHead();
    const partUiManager = getPartUiManager();

    const currentComponent = findExtraCanvasComponent(head, extraSlotNo);
    if (currentComponent) {
      await replaceComponentFromPartUrl(currentComponent, partUrl);
    } else {
      const newComponent = await loadComponentFromPartUrl(partUrl, head.skinTone, head.hairColor);
      newComponent.setParent(head);
    }
    await partUiManager.trackPartsForFace(getHead());
    const nextExtraSlotPartNos = [...extraSlotPartNos];
    nextExtraSlotPartNos[extraSlotNo] = partNo;
    updateForFaceRelatedRevision({extraSlotPartNos:nextExtraSlotPartNos}, setRevision);
  }).then(() => {});
}


export function onChooseHead(setModalDialog:any) { setModalDialog(HeadChooser.name); }

export function onHeadChanged(headParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('headPartNo', headParts, partNo, PartType.HEAD, setModalDialog, setRevision).then(() => {});
}

export function onChooseEyes(setModalDialog:any) { setModalDialog(EyesChooser.name); }

export function onEyesChanged(eyesParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('eyesPartNo', eyesParts, partNo, PartType.EYES, setModalDialog, setRevision).then(() => {});
}

export function onRemoveEyes(setRevision:any) { _removePart(getHead(),'eyesPartNo', PartType.EYES, setRevision); }

export function onChooseMouth(setModalDialog:any) { setModalDialog(MouthChooser.name); }

export function onMouthChanged(mouthParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('mouthPartNo', mouthParts, partNo, PartType.MOUTH, setModalDialog, setRevision).then(() => {});
}

export function onRemoveMouth(setRevision:any) { _removePart(getHead(),'mouthPartNo', PartType.MOUTH, setRevision); }

export function onChooseNose(setModalDialog:any) { setModalDialog(NoseChooser.name); }

export function onNoseChanged(noseParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('nosePartNo', noseParts, partNo, PartType.NOSE, setModalDialog, setRevision).then(() => {});
}

export function onRemoveNose(setRevision:any) { _removePart(getHead(),'nosePartNo', PartType.NOSE, setRevision); }

export function onChooseExtra(setModalDialog:any) { setModalDialog(ExtraChooser.name); }

export function onExtraChanged(extraSlotNo:number, extraParts:LoadablePart[], extraSlotPartNos:number[], partNo:number, setModalDialog:any, setRevision:any) {
  _onExtraChanged(extraSlotNo, extraParts, extraSlotPartNos, partNo, setModalDialog, setRevision).then(() => {});
}

export function onRemoveExtra(extraSlotNo:number, extraSlotPartNos:number[], setRevision:any) {
  _removeExtra(getHead(), extraSlotNo, extraSlotPartNos, setRevision);
}

export function findLoadablePartNo(loadableParts:LoadablePart[], headComponent:CanvasComponent, partType:PartType):number {
  const component = findCanvasComponentForPartType(headComponent, partType);
  if (!component) return UNSPECIFIED;
  return loadableParts.findIndex(loadablePart => loadablePart.url === component.partUrl);
}

export function findLoadablePartNosForExtras(loadableParts:LoadablePart[], headComponent:CanvasComponent):number[] {
  const extraComponents = headComponent.children.filter(child => child.partType === EXTRA_PART_TYPE);
  const partNos:number[] = [];
  for(let extraSlotNo = 0; extraSlotNo < extraComponents.length; ++extraSlotNo) {
    partNos[extraSlotNo] = loadableParts.findIndex(loadablePart => loadablePart.url === extraComponents[extraSlotNo].partUrl);
  }
  return partNos;
}
import {
  findCanvasComponentForPartType,
  getHead,
  getPartUiManager,
  performDisablingOperation, setHead,
  UNSPECIFIED
} from "./coreUtil";
import {updateForFaceRelatedRevision} from "./revisionUtil";
import {PartType} from "facesScreen/PartSelector";
import HeadChooser from "facesScreen/partChoosers/HeadChooser";
import EyesChooser from "facesScreen/partChoosers/EyesChooser";
import MouthChooser from "facesScreen/partChoosers/MouthChooser";
import NoseChooser from "facesScreen/partChoosers/NoseChooser";
import {LoadablePart} from "ui/partAuthoring/PartLoader";

import {
  CanvasComponent,
  HEAD_PART_TYPE,
  loadComponentFromPartUrl, nameToHairColor,
  nameToSkinTone,
  replaceComponentFromPartUrl
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
  });
}

function _onPartChanged(revisionPartNoName:string, parts:LoadablePart[], partNo:number, partType:PartType, setModalDialog:any, setRevision:any) {
  performDisablingOperation(async () => {
    
    setModalDialog(null);
    const partUrl = parts[partNo].url;
    const head = getHead();
    const partUiManager = getPartUiManager();
    const skinTone = nameToSkinTone(head.skinTone);
    const hairColor = nameToHairColor(head.hairColor);

    const currentComponent = findCanvasComponentForPartType(head, partType);
    if (currentComponent) {
      const replacedComponent = await replaceComponentFromPartUrl(currentComponent, partUrl);
      if (replacedComponent.partType === HEAD_PART_TYPE) {
        _reparentHeadParts(head, replacedComponent);
        setHead(replacedComponent);
      }
    } else {
      const newComponent = await loadComponentFromPartUrl(partUrl, skinTone, hairColor);
      if (newComponent.partType !== HEAD_PART_TYPE) newComponent.setParent(head);
    }
    await partUiManager.trackPartsForFace(getHead());
    updateForFaceRelatedRevision({[revisionPartNoName]:partNo}, setRevision);
    
  });
}

export function onReplaceHead(setModalDialog:any) { setModalDialog(HeadChooser.name); }

export function onHeadChanged(headParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('headPartNo', headParts, partNo, PartType.HEAD, setModalDialog, setRevision);
}

export function onReplaceEyes(setModalDialog:any) { setModalDialog(EyesChooser.name); }

export function onAddEyes(setModalDialog:any) { setModalDialog(EyesChooser.name); }

export function onEyesChanged(eyesParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('eyesPartNo', eyesParts, partNo, PartType.EYES, setModalDialog, setRevision);
}

export function onRemoveEyes(setRevision:any) { _removePart(getHead(),'eyesPartNo', PartType.EYES, setRevision); }

export function onReplaceMouth(setModalDialog:any) { setModalDialog(MouthChooser.name); }

export function onAddMouth(setModalDialog:any) { setModalDialog(MouthChooser.name); }

export function onMouthChanged(mouthParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('mouthPartNo', mouthParts, partNo, PartType.MOUTH, setModalDialog, setRevision);
}

export function onRemoveMouth(setRevision:any) { _removePart(getHead(),'mouthPartNo', PartType.MOUTH, setRevision); }

export function onReplaceNose(setModalDialog:any) { setModalDialog(NoseChooser.name); }

export function onAddNose(setModalDialog:any) { setModalDialog(NoseChooser.name); }

export function onNoseChanged(noseParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  _onPartChanged('nosePartNo', noseParts, partNo, PartType.NOSE, setModalDialog, setRevision);
}

export function onRemoveNose(setRevision:any) { _removePart(getHead(),'nosePartNo', PartType.NOSE, setRevision); }

export function findLoadablePartNo(loadableParts:LoadablePart[], headComponent:CanvasComponent, partType:PartType):number {
  const component = findCanvasComponentForPartType(headComponent, partType);
  if (!component) return UNSPECIFIED;
  return loadableParts.findIndex(loadablePart => loadablePart.url === component.partUrl);
}
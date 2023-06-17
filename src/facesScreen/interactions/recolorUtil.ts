import {
  clearHead,
  findCanvasComponentForPartType,
  getHead,
  getPartUiManager,
  performDisablingOperation,
  setHead
} from "./coreUtil";
import {updateForFaceRelatedRevision} from "./revisionUtil";
import {PartType} from "facesScreen/PartSelector";

import {
  CanvasComponent,
  recolorComponent,
  SkinTone,
  HairColor,
  IrisColor,
  replaceComponentFromPartUrl,
  irisColorToName, EYES_PART_TYPE
} from "sl-web-face";

async function _recolorHead(headComponent:CanvasComponent, skinTone:SkinTone, hairColor:HairColor, setRevision:any) {
  return performDisablingOperation(async () => {

    clearHead();
    const nextHead = await recolorComponent(headComponent, skinTone, hairColor);
    const children = headComponent.findNonUiChildren();
    await Promise.all(children.map(child => {
      child.setParent(nextHead);
      const initDataOverrides = child.partType === EYES_PART_TYPE ? {irisColor:child.initData.irisColor} : undefined;
      return recolorComponent(child, skinTone, hairColor, initDataOverrides);
    }));

    setHead(nextHead);
    const partUiManager = getPartUiManager();
    await partUiManager.trackPartsForFace(nextHead);
    updateForFaceRelatedRevision({}, setRevision);

  });
}

export async function onSkinToneChange(skinTone:SkinTone, setRevision:any) {
  const currentHead = getHead();
  if (currentHead.skinTone === skinTone) return;
  return _recolorHead(currentHead, skinTone, currentHead.hairColor, setRevision);
}

export async function onHairColorChange(hairColor:HairColor, setRevision:any) {
  const currentHead = getHead();
  if (currentHead.hairColor === hairColor) return;
  return _recolorHead(currentHead, currentHead.skinTone, hairColor, setRevision);
}

export async function onIrisColorChange(irisColor:IrisColor, setRevision:any) {
  return performDisablingOperation(async () => {
    const head = getHead();
    const currentEyes = findCanvasComponentForPartType(head, PartType.EYES);
    if (!currentEyes) return;
    const irisColorName = irisColorToName(irisColor);
    await replaceComponentFromPartUrl(currentEyes, currentEyes.partUrl, { irisColor:irisColorName });
    const partUiManager = getPartUiManager();
    await partUiManager.trackPartsForFace(head);
    updateForFaceRelatedRevision({}, setRevision);
  });
}
import {clearHead, getHead, getPartUiManager, performDisablingOperation, setHead} from "./coreUtil";
import {updateForFaceRelatedRevision} from "./revisionUtil";

import {CanvasComponent, nameToHairColor, nameToSkinTone, recolorComponent, SkinTone, HairColor} from "sl-web-face";

async function _recolorHead(headComponent:CanvasComponent, skinTone:SkinTone, hairColor:HairColor, setRevision:any) {
  return performDisablingOperation(async () => {

    clearHead();
    const nextHead = await recolorComponent(headComponent, skinTone, hairColor);
    const children = headComponent.findNonUiChildren();
    await Promise.all(children.map(child => {
      child.setParent(nextHead);
      return recolorComponent(child, skinTone, hairColor);
    }));

    setHead(nextHead);
    const partUiManager = getPartUiManager();
    await partUiManager.trackPartsForFace(nextHead);
    updateForFaceRelatedRevision({}, setRevision);

  });
}

export async function onSkinToneChange(skinTone:SkinTone, setRevision:any) {
  const currentHead = getHead();
  const currentSkinTone = nameToSkinTone(currentHead.skinTone);
  if (currentSkinTone === skinTone) return;
  const currentHairColor = nameToHairColor(currentHead.hairColor);
  return _recolorHead(currentHead, skinTone, currentHairColor, setRevision);
}

export async function onHairColorChange(hairColor:HairColor, setRevision:any) {
  const currentHead = getHead();
  const currentHairColor = nameToHairColor(currentHead.hairColor);
  if (currentHairColor === hairColor) return;
  const currentSkinTone = nameToSkinTone(currentHead.skinTone);
  return _recolorHead(currentHead, currentSkinTone, hairColor, setRevision);
}
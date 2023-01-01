import {nameToSkinTone, recolorComponent, SkinTone, skinToneToName} from "sl-web-face";
import {clearHead, getHead, getPartUiManager, performDisablingOperation, setHead} from "./coreUtil";
import {updateForFaceRelatedRevision} from "./revisionUtil";

export async function onSkinToneChange(skinTone:SkinTone, setRevision:any) {
  const currentHead = getHead();
  const currentSkinTone = nameToSkinTone(currentHead.skinTone);
  if (currentSkinTone === skinTone) return;
  
  return performDisablingOperation(async () => {
    
    clearHead();
    const nextHead = await recolorComponent(currentHead, skinTone)
    const children = currentHead.findNonUiChildren();
    await Promise.all(children.map(child => {
      child.setParent(nextHead);
      return recolorComponent(child, skinTone);
    }));
  
    setHead(nextHead);
    const partUiManager = getPartUiManager();
    await partUiManager.trackPartsForFace(nextHead);
    updateForFaceRelatedRevision({}, setRevision);

  });
}
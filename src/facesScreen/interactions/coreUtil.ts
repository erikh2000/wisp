import {PartType} from "../PartSelector";

import {
  CanvasComponent,
  EYES_PART_TYPE,
  MOUTH_PART_TYPE,
  NOSE_PART_TYPE,
} from "sl-web-face";
import PartUiManager from "ui/partAuthoring/PartUiManager";
import PartLoader from "ui/partAuthoring/PartLoader";

export const UNSPECIFIED = -1;

let head:CanvasComponent|null = null;
let setDisabled:any = null;
let partUiManager:PartUiManager|null = null;
let partLoader:PartLoader|null = null;

export async function bindSetDisabled(_setDisabled:any) { setDisabled = _setDisabled; }

export function initCore(_head:CanvasComponent, _partUiMananager:PartUiManager, _partLoader:PartLoader, _setDisabled:any) {
  head = _head;
  setDisabled = _setDisabled;
  partUiManager = _partUiMananager;
  partLoader = _partLoader;
}

export function findCanvasComponentForPartType(headComponent:CanvasComponent, partType:PartType):CanvasComponent|null {
  if (partType === PartType.HEAD) return headComponent;

  let extraNo = 0;
  const childCount = headComponent.children.length;
  for(let childI = 0; childI < childCount; ++childI) {
    const child = headComponent.children[childI];
    if (!child) continue;

    const childPartType = child.partType;
    if (child.isUi) continue;

    if (childPartType !== EYES_PART_TYPE && childPartType !== MOUTH_PART_TYPE) ++extraNo;

    switch(partType) {
      case PartType.EYES:
        if (childPartType !== EYES_PART_TYPE) continue;
        break;

      case PartType.MOUTH:
        if (childPartType !== MOUTH_PART_TYPE) continue;
        break;

      case PartType.NOSE:
        if (childPartType !== NOSE_PART_TYPE) continue;
        break;

      default:
        const partExtraNo = (partType - PartType.EXTRA1) + 1;
        if (extraNo !== partExtraNo) continue;
        break;
    }
    return child;
  }
  return null;
}

export function findPartTypeForCanvasComponent(component:CanvasComponent, components:CanvasComponent[]):PartType {
  const componentCount = components.length;
  let extraCount = 0;
  for(let componentI = 0; componentI < componentCount; ++componentI) {
    const against = components[componentI];
    const isMatch = against === component;
    const partType = against.partType;
    if (against.isUi) continue;
    if (partType === EYES_PART_TYPE) {
      if (isMatch) return PartType.EYES;
      continue;
    }
    if (partType === MOUTH_PART_TYPE) {
      if (isMatch) return PartType.MOUTH;
      continue;
    }
    if (partType === NOSE_PART_TYPE) {
      if (isMatch) return PartType.NOSE;
      continue;
    }
    ++extraCount;
    if (isMatch) {
      if (extraCount > 5) return PartType.HEAD;
      return PartType.EXTRA1 + extraCount - 1;
    }
  }
  return PartType.HEAD;
}

export async function performDisablingOperation(taskFunction:any):Promise<any> {
  if (!setDisabled) throw Error('Unexpected');
  setDisabled(true);
  let result:any = undefined;
  try {
    result = await taskFunction();
  } finally {
    setDisabled(false);
  }
  return result;
}

export function getHead():CanvasComponent {
  if (!head) throw Error('Unexpected');
  return head; 
}

export function isHeadReady() { return head !== null; }

export function setHead(_head:CanvasComponent):void { head = _head; }

export function clearHead():void { head = null; }

export function getPartLoader():PartLoader {
  if (!partLoader) throw Error('Unexpected');
  return partLoader;
}

export function getPartUiManager():PartUiManager {
  if (!partUiManager) throw Error('Unexpected');
  return partUiManager;
}


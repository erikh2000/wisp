import {setHeadForFaceEvents} from "facesCommon/interactions/faceEventUtil";

import {CanvasComponent} from "sl-web-face";

let head:CanvasComponent|null = null;
let setDisabled:any = null;

export function setHead(_head:CanvasComponent):void {
  if (_head !== head) setHeadForFaceEvents(_head);
  head = _head;
}

export async function initCore(headComponent:CanvasComponent, _setDisabled:any) {
  setHead(headComponent);
  setDisabled = _setDisabled;
}

export function getHeadIfReady():CanvasComponent|null {
  return head ?? null;
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

export function bindSetDisabled(_setDisabled:any) {
  setDisabled = _setDisabled;
}
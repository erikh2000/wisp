import {CanvasComponent} from "sl-web-face";
import {setHeadForFaceEvents} from "facesCommon/interactions/faceEventUtil";

let head:CanvasComponent|null = null;

export async function initCore(headComponent:CanvasComponent) {
  head = headComponent;  
}

export function getHead():CanvasComponent {
  if (!head) throw Error('Unexpected');
  return head;
}

export function setHead(_head:CanvasComponent):void {
  if (_head !== head) setHeadForFaceEvents(_head);
  head = _head;
}
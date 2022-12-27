import {TrackedPart} from "./trackedPart";

import {CanvasComponent} from "sl-web-face";

export interface IPartMovedCallback {
  (part:CanvasComponent, x:number, y:number):boolean
}

export type MoveOperation = {
  // Offset from the clicked point inside of a dragged component to its topleft corner.
  dragOffsetX:number,
  dragOffsetY:number,

  // Part component values prior to changes made by dragging.
  previousX:number,
  previousY:number
}

function _revertPartMove(part:TrackedPart, operation:MoveOperation) {
  part.component.x = operation.previousX;
  part.component.y = operation.previousY;
}

export function onCompleteMove(part:TrackedPart, operation:MoveOperation, onPartMoved:IPartMovedCallback) {
  const { x, y } = part.component;
  const confirmed = onPartMoved(part.component, x, y);
  if (!confirmed) _revertPartMove(part, operation);
}

export function onMoveDuringDrag(part:TrackedPart, operation:MoveOperation, mouseMoveX:number, mouseMoveY:number) {
  part.component.x = mouseMoveX + operation.dragOffsetX;
  part.component.y = mouseMoveY + operation.dragOffsetY;
}

export function createMoveOperation(part:TrackedPart, clickX:number, clickY:number):MoveOperation {
  const { x, y } = part.component;
  return {
    previousX: x, previousY: y,
    dragOffsetX: x - clickX, dragOffsetY: y - clickY
  };
}
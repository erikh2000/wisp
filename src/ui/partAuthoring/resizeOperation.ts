import {clamp} from 'common/numberUtil';
import ResizingType from "./ResizingTypes";
import {resizingTypeForComponent, updateResizingButtonPositions} from "./SelectionBoxCanvasComponent";
import {TrackedPart} from "./trackedPart";

import {CanvasComponent} from "sl-web-face";

export type ResizeOperation = {
  // Resize button that is being dragged.
  resizeButton:CanvasComponent,
  resizingType:ResizingType,

  // Dragging constraints.
  dragMinX:number,
  dragMaxX:number,
  dragMinY:number,
  dragMaxY:number,

  // Offset from the clicked point inside of a dragged component to its topleft corner.
  dragOffsetX:number,
  dragOffsetY:number,

  // Part component values prior to changes made by dragging.
  previousX:number,
  previousY:number,
  previousResizeX:number,
  previousResizeY:number,
  previousWidth:number,
  previousHeight:number,
  
  // Original aspect ratio of the part component.
  aspectRatio:number
}

export interface IPartResizedCallback {
  (part:CanvasComponent, x:number, y:number, width:number, height:number):boolean
}

function _calcComponentAspectRatio(component:CanvasComponent):number {
  return component.width / component.height;
}

function _findResizeButtonInComponentAtCoords(component:CanvasComponent, x:number, y:number):CanvasComponent|null {
  if (!component.isVisible) return null;
  const resizingType = resizingTypeForComponent(component);
  if (resizingType !== ResizingType.NONE) {
    const [ boundX, boundY, boundWidth, boundHeight ] = component.boundingRect;
    if (x >= boundX && x < (boundX+boundWidth) && y >= boundY && y < (boundY+boundHeight)) return component;
  }
  const children = component.children;
  const childCount = children.length;
  for(let childI = 0; childI < childCount; ++childI) {
    const matchedComponent = _findResizeButtonInComponentAtCoords(children[childI], x, y);
    if (matchedComponent) return matchedComponent;
  }
  return null;
}

export function findResizeButtonAtCoords(parts:TrackedPart[], x:number, y:number):CanvasComponent|null {
  const partCount = parts.length;
  for(let partI = 0; partI < partCount; ++partI) {
    const matchedComponent =  _findResizeButtonInComponentAtCoords(parts[partI].component, x, y);
    if (matchedComponent) return matchedComponent;
  }
  return null;
}

function _revertPartResize(part:TrackedPart, operation:ResizeOperation) {
  const { selectionBox } = part;
  part.component.x = operation.previousX;
  part.component.y = operation.previousY;
  selectionBox.offsetX = selectionBox.offsetY = 0;
  part.component.width = selectionBox.width = operation.previousWidth;
  part.component.height = selectionBox.height = operation.previousHeight;
  operation.resizeButton.x = operation.previousResizeX;
  operation.resizeButton.y = operation.previousResizeY;
  updateResizingButtonPositions(selectionBox);
}

export function onCompleteResize(part:TrackedPart, operation:ResizeOperation, onPartResized:IPartResizedCallback) {
  const [x, y, width, height] = part.component.boundingRect;
  const confirmed = onPartResized(part.component, x, y, width, height);
  if (!confirmed) _revertPartResize(part, operation);
}

function _getConstrainedResizeCoordinates(operation:ResizeOperation, mouseMoveX:number, mouseMoveY:number):[x:number, y:number] {
  const resizeButtonX = clamp(mouseMoveX + operation.dragOffsetX, operation.dragMinX, operation.dragMaxX);
  const resizeButtonY = clamp(mouseMoveY + operation.dragOffsetY, operation.dragMinY, operation.dragMaxY);
  return [resizeButtonX, resizeButtonY];
}

function _constrainToAspectRatio(operation:ResizeOperation, x:number, y:number, width:number, height:number):[nextX:number, nextY:number, nextWidth:number, nextHeight:number] {
  const aspectRatio = operation.aspectRatio;
  
  if (operation.resizingType === ResizingType.TOP || operation.resizingType === ResizingType.BOTTOM) {
    width = height * aspectRatio;
    if (operation.resizingType === ResizingType.TOP) y = operation.previousY + operation.previousHeight - height;
    return [x, y, width, height];
  }
  
  const constrainHeight = (width / height) > aspectRatio || operation.resizingType === ResizingType.LEFT || operation.resizingType === ResizingType.RIGHT;
  if (constrainHeight) {
    height = width / aspectRatio;
    if (operation.resizingType === ResizingType.TOPLEFT || operation.resizingType === ResizingType.TOPRIGHT) {
      y = operation.previousY + operation.previousHeight - height;
    }
  } else { // Constrain width
    width = height * aspectRatio;
    if (operation.resizingType === ResizingType.TOPLEFT || operation.resizingType === ResizingType.LEFT || operation.resizingType === ResizingType.BOTTOMLEFT) {
      x = operation.previousX + operation.previousWidth - width;
    }
  }
  return [x, y, width, height];
}

export function onResizeDuringDrag(part:TrackedPart, operation:ResizeOperation, mouseMoveX:number, mouseMoveY:number) {
  const [constrainedX, constrainedY] = _getConstrainedResizeCoordinates(operation, mouseMoveX, mouseMoveY);
  operation.resizeButton.x = constrainedX;
  operation.resizeButton.y = constrainedY;
  const deltaX = constrainedX - operation.previousResizeX;
  const deltaY = constrainedY - operation.previousResizeY;
  
  const { selectionBox, component } = part;
  let nextX = component.x, nextY = component.y;
  let nextWidth = component.width, nextHeight = component.height;
  switch(operation.resizingType) {
    case ResizingType.TOPLEFT:
      nextWidth = operation.previousWidth - deltaX;
      nextHeight = operation.previousHeight - deltaY;
      if (part.isMovable) {
        nextX = operation.previousX + deltaX;
        nextY = operation.previousY + deltaY;
      }
      break;

    case ResizingType.TOP:
      nextHeight = operation.previousHeight - deltaY;
      if (part.isMovable) nextY = operation.previousY + deltaY;
      break;

    case ResizingType.TOPRIGHT:
      nextWidth = operation.previousWidth + deltaX;
      nextHeight = operation.previousHeight - deltaY;
      if (part.isMovable) nextY = operation.previousY + deltaY;
      break;

    case ResizingType.LEFT:
      nextWidth = operation.previousWidth - deltaX;
      if (part.isMovable) nextX = operation.previousX + deltaX;
      break;

    case ResizingType.RIGHT:
      nextWidth = operation.previousWidth + deltaX;
      break;

    case ResizingType.BOTTOMLEFT:
      nextWidth = operation.previousWidth - deltaX;
      nextHeight = operation.previousHeight + deltaY;
      if (part.isMovable) nextX = operation.previousX + deltaX;
      break;

    case ResizingType.BOTTOM:
      nextHeight = operation.previousHeight + deltaY;
      break;

    case ResizingType.BOTTOMRIGHT:
      nextWidth = operation.previousWidth + deltaX;
      nextHeight = operation.previousHeight + deltaY;
      break;
  }
  
  if (part.constrainAspectRatio) [nextX, nextY, nextWidth, nextHeight] = _constrainToAspectRatio(operation, nextX, nextY, nextWidth, nextHeight);
  
  if (part.resizeChildren) {
    component.resize(nextWidth, nextHeight);
    selectionBox.width = nextWidth;
    selectionBox.height = nextHeight;
  } else {
    component.width = selectionBox.width = nextWidth;
    component.height = selectionBox.height = nextHeight;
  }
  component.x = nextX;
  component.y = nextY;
  updateResizingButtonPositions(selectionBox);
}

const PIXEL_GAP = 2;
function _calculateDragConstraints(part:TrackedPart, resizingType:ResizingType, resizeButton:CanvasComponent):[dragMinX:number, dragMaxX:number, dragMinY:number, dragMaxY:number] {
  const [ resizeButtonX, resizeButtonY, resizeButtonWidth, resizeButtonHeight ] = resizeButton.boundingRect;
  const [ partX, partY, partWidth, partHeight ] = part.component.boundingRect;

  const halfResizeButtonWidth = Math.floor(resizeButtonWidth / 2);
  const halfResizeButtonHeight = Math.floor(resizeButtonWidth / 2);
  const left = partX + resizeButtonWidth + halfResizeButtonWidth + PIXEL_GAP;
  const top = partY + resizeButtonHeight + halfResizeButtonHeight + PIXEL_GAP;
  const right = partX + partWidth - (resizeButtonWidth * 2) - halfResizeButtonWidth - PIXEL_GAP;
  const bottom = partY + partHeight - (resizeButtonHeight * 2) - halfResizeButtonHeight - PIXEL_GAP;
  switch(resizingType) {
    case ResizingType.TOPLEFT: return [-Infinity, right, -Infinity, bottom];
    case ResizingType.TOP: return [resizeButtonX, resizeButtonX, -Infinity, bottom];
    case ResizingType.TOPRIGHT: return [left, Infinity, -Infinity, bottom];
    case ResizingType.LEFT: return [-Infinity, right, resizeButtonY, resizeButtonY];
    case ResizingType.RIGHT: return [left, Infinity, resizeButtonY, resizeButtonY];
    case ResizingType.BOTTOMLEFT: return [-Infinity, right, top, Infinity];
    case ResizingType.BOTTOM: return [resizeButtonX, resizeButtonX, top, Infinity];
    default: return [left, Infinity, top, Infinity]; // BOTTOMRIGHT
  }
}

export function createResizeOperation(part:TrackedPart, resizeButton:CanvasComponent, clickX:number, clickY:number):ResizeOperation {
  const [ x, y, width, height ] = part.component.boundingRect;
  const dragOffsetX = resizeButton.x - clickX;
  const dragOffsetY = resizeButton.y - clickY;
  const resizingType:ResizingType = resizingTypeForComponent(resizeButton);
  const [ dragMinX, dragMaxX, dragMinY, dragMaxY] = _calculateDragConstraints(part, resizingType, resizeButton);
  return {
    resizeButton,
    resizingType,
    dragMinX, dragMaxX, dragMinY, dragMaxY,
    previousX: x, previousY: y,
    previousWidth: width, previousHeight: height,
    previousResizeX: resizeButton.x, previousResizeY: resizeButton.y,
    dragOffsetX, dragOffsetY,
    aspectRatio: _calcComponentAspectRatio(part.component)
  };
}
import {CanvasComponent} from "sl-web-face";
import {loadSelectionBox, resizingTypeForComponent, updateResizingButtonPositions} from "./SelectionBoxCanvasComponent";
import ResizingType from "./ResizingTypes";

// TODO move to sl-web-face when it stabilizes.

enum OperationType {
  NONE,
  MOVE,
  RESIZE
}

type ResizeOperation = {
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
  previousHeight:number
}

type MoveOperation = {
  // Offset from the clicked point inside of a dragged component to its topleft corner.
  dragOffsetX:number,
  dragOffsetY:number,

  // Part component values prior to changes made by dragging.
  previousX:number,
  previousY:number
}

type Operation = ResizeOperation|MoveOperation;

type TrackedPart = {
  component:CanvasComponent,
  isMovable:boolean,
  isResizable:boolean,
  selectionBox:CanvasComponent
};

export interface IPartFocusedCallback {
  (part:CanvasComponent):void
}

export interface IPartMovedCallback {
  (part:CanvasComponent, x:number, y:number):boolean
}

export interface IPartResizedCallback {
  (part:CanvasComponent, x:number, y:number, width:number, height:number):boolean
}

async function _loadPartUi(component:CanvasComponent, isResizable:boolean):Promise<CanvasComponent> {
  const selectionBox:CanvasComponent = await loadSelectionBox(component.width, component.height, isResizable);
  selectionBox.setParent(component);
  selectionBox.isVisible = false;
  return selectionBox;
}

function _showPartUi(part:TrackedPart) { part.selectionBox.isVisible = true; }

function _hidePartUi(part:TrackedPart) { part.selectionBox.isVisible = false; }

function _findPartAtCoords(parts:TrackedPart[], x:number, y:number):TrackedPart|null {
  const partCount = parts.length;
  for(let partI = 0; partI < partCount; ++partI) {
    const part = parts[partI];
    if (!part.component.isVisible) continue;
    const [ boundX, boundY, boundWidth, boundHeight ] = part.component.boundingRect;
    if (x >= boundX && x < (boundX+boundWidth) && y >= boundY && y < (boundY+boundHeight)) return part;
  }
  return null;
}

function _findPartByComponent(parts:TrackedPart[], component:CanvasComponent|null):TrackedPart|null {
  const i = parts.findIndex(trackedPart => trackedPart.component === component);
  if (i === -1) return null;
  return parts[i];
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

function _findResizeButtonAtCoords(parts:TrackedPart[], x:number, y:number):CanvasComponent|null {
  const partCount = parts.length;
  for(let partI = 0; partI < partCount; ++partI) {
    const matchedComponent =  _findResizeButtonInComponentAtCoords(parts[partI].component, x, y);
    if (matchedComponent) return matchedComponent;
  }
  return null;
}

// TODO - mouseup outside of canvas area leaves operation in progress.

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

function _revertPartMove(part:TrackedPart, operation:MoveOperation) {
  part.component.x = operation.previousX;
  part.component.y = operation.previousY;
}

function _onCompleteResize(part:TrackedPart, operation:ResizeOperation, mouseUpX:number, mouseUpY:number, onPartResized:IPartResizedCallback) {
  const [x, y, width, height] = part.component.boundingRect;
  const confirmed = onPartResized(part.component, x, y, width, height);
  if (!confirmed) _revertPartResize(part, operation);
}

function _onCompleteMove(part:TrackedPart, operation:MoveOperation, mouseUpX:number, mouseUpY:number, onPartMoved:IPartMovedCallback) {
  const { x, y } = part.component;
  const confirmed = onPartMoved(part.component, x, y);
  if (!confirmed) _revertPartMove(part, operation);
}

function _clamp(value:number, min:number, max:number) {
  return value < min 
    ? min 
    : value > max ? max : value;
}

function _getConstrainedResizeCoordinates(operation:ResizeOperation, mouseMoveX:number, mouseMoveY:number):[x:number, y:number] {
  const resizeButtonX = _clamp(mouseMoveX + operation.dragOffsetX, operation.dragMinX, operation.dragMaxX);
  const resizeButtonY = _clamp(mouseMoveY + operation.dragOffsetY, operation.dragMinY, operation.dragMaxY);
  return [resizeButtonX, resizeButtonY]; 
}

function _onResizeDuringDrag(part:TrackedPart, operation:ResizeOperation, mouseMoveX:number, mouseMoveY:number) {
  const [constrainedX, constrainedY] = _getConstrainedResizeCoordinates(operation, mouseMoveX, mouseMoveY); 
  operation.resizeButton.x = constrainedX;
  operation.resizeButton.y = constrainedY;
  const deltaX = constrainedX - operation.previousResizeX;
  const deltaY = constrainedY - operation.previousResizeY;
  
  const { selectionBox, component } = part; 
  switch(operation.resizingType) {
    case ResizingType.TOPLEFT:
      component.width = operation.previousWidth - deltaX;
      component.height = operation.previousHeight - deltaY;
      if (part.isMovable) {
        component.x = operation.previousX + deltaX;
        component.y = operation.previousY + deltaY;
      }
      break;
      
    case ResizingType.TOP:
      component.height = operation.previousHeight - deltaY;
      if (part.isMovable) component.y = operation.previousY + deltaY;
      break;

    case ResizingType.TOPRIGHT:
      component.width = operation.previousWidth + deltaX;
      component.height = operation.previousHeight - deltaY;
      if (part.isMovable) component.y = operation.previousY + deltaY;
      break;

    case ResizingType.LEFT:
      component.width = operation.previousWidth - deltaX;
      if (part.isMovable) component.x = operation.previousX + deltaX;
      break;
      
    case ResizingType.RIGHT:
      component.width = operation.previousWidth + deltaX;
      break;

    case ResizingType.BOTTOMLEFT:
      component.width = operation.previousWidth - deltaX;
      component.height = operation.previousHeight + deltaY;
      if (part.isMovable) component.x = operation.previousX + deltaX;
      break;

    case ResizingType.BOTTOM:
      component.height = operation.previousHeight + deltaY;
      break;

    case ResizingType.BOTTOMRIGHT:
      component.width = operation.previousWidth + deltaX;
      component.height = operation.previousHeight + deltaY;
      break;
  }

  selectionBox.width = component.width;
  selectionBox.height = component.height;
  updateResizingButtonPositions(selectionBox);
}

function _onMoveDuringDrag(part:TrackedPart, operation:MoveOperation, mouseMoveX:number, mouseMoveY:number) {
  part.component.x = mouseMoveX + operation.dragOffsetX;
  part.component.y = mouseMoveY + operation.dragOffsetY;
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

function _createResizeOperation(part:TrackedPart, resizeButton:CanvasComponent, clickX:number, clickY:number):ResizeOperation {
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
    dragOffsetX, dragOffsetY
  };
}

function _createMoveOperation(part:TrackedPart, clickX:number, clickY:number):MoveOperation {
  const { x, y } = part.component;
  return {
    previousX: x, previousY: y,
    dragOffsetX: x - clickX, dragOffsetY: y - clickY
  };
}

class PartUiManager {
  private readonly _trackedParts:TrackedPart[];
  private readonly _onPartFocused:IPartFocusedCallback;
  private readonly _onPartMoved:IPartMovedCallback;
  private readonly _onPartResized:IPartResizedCallback;
  private _focusedPart:TrackedPart|null;
  private _operation:Operation|null;
  private _operationType:OperationType;
  
  constructor(onPartFocused:IPartFocusedCallback, onPartMoved:IPartMovedCallback, onPartResized:IPartResizedCallback) {
    this._trackedParts = [];
    this._onPartFocused = onPartFocused;
    this._onPartMoved = onPartMoved;
    this._onPartResized = onPartResized;
    this._focusedPart = null;
    this._operation = null;
    this._operationType = OperationType.NONE;
  }
  
  setFocus(component:CanvasComponent) {
    const nextFocusedPart = _findPartByComponent(this._trackedParts, component);
    if (!nextFocusedPart) throw Error('Component was not previously added as a part.');
    if (this._focusedPart === nextFocusedPart) return;
    if (this._focusedPart) _hidePartUi(this._focusedPart);
    _showPartUi(nextFocusedPart);
    this._focusedPart = nextFocusedPart;
    this._onPartFocused(nextFocusedPart.component);
  }
  
  private _onResizeButtonClick(resizeButton:CanvasComponent, clickX:number, clickY:number) {
    const partComponent = (resizeButton.parent as CanvasComponent).parent;
    if (!partComponent) throw Error('Unexpected');
    this.setFocus(partComponent);
    if (!this._focusedPart) throw Error('Unexpected');
    
    this._operation = _createResizeOperation(this._focusedPart, resizeButton, clickX, clickY);
    this._operationType = OperationType.RESIZE;
  }
  
  private _onPartClick(part:TrackedPart, clickX:number, clickY:number) {
    this.setFocus(part.component);
    if (!this._focusedPart) throw Error('Unexpected');
    this._operation = _createMoveOperation(this._focusedPart, clickX, clickY);
    this._operationType = OperationType.MOVE;
  }
  
  onMouseDown(event:any) {
    if (!event) return;
    const clickX = event.nativeEvent.offsetX, clickY = event.nativeEvent.offsetY;
    const nextResizeButton = _findResizeButtonAtCoords(this._trackedParts, clickX, clickY);
    if (nextResizeButton) {
      this._onResizeButtonClick(nextResizeButton, clickX, clickY);
      return;
    }
    const nextFocusPart = _findPartAtCoords(this._trackedParts, clickX, clickY);
    if (nextFocusPart) this._onPartClick(nextFocusPart, clickX, clickY);
  }
  
  onMouseUp(event:any) {
    if (!event || !this._focusedPart) return;
    const mouseUpX = event.nativeEvent.offsetX, mouseUpY = event.nativeEvent.offsetY;
    switch(this._operationType) {
      case OperationType.RESIZE: 
        _onCompleteResize(this._focusedPart, this._operation as ResizeOperation, mouseUpX, mouseUpY, this._onPartResized);
        break;
        
      case OperationType.MOVE:
        _onCompleteMove(this._focusedPart, this._operation as MoveOperation, mouseUpX, mouseUpY, this._onPartMoved);
        break;
    }
    this._operationType = OperationType.NONE;
  }
  
  onMouseMove(event:any) {
    const isPrimaryButtonDown = (event.buttons & 1) !== 0;
    if (!event || !isPrimaryButtonDown) return;
    
    const mouseMoveX = event.nativeEvent.offsetX, mouseMoveY = event.nativeEvent.offsetY;
    switch(this._operationType) {
      case OperationType.RESIZE:
        _onResizeDuringDrag(this._focusedPart as TrackedPart, this._operation as ResizeOperation, mouseMoveX, mouseMoveY);
        break;
        
      case OperationType.MOVE:
        _onMoveDuringDrag(this._focusedPart as TrackedPart, this._operation as MoveOperation, mouseMoveX, mouseMoveY);
        break;
    }
  }

  async addPart(component:CanvasComponent, isMovable:boolean, isResizable:boolean) {
    this._trackedParts.push({
      component, isMovable, isResizable,
      selectionBox: await _loadPartUi(component, isResizable)
    });
  }
}

export default PartUiManager;
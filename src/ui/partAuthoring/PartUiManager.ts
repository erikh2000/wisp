import {
  createMoveOperation, 
  hasPartDragged,
  IPartMovedCallback,
  MoveOperation,
  onCompleteMove,
  onMoveDuringDrag
} from "./moveOperation";
import {
  createResizeOperation,
  findResizeButtonAtCoords, 
  IPartResizedCallback,
  onCompleteResize,
  onResizeDuringDrag,
  ResizeOperation
} from "./resizeOperation";
import {
  createTrackedPartsForFace, DEFAULT_TRACKED_PART_OPTIONS,
  findNextPartAtCoords,
  findPartAtCoords,
  findPartByComponent,
  findPartById,
  hidePartUi, isPartAtCoords,
  loadPartUi, removeMissingParts,
  showPartUi,
  TrackedPart, TrackedPartOptions
} from "./trackedPart";
import {CanvasComponent} from "sl-web-face";

type Operation = ResizeOperation|MoveOperation;

enum OperationType {
  NONE,
  MOVE,
  RESIZE
}

export interface IPartFocusedCallback {
  (part:CanvasComponent|null):void
}

class PartUiManager {
  private _trackedParts:TrackedPart[];
  private _onPartFocused:IPartFocusedCallback;
  private _onPartMoved:IPartMovedCallback;
  private _onPartResized:IPartResizedCallback;
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
    const nextFocusedPart = findPartByComponent(this._trackedParts, component);
    if (!nextFocusedPart) throw Error('Component was not previously added as a part.');
    if (this._focusedPart === nextFocusedPart) return;
    if (this._focusedPart) hidePartUi(this._focusedPart);
    showPartUi(nextFocusedPart);
    this._focusedPart = nextFocusedPart;
    this._onPartFocused(nextFocusedPart.component);
  }
  
  isFocused(component:CanvasComponent) {
    return this._focusedPart && this._focusedPart.component.id === component.id;
  }
  
  clearFocus() {
    if (!this._focusedPart) return;
    hidePartUi(this._focusedPart);
    this._focusedPart = null;
    this._onPartFocused(null);
  }
  
  private _onResizeButtonClick(resizeButton:CanvasComponent, clickX:number, clickY:number) {
    const partComponent = (resizeButton.parent as CanvasComponent).parent;
    if (!partComponent) throw Error('Unexpected');
    this.setFocus(partComponent);
    if (!this._focusedPart) throw Error('Unexpected');
    
    this._operation = createResizeOperation(this._focusedPart, resizeButton, clickX, clickY);
    this._operationType = OperationType.RESIZE;
  }
  
  private _onPartClick(part:TrackedPart|null, clickX:number, clickY:number) {
    if (part === null) {
      this.clearFocus();
      return;
    }
    const isNewlyFocusedPart = part !== this._focusedPart;
    this.setFocus(part.component);
    if (!this._focusedPart) throw Error('Unexpected');
    this._operation = createMoveOperation(this._focusedPart, clickX, clickY, isNewlyFocusedPart);
    this._operationType = OperationType.MOVE;
  }
  
  onMouseDown(event:any) {
    if (!event) return;
    const clickX = event.nativeEvent.offsetX, clickY = event.nativeEvent.offsetY;
    const nextResizeButton = findResizeButtonAtCoords(this._trackedParts, clickX, clickY);
    if (nextResizeButton) {
      this._onResizeButtonClick(nextResizeButton, clickX, clickY);
      return;
    }
    const isClickOnFocusedPart = this._focusedPart ? isPartAtCoords(this._focusedPart, clickX, clickY) : false; 
    const nextFocusPart = isClickOnFocusedPart ? this._focusedPart : findPartAtCoords(this._trackedParts, clickX, clickY);
    this._onPartClick(nextFocusPart, clickX, clickY);
  }
  
  completeOperations() {
    if (!this._focusedPart) return;
    switch(this._operationType) {
      case OperationType.RESIZE:
        onCompleteResize(this._focusedPart, this._operation as ResizeOperation, this._onPartResized);
        break;

      case OperationType.MOVE:
        onCompleteMove(this._focusedPart, this._operation as MoveOperation, this._onPartMoved);
        break;
    }
    this._operationType = OperationType.NONE;
  }
  
  onMouseUp(event:any) {
    if (!event || !this._focusedPart) return;
    if (this._operationType === OperationType.MOVE) {
      const operation = this._operation as MoveOperation;
      if (!hasPartDragged(this._focusedPart, operation) && !operation.isNewlyFocusedPart) {
        const mouseUpX = event.nativeEvent.offsetX, mouseUpY = event.nativeEvent.offsetY;
        const nextFocusPart = findNextPartAtCoords(this._trackedParts, this._focusedPart, mouseUpX, mouseUpY);
        if (nextFocusPart !== this._focusedPart) this.setFocus(nextFocusPart.component);
        this._operationType = OperationType.NONE;
      }
    }
    this.completeOperations();
  }
  
  onMouseMove(event:any) {
    const isPrimaryButtonDown = (event.buttons & 1) !== 0;
    if (!event || !isPrimaryButtonDown || !this._focusedPart) return;
    
    const mouseMoveX = event.nativeEvent.offsetX, mouseMoveY = event.nativeEvent.offsetY;
    switch(this._operationType) {
      case OperationType.RESIZE:
        onResizeDuringDrag(this._focusedPart as TrackedPart, this._operation as ResizeOperation, mouseMoveX, mouseMoveY);
        break;
        
      case OperationType.MOVE:
        onMoveDuringDrag(this._focusedPart as TrackedPart, this._operation as MoveOperation, mouseMoveX, mouseMoveY);
        break;
    }
  }

  async addPart(component:CanvasComponent, options:Partial<TrackedPartOptions>) {
    const {isMovable, isResizable, resizeChildren, constrainAspectRatio} =
      {...DEFAULT_TRACKED_PART_OPTIONS, ...options};
    const selectionBox = await loadPartUi(component, isResizable);
    this._trackedParts.push({ component, isMovable, isResizable, resizeChildren, constrainAspectRatio, selectionBox });
  }
  
  async replacePart(oldComponent:CanvasComponent, newComponent:CanvasComponent) {
    const part = findPartByComponent(this._trackedParts, oldComponent);
    if (!part) throw Error('Unexpected');
    part.component = newComponent;
    const wasVisible = part.selectionBox.isVisible;
    part.selectionBox = await loadPartUi(newComponent, part.isResizable);
    if (wasVisible) showPartUi(part);
  }
  
  removePart(component:CanvasComponent) {
    if (this.isFocused(component)) this.clearFocus();
    this._trackedParts = this._trackedParts.filter(part => part.component.id !== component.id);
  }
  
  async trackPartsForFace(headComponent:CanvasComponent) {
    const nextTrackedParts:TrackedPart[] = createTrackedPartsForFace(headComponent);

    this._trackedParts = removeMissingParts(nextTrackedParts, this._trackedParts);
    
    for(let i = 0; i < nextTrackedParts.length; ++i) {
      const nextPart = nextTrackedParts[i];
      const currentPart = findPartById(this._trackedParts, nextPart.component.id);
      if (currentPart) {
        if (currentPart.component !== nextPart.component) {
          await this.replacePart(currentPart.component, nextPart.component);
        }
      } else {
        await this.addPart(nextPart.component, {isMovable:nextPart.isMovable, isResizable:nextPart.isResizable});
      }
    }
  }
  
  bindOnPartFocused(onPartFocused:IPartFocusedCallback) {
    this._onPartFocused = onPartFocused;
  }
  
  bindOnPartMoved(onPartMoved:IPartMovedCallback) {
    this._onPartMoved = onPartMoved;
  }
  
  bindOnPartResized(onPartResized:IPartResizedCallback) {
    this._onPartResized = onPartResized;
  }
  
}

export default PartUiManager;
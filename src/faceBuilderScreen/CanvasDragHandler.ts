import {CanvasComponent} from "sl-web-face";

// TODO move to sl-web-face when it stabilizes.

export interface IDraggedCallback {
  (component:CanvasComponent, x:number, y:number):boolean
}

export interface IStartDragCallback {
  (component:CanvasComponent):boolean
}

function _findComponentAtCoords(components:CanvasComponent[], x:number, y:number):CanvasComponent|null {
  const componentCount = components.length;
  for(let componentI = 0; componentI < componentCount; ++componentI) {
    const component = components[componentI];
    const [ boundX, boundY, boundWidth, boundHeight ] = component.boundingRect;
    if (x >= boundX && x < (boundX+boundWidth) && y >= boundY && y < (boundY+boundHeight)) return component;
  }
  return null;
}

class CanvasDragHandler {
  private _draggableComponents:CanvasComponent[];
  private _onDragged:IDraggedCallback;
  private _onStartDrag:IStartDragCallback;
  private _draggedComponent:CanvasComponent|null;
  private _draggedStartX:number;
  private _draggedStartY:number;
  private _draggedOffsetX:number;
  private _draggedOffsetY:number;
  
  constructor(draggableComponents:CanvasComponent[], onStartDrag:IStartDragCallback, onDragged:IDraggedCallback) {
    this._draggableComponents = draggableComponents;
    this._onDragged = onDragged;
    this._onStartDrag = onStartDrag;
    this._draggedComponent = null;
    this._draggedStartX = this._draggedStartY = this._draggedOffsetX = this._draggedOffsetY = 0;
  }
  
  onMouseDown(event:any) {
    if (!event) return;
    const x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    this._draggedComponent = _findComponentAtCoords(this._draggableComponents, x, y);
    if (this._draggedComponent && this._onStartDrag(this._draggedComponent)) {
      this._draggedStartX = this._draggedComponent.x;
      this._draggedStartY = this._draggedComponent.y;
      this._draggedOffsetX = this._draggedStartX - x;
      this._draggedOffsetY = this._draggedStartY - y;
    }
  }
  
  onMouseUp(event:any) {
    if (!event || !this._draggedComponent) return;
    
    const x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    const confirmed = this._onDragged(this._draggedComponent, x, y);
    if (!confirmed) {
      this._draggedComponent.x = this._draggedStartX;
      this._draggedComponent.y = this._draggedStartY;
    }
    this._draggedComponent = null;
  }
  
  onMouseMove(event:any) {
    if (!event) return;
    const isPrimaryButtonDown:boolean = (event.buttons & 1) !== 0;
    const x = event.nativeEvent.offsetX, y = event.nativeEvent.offsetY;
    if (this._draggedComponent && isPrimaryButtonDown) {
      this._draggedComponent.x = x + this._draggedOffsetX;
      this._draggedComponent.y = y + this._draggedOffsetY;
    }
  }
}

export default CanvasDragHandler;
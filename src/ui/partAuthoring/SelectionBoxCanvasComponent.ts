import {CanvasComponent} from 'sl-web-face';
import ResizingType from "./ResizingTypes";

type SelectionBoxComponentState = {
  width:number,
  height:number
}

async function _onLoad(initData:any):Promise<any> {
  return {
    width:initData.width,
    height:initData.height
  } as SelectionBoxComponentState;
}

export const SELECTION_BOX_PART_TYPE = 'ui:selection box';
export const TOPLEFT_RESIZING_BUTTON_PART_TYPE = 'ui:topleft resizing button';
export const TOP_RESIZING_BUTTON_PART_TYPE = 'ui:top resizing button';
export const TOPRIGHT_RESIZING_BUTTON_PART_TYPE = 'ui:topright resizing button';
export const LEFT_RESIZING_BUTTON_PART_TYPE = 'ui:left resizing button';
export const RIGHT_RESIZING_BUTTON_PART_TYPE = 'ui:right resizing button';
export const BOTTOMLEFT_RESIZING_BUTTON_PART_TYPE = 'ui:bottomleft resizing button';
export const BOTTOM_RESIZING_BUTTON_PART_TYPE = 'ui:bottom resizing button';
export const BOTTOMRIGHT_RESIZING_BUTTON_PART_TYPE = 'ui:bottomright resizing button';

type PartToResizingTypeMap = {
  [partType:string]:ResizingType;
}

const partToResizingType:PartToResizingTypeMap = {
  [SELECTION_BOX_PART_TYPE]: ResizingType.NONE,
  [TOPLEFT_RESIZING_BUTTON_PART_TYPE]: ResizingType.TOPLEFT,
  [TOP_RESIZING_BUTTON_PART_TYPE]: ResizingType.TOP,
  [TOPRIGHT_RESIZING_BUTTON_PART_TYPE]: ResizingType.TOPRIGHT,
  [LEFT_RESIZING_BUTTON_PART_TYPE]: ResizingType.LEFT,
  [RIGHT_RESIZING_BUTTON_PART_TYPE]: ResizingType.RIGHT,
  [BOTTOMLEFT_RESIZING_BUTTON_PART_TYPE]: ResizingType.BOTTOMLEFT,
  [BOTTOM_RESIZING_BUTTON_PART_TYPE]: ResizingType.BOTTOM,
  [BOTTOMRIGHT_RESIZING_BUTTON_PART_TYPE]: ResizingType.BOTTOMRIGHT
};

const SELECTION_BORDER_STROKE_STYLE = 'rgb(200, 100, 100)';
const RESIZING_BUTTON_FILL_STYLE = 'rgb(200, 100, 100)';
const RESIZING_BUTTON_WIDTH = 10;
const RESIZING_BUTTON_HALF_WIDTH = Math.floor(RESIZING_BUTTON_WIDTH/2);
const RESIZING_BUTTON_HEIGHT = 10;
const RESIZING_BUTTON_HALF_HEIGHT = Math.floor(RESIZING_BUTTON_HEIGHT/2);

function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  context.strokeStyle = SELECTION_BORDER_STROKE_STYLE;
  context.strokeRect(x, y, width, height);
}

function _onBoundingDimensions(_componentState:any):[width:number, height:number] {
  const { width, height } = _componentState;
  return [width, height];
}

async function _onResizingButtonLoad(initData:any):Promise<any> {
  return initData;
}

function _onResizingButtonRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  context.fillStyle = RESIZING_BUTTON_FILL_STYLE;
  context.fillRect(x, y, width, height);
}

function _onResizingButtonBoundingDimensions(_componentState:any):[width:number, height:number] {
  return [RESIZING_BUTTON_WIDTH, RESIZING_BUTTON_HEIGHT];
}

function _onComponentStateUpdated(_componentState:any, _changes:any) {};

async function _createResizingButton(selectionBox:CanvasComponent, partType:string):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onResizingButtonLoad, _onResizingButtonRender, _onResizingButtonBoundingDimensions, _onComponentStateUpdated);
  const initData = { partType };
  await component.load(initData);
  component.setParent(selectionBox);
  return component;
}

export function updateResizingButtonPositions(selectionBox:CanvasComponent) {
  const left = -RESIZING_BUTTON_HALF_WIDTH;
  const right = selectionBox.width - RESIZING_BUTTON_HALF_WIDTH;
  const top = -RESIZING_BUTTON_HALF_HEIGHT;
  const bottom = selectionBox.height - RESIZING_BUTTON_HALF_HEIGHT;
  const horizontalCenter = Math.floor(selectionBox.width/2 - RESIZING_BUTTON_HALF_WIDTH); 
  const verticalCenter = Math.floor(selectionBox.height/2 - RESIZING_BUTTON_HALF_HEIGHT);
  
  const childCount = selectionBox.children.length;
  for(let childI = 0; childI < childCount; ++childI) {
    const child = selectionBox.children[childI];
    switch(child.partType) {
      case TOPLEFT_RESIZING_BUTTON_PART_TYPE: child.offsetX = left; child.offsetY = top; break;
      case TOP_RESIZING_BUTTON_PART_TYPE: child.offsetX = horizontalCenter; child.offsetY = top; break;
      case TOPRIGHT_RESIZING_BUTTON_PART_TYPE: child.offsetX = right; child.offsetY = top; break;
      case LEFT_RESIZING_BUTTON_PART_TYPE: child.offsetX = left; child.offsetY = verticalCenter; break;
      case RIGHT_RESIZING_BUTTON_PART_TYPE: child.offsetX = right; child.offsetY = verticalCenter; break;
      case BOTTOMLEFT_RESIZING_BUTTON_PART_TYPE: child.offsetX = left; child.offsetY = bottom; break;
      case BOTTOM_RESIZING_BUTTON_PART_TYPE: child.offsetX = horizontalCenter; child.offsetY = bottom; break;
      case BOTTOMRIGHT_RESIZING_BUTTON_PART_TYPE: child.offsetX = right; child.offsetY = bottom; break;
    }
  }
}

function _findSelectionBoxForPart(part:CanvasComponent):CanvasComponent|null {
  const children = part.children;
  const childCount = children.length;
  for(let i = 0; i < childCount; ++i) {
    const child = children[i];
    if (child.partType === SELECTION_BOX_PART_TYPE) return child;
  }
  return null;
}

function _updateSelectionBoxToMatchPart(part:CanvasComponent) {
  const selectionBox = _findSelectionBoxForPart(part);
  if (!selectionBox) return;
  if (selectionBox.width === part.width && selectionBox.height === part.height) return;
  selectionBox.width = part.width;
  selectionBox.height = part.height;
  updateResizingButtonPositions(selectionBox);
}

export function updateSelectionBoxesToMatchFace(head:CanvasComponent) {
  _updateSelectionBoxToMatchPart(head);
  head.children.forEach(child => _updateSelectionBoxToMatchPart(child));
}

export async function loadSelectionBox(width:number, height:number, isResizable:boolean):Promise<CanvasComponent> {
  const selectionBoxComponent = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions, _onComponentStateUpdated);
  const initData = { partType:SELECTION_BOX_PART_TYPE, width, height };
  await selectionBoxComponent.load(initData);
  if (isResizable) {
    await Promise.all([
      _createResizingButton(selectionBoxComponent, TOPLEFT_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, TOP_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, TOPRIGHT_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, LEFT_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, RIGHT_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, BOTTOMLEFT_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, BOTTOM_RESIZING_BUTTON_PART_TYPE),
      _createResizingButton(selectionBoxComponent, BOTTOMRIGHT_RESIZING_BUTTON_PART_TYPE)
    ]);
  }
  updateResizingButtonPositions(selectionBoxComponent);
  return selectionBoxComponent;
}

export function resizingTypeForComponent(component:CanvasComponent):ResizingType {
  const resizingType = partToResizingType[component.partType];
  return resizingType !== undefined ? resizingType as ResizingType : ResizingType.NONE;
}
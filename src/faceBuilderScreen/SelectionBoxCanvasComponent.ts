import { CanvasComponent } from 'sl-web-face';

export type SelectionBoxInitData = { // TODO move width/height to CanvasComponent and implement setters and pass width/height to _onRender(). And getters need to use that width and height.
  width:number,
  height:number
}

type SelectionBoxComponentState = { // TODO same comment as above
  width:number,
  height:number
}

async function _onLoad(initData:any):Promise<any> {
  return initData;
}

const SELECTION_BORDER_LINE_STYLE = 'rgb(200, 100, 100)';
function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number) {
  const { width, height } = (componentState as SelectionBoxComponentState);
  context.strokeStyle = SELECTION_BORDER_LINE_STYLE;
  context.strokeRect(x, y, width, height);
}

function _onBoundingDimensions(componentState:any):[width:number, height:number] {
  const { width, height } = (componentState as SelectionBoxComponentState);
  return [width, height];
}

export async function loadSelectionBox(initData:SelectionBoxInitData):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  await component.load(initData);
  return component;
}
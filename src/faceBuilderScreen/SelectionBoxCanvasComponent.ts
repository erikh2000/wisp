import { CanvasComponent } from 'sl-web-face';

async function _onLoad(initData:any):Promise<any> {
  return initData;
}

const SELECTION_BORDER_LINE_STYLE = 'rgb(200, 100, 100)';
function _onRender(componentState:any, context:CanvasRenderingContext2D, x:number, y:number, width:number, height:number) {
  context.strokeStyle = SELECTION_BORDER_LINE_STYLE;
  context.strokeRect(x, y, width, height);
}

function _onBoundingDimensions(_componentState:any):[width:number, height:number] {
  return [0, 0];
}

export const SELECTION_BOX_PART_TYPE = 'ui:selection box';

export async function loadSelectionBox(width:number, height:number):Promise<CanvasComponent> {
  const component = new CanvasComponent(_onLoad, _onRender, _onBoundingDimensions);
  const initData = { partType:SELECTION_BOX_PART_TYPE, width, height }; 
  await component.load(initData);
  return component;
}
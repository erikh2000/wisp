import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import {setHead} from "spielsScreen/interactions/coreUtil";

import {CanvasComponent} from "sl-web-face";

function _centerCanvasComponent(component:CanvasComponent, canvasWidth:number, canvasHeight:number) {
  const componentWidth = component.width, componentHeight = component.height;
  component.offsetX = Math.round((canvasWidth - componentWidth) / 2);
  component.offsetY = Math.round((canvasHeight - componentHeight) / 2);
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D, headComponent:CanvasComponent) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  _centerCanvasComponent(headComponent, canvasWidth, canvasHeight);
  headComponent.render(context);
}

export async function onChangeFace(faceName:string, setModalDialog:any) {
  try {
    if (faceName === UNSPECIFIED_NAME) throw Error('Unexpected');
    await setActiveFaceName(UNSPECIFIED_NAME);
    const head = await loadFaceFromName(faceName);
    setHead(head);
    await setActiveFaceName(faceName);
  } finally {
    setModalDialog(null);
  }
}
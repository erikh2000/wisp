import {PartType} from "facesScreen/PartSelector";
import {findCanvasComponentForPartType, getHead, getPartUiManager} from "./coreUtil";
import {updateForAuthoringRevision} from "./revisionUtil";
import {centerCanvasComponent} from "common/canvasComponentUtil";

export function onPartTypeChange(partType:PartType, setRevision:any) {
  const head = getHead();
  updateForAuthoringRevision({partType}, setRevision);
  const partUiManager = getPartUiManager();
  const nextFocusPart = findCanvasComponentForPartType(head, partType);
  if (partUiManager) {
    if (nextFocusPart) {
      partUiManager.setFocus(nextFocusPart);
    } else {
      partUiManager.clearFocus();
    }
  }
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const head = getHead();
  centerCanvasComponent(head, canvasWidth, canvasHeight);
  head.render(context);
}
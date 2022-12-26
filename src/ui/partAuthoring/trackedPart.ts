import {CanvasComponent} from "sl-web-face";
import {loadSelectionBox} from "./SelectionBoxCanvasComponent";

export type TrackedPart = {
  component:CanvasComponent,
  isMovable:boolean,
  isResizable:boolean,
  selectionBox:CanvasComponent
};

export async function loadPartUi(component:CanvasComponent, isResizable:boolean):Promise<CanvasComponent> {
  const selectionBox:CanvasComponent = await loadSelectionBox(component.width, component.height, isResizable);
  selectionBox.setParent(component);
  selectionBox.isVisible = false;
  return selectionBox;
}

export function showPartUi(part:TrackedPart) { part.selectionBox.isVisible = true; }

export function hidePartUi(part:TrackedPart) { part.selectionBox.isVisible = false; }

export function findPartAtCoords(parts:TrackedPart[], x:number, y:number):TrackedPart|null {
  const partCount = parts.length;
  for(let partI = 0; partI < partCount; ++partI) {
    const part = parts[partI];
    if (!part.component.isVisible) continue;
    const [ boundX, boundY, boundWidth, boundHeight ] = part.component.boundingRect;
    if (x >= boundX && x < (boundX+boundWidth) && y >= boundY && y < (boundY+boundHeight)) return part;
  }
  return null;
}

export function findPartByComponent(parts:TrackedPart[], component:CanvasComponent|null):TrackedPart|null {
  const i = parts.findIndex(trackedPart => trackedPart.component === component);
  if (i === -1) return null;
  return parts[i];
}

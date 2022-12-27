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

export function isPartAtCoords(part:TrackedPart, x:number, y:number):boolean {
  if (!part.component.isVisible) return false;
  const [ boundX, boundY, boundWidth, boundHeight ] = part.component.boundingRect;
  return (x >= boundX && x < (boundX+boundWidth) && y >= boundY && y < (boundY+boundHeight));
}

export function findPartAtCoords(parts:TrackedPart[], x:number, y:number):TrackedPart|null {
  const partCount = parts.length;
  for(let partI = partCount - 1; partI >= 0; --partI) {
    const part = parts[partI];
    if (isPartAtCoords(part, x, y)) return part;
  }
  return null;
}

export function findNextPartAtCoords(parts:TrackedPart[], focusedPart:TrackedPart, x:number, y:number):TrackedPart {
  const partCount = parts.length;
  let partI = parts.findIndex(part => part === focusedPart);
  if (partI === -1) return focusedPart;
  const stopPartI = partI;
  while(true) {
    if (++partI === partCount) partI = 0;
    if (partI === stopPartI) return focusedPart;
    const part = parts[partI];
    if (isPartAtCoords(part, x, y)) return part;
  }
}

export function findPartByComponent(parts:TrackedPart[], component:CanvasComponent|null):TrackedPart|null {
  const i = parts.findIndex(trackedPart => trackedPart.component === component);
  if (i === -1) return null;
  return parts[i];
}

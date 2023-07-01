import {CanvasComponent} from "sl-web-face";
import {loadSelectionBox} from "./SelectionBoxCanvasComponent";

export type TrackedPartOptions = {
  isMovable:boolean,
  isResizable:boolean,
  resizeChildren:boolean,
  constrainAspectRatio:boolean
}

export type TrackedPart = TrackedPartOptions & {
  component:CanvasComponent,
  selectionBox:CanvasComponent
};

export const DEFAULT_TRACKED_PART_OPTIONS:TrackedPartOptions = {
  isMovable: true,
  isResizable: false,
  resizeChildren: false,
  constrainAspectRatio: false
}

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

export function findPartById(parts:TrackedPart[], id:number):TrackedPart|null {
  const i = parts.findIndex(trackedPart => trackedPart.component.id === id);
  if (i === -1) return null;
  return parts[i];
}

export function createTrackedPartsForFace(headComponent:CanvasComponent):TrackedPart[] {
  const trackedParts:TrackedPart[] = [];
  const componentPlaceholder = (null as unknown) as CanvasComponent;
  const children = headComponent.findNonUiChildren();
  const childCount = children.length;
  for (let childI = childCount-1; childI >= 0; --childI) {
    const child = children[childI];
    trackedParts.push({component:child, selectionBox:componentPlaceholder, isResizable:true, isMovable:true, resizeChildren:false, constrainAspectRatio:false});
  }
  trackedParts.push({component:headComponent, selectionBox:componentPlaceholder, isResizable:true, isMovable:false, resizeChildren:false, constrainAspectRatio:false});
  return trackedParts;
}

export function findPartByTypeName(parts:TrackedPart[], partTypeName:string):TrackedPart|null {
  for(let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (part.component.partType === partTypeName) return part;
  }
  return null;
}

export function removeMissingParts(compareAgainstParts:TrackedPart[], parts:TrackedPart[]):TrackedPart[] {
  return parts.filter(part => findPartById(compareAgainstParts, part.component.id) !== null);
}
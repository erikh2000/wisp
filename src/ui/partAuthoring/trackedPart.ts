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

export function createTrackedPartsForFace(headComponent:CanvasComponent):TrackedPart[] {
  const trackedParts:TrackedPart[] = [];
  const componentPlaceholder = (null as unknown) as CanvasComponent;
  const children = headComponent.findNonUiChildren();
  const childCount = children.length;
  for (let childI = childCount-1; childI >= 0; --childI) {
    const child = children[childI];
    trackedParts.push({component:child, selectionBox:componentPlaceholder, isResizable:true, isMovable:true});
  }
  trackedParts.push({component:headComponent, selectionBox:componentPlaceholder, isResizable:true, isMovable:false});
  return trackedParts;
}

export function findPartByTypeName(parts:TrackedPart[], partTypeName:string):TrackedPart|null {
  for(let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (part.component.partType === partTypeName) return part;
  }
  return null;
}

/* TODO extra parts need a better way to link besides partType. PartType.EXTRA* does not preserve which items will be removed.
   See calling code from trackPartsForFace() that relies on this.
   
   Ideas:
   #1 assign a unique ID to every extra part. ++
   #2 assign a unique ID to every part. +++
   #3 imply a unique ID from some other variables in the part. ???
   #4 remove tracked part explicitly w/ partUImanager.removePart() rather than trackPartsForFace() noticing the difference and removing implicitly. ++?
   #5 use the instance value of the component to compare? Probably won't work because of recoloring, which loads a new instance. ???
*/
export function removeMissingParts(compareAgainstParts:TrackedPart[], parts:TrackedPart[]):TrackedPart[] {
  return parts.filter(part => findPartByTypeName(compareAgainstParts, part.component.partType) !== null);
}
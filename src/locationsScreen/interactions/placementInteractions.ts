import LocationFaces from "./LocationFaces";
import {scaleDimensionsToFit} from "common/scaleUtil";
import FacePlacement from "persistence/types/FacePlacement";

import { CanvasComponent } from "sl-web-face";
import {loadFaceFromName} from "../../facesCommon/interactions/fileInteractions";
import {getRevisionManager, UNSELECTED} from "./revisionUtil";
import {UNSPECIFIED_NAME} from "../../persistence/projects";
import {getPartUiManager} from "./coreUtil";

function _drawSolidBackground(context:CanvasRenderingContext2D) {
  context.fillStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

const CHOOSE_BACKGROUND_TEXT = 'No Background Image';
function _drawNoBackground(context:CanvasRenderingContext2D) {
  const textMetrics = context.measureText(CHOOSE_BACKGROUND_TEXT);
  _drawSolidBackground(context);
  context.fillStyle = 'grey';
  context.fillText(CHOOSE_BACKGROUND_TEXT, (context.canvas.width - textMetrics.width) / 2, context.canvas.height / 2);
}

function _drawBackground(context:CanvasRenderingContext2D, backgroundImage:ImageBitmap) {
  const { width:canvasWidth, height:canvasHeight } = context.canvas;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const { width:backgroundWidth, height:backgroundHeight } = backgroundImage;
  const [scaledWidth, scaledHeight] = scaleDimensionsToFit(backgroundWidth, backgroundHeight, canvasWidth, canvasHeight);
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;
  context.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight);
}

function _findFacePlacementByName(facePlacements:FacePlacement[], faceName:string):FacePlacement|null {
  for(let faceNo = 0; faceNo < facePlacements.length; ++faceNo) {
    const facePlacement = facePlacements[faceNo];
    if (facePlacement.characterName === faceName) return facePlacement;
  }
  return null;
}

export async function onAddFace(faceName:string, setModalDialog:Function, setRevision:Function) {
  const headComponent = await loadFaceFromName(faceName);
  if (!headComponent) throw Error('Unexpected');
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  const locationFaces = {...currentRevision.locationFaces};
  locationFaces[faceName] = headComponent.duplicate();
  const facePlacements = [...currentRevision.location.facePlacements];
  let facePlacement = _findFacePlacementByName(facePlacements, faceName);
  if (!facePlacement) {
    facePlacement = { characterName:faceName, x: 0, y: 0, width:0, height:0 };
    facePlacements.push(facePlacement);
  }
  facePlacement.width = headComponent.width;
  facePlacement.height = headComponent.height;
  const location = {...currentRevision.location, facePlacements};
  revisionManager.addChanges({locationFaces, location});
  setRevision(revisionManager.currentRevision);
  setModalDialog(null);
}

export function onDrawPlacementCanvas(context:CanvasRenderingContext2D, backgroundImage:ImageBitmap|null, locationFaces:LocationFaces, facePlacements:FacePlacement[]) {
  if (backgroundImage) {
    _drawBackground(context, backgroundImage);
  } else {
    _drawNoBackground(context);
  }
  for(let faceNo = 0; faceNo < facePlacements.length; ++faceNo) {
    const { characterName} = facePlacements[faceNo];
    const headComponent:CanvasComponent|null = locationFaces[characterName];
    if (!headComponent) continue; // TODO - after you get initialization working, this should throw an error.
    // TODO - scaling of background would need to be applied to headComponent. This needs some thinking about separating view coordinates from
    // scene coordinates. Also don't want to redo all the scaling calcs on every frame.
    // TODO - set placement of headComponent from part UI interactions.
    headComponent.render(context);
  }
}

function _findFaceNameForCanvasComponent(locationFaces:LocationFaces, canvasComponent:CanvasComponent):string {
  for(const faceName in locationFaces) {
    const faceComponent = locationFaces[faceName];
    if (!faceComponent) throw Error('Unexpected');
    if (faceComponent.id === canvasComponent.id) return faceName; 
  }
  return UNSPECIFIED_NAME;
}

function _findFaceNoForName(facePlacements:FacePlacement[], faceName:string):number {
  for(let faceNo = 0; faceNo < facePlacements.length; ++faceNo) {
    const facePlacement = facePlacements[faceNo];
    if (facePlacement.characterName === faceName) return faceNo;
  }
  return UNSELECTED;
}

function _findFaceMatchingCanvasComponent(locationFaces:LocationFaces, facePlacements:FacePlacement[], canvasComponent:CanvasComponent):number {
  let matchedFaceName = _findFaceNameForCanvasComponent(locationFaces, canvasComponent);
  return _findFaceNoForName(facePlacements, matchedFaceName);
}

export function onPartFocused(part:CanvasComponent|null, setRevision:Function):void {
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  const {location, locationFaces} = currentRevision;
  const selectedFaceNo = part === null ? UNSELECTED : _findFaceMatchingCanvasComponent(locationFaces, location.facePlacements, part);
  if (currentRevision.selectedFaceNo !== selectedFaceNo) {
    revisionManager.addChanges({selectedFaceNo});
    setRevision(revisionManager.currentRevision);
  }
}

function _updateLocationForPartMovement(part:CanvasComponent, x:number, y:number, width:number, height:number, setRevision:Function) {
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  const location = {...currentRevision.location};
  const facePlacements = location.facePlacements = [...location.facePlacements];
  const faceNo = _findFaceMatchingCanvasComponent(currentRevision.locationFaces, facePlacements, part);
  if (faceNo === UNSELECTED) throw Error('Unexpected');
  const facePlacement = facePlacements[faceNo];
  if (x === facePlacement.x && y === facePlacement.y && width === facePlacement.width && height === facePlacement.height) return;
  facePlacements[faceNo] = {...facePlacement, x, y, width, height};
  revisionManager.addChanges({location});
  setRevision(revisionManager.currentRevision);
}

export function onPartMoved(part:CanvasComponent, x:number, y:number, setRevision:Function):boolean {
  _updateLocationForPartMovement(part, x, y, part.width, part.height, setRevision);
  return true;
}

export function onPartResized(part:CanvasComponent, x:number, y:number, width:number, height:number, setRevision:Function):boolean {
  _updateLocationForPartMovement(part, x, y, width, height, setRevision);
  return true;
}

export function onRemoveFace(faceNo:number, setRevision:Function) {
  if (faceNo === UNSELECTED) throw Error('Unexpected');
  const revisionManager = getRevisionManager();
  const currentRevision = revisionManager.currentRevision;
  const location = {...currentRevision.location};
  const facePlacements = location.facePlacements = [...location.facePlacements];
  const locationFaces = {...currentRevision.locationFaces};
  const faceName = facePlacements[faceNo].characterName;
  const headComponent = locationFaces[faceName];
  if (headComponent) getPartUiManager().removePart(headComponent);
  delete locationFaces[faceName];
  facePlacements.splice(faceNo, 1);
  revisionManager.addChanges({locationFaces, location, selectedFaceNo:UNSELECTED});
  setRevision(revisionManager.currentRevision);
}
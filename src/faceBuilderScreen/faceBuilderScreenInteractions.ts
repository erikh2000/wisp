import {
  AttentionController,
  BlinkController,
  CanvasComponent,
  Emotion,
  EYES_PART_TYPE,
  HEAD_PART_TYPE,
  LidLevel,
  loadFaceFromUrl,
  MOUTH_PART_TYPE,
  publishEvent,
  Topic
} from "sl-web-face";
import {PartType} from "./PartSelector";
import {loadSelectionBox} from "./SelectionBoxCanvasComponent";
import {TestVoiceType} from "./TestVoiceSelector";
import RevisionManager from "documents/RevisionManager";
import CanvasDragHandler from "./CanvasDragHandler";

export type FaceScreenRevision = {
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType
};

export type InitResults = {
  onFaceCanvasMouseMove:any
}

let head:CanvasComponent|null = null;
let selectionBox:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();
const revisionManager:RevisionManager<FaceScreenRevision> = new RevisionManager<FaceScreenRevision>();
let faceCanvasDragHandler:CanvasDragHandler|null = null;

function _findDraggableComponents(components:CanvasComponent[]):CanvasComponent[] {
  return components.filter(component => !component.partType.startsWith('ui:'));
} 

function _onFaceCanvasDragged(component:CanvasComponent, x:number, y:number):boolean {
  // TODO revision tracking
  return true;
}

export async function init():Promise<InitResults> {
  function onFaceCanvasMouseMove(event:any) { faceCanvasDragHandler?.onMouseMove(event); }
  
  if (isInitialized) return { onFaceCanvasMouseMove:faceCanvasDragHandler }
  
  head = await loadFaceFromUrl('/faces/billy.yml');
  selectionBox = await loadSelectionBox(head.width, head.height);
  selectionBox.setParent(head);
  _updateSelectionBox(head, selectionBox);
  blinkController.start();
  attentionController.start();
  const draggableComponents = _findDraggableComponents(head.children);
  faceCanvasDragHandler = new CanvasDragHandler(draggableComponents, _onFaceCanvasDragged);
  isInitialized = true;
  
  return { onFaceCanvasMouseMove }
}

function _publishFaceEventsForRevision(revision:FaceScreenRevision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

export function onUndo(setRevision:any) {
  const nextRevision = revisionManager.prev();
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function onRedo(setRevision:any) {
  const nextRevision = revisionManager.next();
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function isHeadReady():boolean {
  return isInitialized && head !== null;
} 
function _getHeadIfReady():CanvasComponent|null {
  return isHeadReady() ? head : null;
}

function _getSelectedPartType():PartType {
  const revision = revisionManager.currentRevision;
  return revision ? revision.partType : PartType.HEAD;
}

function _findCanvasComponentForPartType(headComponent:CanvasComponent, partType:PartType):CanvasComponent|null {
  if (partType === PartType.HEAD) return headComponent;
  
  let extraNo = 0;
  const childCount = headComponent.children.length;
  for(let childI = 0; childI < childCount; ++childI) {
    const child = headComponent.children[childI];
    if (!child) continue;
    
    const childPartType = child.partType;
    if (childPartType.startsWith('ui:')) continue;
    
    if (childPartType !== EYES_PART_TYPE && childPartType !== MOUTH_PART_TYPE) ++extraNo;
    
    switch(partType) {
      case PartType.EYES: 
        if (childPartType !== EYES_PART_TYPE) continue;
      break;
      
      case PartType.MOUTH:
        if (childPartType !== MOUTH_PART_TYPE) continue;
        break;
        
      default:
        const partExtraNo = (partType - PartType.EXTRA1) + 1; 
        if (extraNo !== partExtraNo) continue;
        break;
    }
    return child;
  }
  return null;
}

function _updateSelectionBox(headComponent:CanvasComponent, selectionBoxComponent:CanvasComponent) {
  const partType = _getSelectedPartType();
  const selectedComponent = _findCanvasComponentForPartType(headComponent, partType) ?? headComponent;
  const selectedWidth = selectedComponent.width, selectedHeight = selectedComponent.height;
  const isHead = selectedComponent.partType === HEAD_PART_TYPE;
  selectionBoxComponent.offsetX = isHead ? 0 : selectedComponent.offsetX;
  selectionBoxComponent.offsetY = isHead ? 0 : selectedComponent.offsetY;
  selectionBoxComponent.width = selectedComponent.width;
  selectionBoxComponent.height = selectedComponent.height;
}

function _centerCanvasComponent(component:CanvasComponent, canvasWidth:number, canvasHeight:number) {
  const componentWidth = component.width, componentHeight = component.height;
  component.offsetX = Math.round((canvasWidth - componentWidth) / 2);
  component.offsetY = Math.round((canvasHeight - componentHeight) / 2);
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const head = _getHeadIfReady();
  if (!head || !selectionBox) return;
  _centerCanvasComponent(head, canvasWidth, canvasHeight);
  head.renderWithChildren(context);
}

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  revisionManager.addChanges({testVoice});
  setRevision(revisionManager.currentRevision);
}

function _updateForFaceRelatedRevision(changes:any, setRevision:any) {
  revisionManager.addChanges(changes);
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  _updateForFaceRelatedRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  _updateForFaceRelatedRevision({lidLevel}, setRevision);
}

export function onPartTypeChange(partType:PartType, setRevision:any) {
  revisionManager.addChanges({partType});
  if (head && selectionBox) _updateSelectionBox(head, selectionBox);
  setRevision(revisionManager.currentRevision);
}

export function getRevisionForMount():FaceScreenRevision {
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    partType: PartType.HEAD,
    testVoice: TestVoiceType.MUTED
  };
  revisionManager.add(revision);
  return revision;
}

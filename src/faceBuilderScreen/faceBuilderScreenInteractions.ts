import {
  AttentionController,
  BlinkController,
  CanvasComponent,
  createFaceDocument,
  Emotion,
  EYES_PART_TYPE,
  FaceDocument,
  HEAD_PART_TYPE,
  LidLevel,
  loadFaceFromUrl,
  MOUTH_PART_TYPE,
  publishEvent,
  Topic,
  updateFaceFromDocument
} from "sl-web-face";
import {PartType} from "./PartSelector";
import {loadSelectionBox} from "./SelectionBoxCanvasComponent";
import {TestVoiceType} from "./TestVoiceSelector";
import RevisionManager from "documents/RevisionManager";
import CanvasDragHandler from "./CanvasDragHandler";

export type Revision = {
  document:FaceDocument|null, // A null document indicates no document is loaded. Used only for initial revision. 
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType
};

export type InitResults = {
  onFaceCanvasMouseMove:any,
  onFaceCanvasMouseDown:any,
  onFaceCanvasMouseUp:any
}

let head:CanvasComponent|null = null;
let selectionBox:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();
const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>();
let faceCanvasDragHandler:CanvasDragHandler|null = null;

function _findDraggableComponents(headComponent:CanvasComponent):CanvasComponent[] {
  return headComponent.findNonUiChildren();
}

function _updateSelectionBox(headComponent:CanvasComponent, selectionBoxComponent:CanvasComponent) {
  const partType = _getSelectedPartType();
  const selectedComponent = _findCanvasComponentForPartType(headComponent, partType) ?? headComponent;
  const selectedWidth = selectedComponent.width, selectedHeight = selectedComponent.height;
  const isHead = selectedComponent.partType === HEAD_PART_TYPE;
  selectionBoxComponent.offsetX = isHead ? 0 : selectedComponent.offsetX;
  selectionBoxComponent.offsetY = isHead ? 0 : selectedComponent.offsetY;
  selectionBoxComponent.width = selectedWidth;
  selectionBoxComponent.height = selectedHeight;
}

function _onFaceCanvasDragged(component:CanvasComponent, x:number, y:number, setRevision:any):boolean {
  if (!head || !selectionBox) return false;
  _updateSelectionBox(head, selectionBox);
  const document = createFaceDocument(head);
  revisionManager.addChanges({document});
  setRevision(revisionManager.currentRevision);
  return true;
}

function _findPartTypeForCanvasComponent(component:CanvasComponent, components:CanvasComponent[]):PartType {
  const componentCount = components.length;
  let extraCount = 0;
  for(let componentI = 0; componentI < componentCount; ++componentI) {
    const against = components[componentI];
    const isMatch = against === component;
    const partType = against.partType;
    if (against.isUi) continue;
    if (partType === EYES_PART_TYPE) {
      if (isMatch) return PartType.EYES;
      continue;
    }
    if (partType === MOUTH_PART_TYPE) {
      if (isMatch) return PartType.MOUTH;
      continue;
    }
    ++extraCount;
    if (isMatch) {
      if (extraCount > 5) return PartType.HEAD;
      return PartType.EXTRA1 + extraCount - 1;
    }
  }
  return PartType.HEAD;
}

export function onPartTypeChange(partType:PartType, setRevision:any) {
  const document = head ? createFaceDocument(head) : undefined;
  revisionManager.addChanges({partType, document});
  if (head && selectionBox) _updateSelectionBox(head, selectionBox);
  setRevision(revisionManager.currentRevision);
}

function _onFaceCanvasStartDrag(component:CanvasComponent, setRevision:any):boolean {
  if (!head || !selectionBox) return false;
  const currentPartType = revisionManager.currentRevision?.partType;
  const partType = _findPartTypeForCanvasComponent(component, head.children);
  if (partType !== currentPartType) {
    const document = head ? createFaceDocument(head) : undefined;
    revisionManager.addChanges({partType, document});
    _updateSelectionBox(head, selectionBox);
    setRevision(revisionManager.currentRevision);
  }
  return true;
}

export async function init(setRevision:any):Promise<InitResults> {
  function onFaceCanvasMouseMove(event:any) { faceCanvasDragHandler?.onMouseMove(event); }
  function onFaceCanvasMouseUp(event:any) { faceCanvasDragHandler?.onMouseUp(event); }
  function onFaceCanvasMouseDown(event:any) { faceCanvasDragHandler?.onMouseDown(event); }
  const initResults:InitResults = { onFaceCanvasMouseMove, onFaceCanvasMouseDown, onFaceCanvasMouseUp };
  
  if (isInitialized) return initResults
  
  head = await loadFaceFromUrl('/faces/billy.yml');
  selectionBox = await loadSelectionBox(head.width, head.height);
  selectionBox.setParent(head);
  _updateSelectionBox(head, selectionBox);
  blinkController.start();
  attentionController.start();
  const draggableComponents = _findDraggableComponents(head);
  faceCanvasDragHandler = new CanvasDragHandler(draggableComponents, 
    (component) => _onFaceCanvasStartDrag(component, setRevision),
    (component, x, y) =>_onFaceCanvasDragged(component, x, y, setRevision));
  
  const nextRevision:Revision = {
    emotion:Emotion.NEUTRAL,
    partType:PartType.HEAD,
    lidLevel:LidLevel.NORMAL,
    testVoice:TestVoiceType.MUTED,
    document: createFaceDocument(head)
  }
  setRevision(nextRevision);
  
  isInitialized = true;
  
  return initResults;
}

function _publishFaceEventsForRevision(revision:Revision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

function _updateEverythingToMatchRevision(revision:Revision|null, setRevision:any) {
  if (!revision) return;
  if (head && revision.document) updateFaceFromDocument(head, revision.document);
  _publishFaceEventsForRevision(revision);
  if (head && selectionBox) _updateSelectionBox(head, selectionBox);
  setRevision(revision);
}

export function onUndo(setRevision:any) { _updateEverythingToMatchRevision(revisionManager.prev(), setRevision); }

export function onRedo(setRevision:any) { _updateEverythingToMatchRevision(revisionManager.next(), setRevision); }

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
    if (child.isUi) continue;
    
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
  const document = head ? createFaceDocument(head) : undefined;
  revisionManager.addChanges({testVoice, document});
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
  const document = head ? createFaceDocument(head) : undefined;
  _updateForFaceRelatedRevision({emotion, document}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  const document = head ? createFaceDocument(head) : undefined;
  _updateForFaceRelatedRevision({lidLevel, document}, setRevision);
}

export function getRevisionForMount():Revision {
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    partType: PartType.HEAD,
    testVoice: TestVoiceType.MUTED,
    document: null
  };
  revisionManager.add(revision);
  return revision;
}

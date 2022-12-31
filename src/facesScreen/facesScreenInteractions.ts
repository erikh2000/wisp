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
  loadComponentFromPartUrl,
  loadFaceFromUrl,
  MOUTH_PART_TYPE,
  nameToSkinTone,
  NOSE_PART_TYPE,
  publishEvent,
  replaceComponentFromPartUrl,
  Topic,
  updateFaceFromDocument
} from "sl-web-face";
import {PartType} from "./PartSelector";
import {TestVoiceType} from "./TestVoiceSelector";
import NoseChooser from "./NoseChooser";
import RevisionManager from "documents/RevisionManager";
import PartUiManager from "ui/partAuthoring/PartUiManager";
import {updateSelectionBoxesToMatchFace} from "ui/partAuthoring/SelectionBoxCanvasComponent";
import PartLoader, {LoadablePart} from "ui/partAuthoring/PartLoader";

const UNSELECTED = -1;

export type Revision = {
  document:FaceDocument|null, // A null document indicates no document is loaded. Used only for initial revision. 
  emotion:Emotion,
  lidLevel:LidLevel,
  partType:PartType,
  testVoice:TestVoiceType,
  nosePartNo:number
};

export type InitResults = {
  onFaceCanvasMouseMove:any,
  onFaceCanvasMouseDown:any,
  onFaceCanvasMouseUp:any
}

let head:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();
const revisionManager:RevisionManager<Revision> = new RevisionManager<Revision>();
let setDisabled:any = null;
let partUiManager:PartUiManager|null = null;
let partLoader:PartLoader|null = null;

async function _performDisablingOperation(taskFunction:any):Promise<any> {
  if (!setDisabled) throw Error('Unexpected');
  setDisabled(true);
  let result:any = undefined;
  try {
    result = await taskFunction();
  } finally {
    setDisabled(false);  
  }
  return result;
}

function _findPartComponents(headComponent:CanvasComponent):CanvasComponent[] {
  return headComponent.findNonUiChildren();
}

function _onPartMoved(component:CanvasComponent, x:number, y:number, setRevision:any):boolean {
  if (!head) return false;
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
    if (partType === NOSE_PART_TYPE) {
      if (isMatch) return PartType.NOSE;
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
  if (head) {
    const nextFocusPart = _findCanvasComponentForPartType(head, partType);
    if (partUiManager && nextFocusPart) partUiManager.setFocus(nextFocusPart);
  }
  setRevision(revisionManager.currentRevision);
}

function _onPartFocused(component:CanvasComponent, setRevision:any):boolean {
  if (!head) return false;
  const currentPartType = revisionManager.currentRevision?.partType;
  const partType = _findPartTypeForCanvasComponent(component, head.children);
  if (partType !== currentPartType) {
    const document = head ? createFaceDocument(head) : undefined;
    revisionManager.addChanges({partType, document});
    setRevision(revisionManager.currentRevision);
  }
  return true;
}

function _onPartResized(setRevision:any):boolean {
  if (!head) return false;
  const document = createFaceDocument(head);
  revisionManager.addChanges({document});
  setRevision(revisionManager.currentRevision);
  return true;
}

function _addDocumentMouseUpListener(onMouseUp:(event:any) => void) {
  document.addEventListener("mouseup", onMouseUp);
}

function _removeDocumentMouseUpListener(onMouseUp:(event:any) => void) {
  document.removeEventListener("mouseup", onMouseUp);
}

function _onFaceCanvasMouseMove(event:any) { partUiManager?.onMouseMove(event); }

function _findLoadablePartNo(loadableParts:LoadablePart[], headComponent:CanvasComponent, partType:PartType):number {
  const component = _findCanvasComponentForPartType(headComponent, partType);
  if (!component) return UNSELECTED;
  return loadableParts.findIndex(loadablePart => loadablePart.url === component.partUrl);
}

export async function init(setRevision:any, setNoseParts:any, _setDisabled:any):Promise<InitResults> {
  
  function onFaceCanvasMouseUp(event:any) { partUiManager?.onMouseUp(event); }
  function onFaceCanvasMouseDown(event:any) { partUiManager?.onMouseDown(event); }
  function onPartFocused(part:CanvasComponent) { _onPartFocused(part, setRevision); }
  function onPartMoved(part:CanvasComponent, x:number, y:number) { return _onPartMoved(part, x, y, setRevision); }
  function onPartResized(part:CanvasComponent, _x:number, _y:number, _width:number, _height:number) { return _onPartResized(setRevision); }
  function onPartLoaderUpdated(partTypeName:string, _partName:string) {
    if (!partLoader) return;
    switch(partTypeName) {
      case NOSE_PART_TYPE:
        setNoseParts([...partLoader.noses]);
        break;
    }
  }
  
  const initResults:InitResults = { onFaceCanvasMouseMove:_onFaceCanvasMouseMove, onFaceCanvasMouseDown, onFaceCanvasMouseUp };
  
  _addDocumentMouseUpListener(onFaceCanvasMouseUp);
  if (isInitialized) return initResults
  
  setDisabled = _setDisabled;
  
  head = await loadFaceFromUrl('/faces/billy.yml');
  blinkController.start();
  attentionController.start();
  partUiManager = new PartUiManager(onPartFocused, onPartMoved, onPartResized);
  await partUiManager.trackPartsForFace(head);
  partUiManager.setFocus(head);
  partLoader = new PartLoader(onPartLoaderUpdated);
  await partLoader.loadManifest('/parts/part-manifest.yml');

  const nextRevision:Revision = {
    emotion:Emotion.NEUTRAL,
    partType:PartType.HEAD,
    lidLevel:LidLevel.NORMAL,
    testVoice:TestVoiceType.MUTED,
    document: createFaceDocument(head),
    nosePartNo: _findLoadablePartNo(partLoader.noses, head, PartType.NOSE)
  }
  revisionManager.clear();
  revisionManager.add(nextRevision);
  setRevision(nextRevision);
  
  isInitialized = true;
  
  return initResults;
}

export function deinit() {
  if (!partUiManager) return;
  _removeDocumentMouseUpListener(_onFaceCanvasMouseMove);
}

function _publishFaceEventsForRevision(revision:Revision) {
  publishEvent(Topic.EMOTION, revision.emotion);
  publishEvent(Topic.LID_LEVEL, revision.lidLevel);
}

async function _changePart(partUrl:string, partType:PartType) {
  if (!head || !partUiManager) return;
  const skinTone = nameToSkinTone(head.skinTone);
  
  const currentComponent = _findCanvasComponentForPartType(head, partType);
  if (currentComponent) {
    const replacedComponent = await replaceComponentFromPartUrl(currentComponent, partUrl);
    if (replacedComponent.partType === HEAD_PART_TYPE) head = replacedComponent;
  } else {
    const newComponent = await loadComponentFromPartUrl(partUrl, skinTone);
    if (newComponent.partType !== HEAD_PART_TYPE) newComponent.setParent(head); 
  }
  await partUiManager.trackPartsForFace(head);
}

async function _updateEverythingToMatchRevision(revision:Revision|null, setRevision:any) {
  if (!revision || !head || !partUiManager) return;
  if (revision.document) await updateFaceFromDocument(head, revision.document);
  await partUiManager.trackPartsForFace(head);
  updateSelectionBoxesToMatchFace(head);
  _publishFaceEventsForRevision(revision);
  const nextFocusPart = _findCanvasComponentForPartType(head, revision.partType);
  if (partUiManager && nextFocusPart) partUiManager.setFocus(nextFocusPart);
  setRevision(revision);
}

export function onUndo(setRevision:any) {
  _performDisablingOperation(async () => _updateEverythingToMatchRevision(revisionManager.prev(), setRevision)); 
}

export function onRedo(setRevision:any) {
  _performDisablingOperation(async () => _updateEverythingToMatchRevision(revisionManager.next(), setRevision)); 
}

export function isHeadReady():boolean { return isInitialized && head !== null; }

function _getHeadIfReady():CanvasComponent|null { return isHeadReady() ? head : null; }

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
        
      case PartType.NOSE:
        if (childPartType !== NOSE_PART_TYPE) continue;
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
  if (!head) return;
  _centerCanvasComponent(head, canvasWidth, canvasHeight);
  head.render(context);
}

function _updateForFaceRelatedRevision(changes:any, setRevision:any) {
  const document = head ? createFaceDocument(head) : undefined;
  revisionManager.addChanges({document, ...changes});
  const nextRevision = revisionManager.currentRevision;
  if (!nextRevision) return;
  _publishFaceEventsForRevision(nextRevision);
  setRevision(nextRevision);
}

export function onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  _updateForFaceRelatedRevision({testVoice}, setRevision);
}

export function onEmotionChange(emotion:Emotion, setRevision:any) {
  _updateForFaceRelatedRevision({emotion}, setRevision);
}

export function onLidLevelChange(lidLevel:LidLevel, setRevision:any) {
  _updateForFaceRelatedRevision({lidLevel}, setRevision);
}

export function getRevisionForMount():Revision {
  let revision = revisionManager.currentRevision;
  if (revision) return revision;
  revision = {
    emotion: Emotion.NEUTRAL,
    lidLevel: LidLevel.NORMAL,
    partType: PartType.HEAD,
    testVoice: TestVoiceType.MUTED,
    document: null,
    nosePartNo: UNSELECTED
  };
  revisionManager.add(revision);
  return revision;
}

export function onReplaceNose(setModalDialog:any) {
  setModalDialog(NoseChooser.name);
}
 
export function onNoseChanged(noseParts:LoadablePart[], partNo:number, setModalDialog:any, setRevision:any) {
  setModalDialog(null);
  const partUrl = noseParts[partNo].url;
  _performDisablingOperation(async () => {
    _changePart(partUrl, PartType.NOSE)
      .then(() => _updateForFaceRelatedRevision({nosePartNo:partNo}, setRevision));
  });
}

export function onRemoveNose(setRevision:any) {
  if (!head) return;
  const noseComponent = _findCanvasComponentForPartType(head, PartType.NOSE);
  if (!noseComponent) return;
  noseComponent.setParent(null);
  _performDisablingOperation(async () => {
      _updateForFaceRelatedRevision({nosePartNo:UNSELECTED}, setRevision);
  });
}

export function findPartNoByType(parts:LoadablePart[], partType:PartType):number {
  if (!head) return -1;
  const component = _findCanvasComponentForPartType(head, partType);
  if (!component) return -1;
  const matchUrl = component.partUrl;
  return parts.findIndex(part => part.url === matchUrl);
}
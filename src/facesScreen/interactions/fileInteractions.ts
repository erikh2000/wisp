import {getHead, getPartUiManager, performDisablingOperation, setHead} from "./coreUtil";
import {getRevisionManager, setUpRevisionForNewFace} from "./revisionUtil";
import NewFaceDialog from "facesScreen/dialogs/NewFaceDialog";
import {DEFAULT_FACE_URL, loadFaceFromName, loadDefaultFace} from "facesCommon/interactions/fileInteractions";
import {deleteFace} from "persistence/faces";
import {MIMETYPE_WISP_FACE} from "persistence/mimeTypes";
import {renameActiveFaceName, setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import Screen, {screenConfigs} from "ui/screen/screens";
import {infoToast} from "ui/toasts/toastUtil";

import {CanvasComponent, createFaceDocument, loadFaceFromDefinition, loadFaceFromUrl} from "sl-web-face";
import {NavigateFunction} from "react-router";
import {stringify} from 'yaml';

export function onNewFaceName(faceName:string, setModalDialog:any, setDocumentName:any) {
  setActiveFaceName(faceName).then(() => {
    const revisionManager = getRevisionManager();
    return revisionManager.persistCurrent();
  }).then(() => {
    setDocumentName(faceName);
    setModalDialog(null);
    infoToast('New face created.');
  });
}

export function onRenameFace(nextFaceName:string, setModalDialog:any, setDocumentName:any) {
  renameActiveFaceName(nextFaceName).then(() => {
    setDocumentName(nextFaceName);
    setModalDialog(null);
    infoToast('Face renamed.');
  });
}

export async function _loadFaceFromFaceDefFileHandle(fileHandle:FileSystemFileHandle):Promise<CanvasComponent> {
  const file = await fileHandle.getFile();
  const faceDef:string|null = await file.text();
  return await loadFaceFromDefinition(faceDef);
}

async function _selectFaceFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    multiple:false,
    types: [{
      description: 'Face Definitions',
      accept: {[MIMETYPE_WISP_FACE]: ['.face']}
    }]
  };
  try {
    const handles:FileSystemFileHandle[] = await ((window as any).showOpenFilePicker(openFileOptions));
    return handles[0];
  } catch(_ignoredAbortError) {
    return null;
  }
}

export async function _selectNewFaceFileHandle(suggestedFilename:string):Promise<FileSystemFileHandle|null> {
  try {
    const saveFileOptions = {
      suggestedName:suggestedFilename,
      excludeAcceptAllOption: true,
      multiple:false,
      types: [{
        description: 'Face Definitions',
        accept: {[MIMETYPE_WISP_FACE]: ['.face']}
      }]
    };
    return await (window as any).showSaveFilePicker(saveFileOptions);
  } catch(_ignoredAbortError) {
    return null;
  }
}

async function _setUpForNewFace(loadHeadFunc:() => Promise<CanvasComponent>, setDocumentName:any, setRevision:any):Promise<void> {
  await performDisablingOperation(async () => {
    const revisionManager = getRevisionManager();
    await revisionManager.persistCurrent();
    setDocumentName(UNSPECIFIED_NAME); // If anything fails, it's better to leave the document name cleared to avoid overwriting a previous face.
    await setActiveFaceName(UNSPECIFIED_NAME);
    const partUiManager = getPartUiManager();
    revisionManager.clear();
    const head = await loadHeadFunc();
    await partUiManager.trackPartsForFace(head);
    setHead(head);
    await setUpRevisionForNewFace(head, setRevision);
    partUiManager.setFocus(head);
  });
}

export async function onNewFace(setModalDialog:any, setDocumentName:any, setRevision:any):Promise<void> {
  await _setUpForNewFace(() => loadFaceFromUrl(DEFAULT_FACE_URL), setDocumentName, setRevision);
  setModalDialog(NewFaceDialog.name);
}

async function _loadHead(faceName:string):Promise<CanvasComponent> {
  return await loadFaceFromName(faceName) ?? await loadDefaultFace();
}

export async function onOpenFace(faceName:string, setModalDialog:any, setDocumentName:any, setRevision:any):Promise<void> {
  if (faceName === UNSPECIFIED_NAME) throw Error('Unexpected');
  setModalDialog(null);
  await _setUpForNewFace(() => _loadHead(faceName), setDocumentName, setRevision);
  setDocumentName(faceName);
  await setActiveFaceName(faceName);
}

export async function onCancelOpenFace(documentName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function):Promise<void> {
  setModalDialog(null);
  if (documentName === UNSPECIFIED_NAME) {
    return onNewFace(setModalDialog, setDocumentName, setRevision);
  }
}

export async function onConfirmDeleteFace(faceName:string, navigate:NavigateFunction):Promise<void> {
  try {
    await deleteFace(faceName);
    await setActiveFaceName(UNSPECIFIED_NAME);
    const revisionManager = getRevisionManager();
    revisionManager.clear();
  } finally {
    navigate(screenConfigs[Screen.HOME].url);
  }
}

export async function importFace(setModalDialog:any, setDocumentName:any, setRevision:any):Promise<void> {
  await performDisablingOperation(async () => {
    const faceFileHandle = await _selectFaceFileHandle();
    if (!faceFileHandle) return;
    await _setUpForNewFace(() => _loadFaceFromFaceDefFileHandle(faceFileHandle), setDocumentName, setRevision);
    setModalDialog(NewFaceDialog.name);
    infoToast('Face imported.');
  });
}

export async function exportFace(documentName:string):Promise<void> {
  await performDisablingOperation(async () => {
    let fileHandle = await _selectNewFaceFileHandle(documentName);
    if (!fileHandle) return;
    const head = getHead();
    const faceDef = createFaceDocument(head);
    const faceDefYml = stringify(faceDef);
    const writable = await (fileHandle as any).createWritable();
    await writable.write(faceDefYml);
    await writable.close();
    infoToast('Face exported.');
  });
}
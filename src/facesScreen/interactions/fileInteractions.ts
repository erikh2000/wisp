import {getPartUiManager, performDisablingOperation, setHead} from "./coreUtil";
import {getRevisionManager, setUpRevisionForNewFace} from "./revisionUtil";
import NewFaceDialog from "facesScreen/fileDialogs/NewFaceDialog";
import {deleteFace, getFaceDefinition} from "persistence/faces";
import {MIMETYPE_WISP_FACE} from "persistence/mimeTypes";
import {renameActiveFaceName, setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import Screen, {screenConfigs} from "ui/screen/screens";

import {CanvasComponent, loadFaceFromDefinition, loadFaceFromUrl} from "sl-web-face";
import {NavigateFunction} from "react-router";

const DEFAULT_FACE_URL = '/faces/default.face';

export function onNewFaceName(faceName:string, setModalDialog:any, setDocumentName:any) {
  setActiveFaceName(faceName).then(() => {
    setDocumentName(faceName);
    setModalDialog(null);
  });
}

export function onRenameFace(nextFaceName:string, setModalDialog:any, setDocumentName:any) {
  renameActiveFaceName(nextFaceName).then(() => {
    setDocumentName(nextFaceName);
    setModalDialog(null);
  });
}

export async function loadFaceFromName(faceName:string):Promise<CanvasComponent> {
  if (faceName === UNSPECIFIED_NAME) return loadFaceFromUrl(DEFAULT_FACE_URL);
  let faceDef:string|null = null;
  try {
    faceDef = await getFaceDefinition(faceName);
  } catch(err) {
    console.warn(`Could not find "${faceName}" in browser persistent storage. Loading default face.`);
    return loadFaceFromUrl(DEFAULT_FACE_URL);
  }
  if (!faceDef) throw Error('Unexpected');
  return await loadFaceFromDefinition(faceDef);
}

export async function _loadFaceFromFaceDefFileHandle(fileHandle:FileSystemFileHandle):Promise<CanvasComponent> {
  const file = await fileHandle.getFile();
  const faceDef:string|null = await file.text();
  return await loadFaceFromDefinition(faceDef);
}

async function _selectFaceFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    types: [{
      description: 'Face Files',
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

async function _setUpForNewFace(loadHeadFunc:() => Promise<CanvasComponent>, setDocumentName:any, setRevision:any) {
  await performDisablingOperation(async () => {
    setDocumentName(UNSPECIFIED_NAME); // If anything fails, it's better to leave the document name cleared to avoid overwriting a previous face.
    await setActiveFaceName(UNSPECIFIED_NAME);
    const partUiManager = getPartUiManager();
    const revisionManager = getRevisionManager();
    await revisionManager.waitForPersist();
    revisionManager.clear();
    const head = await loadHeadFunc();
    await partUiManager.trackPartsForFace(head);
    setHead(head);
    await setUpRevisionForNewFace(head, setRevision);
    partUiManager.setFocus(head);
  });
}

export async function onNewFace(setModalDialog:any, setDocumentName:any, setRevision:any) {
  await _setUpForNewFace(() => loadFaceFromUrl(DEFAULT_FACE_URL), setDocumentName, setRevision);
  setModalDialog(NewFaceDialog.name);
}

export async function onOpenFace(faceName:string, setModalDialog:any, setDocumentName:any, setRevision:any) {
  if (faceName === UNSPECIFIED_NAME) throw Error('Unexpected');
  setModalDialog(null);
  await _setUpForNewFace(() => loadFaceFromName(faceName), setDocumentName, setRevision);
  setDocumentName(faceName);
  await setActiveFaceName(faceName);
}

export async function onConfirmDeleteFace(faceName:string, navigate:NavigateFunction) {
  try {
    await deleteFace(faceName);
    await setActiveFaceName(UNSPECIFIED_NAME);
    const revisionManager = getRevisionManager();
    revisionManager.clear();
  } finally {
    navigate(screenConfigs[Screen.HOME].url);
  }
}

export async function importFace(setModalDialog:any, setDocumentName:any, setRevision:any) {
  const faceFileHandle = await _selectFaceFileHandle();
  if (faceFileHandle === null) return;
  await _setUpForNewFace(() => _loadFaceFromFaceDefFileHandle(faceFileHandle), setDocumentName, setRevision);
  setModalDialog(NewFaceDialog.name);
}
import {getPartUiManager, performDisablingOperation, setHead} from "./coreUtil";
import {getRevisionManager, setUpRevisionForNewFace} from "./revisionUtil";
import NewFaceDialog from "facesScreen/fileDialogs/NewFaceDialog";
import {getFaceDefinition} from "persistence/faces";
import {renameActiveFaceName, setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";

import {CanvasComponent, loadFaceFromDefinition, loadFaceFromUrl} from "sl-web-face";

const DEFAULT_FACE_URL = '/faces/default.yml';

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

export async function loadFace(faceName:string):Promise<CanvasComponent> {
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

export async function onNewFace(setModalDialog:any, setDocumentName:any, setRevision:any) {
  await performDisablingOperation(async () => {
    const partUiManager = getPartUiManager();
    const revisionManager = getRevisionManager();
    await revisionManager.waitForPersist();
    revisionManager.clear();
    const head = await loadFaceFromUrl(DEFAULT_FACE_URL);
    await partUiManager.trackPartsForFace(head);
    setHead(head);
    setDocumentName(UNSPECIFIED_NAME);
    await setUpRevisionForNewFace(head, setRevision);
    partUiManager.setFocus(head);
  });
  setModalDialog(NewFaceDialog.name);
}
import {UNSPECIFIED_NAME} from "persistence/projects";
import {getFaceDefinition} from "persistence/faces";

import {CanvasComponent, loadFaceFromDefinition, loadFaceFromUrl} from "sl-web-face";

export const DEFAULT_FACE_URL = '/faces/default.face';

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
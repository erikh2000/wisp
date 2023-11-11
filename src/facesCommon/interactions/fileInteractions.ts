import {UNSPECIFIED_NAME} from "persistence/projects";
import {getFaceDefinitionIfModified} from "persistence/faces";

import {CanvasComponent, loadFaceFromDefinition, loadFaceFromUrl} from "sl-web-face";

export const DEFAULT_FACE_URL = '${process.env.PUBLIC_URL}/faces/default.face';

export async function loadFaceFromNameIfModified(faceName:string, since:number):Promise<CanvasComponent|null> {
  if (faceName === UNSPECIFIED_NAME) return loadFaceFromUrl(DEFAULT_FACE_URL);
  let faceDef:string|null = await getFaceDefinitionIfModified(faceName, since);
  if (!faceDef) return null;
  return await loadFaceFromDefinition(faceDef);
}

export async function loadFaceFromName(faceName:string):Promise<CanvasComponent|null> {
  return await loadFaceFromNameIfModified(faceName, 0);
}

export async function loadDefaultFace():Promise<CanvasComponent> {
  return loadFaceFromUrl(DEFAULT_FACE_URL);
}
import {getAllKeysAtPath, getText, renameKey, setText} from "./pathStore";
import {FACE_PATH_TEMPLATE, FACES_PATH_TEMPLATE} from "./keyPaths";
import {fillTemplate, isValidName, keyToName} from "./pathUtil";
import {MIMETYPE_WISP_FACE} from "./mimeTypes";
import {getActiveProjectName} from "./projects";
import {fetchText} from "common/fetchUtil";

export async function getFaceNames(projectName:string = getActiveProjectName()):Promise<string[]> {
  const facesPath = fillTemplate(FACES_PATH_TEMPLATE, {projectName})
  const keys = await getAllKeysAtPath(facesPath);
  return keys.map(key => keyToName(key));
}

export async function createFace(faceName:string, duplicateFromUrl:string, projectName:string = getActiveProjectName()) {
  if (!isValidName(projectName) || !isValidName(faceName)) throw Error('Unexpected');
  const faceDef = await fetchText(duplicateFromUrl);
  const key = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName});
  await setText(key, faceDef, MIMETYPE_WISP_FACE);
}

export async function getFaceDefinition(faceName:string, projectName:string = getActiveProjectName()):Promise<string> {
  const key = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName});
  const faceDefYaml = await getText(key);
  if (!faceDefYaml) throw Error('Unexpected');
  return faceDefYaml;
}

export async function setFaceDefinition(faceName:string, faceDefYaml:string, projectName:string = getActiveProjectName()) {
  const key = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName});
  await setText(key, faceDefYaml, MIMETYPE_WISP_FACE);
}

export async function renameFace(currentFaceName:string, nextFaceName:string, projectName:string = getActiveProjectName()) {
  const currentKey = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName:currentFaceName});
  const nextKey = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName:nextFaceName});
  await renameKey(currentKey, nextKey);
}
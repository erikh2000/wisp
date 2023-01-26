import {getAllKeysAtPath, getText, setText} from "./pathStore";
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

export async function getFaceDefinition(faceName:string, projectName:string = getActiveProjectName()) {
  const key = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName});
  return await getText(key);
}
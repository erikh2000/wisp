import {getAllKeysAtPath, setText} from "./pathStore";
import {FACE_PATH_TEMPLATE, FACES_PATH_TEMPLATE} from "./keyPaths";
import {fillTemplate, isValidName, keyToName} from "./pathUtil";
import {MIMETYPE_WISP_FACE} from "./mimeTypes";

async function _fetchFaceDef(url:string):Promise<string> {
  const request = await fetch(url);
  if (request.status !== 200 && request.status !== 304) throw Error(`Failed to fetch from "${url}", status code=${request.status}`);
  return await request.text();
}

export async function getFaceNames(projectName:string):Promise<string[]> {
  const facesPath = fillTemplate(FACES_PATH_TEMPLATE, {projectName})
  const keys = await getAllKeysAtPath(facesPath);
  return keys.map(key => keyToName(key));
}

export async function createFace(projectName:string, faceName:string, duplicateFromUrl:string) {
  if (!isValidName(projectName) || !isValidName(faceName)) throw Error('Unexpected');
  const faceDef = await _fetchFaceDef(duplicateFromUrl);
  const key = fillTemplate(FACE_PATH_TEMPLATE, {projectName, faceName});
  await setText(key, faceDef, MIMETYPE_WISP_FACE);
}
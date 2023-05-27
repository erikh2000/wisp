import {getActiveProjectName, getAllProjectKeys} from "./projects";
import {fillTemplate, keyToName} from "./pathUtil";
import {SPIELS_PATH_TEMPLATE, SPIEL_PATH_TEMPLATE} from "./keyPaths";
import {deleteByKey, getAllKeysAtPath, getText, renameKey, setText} from "./pathStore";
import {MIMETYPE_WISP_SPIEL} from "./mimeTypes";

export async function getSpielByKey(key:string):Promise<string> {
  const spielYaml = await getText(key);
  if (!spielYaml) throw Error('Unexpected');
  return spielYaml;
}

export async function getSpiel(spielName:string, projectName:string = getActiveProjectName()):Promise<string> {
  const key = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName});
  return getSpielByKey(key);
}

export async function setSpiel(spielName:string, spielYaml:string, projectName:string = getActiveProjectName()):Promise<void> {
  const key = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName});
  await setText(key, spielYaml, MIMETYPE_WISP_SPIEL);
}

export async function renameSpiel(currentSpielName:string, nextSpielName:string, projectName:string = getActiveProjectName()):Promise<void> {
  const currentKey = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName:currentSpielName});
  const nextKey = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, faceName:nextSpielName});
  await renameKey(currentKey, nextKey);
}

export async function deleteSpiel(spielName:string, projectName:string = getActiveProjectName()):Promise<void> {
  const key = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName});
  await deleteByKey(key);
}

export async function getSpielNames(projectName:string = getActiveProjectName()):Promise<string[]> {
  const spielsPath = fillTemplate(SPIELS_PATH_TEMPLATE, {projectName})
  const keys = await getAllKeysAtPath(spielsPath);
  return keys.map(key => keyToName(key));
}

export async function getAllSpielKeys():Promise<string[]> {
  let spielKeys:string[] = [];
  const projectKeys = await getAllProjectKeys();
  for(let projectKeyI = 0; projectKeyI < projectKeys.length; ++projectKeyI) {
    const projectKey = projectKeys[projectKeyI];
    const spielPath = fillTemplate(SPIELS_PATH_TEMPLATE, {projectName:keyToName(projectKey)});
    const spielKeysAtPath = await getAllKeysAtPath(spielPath);
    spielKeys.push(...spielKeysAtPath);
  }
  return spielKeys;
}

export function spielKeyToName(spielKey:string):string {
  return keyToName(spielKey);
}
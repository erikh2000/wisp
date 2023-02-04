import {getActiveProjectName} from "./projects";
import {fillTemplate, keyToName} from "./pathUtil";
import {SPIELS_PATH_TEMPLATE, SPIEL_PATH_TEMPLATE} from "./keyPaths";
import {deleteByKey, getAllKeysAtPath, getText, renameKey, setText} from "./pathStore";
import {MIMETYPE_WISP_SPIEL} from "./mimeTypes";

export async function getSpiel(spielName:string, projectName:string = getActiveProjectName()):Promise<string> {
  const key = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName});
  const spielYaml = await getText(key);
  if (!spielYaml) throw Error('Unexpected');
  return spielYaml;
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
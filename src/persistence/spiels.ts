import {getActiveProjectName, getAllProjectKeys, projectKeyToName, renameSpielReferencesInProject} from "./projects";
import {fillTemplate, keyToName} from "./pathUtil";
import {SPIELS_PATH_TEMPLATE, SPIEL_PATH_TEMPLATE, FACES_PATH_TEMPLATE} from "./keyPaths";
import {
  deleteByKey,
  getAllKeysAtPath,
  getAllValuesAtPath,
  getText,
  KeyValueRecord,
  renameKey,
  setText
} from "./pathStore";
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
  const nextKey = fillTemplate(SPIEL_PATH_TEMPLATE, {projectName, spielName:nextSpielName});
  await renameKey(currentKey, nextKey);
  await renameSpielReferencesInProject(currentSpielName, nextSpielName, projectName);
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

export async function getSpielCount(projectName:string = getActiveProjectName()):Promise<number> {
  const spielsPath = fillTemplate(SPIELS_PATH_TEMPLATE, {projectName})
  const keys = await getAllKeysAtPath(spielsPath);
  return keys.length;
}

export async function getAllSpielKeys():Promise<string[]> {
  let spielKeys:string[] = [];
  const projectKeys = await getAllProjectKeys();
  for(let projectKeyI = 0; projectKeyI < projectKeys.length; ++projectKeyI) {
    const projectKey = projectKeys[projectKeyI];
    const projectName = projectKeyToName(projectKey);
    const spielPath = fillTemplate(SPIELS_PATH_TEMPLATE, {projectName});
    const spielKeysAtPath = await getAllKeysAtPath(spielPath);
    spielKeys.push(...spielKeysAtPath);
  }
  return spielKeys;
}

export function spielKeyToName(spielKey:string):string {
  return keyToName(spielKey);
}

export async function getAllSpielRecords(projectName:string = getActiveProjectName()):Promise<KeyValueRecord[]> {
  const spielsPath = fillTemplate(SPIELS_PATH_TEMPLATE, {projectName});
  return await getAllValuesAtPath(spielsPath);
}
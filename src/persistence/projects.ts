import {renameFace} from "./faces";
import {PROJECT_PATH_TEMPLATE, PROJECT_REGEX_TEMPLATE, PROJECTS_PATH} from "./keyPaths";
import {MIMETYPE_WISP_PROJECT} from "./mimeTypes";
import {getAllKeysAtPath, getAllKeysMatchingRegex, getText, setText} from "./pathStore";
import {fillTemplate, isValidName, keyToName} from "./pathUtil";
import Project from "./Project";

import {parse, stringify} from 'yaml';

export const DEFAULT_PROJECT_NAME = 'default';
export const UNSPECIFIED_NAME = '';

let activeProjectName:string = DEFAULT_PROJECT_NAME;

export async function getProjectNames():Promise<string[]> {
  const keys = await getAllKeysAtPath(PROJECTS_PATH);
  return keys.map(key => keyToName(key));
}

export async function createProject(projectName:string) {
  if (!isValidName(projectName)) throw Error('Invalid project name');
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName});
  const project:Project = { created:Date.now(), activeFace:UNSPECIFIED_NAME, activeSpiel:UNSPECIFIED_NAME };
  const projectYaml = stringify(project);
  await setText(key, projectYaml, MIMETYPE_WISP_PROJECT);
  
  // Avoid creating things under a project just to have defaults. Data should be created as needed.
}

export async function createDefaultProjectIfMissing() {
  const keys = await getAllKeysAtPath(PROJECTS_PATH);
  if (keys.length) return;
  await createProject(DEFAULT_PROJECT_NAME);
}

async function _getProjectByKey(key:string) {
  const projectYaml = await getText(key);
  if (!projectYaml) throw Error('Unexpected');
  return parse(projectYaml);
}

export async function getActiveProject():Promise<Project> {
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName:activeProjectName});
  return _getProjectByKey(key);
} 

export async function getActiveFaceName():Promise<string> {
  const project = await getActiveProject();
  return project.activeFace ?? UNSPECIFIED_NAME;
}

export async function setActiveFaceName(faceName:string) {
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  project.activeFace = faceName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export async function getActiveSpielName():Promise<string> {
  const project = await getActiveProject();
  return project.activeSpiel ?? UNSPECIFIED_NAME;
}

export async function setActiveSpielName(spielName:string) {
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  project.activeSpiel = spielName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export async function renameActiveFaceName(nextFaceName:string) {
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  const currentFaceName = project.activeFace;
  await renameFace(currentFaceName, nextFaceName);
  project.activeFace = nextFaceName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export function getActiveProjectName():string { return activeProjectName; }

export function getAllProjectKeys():Promise<string[]> {
  return getAllKeysAtPath(PROJECTS_PATH);
}

export function getAllKeysForProject(projectName:string = getActiveProjectName()):Promise<string[]> {
  const regex = new RegExp(fillTemplate(PROJECT_REGEX_TEMPLATE, {projectName}));
  return getAllKeysMatchingRegex(regex);
}

// TODO - add code for creating multiple projects and selecting between them.
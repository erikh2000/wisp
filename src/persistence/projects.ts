import {renameFace} from "./faces";
import {PROJECT_KEY_TEMPLATE, PROJECT_KEYS_REGEX, PROJECT_PATH_REGEX_TEMPLATE, PROJECTS_PATH} from "./keyPaths";
import {MIMETYPE_WISP_PROJECT} from "./mimeTypes";
import {doesKeyExist, getAllKeysMatchingRegex, getText, setText} from "./pathStore";
import {fillTemplate, isValidName, keyToName} from "./pathUtil";
import Project from "./Project";

import {parse, stringify} from 'yaml';

export const DEFAULT_PROJECT_NAME = 'default';
export const UNSPECIFIED_NAME = '';

let activeProjectName:string = DEFAULT_PROJECT_NAME;

export async function getProjectNames():Promise<string[]> {
  const keys = await getAllKeysMatchingRegex(PROJECT_KEYS_REGEX);
  return keys.map(key => keyToName(key));
}

export async function createProject(projectName:string) {
  if (!isValidName(projectName)) throw Error('Invalid project name');
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName});
  const project:Project = { created:Date.now(), activeFace:UNSPECIFIED_NAME, activeSpiel:UNSPECIFIED_NAME, entrySpiel:UNSPECIFIED_NAME, aboutText:'', creditsText:'' };
  const projectYaml = stringify(project);
  await setText(key, projectYaml, MIMETYPE_WISP_PROJECT);
  
  // Avoid creating things under a project just to have defaults. Data should be created as needed.
}

export async function createDefaultProjectIfMissing() {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:DEFAULT_PROJECT_NAME});
  if (!await doesKeyExist(key)) await createProject(DEFAULT_PROJECT_NAME);
}

async function _getProjectByKey(key:string):Promise<Project> {
  const projectYaml = await getText(key);
  if (!projectYaml) throw Error('Unexpected');
  return parse(projectYaml);
}

export async function getActiveProject():Promise<Project> {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  return _getProjectByKey(key);
} 

export async function getActiveFaceName():Promise<string> {
  const project = await getActiveProject();
  return project.activeFace ?? UNSPECIFIED_NAME;
}

export async function setActiveFaceName(faceName:string) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  project.activeFace = faceName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export async function getActiveSpielName():Promise<string> {
  const project = await getActiveProject();
  return project.activeSpiel ?? UNSPECIFIED_NAME;
}

export async function setActiveSpielName(spielName:string) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  project.activeSpiel = spielName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export async function renameActiveFaceName(nextFaceName:string) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  const project:Project = await _getProjectByKey(key);
  const currentFaceName = project.activeFace;
  await renameFace(currentFaceName, nextFaceName);
  project.activeFace = nextFaceName;
  await setText(key, stringify(project), MIMETYPE_WISP_PROJECT);
}

export async function updateActiveProject(changes:Partial<Project>) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  const currentProject:Project = await _getProjectByKey(key);
  currentProject.entrySpiel = changes.entrySpiel ?? currentProject.entrySpiel ?? UNSPECIFIED_NAME;
  currentProject.aboutText = changes.aboutText ?? currentProject.aboutText ?? '';
  currentProject.creditsText = changes.creditsText ?? currentProject.creditsText ?? '';
  await setText(key, stringify(currentProject), MIMETYPE_WISP_PROJECT);
}

export function getActiveProjectName():string { return activeProjectName; }

export function getAllProjectKeys():Promise<string[]> {
  return getAllKeysMatchingRegex(PROJECT_KEYS_REGEX);
}

export function getAllKeysForProject(projectName:string = getActiveProjectName()):Promise<string[]> {
  const regex = new RegExp(fillTemplate(PROJECT_PATH_REGEX_TEMPLATE, {projectName}));
  return getAllKeysMatchingRegex(regex);
}

export async function renameFaceReferencesInProject(currentFaceName:string, nextFaceName:string, projectName:string = getActiveProjectName()) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName});
  const currentProject:Project = await _getProjectByKey(key);
  if (currentProject.activeFace === currentFaceName) currentProject.activeFace = nextFaceName;
  await setText(key, stringify(currentProject), MIMETYPE_WISP_PROJECT);
}

export async function renameSpielReferencesInProject(currentSpielName:string, nextSpielName:string, projectName:string = getActiveProjectName()) {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName});
  const currentProject:Project = await _getProjectByKey(key);
  if (currentProject.activeSpiel === currentSpielName) currentProject.activeSpiel = nextSpielName;
  if (currentProject.entrySpiel === currentSpielName) currentProject.entrySpiel = nextSpielName;
  await setText(key, stringify(currentProject), MIMETYPE_WISP_PROJECT);
}

export function projectKeyToName(key:string):string {
  // Parsing PROJECTNAME from /projects/PROJECTNAME/project
  if (!key.startsWith(PROJECTS_PATH)) throw Error('Unexpected');
  const endNamePos = key.indexOf('/', PROJECTS_PATH.length);
  if (endNamePos === -1) throw Error('Unexpected');
  return key.substring(PROJECTS_PATH.length, endNamePos);
}

// TODO - add code for creating multiple projects and selecting between them.
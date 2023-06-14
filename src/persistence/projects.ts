import {renameFace} from "./faces";
import {
  PROJECT_KEY_TEMPLATE,
  PROJECT_KEYS_REGEX,
  PROJECT_PATH_REGEX_TEMPLATE,
  PROJECT_PATH_TEMPLATE,
  PROJECTS_PATH
} from "./keyPaths";
import {MIMETYPE_WISP_PROJECT} from "./mimeTypes";
import {getProjectsScreenSettings, setProjectsScreenSettings} from "./settings";
import {
  deleteAllKeys,
  doesKeyExist,
  getAllKeysMatchingRegex,
  getText,
  getValuesForKeys,
  KeyValueRecord, renameKey, renamePath,
  setText
} from "./pathStore";
import {fillTemplate, isValidName} from "./pathUtil";
import Project from "./Project";
import {CURRENT_DATA_VERSION} from "./versions";

import {parse, stringify} from 'yaml';

export const DEFAULT_PROJECT_NAME = 'default';
export const UNSPECIFIED_NAME = '';

let activeProjectName:string = UNSPECIFIED_NAME;

export function getProjectNameFromKey(key:string):string {
  // key is of the form: /projects/<projectName>/...
  const tokens = key.split('/');
  return tokens[2];
}

export async function getProjectNames():Promise<string[]> {
  const keys = await getAllKeysMatchingRegex(PROJECT_KEYS_REGEX);
  return keys.map(key => getProjectNameFromKey(key));
}

export async function getAllProjectRecords():Promise<KeyValueRecord[]> {
  const keys = await getAllProjectKeys();
  return await getValuesForKeys(keys);
}

export async function createProject(projectName:string) {
  if (!isValidName(projectName)) throw Error('Invalid project name');
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName});
  const project:Project = { 
    created:Date.now(), 
    activeFace:UNSPECIFIED_NAME, 
    activeSpiel:UNSPECIFIED_NAME, 
    entrySpiel:UNSPECIFIED_NAME, 
    aboutText:'', 
    creditsText:'',
    version: CURRENT_DATA_VERSION
  };
  const projectYaml = stringify(project);
  await setText(key, projectYaml, MIMETYPE_WISP_PROJECT);
  
  // Avoid creating things under a project just to have defaults. Data should be created as needed.
}

export async function createDefaultProjectIfMissing() {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:DEFAULT_PROJECT_NAME});
  if (!await doesKeyExist(key)) await createProject(DEFAULT_PROJECT_NAME);
}

async function _getProjectByKey(key:string):Promise<Project> {
  let projectYaml = await getText(key);
  if (!projectYaml) throw Error('Unexpected');
  if (projectYaml.indexOf('version:') === -1) projectYaml=`version: ${CURRENT_DATA_VERSION}\n${projectYaml}`; // TODO add support for chained upgrades.
  return parse(projectYaml);
}

export async function getActiveProject():Promise<Project> {
  const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:activeProjectName});
  return _getProjectByKey(key);
}

export async function setActiveProject(projectName:string) {
  if (projectName !== UNSPECIFIED_NAME) {
    const key = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:projectName});
    if (!await doesKeyExist(key)) throw Error(`${projectName} project does not exist.`);
  }
  await setProjectsScreenSettings({activeProjectName:projectName});
  (globalThis as any).__activeProjectName = projectName;
  activeProjectName = projectName;
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

export async function initActiveProjectName() {
  const projectsScreenSettings = await getProjectsScreenSettings();
  activeProjectName = projectsScreenSettings?.activeProjectName ?? DEFAULT_PROJECT_NAME;
  if (!projectsScreenSettings) await setProjectsScreenSettings({activeProjectName});
  (globalThis as any).__activeProjectName = activeProjectName;
}

export function getActiveProjectName():string {
  if (!activeProjectName) activeProjectName = (globalThis as any).__activeProjectName;
  return activeProjectName; 
}

export async function getAllProjectKeys():Promise<string[]> {
  return getAllKeysMatchingRegex(PROJECT_KEYS_REGEX);
}

export async function getProjectCount():Promise<number> {
  return (await getAllProjectKeys()).length;
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
  // Parsing PROJECT NAME from /projects/PROJECT NAME/project
  if (!key.startsWith(PROJECTS_PATH)) throw Error('Unexpected');
  const endNamePos = key.indexOf('/', PROJECTS_PATH.length);
  if (endNamePos === -1) throw Error('Unexpected');
  return key.substring(PROJECTS_PATH.length, endNamePos);
}

export async function deleteProject(projectName:string) {
  const keys = await getAllKeysForProject(projectName);
  await deleteAllKeys(keys)
}

export async function renameProject(nextProjectName:string, projectName:string = getActiveProjectName()) {
  const projectKey = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName});
  const nextProjectKey = fillTemplate(PROJECT_KEY_TEMPLATE, {projectName:nextProjectName});
  await renameKey(projectKey, nextProjectKey); // Normally, this would rename all the descendent keys, but since project file is stored as a separate key under the project path, need to continue with the next section. 
  const projectPath = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName});
  const nextProjectPath = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName:nextProjectName});
  await renamePath(projectPath, nextProjectPath);
  await setActiveProject(nextProjectName);
}
import {PROJECT_PATH_TEMPLATE, PROJECTS_PATH} from "./keyPaths";
import {MIMETYPE_WISP_PROJECT} from "./mimeTypes";
import {getAllKeysAtPath, setText} from "./pathStore";
import {fillTemplate, isValidName, keyToName} from "./pathUtil";
import Project from "./Project";

import {stringify} from 'yaml';

export const DEFAULT_PROJECT_NAME = 'default';
let activeProjectName:string = DEFAULT_PROJECT_NAME;

export async function getProjectNames():Promise<string[]> {
  const keys = await getAllKeysAtPath(PROJECTS_PATH);
  return keys.map(key => keyToName(key));
}

export async function createProject(projectName:string) {
  if (!isValidName(projectName)) throw Error('Invalid project name');
  const key = fillTemplate(PROJECT_PATH_TEMPLATE, {projectName});
  const project:Project = { created:Date.now() };
  const projectYaml = stringify(project);
  await setText(key, projectYaml, MIMETYPE_WISP_PROJECT);
  
  // Avoid creating things under a project just to have defaults. Data should be created as needed.
}

export async function createDefaultProjectIfMissing() {
  const keys = await getAllKeysAtPath(PROJECTS_PATH);
  if (keys.length) return;
  await createProject(DEFAULT_PROJECT_NAME);
}

export function getActiveProjectName():string { return activeProjectName; }

// TODO - add code for creating multiple projects and selecting between them.
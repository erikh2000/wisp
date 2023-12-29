import {downloadBlob} from "./downloadUtil";
import {PROJECT_PATH_REGEX_TEMPLATE} from "./keyPaths";
import {getAllKeysMatchingRegex, getDataForFileStorage} from "./pathStore";
import {fillTemplate, isValidName} from "./pathUtil";
import {getActiveProjectName, getProjectByName, getProjectNames} from "./projects";

import JSZip from 'jszip';
import {parse} from "yaml";
import Project from "./types/Project";

export type ProjectArchive = {
  zip:JSZip;
  relativePaths:string[];
  project:Project;
  doesProjectExist:boolean;
  projectName:string;
}

export async function downloadProjectZip(projectName:string = getActiveProjectName()):Promise<void> {
  const zip = new JSZip();
  const projectRegex = new RegExp(fillTemplate(PROJECT_PATH_REGEX_TEMPLATE, {projectName}));
  const keys = await getAllKeysMatchingRegex(projectRegex);
  for(let keyI = 0; keyI < keys.length; ++keyI) {
    const key = keys[keyI];
    const data = await getDataForFileStorage(key);
    const date = new Date(data.lastModified);
    const zipPath = `${data.path}${data.fileName}`; 
    zip.file(zipPath, data.blob, {binary: true, date, createFolders:true});
  }
  const zipBlob = await zip.generateAsync({type: 'blob'});
  downloadBlob(zipBlob, `${projectName}-${new Date().toISOString()}.zip`);
}

async function _loadProjectFile(zip:JSZip, relativePaths:string[]):Promise<Project> {
  const projectWispPaths = relativePaths.filter(relativePath => relativePath.endsWith('project.wisp'));
  if (projectWispPaths.length === 0) throw Error('Project archive does not contain project.wisp');
  if (projectWispPaths.length > 1) throw Error('Project archive contains multiple project.wisp files');
  
  const projectWispPath = projectWispPaths[0];
  const projectWispBlob = await zip.file(projectWispPath)?.async('blob');
  if (!projectWispBlob) throw Error('Corrupted project archive');
  const projectYaml = await projectWispBlob.text();
  return parse(projectYaml);
}

async function _doesProjectNameExist(projectTitle:string):Promise<boolean> {
  const existingProjectNames = await getProjectNames();
  return existingProjectNames.includes(projectTitle);
}

function _findProjectName(project:Project):string {
  if (isValidName(project.title)) return project.title;
  if (isValidName(project.entrySpiel)) return project.entrySpiel;
  return 'imported project';
}

export async function openProjectArchive(fileHandle:FileSystemFileHandle):Promise<ProjectArchive> {
  const file = await fileHandle.getFile();
  const zip = await JSZip.loadAsync(file);
  const relativePaths:string[] = [];
  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    relativePaths.push(relativePath);
  });
  const project = await _loadProjectFile(zip, relativePaths);
  const projectName = _findProjectName(project);
  const doesProjectExist = await _doesProjectNameExist(projectName);
  return {zip, relativePaths, project, projectName, doesProjectExist};
}

// Missing values from new object are filled in from old object. Otherwise, all values from new object are used.
function _mergeObjects(oldObject:Object, newObject:Object):Object {
  const _isSpecified = (value:any) => value !== undefined && value !== null && value !== '';
  const mergedObject:any = {...newObject};
  for(const key in oldObject) {
    if (!mergedObject.hasOwnProperty(key) || !_isSpecified(mergedObject[key])) {
      const nextValue = (oldObject as any)[key];
      if (_isSpecified(nextValue)) mergedObject[key] = nextValue;
    }
  }
  return mergedObject;
}

async function _importProjectFile(project:Project, projectName:string) {
  const oldProject = await getProjectByName(projectName);
  if (oldProject) project = _mergeObjects(oldProject, project) as Project;
  const projectKey = fillTemplate(PROJECT_PATH_REGEX_TEMPLATE, {projectName});
  
  // TODO - You were thinking about how best to import the project. It should be designed out in some detail. I'm a little
  // worried about merging rules leading to trouble. And there needs to be integrity checks along the way rather than just
  // blindly importing all the files. Maybe a transaction rollback. Maybe something like...
  // 1. import the project file to a temporary project.
  // 2. import each face
  // 3. import each spiel. For each of these, import the speech files.
  // 4. Do an integrity check. Try to fix problems. If you can't fix them all then delete the project.
  // 5. Is the project new?
  //    a. Yes - then rename it to the target name and done.
  //    b. No - merge changes into the old project and delete the temporary project.
}

export async function importProjectArchive(projectArchive:ProjectArchive) {
  await _importProjectFile(projectArchive.project, projectArchive.projectName);
}

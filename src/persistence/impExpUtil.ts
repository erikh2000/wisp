import {getAllKeysMatchingRegex, getDataForFileStorage} from "./pathStore";
import {getActiveProjectName} from "./projects";

import JSZip from 'jszip';
import {PROJECT_REGEX_TEMPLATE, PROJECTS_PATH} from "./keyPaths";
import {fillTemplate} from "./pathUtil";
import {downloadBlob} from "./downloadUtil";

export async function downloadProjectZip(projectName:string = getActiveProjectName()):Promise<void> {
  const zip = new JSZip();
  const projectRegex = new RegExp(fillTemplate(PROJECT_REGEX_TEMPLATE, {projectName}));
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
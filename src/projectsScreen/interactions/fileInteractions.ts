import {
  createProject,
  getActiveProject,
  getActiveProjectName,
  setActiveProject,
  updateActiveProject
} from "persistence/projects";
import {createDefaultRevision, getRevisionManager} from "./revisionUtil";
import {getSpielNames} from "../../persistence/spiels";

export async function createNewProject(projectName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function) {
  const revisionManager = getRevisionManager();
  await revisionManager.waitForPersist();
  
  await createProject(projectName);
  await setActiveProject(projectName);
  setDocumentName(projectName);
  revisionManager.clear();
  const revision = createDefaultRevision();
  revisionManager.add(revision);
  await revisionManager.persistCurrent();
  setRevision(revisionManager.currentRevision);
  setModalDialog(null);
}

export async function openProject(projectName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function, setSpielNames:Function) {
  const revisionManager = getRevisionManager();
  await revisionManager.waitForPersist();

  await setActiveProject(projectName);
  const project = await getActiveProject();
  const spielNames = await getSpielNames(projectName);
  revisionManager.clear();
  const revision = createDefaultRevision();
  revision.entrySpiel = spielNames.includes(project.entrySpiel) ? project.entrySpiel : '';
  revision.creditsText = project.creditsText;
  revision.aboutText = project.aboutText;
  revisionManager.add(revision);
  setRevision(revisionManager.currentRevision);
  setDocumentName(projectName);
  setSpielNames(spielNames);
  setModalDialog(null);
}
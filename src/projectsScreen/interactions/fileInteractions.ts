import {createDefaultRevision, getRevisionManager} from "./revisionUtil";
import {
  createProject,
  deleteProject,
  getActiveProject, getActiveProjectName, renameProject,
  setActiveProject,
  UNSPECIFIED_NAME,
} from "persistence/projects";
import OpenOrNewProjectChooser from "projectsScreen/dialogs/OpenOrNewProjectChooser";
import {getSpielNames} from "persistence/spiels";
import {infoToast} from "ui/toasts/toastUtil";

export async function createNewProject(projectName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function) {
  const revisionManager = getRevisionManager();
  await revisionManager.persistCurrent();
  
  await createProject(projectName);
  await setActiveProject(projectName);
  setDocumentName(projectName);
  revisionManager.clear();
  const revision = createDefaultRevision();
  revisionManager.add(revision);
  await revisionManager.persistCurrent();
  setRevision(revisionManager.currentRevision);
  setModalDialog(null);
  infoToast('New project created');
}

export async function openProject(projectName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function, setSpielNames:Function) {
  const revisionManager = getRevisionManager();
  if (getActiveProjectName() !== UNSPECIFIED_NAME) await revisionManager.persistCurrent();

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
  await setDocumentName(projectName);
  setSpielNames(spielNames);
  setModalDialog(null);
}

export async function onConfirmDeleteProject(projectName:string, setModalDialog:Function, setDocumentName:Function, setRevision:Function, setSpielNames:Function) {
  await deleteProject(projectName);
  await setActiveProject(UNSPECIFIED_NAME);
  const revisionManager = getRevisionManager();
  revisionManager.clear();
  setDocumentName(null);
  setSpielNames([]);
  setModalDialog(OpenOrNewProjectChooser.name);
  infoToast('Project deleted');
}

export async function onRenameProject(currentProjectName:string, newProjectName:string, setModalDialog:Function, setDocumentName:Function) {
  await renameProject(newProjectName, currentProjectName);
  await setDocumentName(newProjectName);
  setModalDialog(null);
  infoToast('Project renamed');
}
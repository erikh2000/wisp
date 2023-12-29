import {createDefaultRevision, getRevisionManager} from "./revisionUtil";
import {openProjectArchive, ProjectArchive} from "persistence/impExpUtil";
import {MIMETYPE_ZIP} from "persistence/mimeTypes";
import {
  createProject,
  deleteProject,
  getActiveProject, getActiveProjectName, renameProject,
  setActiveProject,
  UNSPECIFIED_NAME,
} from "persistence/projects";
import ConfirmMergeProjectDialog from "projectsScreen/dialogs/ConfirmMergeProjectDialog";
import ExportProgressDialog from "projectsScreen/dialogs/ExportProgressDialog";
import {ExportProjectSettings} from "projectsScreen/dialogs/ExportSettingsDialog";
import ImportProgressDialog from "projectsScreen/dialogs/ImportProgressDialog";
import OpenOrNewProjectChooser from "projectsScreen/dialogs/OpenOrNewProjectChooser";
import {getSpielNames} from "persistence/spiels";
import {errorToast, infoToast} from "ui/toasts/toastUtil";
import {performDisablingOperation} from "./coreUtil";

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

export function startExportProject(exportSettings:ExportProjectSettings, setModalDialog:Function, setExportSettings:Function) {
  setExportSettings(exportSettings);
  setModalDialog(ExportProgressDialog.name);
}

async function _selectProjectFileHandle():Promise<FileSystemFileHandle|null> {
  const openFileOptions = {
    excludeAcceptAllOption: true,
    multiple:false,
    types: [{
      description: 'Project Archive (.zip)',
      accept: {[MIMETYPE_ZIP]: ['.zip']}
    }]
  };
  try {
    const handles:FileSystemFileHandle[] = await ((window as any).showOpenFilePicker(openFileOptions));
    return handles[0];
  } catch(_ignoredAbortError) {
    return null;
  }
}

export async function importProject(setModalDialog:Function, setImportProjectArchive:Function):Promise<void> {
  await performDisablingOperation(async () => {
    const projectFileHandle = await _selectProjectFileHandle();
    if (!projectFileHandle) return;
    let projectArchive:ProjectArchive|null = null;
    try {
      projectArchive = await openProjectArchive(projectFileHandle);
    } catch(error) {
      console.error(error);
      errorToast('Import canceled because project archive did not contain expected files.');
      setImportProjectArchive(null);
      return;
    }
    setImportProjectArchive(projectArchive);
    const nextDialogName = projectArchive.doesProjectExist ? ConfirmMergeProjectDialog.name : ImportProgressDialog.name;
    setModalDialog(nextDialogName);
  });
}

export async function onConfirmMergeProject(setModalDialog:Function) {
  await performDisablingOperation(async () => {
    setModalDialog(ImportProgressDialog.name);
  });
}

export function onCancelMergeProject(setModalDialog:Function, setImportProjectArchive:Function) {
  setModalDialog(null);
  setImportProjectArchive(null);
  infoToast('Import canceled. You can rename the existing project and try again if you want to import without merging.');
}
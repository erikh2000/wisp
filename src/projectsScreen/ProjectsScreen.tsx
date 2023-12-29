import ConfirmDeleteProjectDialog from "./dialogs/ConfirmDeleteProjectDialog";
import ConfirmMergeProjectDialog from "./dialogs/ConfirmMergeProjectDialog";
import ExportProgressDialog from './dialogs/ExportProgressDialog';
import ExportSettingsDialog, {ExportProjectSettings, defaultExportProjectSettings} from "./dialogs/ExportSettingsDialog";
import ImportProgressDialog from "./dialogs/ImportProgressDialog";
import NewProjectDialog from "./dialogs/NewProjectDialog";
import OpenOrNewProjectChooser from "./dialogs/OpenOrNewProjectChooser";
import OpenProjectChooser from "./dialogs/OpenProjectChooser";
import RenameProjectDialog from "./dialogs/RenameProjectDialog";
import {
  createNewProject, importProject, onCancelMergeProject,
  onConfirmDeleteProject, onConfirmMergeProject,
  onRenameProject,
  openProject,
  startExportProject
} from "./interactions/fileInteractions";
import {init} from './interactions/initialization';
import {
  onChangeEntrySpielName,
  onChangeAboutText,
  onChangeCreditsText,
  onChangeLanguageCode,
  onChangeTitle
} from "./interactions/projectInteractions";
import {onRedo, onUndo, updateUndoRedoDisabled} from "./interactions/revisionUtil";
import GeneralSettingsPane from "./panes/GeneralSettingsPane";
import styles from "./ProjectsScreen.module.css";
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import useEffectOnce from "common/useEffectOnce";
import {ProjectArchive} from "persistence/impExpUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, {useEffect, useState} from "react";


function ProjectsScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [exportSettings, setExportSettings] = useState<ExportProjectSettings>(defaultExportProjectSettings());
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [importProjectArchive, setImportProjectArchive] = useState<ProjectArchive|null>(null); 
  const [redoDisabled, setRedoDisabled] = useState<boolean>(true);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [spielNames, setSpielNames] = useState<string[]>([]);
  const [undoDisabled, setUndoDisabled] = useState<boolean>(true);

  useEffectOnce(() => {
    
    init(setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.projectName === UNSPECIFIED_NAME) {
        setModalDialog(OpenOrNewProjectChooser.name);
      } else {
        setDocumentName(nextInitResults.projectName);
        setSpielNames(nextInitResults.spielNames);
      } 
      setDisabled(false);
    });
  }, []);

  useEffect(() => {
    updateUndoRedoDisabled(disabled, setUndoDisabled, setRedoDisabled);
  }, [disabled, revision, setUndoDisabled, setRedoDisabled]);

  const actionBarButtons = [
    {text:'New', onClick:() => setModalDialog(NewProjectDialog.name), groupNo:0, disabled},
    {text:'Open', onClick:() => setModalDialog(OpenProjectChooser.name), groupNo:0, disabled},
    {text:'Rename', onClick:() => setModalDialog(RenameProjectDialog.name), groupNo:0, disabled},
    {text:'Delete', onClick:() => setModalDialog(ConfirmDeleteProjectDialog.name), groupNo:0, disabled},
    {text:'Import', onClick:() => importProject(setModalDialog, setImportProjectArchive), groupNo:0, disabled},
    {text:'Export', onClick:() => setModalDialog(ExportSettingsDialog.name), groupNo:0},

    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:1, disabled:undoDisabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:1, disabled:redoDisabled}
  ];

  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.PROJECTS} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        <GeneralSettingsPane
          title={revision.title}
          aboutText={revision.aboutText}
          creditsText={revision.creditsText}
          disabled={disabled}  
          entrySpielName={revision.entrySpiel}
          languageCode={revision.languageCode}
          onChangeAboutText={nextAboutText => onChangeAboutText(nextAboutText, setRevision)}
          onChangeCreditsText={nextCreditsText => onChangeCreditsText(nextCreditsText, setRevision)}
          onChangeEntrySpielName={nextEntrySpielName => onChangeEntrySpielName(nextEntrySpielName, setRevision)}
          onChangeLanguage={nextLanguageCode => onChangeLanguageCode(nextLanguageCode, setRevision)}
          onChangeTitle={nextTitle => onChangeTitle(nextTitle, setRevision)}
          spielNames={spielNames}
        />
      </div>
      <ExportSettingsDialog
        isOpen={modalDialog === ExportSettingsDialog.name}
        projectName={documentName}
        onCancel={() => setModalDialog(null)}
        onContinue={(exportSettings) => startExportProject(exportSettings, setModalDialog, setExportSettings)}
      />
      <ExportProgressDialog
        exportSettings={exportSettings}
        isOpen={modalDialog === ExportProgressDialog.name}
        projectName={documentName}
        onComplete={() => setModalDialog(null)}
        onCancel={() => setModalDialog(null)}
      />
      <NewProjectDialog
        isOpen={modalDialog === NewProjectDialog.name}
        onCancel={() => setModalDialog(documentName === UNSPECIFIED_NAME ? OpenOrNewProjectChooser.name : null)}
        onSubmit={(projectName) => createNewProject(projectName, setModalDialog, setDocumentName, setRevision)}
      />
      <OpenProjectChooser
        isOpen={modalDialog === OpenProjectChooser.name}
        originalDocumentName={documentName}
        onCancel={() => setModalDialog(null)}
        onChoose={(projectName) => openProject(projectName, setModalDialog, setDocumentName, setRevision, setSpielNames)}
      />
      <ConfirmDeleteProjectDialog
        isOpen={modalDialog === ConfirmDeleteProjectDialog.name}
        projectName={documentName}
        onCancel={() => setModalDialog(null)}
        onConfirm={() => onConfirmDeleteProject(documentName, setModalDialog, setDocumentName, setRevision, setSpielNames)}
      />
      <ConfirmMergeProjectDialog
        isOpen={modalDialog === ConfirmMergeProjectDialog.name}
        projectName={documentName}
        onCancel={() => onCancelMergeProject(setModalDialog, setImportProjectArchive)}
        onConfirm={() => onConfirmMergeProject(setModalDialog)}
      />
      <OpenOrNewProjectChooser 
        isOpen={modalDialog === OpenOrNewProjectChooser.name}
        originalDocumentName={documentName}
        onNew={() => setModalDialog(NewProjectDialog.name)}
        onChoose={(projectName) => openProject(projectName, setModalDialog, setDocumentName, setRevision, setSpielNames)}
      />
      <RenameProjectDialog
        isOpen={modalDialog === RenameProjectDialog.name}
        onCancel={() => setModalDialog(null)}
        onSubmit={(newProjectName) => onRenameProject(documentName, newProjectName, setModalDialog, setDocumentName)}
      />
      <ImportProgressDialog
        isOpen={modalDialog === ImportProgressDialog.name}
        projectArchive={importProjectArchive}
        onCancel={() => setModalDialog(null)}
        onComplete={() => setModalDialog(null)}
      />
    </ScreenContainer>
  );
}

export default ProjectsScreen;
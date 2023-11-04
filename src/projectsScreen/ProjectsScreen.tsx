import ConfirmDeleteProjectDialog from "./dialogs/ConfirmDeleteProjectDialog";
import NewProjectDialog from "./dialogs/NewProjectDialog";
import OpenProjectChooser from "./dialogs/OpenProjectChooser";
import RenameProjectDialog from "./dialogs/RenameProjectDialog";
import {createNewProject, onConfirmDeleteProject, onRenameProject, openProject} from "./interactions/fileInteractions";
import {init} from './interactions/initialization';
import {onChangeEntrySpielName, onChangeAboutText, onChangeCreditsText, onChangeLanguageCode} from "./interactions/projectInteractions";
import {onRedo, onUndo, updateUndoRedoDisabled} from "./interactions/revisionUtil";
import GeneralSettingsPane from "./panes/GeneralSettingsPane";
import styles from "./ProjectsScreen.module.css";
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import useEffectOnce from "common/useEffectOnce";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";
import ExportProjectDialog from './dialogs/ExportProjectDialog';
import OpenOrNewProjectChooser from "./dialogs/OpenOrNewProjectChooser";

import React, {useEffect, useState} from "react";

const emptyCallback = () => {}; // TODO delete when not using

function ProjectsScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [undoDisabled, setUndoDisabled] = useState<boolean>(true);
  const [redoDisabled, setRedoDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [spielNames, setSpielNames] = useState<string[]>([]);
  const [modalDialog, setModalDialog] = useState<string|null>(null);

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
    {text:'Import', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export', onClick:() => setModalDialog(ExportProjectDialog.name), groupNo:0},

    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:1, disabled:undoDisabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:1, disabled:redoDisabled}
  ];

  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.PROJECTS} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        <GeneralSettingsPane
          aboutText={revision.aboutText}
          creditsText={revision.creditsText}
          disabled={disabled}  
          entrySpielName={revision.entrySpiel}
          languageCode={revision.languageCode}
          onChangeAboutText={nextAboutText => onChangeAboutText(nextAboutText, setRevision)}
          onChangeCreditsText={nextCreditsText => onChangeCreditsText(nextCreditsText, setRevision)}
          onChangeEntrySpielName={nextEntrySpielName => onChangeEntrySpielName(nextEntrySpielName, setRevision)}
          onChangeLanguage={nextLanguageCode => onChangeLanguageCode(nextLanguageCode, setRevision)}
          spielNames={spielNames}
        />
      </div>
      <ExportProjectDialog
        isOpen={modalDialog === ExportProjectDialog.name}
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
    </ScreenContainer>
  );
}

export default ProjectsScreen;
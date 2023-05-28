import {init} from './interactions/generalInteractions';
import {onChangeEntrySpielName, onChangeAboutText, onChangeCreditsText} from "./interactions/projectInteractions";
import GeneralSettingsPane from "./panes/GeneralSettingsPane";
import styles from "./ProjectsScreen.module.css";
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import useEffectAfterMount from "common/useEffectAfterMount";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";
import ExportProjectDialog from './dialogs/ExportProjectDialog';

import React, { useState } from "react";

const emptyCallback = () => {}; // TODO delete when not using

function ProjectsScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [spielNames, setSpielNames] = useState<string[]>([]);
  const [modalDialog, setModalDialog] = useState<string|null>(null);

  useEffectAfterMount(() => {
    
    init(setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.projectName !== UNSPECIFIED_NAME) {
        setDocumentName(nextInitResults.projectName);
        setSpielNames(nextInitResults.spielNames);
      }
      setDisabled(false);
    });
  }, []);

  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Open', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Rename', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Import', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export', onClick:() => setModalDialog(ExportProjectDialog.name), groupNo:0},

    {text:'Undo', onClick:emptyCallback, groupNo:1, disabled:true},
    {text:'Redo', onClick:emptyCallback, groupNo:1, disabled:true}
  ];

  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.PROJECTS} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        <GeneralSettingsPane
          aboutText={revision.aboutText}
          creditsText={revision.creditsText}
          spielNames={spielNames}
          entrySpielName={revision.entrySpiel}
          onChangeAboutText={nextAboutText => onChangeAboutText(nextAboutText, setRevision)}
          onChangeCreditsText={nextCreditsText => onChangeCreditsText(nextCreditsText, setRevision)}
          onChangeEntrySpielName={nextEntrySpielName => onChangeEntrySpielName(nextEntrySpielName, setRevision)}
          disabled={disabled}  
        />
      </div>
      <ExportProjectDialog
        isOpen={modalDialog === ExportProjectDialog.name}
        projectName={documentName}
        onComplete={() => setModalDialog(null)}
        onCancel={() => setModalDialog(null)}
      />
    </ScreenContainer>
  );
}

export default ProjectsScreen;
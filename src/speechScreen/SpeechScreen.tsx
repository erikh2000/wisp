import SelectByDialog from "./dialogs/SelectByDialog";
import NoSpielPane from "./NoSpielPane";
import styles from "./SpeechScreen.module.css";
import SpielSpeechPane from "./SpielSpeechPane";
import {init} from './interactions/generalInteractions';
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import {
  onChangeRowSelection,
  onDeselectAllRows,
  onSelectAllRows,
  selectRowsByCriteria
} from "./interactions/speechTableInteractions";
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import RecordStartDialog from "./dialogs/RecordStartDialog";
import RecordingDialog from "./dialogs/RecordingDialog";

const emptyCallback = () => {}; // TODO delete when not using

function SpeechScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init(setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.spielName !== UNSPECIFIED_NAME) {
        setDocumentName(nextInitResults.spielName);
        setCharacterNames(nextInitResults.characterNames);
      }
      setDisabled(false);
    });
  }, []);
  
  const isNoSpiel = documentName === UNSPECIFIED_NAME && !disabled;
  
  const actionBarButtons = [
    {text:'Change Spiel', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Import Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    
    {text:'Undo', onClick:emptyCallback, groupNo:1, disabled:true},
    {text:'Redo', onClick:emptyCallback, groupNo:1, disabled:true}
  ];
  const content = isNoSpiel ? <NoSpielPane /> :
    (<div className={styles.container}>
      <SpielSpeechPane
        onChangeRowSelection={(rowNo, isSelected) => onChangeRowSelection(rowNo, isSelected, revision.speechTable, setRevision) }
        onDeselectAllRows={() => onDeselectAllRows(revision.speechTable, setRevision)}
        onOpenSelectByDialog={() => setModalDialog(SelectByDialog.name)}
        onRecordSelected={() => setModalDialog(RecordStartDialog.name)}
        onSelectAllRows={() => onSelectAllRows(revision.speechTable, setRevision)}
        speechTable={revision.speechTable}
        disabled={disabled}
      />
    </div>);
  
  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.SPEECH} actionBarButtons={actionBarButtons}>
      {content}
      <SelectByDialog
        isOpen={modalDialog === SelectByDialog.name}
        onCancel={() => setModalDialog(null)}
        onSelectRowsBy={(selectBy) => selectRowsByCriteria(selectBy, revision.speechTable, setRevision, setModalDialog)}
        characterNames={characterNames}
      />
      <RecordStartDialog
        speechTable={revision.speechTable}
        isOpen={modalDialog === RecordStartDialog.name}
        onCancel={() => setModalDialog(null)}
        onStartRecording={() => setModalDialog(RecordingDialog.name)}
      />
      <RecordingDialog
        speechTable={revision.speechTable}
        isOpen={modalDialog === RecordingDialog.name}
        onCancel={() => setModalDialog(null)}
      />
    </ScreenContainer>
  );
}

export default SpeechScreen;
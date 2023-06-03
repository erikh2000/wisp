import ConfirmDeleteAllTakesDialog from "./dialogs/ConfirmDeleteAllTakesDialog";
import GenerateLipAnimationDialog from "./dialogs/GenerateLipAnimationDialog";
import RecordingDialog from "./dialogs/RecordingDialog";
import RecordStartDialog from "./dialogs/RecordStartDialog";
import SelectByDialog from "./dialogs/SelectByDialog";
import TrimSpeechDialog from "./dialogs/TrimSpeechDialog";
import NoSpielPane from "./NoSpielPane";
import styles from "./SpeechScreen.module.css";
import SpielSpeechPane from "./SpielSpeechPane";
import { init } from './interactions/generalInteractions';
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import {
  onChangeRowSelection,
  onDeselectAllRows,
  onSelectAllRows,
  selectRowsByCriteria
} from "./interactions/speechTableInteractions";
import {
  deleteAllTakes,
  onCancelRecording, onCompleteFinalization,
  onCompleteRecording, onDeleteTake, onFinalizeTake
} from './interactions/takeInteractions';
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import OpenSpielChooser from "../spielsCommon/dialogs/OpenSpielChooser";
import {onOpenSpiel} from "./interactions/fileInteractions";

const emptyCallback = () => {}; // TODO delete when not using

function SpeechScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [finalizingTakeWavKey, setFinalizingTakeWavKey] = useState<string|null>(null);
  const [finalizingAudioBuffer, setFinalizingAudioBuffer] = useState<AudioBuffer|null>(null);
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
    {text:'Change Spiel', onClick:() => setModalDialog(OpenSpielChooser.name), groupNo:0, disabled},
    {text:'Import Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    
    {text:'Undo', onClick:emptyCallback, groupNo:1, disabled:true},
    {text:'Redo', onClick:emptyCallback, groupNo:1, disabled:true}
  ];

  const content = isNoSpiel ? <NoSpielPane /> :
    (<div className={styles.container}>
      <SpielSpeechPane
        onChangeRowSelection={(rowNo, isSelected) => onChangeRowSelection(rowNo, isSelected, revision.speechTable, setRevision) }
        onDeleteTake={(takeWavKey:string) => onDeleteTake(takeWavKey, documentName, setRevision, setModalDialog)}
        onDeleteAllTakes={() => setModalDialog(ConfirmDeleteAllTakesDialog.name)}
        onDeselectAllRows={() => onDeselectAllRows(revision.speechTable, setRevision)}
        onFinalizeTake={(takeWavKey:string) => onFinalizeTake(takeWavKey, setModalDialog, setFinalizingTakeWavKey)}
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
      <ConfirmDeleteAllTakesDialog
        isOpen={modalDialog === ConfirmDeleteAllTakesDialog.name}
        onConfirm={() => deleteAllTakes(documentName, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
      />
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
        onCancel={() => onCancelRecording(documentName, setRevision, setModalDialog)}
        onClose={() => onCompleteRecording(documentName, setRevision, setModalDialog)}
        spielName={documentName}
      />
      <TrimSpeechDialog
        isOpen={modalDialog === TrimSpeechDialog.name}
        onCancel={() => setModalDialog(null)}
        onComplete={(audioBuffer) => {
          setFinalizingAudioBuffer(audioBuffer);
          setModalDialog(GenerateLipAnimationDialog.name)
        }}
        takeWavKey={finalizingTakeWavKey}
      />
      <GenerateLipAnimationDialog
        audioBuffer={finalizingAudioBuffer}
        isOpen={modalDialog === GenerateLipAnimationDialog.name}
        onCancel={() => setModalDialog(null)}
        onComplete={(lipzEvents) => onCompleteFinalization(finalizingTakeWavKey, finalizingAudioBuffer, lipzEvents, documentName, setRevision, setModalDialog)}
      />
      <OpenSpielChooser
        isOpen={modalDialog === OpenSpielChooser.name}
        onCancel={() => setModalDialog(null)}
        onChoose={(spielName) => onOpenSpiel(spielName, setDocumentName, setRevision, setModalDialog)}
        originalDocumentName={documentName}
      />
    </ScreenContainer>
  );
}

export default SpeechScreen;
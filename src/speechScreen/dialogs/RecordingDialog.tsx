import styles from './RecordDialogBase.module.css';
import {findDialogueText, getSelectedRowCount} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useState, useEffect } from "react";
import RecordingLevelMeter, {MicState} from "./RecordingLevelMeter";
import {UNSPECIFIED_NAME} from "../../persistence/projects";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  speechTable: SpeechTable;
}

function _onNextClick(speechTable:SpeechTable, dialogueTextNo:number, setDialogueTextNo:Function) {
  setDialogueTextNo(dialogueTextNo+1);
}

function _onRetakeClick() {
  console.log('Retake');
}

function RecordingDialog(props:IProps) {
  const {isOpen, onCancel, speechTable} = props;

  const [dialogueTextNo, setDialogueTextNo] = useState<number>(1);
  const [dialogueTextCount, setDialogueTextCount] = useState<number>(0);
  const [characterName, setCharacterName] = useState<string>('');
  const [dialogueText, setDialogueText] = useState<string>('');
  const [parenthetical, setParenthetical] = useState<string>('');
  const [micState, setMicState] = useState<MicState>(MicState.OFF);

  useEffect(() => {
    if (!isOpen) return;
    const nextDialogueTextCount = getSelectedRowCount(speechTable);
    setDialogueTextNo(0);
    setDialogueTextCount(nextDialogueTextCount);
  }, [isOpen, speechTable]);
  
  useEffect(() => {
    const [nextCharacterName, nextParenthetical, nextDialogueText] = findDialogueText(speechTable, dialogueTextNo);
    setParenthetical(nextParenthetical);
    setCharacterName(nextCharacterName);
    setDialogueText(nextDialogueText);
  }, [dialogueTextNo]);

  let noMicWarning = micState === MicState.UNAVAILABLE 
    ? <p className={styles.noMicWarning}>Microphone is not available. Are your browser permissions allowing it?</p> : null;
  
  const lastButton = dialogueTextNo === dialogueTextCount - 1 
    ? <DialogButton text={'Finish'} onClick={() => onCancel()} isPrimary/> 
    : <DialogButton text={'Next'} onClick={() => _onNextClick(speechTable, dialogueTextNo, setDialogueTextNo)} isPrimary/>;
  
  return (
    <ModalDialog isOpen={isOpen} title={`Recording Dialogue - Line ${dialogueTextNo + 1} of ${dialogueTextCount}`} onCancel={onCancel}>
      {noMicWarning}
      <div className={styles.dialogueContainer}>
        <div className={styles.characterName}>{characterName}</div>
        <div className={styles.parenthetical}>{parenthetical}</div>
        <div className={styles.dialogueText}>{dialogueText}</div>
      </div>
      <RecordingLevelMeter onMicStateChange={setMicState}/>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={() => onCancel()}/>
        <DialogButton text={'Retake'} onClick={() => _onRetakeClick()}/>
        {lastButton}
      </DialogFooter>
    </ModalDialog>
  );
}

export default RecordingDialog;
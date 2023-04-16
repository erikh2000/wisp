import AudioRecorder, {MicState} from "./AudioRecorder";
import styles from './RecordDialogBase.module.css';
import {getSelectedRowCount} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useState, useEffect } from "react";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onStartRecording: () => void;
  speechTable: SpeechTable;
}

function RecordStartDialog(props:IProps) {
  const {isOpen, onCancel, onStartRecording, speechTable} = props;
  
  const [dialogueTextCount, setDialogueTextCount] = useState<number>(0);
  const [micState, setMicState] = useState<MicState>(MicState.OFF);
  
  useEffect(() => {
    if (!isOpen) return;
    const nextDialogueTextCount = getSelectedRowCount(speechTable);
    setDialogueTextCount(nextDialogueTextCount);
  }, [isOpen, speechTable, setDialogueTextCount]);
  
  let instructionText:string;
  switch (micState) {
    case MicState.OFF:
    case MicState.INITIALIZING: 
      instructionText = '';
      break;
      
    case MicState.UNAVAILABLE: 
      instructionText = 'Microphone is not available. Are your browser permissions allowing it?'; 
      break;
      
    default: 
      instructionText = `Click "Start" when you are ready to begin recording. You'll be able to discard unwanted takes and trim silence later.`;
  }

  return (
    <ModalDialog isOpen={isOpen} title={'Record Selected'} onCancel={onCancel}>
      <p>{dialogueTextCount} {dialogueTextCount !== 1 ? 'lines are' : 'line is'} selected to record.</p>
      <p className={styles.instructionText}>{instructionText}</p>
      <AudioRecorder onMicStateChange={setMicState}/>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={() => onCancel()}/>
        <DialogButton text={'Start'} onClick={() => onStartRecording()} isPrimary disabled={micState !== MicState.AVAILABLE}/>
      </DialogFooter>
    </ModalDialog>
  );
}

export default RecordStartDialog;
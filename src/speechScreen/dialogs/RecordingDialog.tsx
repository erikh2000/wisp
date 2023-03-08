import styles from './RecordDialogBase.module.css';
import {getSelectedRowCount} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useState, useEffect } from "react";
import RecordingLevelMeter, {MicState} from "./RecordingLevelMeter";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  speechTable: SpeechTable;
}

function RecordingDialog(props:IProps) {
  const {isOpen, onCancel, speechTable} = props;

  const [dialogueTextNo, setDialogueTextNo] = useState<number>(1);
  const [dialogueTextCount, setDialogueTextCount] = useState<number>(0);
  const [micState, setMicState] = useState<MicState>(MicState.OFF);

  useEffect(() => {
    if (!isOpen) return;
    const nextDialogueTextCount = getSelectedRowCount(speechTable);
    setDialogueTextCount(nextDialogueTextCount);
  }, [isOpen, speechTable]);

  let noMicWarning = micState === MicState.UNAVAILABLE 
    ? <p className={styles.noMicWarning}>Microphone is not available. Are your browser permissions allowing it?</p> : null;

  return (
    <ModalDialog isOpen={isOpen} title={`Recording Dialogue - Line ${dialogueTextNo} of ${dialogueTextCount}`} onCancel={onCancel}>
      {noMicWarning}
      <RecordingLevelMeter onMicStateChange={setMicState}/>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={() => onCancel()}/>
      </DialogFooter>
    </ModalDialog>
  );
}

export default RecordingDialog;
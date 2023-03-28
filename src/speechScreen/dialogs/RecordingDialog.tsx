import AudioRecorder, {MicState} from "./AudioRecorder";
import styles from './RecordDialogBase.module.css';
import RecordingBuffer from "./RecordingBuffer";
import {findDialogueText, getSelectedRowCount} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useState, useEffect } from "react";
import {addTake} from "persistence/speech";

interface IProps {
  spielName: string,
  isOpen: boolean;
  onCancel: () => void;
  onClose:() => void,
  speechTable: SpeechTable;
}

const recordingBuffer = new RecordingBuffer();

async function _saveTake(spielName:string, speechTable:SpeechTable, dialogueTextNo:number) {
  const [characterName, , dialogueText, speechId] = findDialogueText(speechTable, dialogueTextNo);
  const wavBytes = recordingBuffer.getWavBytes();
  await addTake(spielName, characterName, speechId, dialogueText, wavBytes);
  recordingBuffer.clear();
}

function _onNextClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, setDialogueTextNo:Function) {
  _saveTake(spielName, speechTable, dialogueTextNo).then(() => setDialogueTextNo(dialogueTextNo+1));
}

function _onFinishClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, onClose:Function) {
  _saveTake(spielName, speechTable, dialogueTextNo).then(() => onClose());
}

function _onRetakeClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number) {
  _saveTake(spielName, speechTable, dialogueTextNo);
}

function _onReceiveSamples(samples:Float32Array, sampleRate:number) {
  recordingBuffer.sampleRate = sampleRate;
  recordingBuffer.addSamples(samples);
}

function RecordingDialog(props:IProps) {
  const {isOpen, onCancel, onClose, speechTable, spielName} = props;

  const [dialogueTextNo, setDialogueTextNo] = useState<number>(1);
  const [dialogueTextCount, setDialogueTextCount] = useState<number>(0);
  const [characterName, setCharacterName] = useState<string>('');
  const [dialogueText, setDialogueText] = useState<string>('');
  const [parenthetical, setParenthetical] = useState<string>('');
  const [micState, setMicState] = useState<MicState>(MicState.OFF);

  useEffect(() => {
    if (!isOpen) return;
    recordingBuffer.clear();
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
    ? <DialogButton text={'Finish'} onClick={() => _onFinishClick(spielName, speechTable, dialogueTextNo, onClose)} isPrimary/> 
    : <DialogButton text={'Next'} onClick={() => _onNextClick(spielName, speechTable, dialogueTextNo, setDialogueTextNo)} isPrimary/>;
  
  return (
    <ModalDialog isOpen={isOpen} title={`Recording Dialogue - Line ${dialogueTextNo + 1} of ${dialogueTextCount}`} onCancel={onCancel}>
      {noMicWarning}
      <div className={styles.dialogueContainer}>
        <div className={styles.characterName}>{characterName}</div>
        <div className={styles.parenthetical}>{parenthetical}</div>
        <div className={styles.dialogueText}>{dialogueText}</div>
      </div>
      <AudioRecorder onMicStateChange={setMicState} onReceiveSamples={_onReceiveSamples}/>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={() => onCancel()}/>
        <DialogButton text={'Retake'} onClick={() => _onRetakeClick(spielName, speechTable, dialogueTextNo)}/>
        {lastButton}
      </DialogFooter>
    </ModalDialog>
  );
}

export default RecordingDialog;
import AudioRecorder, {MicState} from "./AudioRecorder";
import styles from './RecordDialogBase.module.css';
import RecordingBuffer from "./RecordingBuffer";
import {addTake, getTakeCount} from "persistence/speech";
import {findDialogueText, getSelectedRowCount} from "speechScreen/speechTable/speechTableUtil";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useState, useEffect } from "react";

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

async function _updateTakeNo(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, setTakeNo:Function):Promise<void> {
  const [characterName, , dialogueText, speechId] = findDialogueText(speechTable, dialogueTextNo);
  const takeCount = await getTakeCount(spielName, characterName, speechId, dialogueText);
  setTakeNo(takeCount);
}

function _onNextClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, setDialogueTextNo:Function, setTakeNo:Function) {
  _saveTake(spielName, speechTable, dialogueTextNo).then(() => {
    setDialogueTextNo(dialogueTextNo+1);
    _updateTakeNo(spielName, speechTable, dialogueTextNo+1, setTakeNo).then(() => {});
  });
}

function _onFinishClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, onClose:Function) {
  _saveTake(spielName, speechTable, dialogueTextNo).then(() => onClose());
}

function _onRetakeClick(spielName:string, speechTable:SpeechTable, dialogueTextNo:number, setTakeNo:Function) {
  _saveTake(spielName, speechTable, dialogueTextNo).then(() => {
    _updateTakeNo(spielName, speechTable, dialogueTextNo, setTakeNo).then(() => {});
  });
}

function _onReceiveSamples(samples:Float32Array, sampleRate:number) {
  recordingBuffer.sampleRate = sampleRate;
  recordingBuffer.addSamples(samples);
}

function _updateDialogueState(speechTable:SpeechTable, dialogueTextNo:number, setCharacterName:Function, setParenthetical:Function, setDialogueText:Function) {
  const [characterName, parenthetical, dialogueText] = findDialogueText(speechTable, dialogueTextNo);
  setCharacterName(characterName);
  setParenthetical(parenthetical);
  setDialogueText(dialogueText);
}

function RecordingDialog(props:IProps) {
  const {isOpen, onCancel, onClose, speechTable, spielName} = props;

  const [dialogueTextNo, setDialogueTextNo] = useState<number>(1);
  const [dialogueTextCount, setDialogueTextCount] = useState<number>(0);
  const [characterName, setCharacterName] = useState<string>('');
  const [dialogueText, setDialogueText] = useState<string>('');
  const [parenthetical, setParenthetical] = useState<string>('');
  const [micState, setMicState] = useState<MicState>(MicState.OFF);
  const [takeNo, setTakeNo] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;
    recordingBuffer.clear();
    const nextDialogueTextCount = getSelectedRowCount(speechTable);
    setDialogueTextNo(0);
    setDialogueTextCount(nextDialogueTextCount);
    _updateDialogueState(speechTable, 0, setCharacterName, setParenthetical, setDialogueText);
    _updateTakeNo(spielName, speechTable, 0, setTakeNo).then(() => {});
  }, [isOpen, speechTable, spielName]);
  
  useEffect(() => {
    _updateDialogueState(speechTable, dialogueTextNo, setCharacterName, setParenthetical, setDialogueText);
  }, [dialogueTextNo, speechTable, setCharacterName, setParenthetical, setDialogueText]);

  let noMicWarning = micState === MicState.UNAVAILABLE 
    ? <p className={styles.noMicWarning}>Microphone is not available. Are your browser permissions allowing it?</p> : null;
  
  const lastButton = dialogueTextNo === dialogueTextCount - 1 
    ? <DialogButton text={'Finish'} onClick={() => _onFinishClick(spielName, speechTable, dialogueTextNo, onClose)} isPrimary/> 
    : <DialogButton text={'Next'} onClick={() => _onNextClick(spielName, speechTable, dialogueTextNo, setDialogueTextNo, setTakeNo)} isPrimary/>;
  
  return (
    <ModalDialog isOpen={isOpen} title={`Recording Now - Line ${dialogueTextNo + 1} of ${dialogueTextCount}, Take ${takeNo+1}`} onCancel={onCancel}>
      {noMicWarning}
      <div className={styles.dialogueContainer}>
        <div className={styles.characterName}>{characterName}</div>
        <div className={styles.parenthetical}>{parenthetical}</div>
        <div className={styles.dialogueText}>{dialogueText}</div>
      </div>
      <AudioRecorder onMicStateChange={setMicState} onReceiveSamples={_onReceiveSamples}/>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={() => onCancel()}/>
        <DialogButton text={'Retake'} onClick={() => _onRetakeClick(spielName, speechTable, dialogueTextNo, setTakeNo)}/>
        {lastButton}
      </DialogFooter>
    </ModalDialog>
  );
}

export default RecordingDialog;
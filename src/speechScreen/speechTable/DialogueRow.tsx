import styles from "./SpeechTable.module.css";
import {deleteTake, makeTakeFinal} from "persistence/speech";
import TakeButton from "speechScreen/dialogs/TakeButton";
import FinalTakeButton from "speechScreen/dialogs/FinalTakeButton";

import React, { useState } from "react";

type ToggleSelectionCallback = (isSelected:boolean) => void;

interface IProps {
  isOdd: boolean;
  onTakesChanged: () => void;
  onToggleSelection: ToggleSelectionCallback;
  isSelectable: boolean;
  isSelected: boolean;
  takeWavKeys: string[];
  finalTakeNo: number;
  text: string;
}

function _generateRecordedTakes(takeWavKeys:string[], finalTakeNo:number, onDragStart:Function, onDragEnd:Function):JSX.Element[] {
  const elements:JSX.Element[] = [];
  for(let takeNo = 0; takeNo < takeWavKeys.length; takeNo++) {
    if (takeNo === finalTakeNo) continue;
    const takeKey = takeWavKeys[takeNo];
    elements.push(
      <TakeButton key={takeKey} onDragEnd={() => onDragEnd()} onDragStart={() => onDragStart(takeNo)} 
                  takeNo={elements.length} takeWavKey={takeKey} />
    );
  }
  return elements;
}

const NOT_DRAGGING = -1;
const UNSPECIFIED_TAKE_NO = -1;

function DialogueRow(props:IProps) {
  const { finalTakeNo, isOdd, isSelectable, isSelected, onTakesChanged, onToggleSelection, takeWavKeys, text } = props;
  const [isHoveringFinalize, setIsHoveringFinalize] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const [draggingTakeNo, setDraggingTakeNo] = useState(NOT_DRAGGING);
  
  const onDragStart = (takeNo:number) => setDraggingTakeNo(takeNo);
  const onDragEnd = () => setDraggingTakeNo(NOT_DRAGGING);
  const onDeleteDrop = () => { deleteTake(takeWavKeys[draggingTakeNo]).then(() => onTakesChanged()) };
  const onFinalizeDrop = () => { makeTakeFinal(takeWavKeys[draggingTakeNo]).then(() => onTakesChanged()) };
  
  const rowStyle = `${styles.dialogueRow} ${isOdd ? styles.oddRow : styles.evenRow}`;
  const hideDragTargetStyle = draggingTakeNo === NOT_DRAGGING ? styles.hideDragTarget : '';
  const deleteDragTargetStyle = isHoveringDelete ? styles.deleteDragTargetHover : styles.deleteDragTarget;
  const finalizeDragTargetStyle = isHoveringFinalize ? styles.finalizeDragTargetHover : styles.finalizeDragTarget;
  const checkboxElement = isSelectable ? <input type='checkbox' checked={isSelected} onChange={() => onToggleSelection(!isSelected) } /> : null;
  const recordedTakes = _generateRecordedTakes(takeWavKeys, finalTakeNo, onDragStart, onDragEnd);
  const finalTake = finalTakeNo !== UNSPECIFIED_TAKE_NO && draggingTakeNo === NOT_DRAGGING 
    ? <FinalTakeButton takeWavKey={takeWavKeys[finalTakeNo]}/> : null;
  
  return (
    <div className={rowStyle}>
      <span className={styles.selectColumn}>
        {checkboxElement}
      </span>
      <span className={styles.dialogueColumn}>{text}</span>
      <span className={styles.recordedTakesColumn}>
        {recordedTakes}
        <span 
          className={`${deleteDragTargetStyle} ${hideDragTargetStyle}`}
          onDragEnter={() => setIsHoveringDelete(true)}
          onDragLeave={() => setIsHoveringDelete(false)}
          onDragOver={event => event.preventDefault()} 
          onDrop={() => onDeleteDrop()}
        >
          delete
        </span>
      </span>
      <span className={styles.finalColumn}>
        {finalTake}
        <span 
          className={`${finalizeDragTargetStyle} ${hideDragTargetStyle}`}
          onDragEnter={() => setIsHoveringFinalize(true)}
          onDragLeave={() => setIsHoveringFinalize(false)}
          onDragOver={event => event.preventDefault()}
          onDrop={() => onFinalizeDrop()}
        >
          finalize
        </span>
      </span>
    </div>
  );
}

export default DialogueRow;
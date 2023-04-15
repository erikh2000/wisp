import styles from "./SpeechTable.module.css";
import React from "react";
import TakeButton from "../dialogs/TakeButton";

type ToggleSelectionCallback = (isSelected:boolean) => void;

interface IProps {
  isOdd: boolean;
  onToggleSelection: ToggleSelectionCallback;
  isSelectable: boolean;
  isSelected: boolean;
  takeWavKeys: string[];
  text: string;
}

function _generateRecordedTakes(takeWavKeys:string[]):JSX.Element[] {
  return takeWavKeys.map((takeKey, takeNo) => {
    return <TakeButton key={takeKey} takeNo={takeNo} takeWavKey={takeKey} />;
  });
}

function DialogueRow(props:IProps) {
  const { isOdd, isSelectable, isSelected, onToggleSelection, takeWavKeys, text } = props;
  const rowStyle = `${styles.dialogueRow} ${isOdd ? styles.oddRow : styles.evenRow}`;
  const checkboxElement = isSelectable ? <input type='checkbox' checked={isSelected} onChange={() => onToggleSelection(!isSelected) } /> : null;
  const recordedTakes = _generateRecordedTakes(takeWavKeys);
  return (
    <div className={rowStyle}>
      <span className={styles.selectColumn}>
        {checkboxElement}
      </span>
      <span className={styles.dialogueColumn}>{text}</span>
      <span className={styles.recordedTakesColumn}>{recordedTakes}</span>
      <span className={styles.finalColumn} />
    </div>
  );
}

export default DialogueRow;
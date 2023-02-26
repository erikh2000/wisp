import styles from "./SpeechTable.module.css";
import React from "react";

type ToggleSelectionCallback = (isSelected:boolean) => void;

interface IProps {
  isOdd: boolean;
  onToggleSelection: ToggleSelectionCallback;
  isSelected: boolean;
  text: string;
}

function DialogueRow(props:IProps) {
  const { isOdd, isSelected, onToggleSelection, text } = props;
  const rowStyle = `${styles.dialogueRow} ${isOdd ? styles.oddRow : styles.evenRow}`;
  return (
    <div className={rowStyle}>
      <span className={styles.selectColumn}>
        <input type='checkbox' checked={isSelected} onChange={() => onToggleSelection(!isSelected) } />
      </span>
      <span className={styles.dialogueColumn}>{text}</span>
      <span className={styles.recordedTakesColumn} />
      <span className={styles.finalColumn} />
    </div>
  );
}

export default DialogueRow;
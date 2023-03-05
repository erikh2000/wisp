import styles from "./SpeechTable.module.css";
import React from "react";

type ToggleSelectionCallback = (isSelected:boolean) => void;

interface IProps {
  isOdd: boolean;
  onToggleSelection: ToggleSelectionCallback;
  isSelectable: boolean;
  isSelected: boolean;
  text: string;
}

function DialogueRow(props:IProps) {
  const { isOdd, isSelectable, isSelected, onToggleSelection, text } = props;
  const rowStyle = `${styles.dialogueRow} ${isOdd ? styles.oddRow : styles.evenRow}`;
  const checkboxElement = isSelectable ? <input type='checkbox' checked={isSelected} onChange={() => onToggleSelection(!isSelected) } /> : null;
  return (
    <div className={rowStyle}>
      <span className={styles.selectColumn}>
        {checkboxElement}
      </span>
      <span className={styles.dialogueColumn}>{text}</span>
      <span className={styles.recordedTakesColumn} />
      <span className={styles.finalColumn} />
    </div>
  );
}

export default DialogueRow;
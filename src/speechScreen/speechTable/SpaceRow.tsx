import styles from './SpeechTable.module.css';
import React from "react";

interface IProps {
  isOdd: boolean;
}
function SpaceRow(props:IProps) {
  const { isOdd } = props;
  const rowStyle = `${styles.spaceRow} ${isOdd ? styles.oddRow : styles.evenRow}`;
  return (
    <div className={rowStyle}>
      <span className={styles.selectColumn} />
      <span className={styles.dialogueColumn} />
      <span className={styles.recordedTakesColumn} />
      <span className={styles.finalColumn} />
    </div>
  );
}

export default SpaceRow;
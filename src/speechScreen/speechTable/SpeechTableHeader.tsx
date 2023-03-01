import styles from "./SpeechTable.module.css";

import React from "react";

interface IProps {
  areAllRowsSelected: boolean;
  onSelectAllRows: () => void,
  onDeselectAllRows: () => void
}

function SpeechTableHeader(props:IProps) {
  const {areAllRowsSelected, onSelectAllRows, onDeselectAllRows} = props;
  
  function _handleOnChange() {
    if (areAllRowsSelected) return onDeselectAllRows();
    onSelectAllRows();
  }
  
  return (
    <div className={styles.speechTableHeader}>
      <span className={styles.selectColumn}><input type='checkbox' checked={areAllRowsSelected} onChange={() => _handleOnChange()}/></span>
      <span className={styles.dialogueColumn}>Dialogue</span>
      <span className={styles.recordedTakesColumn}>Recorded Takes</span>
      <span className={styles.finalColumnForHeader}>Final</span>
    </div>
  );
}

export default SpeechTableHeader;
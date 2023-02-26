import styles from "./SpeechTable.module.css";

import React from "react";

function SpeechTableHeader() {
  return (
    <div className={styles.speechTableHeader}>
      <span className={styles.selectColumn}><input type='checkbox' /></span>
      <span className={styles.dialogueColumn}>Dialogue</span>
      <span className={styles.recordedTakesColumn}>Recorded Takes</span>
      <span className={styles.finalColumnForHeader}>Final</span>
    </div>
  );
}

export default SpeechTableHeader;
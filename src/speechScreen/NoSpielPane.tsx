import styles from "./SpielSpeechPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React from "react";

function NoSpielPane() {
  
  return  (
    <InnerContentPane className={styles.spielSpeechPane} caption='Spiel Speech'>
      <p className={styles.noSpielText}>Before you can record speech, you need to create or open a spiel.</p>
    </InnerContentPane>
  );
}

export default NoSpielPane;
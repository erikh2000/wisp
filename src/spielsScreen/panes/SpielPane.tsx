import styles from "./SpielPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";
import React from "react";

function SpielPane() {
  return (
    <InnerContentPane className={styles.spielPane} caption='Spiel'>
    </InnerContentPane>
  );
}

export default SpielPane;
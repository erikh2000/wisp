import styles from "./GeneralSettingsPane.module.css";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React from "react";

function GeneralSettingsPane() {

  return  (
    <InnerContentPane className={styles.generalSettingsPane} caption='General Settings' />
  );
}

export default GeneralSettingsPane;
import styles from "./TakeButton.module.css";
import {playTakeWave} from "speechScreen/interactions/takeUtil";

import React from "react";

interface IProps {
  takeWavKey: string;
}

function FinalTakeButton(props:IProps) {
  const { takeWavKey } = props;

  return (
    <button className={styles.finalTake} onClick={() => playTakeWave(takeWavKey)}>✓</button>);
}

export default FinalTakeButton;
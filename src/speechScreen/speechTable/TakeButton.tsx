import styles from "./TakeButton.module.css";
import {playTakeWave} from "speechScreen/interactions/takeInteractions";

import React from "react";

interface IProps {
  onDragEnd: () => void;
  onDragStart: () => void;
  takeNo: number;
  takeWavKey: string;
}

function TakeButton(props:IProps) {
  const { onDragStart, onDragEnd, takeNo, takeWavKey } = props;
  
  return ( 
    <button 
      className={styles.take} 
      onClick={() => playTakeWave(takeWavKey)}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      draggable>
      {takeNo+1}
    </button>);
}

export default TakeButton;
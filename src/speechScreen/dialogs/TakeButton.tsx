import styles from "./TakeButton.module.css";
import {getTake} from "persistence/speech";

import {stopAll, playAudioBuffer, wavBytesToAudioBuffer} from 'sl-web-audio';
import React from "react";

interface IProps {
  takeNo: number;
  takeWavKey: string;
}

async function _playWave(wavKey:string) {
  const wavBytes = await getTake(wavKey);
  const audioBuffer = wavBytesToAudioBuffer(wavBytes);
  stopAll();
  playAudioBuffer(audioBuffer);
}

function TakeButton(props:IProps) {
  const { takeNo, takeWavKey } = props;
  
  return <button key={takeWavKey} className={styles.recordedTake} onClick={() => _playWave(takeWavKey)}>{takeNo+1}</button>;
}

export default TakeButton;
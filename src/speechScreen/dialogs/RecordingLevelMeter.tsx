import styles from './RecordingLevelMeter.module.css';

import { Microphone, findMaxPeakInSamples } from 'sl-web-audio';
import { useEffect, useState } from 'react';

interface IProps {
  onMicStateChange?: (micState:MicState) => void;
}

export enum MicState {
  INITIALIZING,
  UNAVAILABLE,
  AVAILABLE,
  OFF
}

let microphone:Microphone|null = null;
let micState:MicState = MicState.OFF;
const SHOW_MIC_UNAVAILABLE_AFTER_MSECS = 1000;

function _changeMicState(newMicState:MicState, onMicStateChange?:Function) {
  if (micState === newMicState) return;
  micState = newMicState;
  if (onMicStateChange) onMicStateChange(newMicState);
}

function RecordingLevelMeter(props:IProps) {
  const { onMicStateChange } = props;
  const [loudness, setLoudness] = useState<number>(0);
  
  useEffect(() => {
    _changeMicState(MicState.INITIALIZING, onMicStateChange);
    microphone = new Microphone((samples:Float32Array, sampleRate:number) => {
      const peakValue = findMaxPeakInSamples(samples);
      const nextLoudness = Math.min(1, peakValue);
      setLoudness(nextLoudness);
      _changeMicState(MicState.AVAILABLE, onMicStateChange);
    });
    microphone.init().then(() => {
      microphone?.enable();
    });
    setTimeout(() => {
      if (micState === MicState.INITIALIZING) _changeMicState(MicState.UNAVAILABLE, onMicStateChange);
    }, SHOW_MIC_UNAVAILABLE_AFTER_MSECS);
    
    return () => { 
      microphone?.disable();
      microphone = null;
      _changeMicState(MicState.OFF, onMicStateChange);
    }
  }, [onMicStateChange]);
  
  return (
    <div className={styles.container}>
      <span className={micState === MicState.AVAILABLE ? styles.cell0 : styles.cellOff}/>
      <span className={loudness >= .1 ? styles.cell1 : styles.cellOff}/>
      <span className={loudness >= .2 ? styles.cell2 : styles.cellOff}/>
      <span className={loudness >= .3 ? styles.cell3 : styles.cellOff}/>
      <span className={loudness >= .4 ? styles.cell4 : styles.cellOff}/>
      <span className={loudness >= .5 ? styles.cell5 : styles.cellOff}/>
      <span className={loudness >= .6 ? styles.cell6 : styles.cellOff}/>
      <span className={loudness >= .7 ? styles.cell7 : styles.cellOff}/>
      <span className={loudness >= .8 ? styles.cell8 : styles.cellOff}/>
      <span className={loudness >= .9 ? styles.cell9 : styles.cellOff}/>
    </div>);
}

export default RecordingLevelMeter;
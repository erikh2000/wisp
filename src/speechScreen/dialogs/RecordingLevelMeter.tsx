import {MicState} from "./AudioRecorder";
import styles from './RecordingLevelMeter.module.css';

interface IProps {
  loudness:number,
  micState:MicState
}

function RecordingLevelMeter(props:IProps) {
  const { loudness, micState } = props;
  
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
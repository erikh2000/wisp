import TrimSlider from "./TrimSlider";
import styles from "./TrimSpeechDialog.module.css";
import {loadTakeWave} from "speechScreen/interactions/takeInteractions";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import WaveformTimeMarker, {MarkerType} from "ui/waveformVisualizer/WaveformTimeMarker";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";

import { useEffect, useState } from "react";
import { createAudioBufferForRange, playAudioBufferRange, stopAll } from "sl-web-audio";

interface IProps {
  isOpen: boolean;
  takeWavKey: string|null;
  onCancel: () => void;
  onComplete: (audioBuffer:AudioBuffer) => void;
}

function _onClickNext(audioBuffer:AudioBuffer|null, startPercent:number, endPercent:number, onComplete:Function) {
  if (!audioBuffer) throw Error('Unexpected');
  const duration = audioBuffer.duration;
  const startTime = (startPercent / 100) * duration;
  const rangeDuration = (endPercent / 100) * duration - startTime;
  const trimmedAudioBuffer = createAudioBufferForRange(audioBuffer, startTime, rangeDuration);
  onComplete(trimmedAudioBuffer);
}

function _onPlayTrimmedWave(audioBuffer:AudioBuffer|null, startPercent:number, endPercent:number) {
  if (!audioBuffer) return;
  const startTime = audioBuffer.duration * (startPercent/100);
  const duration = audioBuffer.duration * (endPercent/100) - startTime;
  stopAll();
  playAudioBufferRange(audioBuffer, startTime, duration);
}

function TrimSpeechDialog(props:IProps) {
  const {isOpen, onCancel, onComplete, takeWavKey} = props;
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer|null>(null);
  const [startValue, setStartValue] = useState<number>(0);
  const [endValue, setEndValue] = useState<number>(100);
  const [timeMarkers, setTimeMarkers] = useState<WaveformTimeMarker[]>([]);
  
  useEffect(() => {
    if (!isOpen || !takeWavKey) return;
    setSamples(null);
    setStartValue(0);
    setEndValue(100);
    loadTakeWave(takeWavKey).then(audioBuffer => {
      setAudioBuffer(audioBuffer);
      setSamples(audioBuffer.getChannelData(0));
    });
  }, [isOpen, takeWavKey, setAudioBuffer, setSamples, setStartValue, setEndValue]);
  
  useEffect(() => {
    if (!audioBuffer) return;
    const lastSampleNo = audioBuffer.length - 1;
    const startSampleNo = (lastSampleNo * (startValue/100));
    const endSampleNo = (lastSampleNo * (endValue/100));
    setTimeMarkers([
      {markerType:MarkerType.Primary, sampleNo:startSampleNo, toSampleNo:null, description:null, isBackground:false},
      {markerType:MarkerType.Primary, sampleNo:endSampleNo, toSampleNo:null, description:null, isBackground:false},
    ]);
  }, [audioBuffer, startValue, endValue]);
  
  const isNextDisabled = !audioBuffer;
  
  return (
  <ModalDialog isOpen={isOpen} title="Finalize Take - Trim Audio" onCancel={onCancel}>
    <p className={styles.descriptionText}>Trim silence or other unwanted audio from your speech by adjusting start and end points below.</p>
    <WaveformVisualizer 
      amplitudeMarkers={[]} 
      blockMarkers={[]} 
      timeMarkers={timeMarkers} 
      className={styles.waveformContainer} 
      beginSampleNo={0} 
      endSampleNo={audioBuffer?.length ?? 0} 
      samples={samples} 
      needleSampleNo={null} 
    />
    <TrimSlider 
      leftValue={startValue} 
      rightValue={endValue}
      onLeftChange={(nextStartValue) => setStartValue(nextStartValue)} 
      onRightChange={(nextEndValue) => setEndValue(nextEndValue)} 
    />
    <DialogFooter>
      <DialogButton text="Cancel" onClick={onCancel} />
      <DialogButton text="Test" onClick={() => _onPlayTrimmedWave(audioBuffer, startValue, endValue)} />
      <DialogButton text="Next" onClick={() => _onClickNext(audioBuffer, startValue, endValue, onComplete)} isPrimary disabled={isNextDisabled}/>
    </DialogFooter>
  </ModalDialog>);
}

export default TrimSpeechDialog;
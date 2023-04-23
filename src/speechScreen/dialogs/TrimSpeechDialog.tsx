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

const FRAME_INTERVAL = 1000/20;

function _onClickNext(audioBuffer:AudioBuffer|null, startPercent:number, endPercent:number, onComplete:Function) {
  if (!audioBuffer) throw Error('Unexpected');
  const duration = audioBuffer.duration;
  const startTime = (startPercent / 100) * duration;
  const rangeDuration = (endPercent / 100) * duration - startTime;
  const trimmedAudioBuffer = createAudioBufferForRange(audioBuffer, startTime, rangeDuration);
  onComplete(trimmedAudioBuffer);
}

function _onPlayTrimmedWave(audioBuffer:AudioBuffer|null, startPercent:number, endPercent:number, setStartPlayTime:Function, setIsPlaying:Function) {
  if (!audioBuffer) return;
  const startTime = audioBuffer.duration * (startPercent/100);
  const duration = audioBuffer.duration * (endPercent/100) - startTime;
  stopAll();
  playAudioBufferRange(audioBuffer, startTime, duration, () => setIsPlaying(false));
  setStartPlayTime(Date.now());
  setIsPlaying(true);
}

function _calcNeedSamplePos(audioBuffer:AudioBuffer|null, startPercent:number, startPlayTime:number) {
  if (!audioBuffer) return null;
  const elapsed = (Date.now() - startPlayTime) / 1000;
  const trimStartTime = (startPercent / 100) * audioBuffer.duration;
  let samplePos = Math.floor(((trimStartTime + elapsed) / audioBuffer.duration) * audioBuffer.length);
  if (samplePos >= audioBuffer.length) samplePos = audioBuffer.length - 1;
  return samplePos;
}

function TrimSpeechDialog(props:IProps) {
  const {isOpen, onCancel, onComplete, takeWavKey} = props;
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer|null>(null);
  const [startValue, setStartValue] = useState<number>(0);
  const [endValue, setEndValue] = useState<number>(100);
  const [timeMarkers, setTimeMarkers] = useState<WaveformTimeMarker[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startPlayTime, setStartPlayTime] = useState<number>(0);
  const [frameNo, setFrameNo] = useState<number>(0);
  
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

  useEffect(() => { // Cause re-render at regular interval.
    const timer = setTimeout(() => setFrameNo(frameNo + 1), FRAME_INTERVAL);
    return () => clearTimeout(timer);
  }, [frameNo]);
  
  const needleSamplePos = isPlaying ? _calcNeedSamplePos(audioBuffer, startValue, startPlayTime) : null;
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
      needleSampleNo={needleSamplePos} 
    />
    <TrimSlider 
      leftValue={startValue} 
      rightValue={endValue}
      onLeftChange={(nextStartValue) => setStartValue(nextStartValue)} 
      onRightChange={(nextEndValue) => setEndValue(nextEndValue)} 
    />
    <DialogFooter>
      <DialogButton text="Cancel" onClick={onCancel} />
      <DialogButton text="Test" onClick={() => _onPlayTrimmedWave(audioBuffer, startValue, endValue, setStartPlayTime, setIsPlaying)} />
      <DialogButton text="Next" onClick={() => _onClickNext(audioBuffer, startValue, endValue, onComplete)} isPrimary disabled={isNextDisabled}/>
    </DialogFooter>
  </ModalDialog>);
}

export default TrimSpeechDialog;
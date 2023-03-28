import RecordingLevelMeter from "./RecordingLevelMeter";

import { Microphone, findMaxPeakInSamples } from 'sl-web-audio';
import { useEffect, useState } from 'react';

interface IProps {
  onMicStateChange?: (micState:MicState) => void;
  onReceiveSamples?: (samples:Float32Array, sampleRate:number) => void;
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

// It seems that meter over-reports red when there's little risk of clipping, so I adjust the peak value down a bit.
const PEAK_ADJUST_FOR_DISPLAY = .8;

function AudioRecorder(props:IProps) {
  const { onMicStateChange, onReceiveSamples } = props;
  const [loudness, setLoudness] = useState<number>(0);

  useEffect(() => {
    _changeMicState(MicState.INITIALIZING, onMicStateChange);
    microphone = new Microphone((samples:Float32Array, sampleRate:number) => {
      const peakValue = findMaxPeakInSamples(samples);
      const nextLoudness = Math.min(1, peakValue * PEAK_ADJUST_FOR_DISPLAY);
      setLoudness(nextLoudness);
      if (onReceiveSamples) onReceiveSamples(samples, sampleRate);
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
  }, [onMicStateChange, onReceiveSamples]);

  return <RecordingLevelMeter loudness={loudness} micState={micState}/>;
}

export default AudioRecorder;
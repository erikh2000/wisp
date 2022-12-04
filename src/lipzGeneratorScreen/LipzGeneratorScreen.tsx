import styles from './LipzGeneratorScreen.module.css';
import {generateLipzTextFromAudioBuffer, init, PhonemeTimeline} from "./lipzGenerationUtil";
import IWaveformAmplitudeMarker from "ui/waveformVisualizer/WaveformAmplitudeMarker";
import IWaveformBlockMarker from "ui/waveformVisualizer/WaveformBlockMarker";
import IWaveformTimeMarker, {MarkerType} from "ui/waveformVisualizer/WaveformTimeMarker";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";

import React, {useEffect, useState} from 'react';
import { WordTimeline } from 'sl-web-speech';
import {loadWavFromUrl, mSecsToSampleCount} from "sl-web-face";

let isInitialized = false;

async function _init():Promise<void> {
  if (isInitialized) return;
  return init();
}

async function _extract(setSamples:any, setSampleRate:any, setWordTimeline:any, setPhonemeTimeline:any) {
  if (!isInitialized) return;
  const audioBuffer = await loadWavFromUrl('/speech/male3.wav');
  
  const debugCapture:any = {};
  const lipzText = await generateLipzTextFromAudioBuffer(audioBuffer, debugCapture);
  console.log(`[${lipzText}]`);
  console.log(debugCapture.wordTimeline);
  setWordTimeline(debugCapture.wordTimeline);
  setPhonemeTimeline(debugCapture.phonemeTimeline);
  setSamples(audioBuffer.getChannelData(0));
  setSampleRate(audioBuffer.sampleRate);
}

type Markers = {
  amplitudeMarkers:IWaveformAmplitudeMarker[],
  blockMarkers:IWaveformBlockMarker[],
  timeMarkers:IWaveformTimeMarker[]
}

function _createEmptyMarkers():Markers {
  return {
    amplitudeMarkers:[],
    blockMarkers:[],
    timeMarkers:[]
  }
}

function _createMarkersFromTimelines(wordTimeline:WordTimeline, phonemeTimeline:PhonemeTimeline, sampleRate:number):Markers {
  const timeMarkers = wordTimeline.map(wordTiming => {
    const description = wordTiming.word;
    const sampleNo = mSecsToSampleCount(wordTiming.startTime, sampleRate); 
    const toSampleNo = mSecsToSampleCount(wordTiming.endTime, sampleRate);
    return {
      markerType:MarkerType.Primary,
      sampleNo, toSampleNo, description,
      isBackground:false
    }
  });
  phonemeTimeline.forEach(phonemeTiming => {
    const description = phonemeTiming.phoneme;
    const sampleNo = mSecsToSampleCount(phonemeTiming.time, sampleRate);
    const toSampleNo = sampleNo;
    timeMarkers.push({
      markerType:MarkerType.Secondary,
      sampleNo, toSampleNo, description,
      isBackground:false
    });
  });
  return { amplitudeMarkers:[], blockMarkers:[], timeMarkers };
}

function LipzGeneratorScreen() {
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [wordTimeline, setWordTimeline] = useState<WordTimeline>([]);
  const [phonemeTimeline, setPhonemeTimeline] = useState<PhonemeTimeline>([]);
  const [markers, setMarkers] = useState<Markers>(_createEmptyMarkers());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isInitialized) return;
    _init()
      .then(() => {
        setIsLoading(false);
        isInitialized = true;
      });
  }, []);

  useEffect(() => {
    if (!samples) return;
    const nextMarkers = _createMarkersFromTimelines(wordTimeline, phonemeTimeline, sampleRate);
    setMarkers(nextMarkers);
  }, [wordTimeline, phonemeTimeline, samples, sampleRate]);

  const waveform = !samples ? null :
    (<WaveformVisualizer
      samples={samples}
      beginSampleNo={0}
      endSampleNo={samples.length}
      amplitudeMarkers={markers.amplitudeMarkers}
      blockMarkers={markers.blockMarkers}
      timeMarkers={markers.timeMarkers}
      className={styles.waveform}
    />);
  
  return (
    <div className={styles.app}>
      <div className={styles.configPanel}>
        <button onClick={() => _extract(setSamples, setSampleRate, setWordTimeline, setPhonemeTimeline)} disabled={isLoading}>Find Words</button>
      </div>
      {waveform}
    </div>
  );
}

export default LipzGeneratorScreen;
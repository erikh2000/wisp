import styles from './LipzGeneratorScreen.module.css';
import IWaveformAmplitudeMarker from "ui/waveformVisualizer/WaveformAmplitudeMarker";
import IWaveformBlockMarker from "ui/waveformVisualizer/WaveformBlockMarker";
import IWaveformTimeMarker, {MarkerType} from "ui/waveformVisualizer/WaveformTimeMarker";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";

import React, {useEffect, useState} from 'react';
import { WordTimelineExtractor, WordTimeline } from 'sl-web-speech';
import { loadWavFromUrl } from "sl-web-face";

let extractor:WordTimelineExtractor|null = null;
let isInitialized = false;

async function _init():Promise<void> {
  if (isInitialized) return;
  return new Promise(resolve => {
    extractor = new WordTimelineExtractor(() => { 
      resolve(); 
    });
  });
}

async function _extract(setSamples:any, setSampleRate:any, setWordTimeline:any) {
  if (!isInitialized) return;
  const audioBuffer = await loadWavFromUrl('/speech/male1.wav');
  const wordTimeline = await extractor?.extract(audioBuffer);
  setWordTimeline(wordTimeline);
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

function _createMarkersFromTimelines(wordTimeline:WordTimeline, sampleRate:number):Markers {
  const timeMarkers = wordTimeline.map(wordTiming => {
    const description = wordTiming.word;
    const sampleNo = (wordTiming.startTime / 1000) * sampleRate;
    const toSampleNo = (wordTiming.endTime / 1000) * sampleRate;
    return {
      markerType:MarkerType.Primary,
      sampleNo, toSampleNo, description,
      isBackground:false
    }
  });
  return { amplitudeMarkers:[], blockMarkers:[], timeMarkers };
}

function LipzGeneratorScreen() {
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [wordTimeline, setWordTimeline] = useState<WordTimeline>([]);
  const [markers, setMarkers] = useState<Markers>(_createEmptyMarkers());

  useEffect(() => {
    if (isInitialized) return;
    _init()
      .then(() => isInitialized = true);
  }, []);

  useEffect(() => {
    if (!samples) return;
    const nextMarkers = _createMarkersFromTimelines(wordTimeline, sampleRate);
    setMarkers(nextMarkers);
  }, [wordTimeline, samples, sampleRate]);

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
        <button onClick={() => _extract(setSamples, setSampleRate, setWordTimeline)}>Find Words</button>
      </div>
      {waveform}
    </div>
  );
}

export default LipzGeneratorScreen;
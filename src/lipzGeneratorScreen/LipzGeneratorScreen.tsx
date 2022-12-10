import styles from './LipzGeneratorScreen.module.css';
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import IWaveformAmplitudeMarker from "ui/waveformVisualizer/WaveformAmplitudeMarker";
import IWaveformBlockMarker from "ui/waveformVisualizer/WaveformBlockMarker";
import IWaveformTimeMarker, {MarkerType} from "ui/waveformVisualizer/WaveformTimeMarker";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";

import React, {useEffect, useState} from 'react';
import { WordTimeline, generateLipzTextFromAudioBuffer, init, PhonemeTimeline, wavToLipzTextFilename } from 'sl-web-speech';
import {mSecsToSampleCount, loadWavFromFileSystem} from "sl-web-audio";

let isInitialized = false;

async function _init():Promise<void> {
  if (isInitialized) return;
  return init();
}

async function _openWav(setSamples:any, setSampleRate:any, setWordTimeline:any, setPhonemeTimeline:any, setLipzSuggestedFilename:any, setLipzText:any) {
  const wavFileData = await loadWavFromFileSystem();
  if (!wavFileData) return;
  const { audioBuffer, filename } = wavFileData;

  const debugCapture:any = {};
  const lipzText = await generateLipzTextFromAudioBuffer(audioBuffer, debugCapture);
  setWordTimeline(debugCapture.wordTimeline);
  setPhonemeTimeline(debugCapture.phonemeTimeline);
  setSamples(audioBuffer.getChannelData(0));
  setSampleRate(audioBuffer.sampleRate);
  setLipzText(lipzText);
  const suggestedLipzTextFilename = wavToLipzTextFilename(filename);
  setLipzSuggestedFilename(suggestedLipzTextFilename);
}

async function _saveLipz(lipzText:string, suggestedFilename:string):Promise<void> {
  try {
    const saveFileOptions = {
      suggestedName:suggestedFilename,
      excludeAcceptAllOption: true,
      multiple:false,
      types: [{
        description: 'Lipz Files',
        accept: {'text/plain': ['.lipz.txt']}
      }]
    };
    const fileHandle:FileSystemFileHandle = await (window as any).showSaveFilePicker(saveFileOptions);
    const writable = await (fileHandle as any).createWritable();
    await writable.write(lipzText);
    return writable.close();
  } catch(err) {
    console.error(err);
  }
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
  const [lipzText, setLipzText] = useState<string|null>(null);
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [wordTimeline, setWordTimeline] = useState<WordTimeline>([]);
  const [phonemeTimeline, setPhonemeTimeline] = useState<PhonemeTimeline>([]);
  const [markers, setMarkers] = useState<Markers>(_createEmptyMarkers());
  const [lipzSuggestedFilename, setLipzSuggestedFilename] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isInitialized) { setIsLoading(false); return; }
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
    <ScreenContainer isControlPaneOpen={true} activeScreen={Screen.SPEECH}>
      <div className={styles.app}>
        <div className={styles.configPanel}>
          <button onClick={() => _openWav(setSamples, setSampleRate, setWordTimeline, setPhonemeTimeline, setLipzSuggestedFilename, setLipzText)} disabled={isLoading}>Open WAV</button>
          <button onClick={() => {if (lipzText) _saveLipz(lipzText, lipzSuggestedFilename)} } disabled={lipzText === null}>Save LIPZ</button>
        </div>
        {waveform}
        <label className={styles.lipzTextLabel}>Lipz Text:
          <input className={styles.lipzTextInput} type='text' value={lipzText ?? ''} 
                 onChange={(event) => setLipzText(event.target.value)} />
        </label>
      </div>
    </ScreenContainer>
  );
}

export default LipzGeneratorScreen;
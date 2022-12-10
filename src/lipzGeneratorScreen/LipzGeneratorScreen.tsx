import styles from './LipzGeneratorScreen.module.css';
import { changeLipzText, init, isInitialized, onDrawMouth, onMouthClick, openWav, saveLipz } from "./lipzGeneratorScreenInteractions";
import { Markers, createEmptyMarkers, createMarkersFromTimelines } from "lipzGeneratorScreen/markerGeneration";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";
import Canvas from "ui/Canvas";
import ContentPaneButton from "ui/ContentPaneButton";

import React, {useEffect, useState} from 'react';
import { PhonemeTimeline, WordTimeline } from 'sl-web-speech';

function LipzGeneratorScreen() {
  const [lipzText, setLipzText] = useState<string|null>(null);
  const [samples, setSamples] = useState<Float32Array|null>(null);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [needleSampleNo, setNeedleSampleNo] = useState<number|null>(null);
  const [wordTimeline, setWordTimeline] = useState<WordTimeline>([]);
  const [phonemeTimeline, setPhonemeTimeline] = useState<PhonemeTimeline>([]);
  const [markers, setMarkers] = useState<Markers>(createEmptyMarkers());
  const [lipzSuggestedFilename, setLipzSuggestedFilename] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isInitialized()) { setIsLoading(false); return; }
    init().then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!samples) return;
    const nextMarkers = createMarkersFromTimelines(wordTimeline, phonemeTimeline, sampleRate);
    setMarkers(nextMarkers);
  }, [wordTimeline, phonemeTimeline, samples, sampleRate]);

  const content = !samples ? (
    <p>Open a WAV file to process.</p>
  ) : (
    <React.Fragment>
      <WaveformVisualizer
        samples={samples}
        beginSampleNo={0}
        endSampleNo={samples.length}
        amplitudeMarkers={markers.amplitudeMarkers}
        blockMarkers={markers.blockMarkers}
        timeMarkers={markers.timeMarkers}
        className={styles.waveform}
        needleSampleNo={needleSampleNo}
      />
      <label className={styles.lipzTextLabel}>Phoneme Spacings:
        <input className={styles.lipzTextInput} type='text' value={lipzText ?? ''}
               onChange={(event) => changeLipzText(event.target.value, setLipzText)} />
      </label>
      <Canvas className={styles.mouth} isAnimated={true} onDraw={onDrawMouth} onClick={() => onMouthClick(setNeedleSampleNo)} />
    </React.Fragment>
  );
  
  return (
    <ScreenContainer isControlPaneOpen={true} activeScreen={Screen.SPEECH}>
      <div className={styles.container}>
        <div className={styles.configPanel}>
          <ContentPaneButton text='Open WAV' onClick={() => openWav(setSamples, setSampleRate, setWordTimeline, setPhonemeTimeline, setLipzSuggestedFilename, setLipzText)} disabled={isLoading}/>
          <ContentPaneButton text='Save LIPZ' onClick={() => {if (lipzText) saveLipz(lipzText, lipzSuggestedFilename)} } disabled={lipzText === null}/>
        </div>
        {content}
      </div>
    </ScreenContainer>
  );
}

export default LipzGeneratorScreen;
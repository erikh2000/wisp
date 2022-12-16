import styles from './LipzGeneratorScreen.module.css';
import {
  Revision,
  changeLipzText,
  getRevisionForMount,
  init,
  isInitialized,
  onDrawMouth,
  onMouthClick,
  openWav,
  redo,
  saveLipz,
  undo
} from "./lipzGeneratorScreenInteractions";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";
import Canvas from "ui/Canvas";
import ContentPaneButton from "ui/ContentPaneButton";
import LoadingBox from "ui/LoadingBox";

import React, {useEffect, useState} from 'react';

function emptyCallback() {} // TODO delete when not using

function LipzGeneratorScreen() {
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needleSampleNo, setNeedleSampleNo] = useState<number|null>(null);
  
  const { lipzText, markers, samples, lipzSuggestedFilename } = revision;
  
  useEffect(() => {
    if (isInitialized()) { setIsLoading(false); return; }
    init().then(() => setIsLoading(false));
  }, []);
  
  useEffect(() => {
    setNeedleSampleNo(0);
  }, [samples]);

  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0},
    {text:'Open', onClick:emptyCallback, groupNo:0},
    {text:'Undo', onClick:() => undo(setRevision), groupNo:0},
    {text:'Redo', onClick:() => redo(setRevision), groupNo:0},
    {text:'Import', onClick:emptyCallback, groupNo:1},
    {text:'Export', onClick:emptyCallback, groupNo:1}
  ];

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
               onChange={(event) => changeLipzText(event.target.value, setRevision)} />
      </label>
      <Canvas className={styles.mouth} isAnimated={true} onDraw={onDrawMouth} onClick={() => onMouthClick(setNeedleSampleNo)} />
    </React.Fragment>
  );
  
  return (
    <ScreenContainer isControlPaneOpen={true} activeScreen={Screen.SPEECH} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        <div className={styles.configPanel}>
          <ContentPaneButton text='Open WAV' onClick={() => openWav(setRevision)} disabled={isLoading}/>
          <ContentPaneButton text='Save LIPZ' onClick={() => {if (lipzText) saveLipz(lipzText, lipzSuggestedFilename)} } disabled={lipzText === null}/>
        </div>
        <LoadingBox className={styles.loadingLanguageModels} text='loading language model' />
        {content}
      </div>
    </ScreenContainer>
  );
}

export default LipzGeneratorScreen;
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
import LoadingBox from "ui/LoadingBox";

import React, {useEffect, useState} from 'react';

function emptyCallback() {} // TODO delete when not using

function LipzGeneratorScreen() {
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [isLoadingLanguageModel, setIsLoadingLanguageModel] = useState<boolean>(true);
  const [isLoadingWav, setIsLoadingWav] = useState<boolean>(false);
  const [needleSampleNo, setNeedleSampleNo] = useState<number|null>(null);
  
  const { lipzText, markers, samples, lipzSuggestedFilename } = revision;
  
  useEffect(() => {
    if (isInitialized()) { setIsLoadingLanguageModel(false); return; }
    init().then(() => setIsLoadingLanguageModel(false));
  }, []);
  
  useEffect(() => {
    setNeedleSampleNo(0);
  }, [samples]);

  const disabled = isLoadingLanguageModel || isLoadingWav;
  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0, disabled},
    {text:'Open', onClick:emptyCallback, groupNo:0, disabled},
    {text:'Undo', onClick:() => undo(setRevision), groupNo:0, disabled},
    {text:'Redo', onClick:() => redo(setRevision), groupNo:0, disabled},
    {text:'Import', onClick:() => openWav(setRevision, setIsLoadingWav), groupNo:1, disabled},
    {text:'Export', onClick:() => {if (lipzText) saveLipz(lipzText, lipzSuggestedFilename)}, groupNo:1, disabled:disabled || lipzText === null}
  ];

  let content:JSX.Element|null = null;
  if (isLoadingLanguageModel) {
    content = <LoadingBox className={styles.loadingBox} text='loading language model' />;
  }
  if (!content && isLoadingWav) {
    content = <LoadingBox className={styles.loadingBox} text='recognizing words in audio' />;
  }
  if (!content && !samples) {
    content = <p>Import a WAV file to process.</p>; 
  }
  if (!content && samples) {
    content = (
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
  }
  
  return (
    <ScreenContainer isControlPaneOpen={true} activeScreen={Screen.SPEECH} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        {content}
      </div>
    </ScreenContainer>
  );
}

export default LipzGeneratorScreen;
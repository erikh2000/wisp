import styles from './FaceBuilderScreen.module.css';
import {
  FaceScreenRevision,
  getRevisionForMount,
  init, 
  isHeadReady,
  onDrawFaceCanvas, 
  onEmotionChange, 
  onLidLevelChange, 
  onPartTypeChange,
  onRedo, 
  onTestVoiceChange,
  onUndo
} from "./faceBuilderScreenInteractions";
import Canvas from "ui/Canvas";
import EmotionSelector from "faceBuilderScreen/EmotionSelector";
import ExtraSelectionPane from "faceBuilderScreen/ExtraSelectionPane";
import HeadSelectionPane from "faceBuilderScreen/HeadSelectionPane";
import EyesSelectionPane from "faceBuilderScreen/EyesSelectionPane";
import LidLevelSelector from "faceBuilderScreen/LidLevelSelector";
import MouthSelectionPane from "faceBuilderScreen/MouthSelectionPane";
import PartSelector, {PartType} from "faceBuilderScreen/PartSelector";
import TestVoiceSelector from "faceBuilderScreen/TestVoiceSelector";
import LoadingBox from "ui/LoadingBox";
import ScreenContainer from 'ui/screen/ScreenContainer';
import Screen from 'ui/screen/screens';
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React, {useEffect, useState, useReducer} from 'react';

function emptyCallback() {} // TODO delete when not using

function FaceBuilderScreen() {
  const [revision, setRevision] = useState<FaceScreenRevision>(getRevisionForMount());
  const { partType, testVoice, emotion, lidLevel } = revision;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  useEffect(() => {
    init().then(() => forceUpdate());
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0},
    {text:'Open', onClick:emptyCallback, groupNo:0},
    {text:'Rename', onClick:emptyCallback, groupNo:0},
    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:0},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:0},
    {text:'Import', onClick:emptyCallback, groupNo:1},
    {text:'Export', onClick:emptyCallback, groupNo:1}
  ];
  
  let selectionPane:JSX.Element|null;
  switch(partType) {
    case PartType.HEAD:
      selectionPane = <HeadSelectionPane className={styles.selectionPane} onReplace={() => {}} />
      break;
    case PartType.EYES:
      selectionPane = <EyesSelectionPane className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={true} />
      break;
    case PartType.MOUTH:
      selectionPane = <MouthSelectionPane className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={true} />
      break;
    default:
      selectionPane = <ExtraSelectionPane partNo={1} className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={false} />
      break;
  }
  
  const faceContent:JSX.Element = isHeadReady() 
    ? <Canvas className={styles.canvas} isAnimated={true} onDraw={onDrawFaceCanvas} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  return (
    <ScreenContainer documentName='Old Billy' actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.FACES}>
      <div className={styles.container}>
        <InnerContentPane className={styles.facePane} caption='Face'>
          <PartSelector partType={partType} onChange={(nextPartType) => onPartTypeChange(nextPartType, setRevision)} extraCount={0} />
          {faceContent}
        </InnerContentPane>
        <div className={styles.rightColumn}>
          <InnerContentPane className={styles.viewPane} caption='View'>
            <EmotionSelector emotion={emotion} onChange={(nextEmotion) => onEmotionChange(nextEmotion, setRevision)}/>
            <LidLevelSelector lidLevel={lidLevel} onChange={(nextLidLevel) => onLidLevelChange(nextLidLevel, setRevision)}/>
            <TestVoiceSelector testVoiceType={testVoice} onChange={(nextTestVoice) => onTestVoiceChange(nextTestVoice, setRevision)} />
          </InnerContentPane>
          {selectionPane}
        </div>
      </div>
    </ScreenContainer>
  );
}

export default FaceBuilderScreen;
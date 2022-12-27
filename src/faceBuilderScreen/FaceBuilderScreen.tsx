import styles from './FaceBuilderScreen.module.css';
import {
  InitResults,
  Revision,
  deinit,
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
import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";
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
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const { partType, testVoice, emotion, lidLevel } = revision;
  
  useEffect(() => {
    init(setRevision).then((nextInitResults:InitResults) => {
      setInitResults(nextInitResults);
    });
    return deinit();
  }, []);
  
  const disabled = initResults === null;
  const actionBarButtons = [
    {text:'New', onClick:() => setModalDialog(ConfirmCancelDialog.name), groupNo:0, disabled},
    {text:'Open', onClick:emptyCallback, groupNo:0, disabled},
    {text:'Rename', onClick:emptyCallback, groupNo:0, disabled},
    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:0, disabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:0, disabled},
    {text:'Import', onClick:emptyCallback, groupNo:1, disabled},
    {text:'Export', onClick:emptyCallback, groupNo:1, disabled}
  ];
  
  let selectionPane:JSX.Element|null;
  switch(partType) {
    case PartType.HEAD:
      selectionPane = <HeadSelectionPane className={styles.selectionPane} onReplace={() => {}} disabled={disabled}/>
      break;
    case PartType.EYES:
      selectionPane = <EyesSelectionPane className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={true} disabled={disabled}/>
      break;
    case PartType.MOUTH:
      selectionPane = <MouthSelectionPane className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={true} disabled={disabled}/>
      break;
    default:
      selectionPane = <ExtraSelectionPane partNo={1} className={styles.selectionPane} onAdd={() => {}} onReplace={() => {}} onRemove={() => {}} isSpecified={false} disabled={disabled}/>
      break;
  }
  
  const faceContent:JSX.Element = isHeadReady() 
    ? <Canvas className={styles.canvas} isAnimated={true} onDraw={onDrawFaceCanvas} 
              onMouseMove={initResults?.onFaceCanvasMouseMove} onMouseDown={initResults?.onFaceCanvasMouseDown} 
              onMouseUp={initResults?.onFaceCanvasMouseUp} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  
  return (
    <ScreenContainer documentName='Old Billy' actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.FACES}>
      <div className={styles.container}>
        <InnerContentPane className={styles.facePane} caption='Face'>
          <PartSelector partType={partType} onChange={(nextPartType) => onPartTypeChange(nextPartType, setRevision)} extraCount={0} disabled={disabled}/>
          {faceContent}
        </InnerContentPane>
        <div className={styles.rightColumn}>
          <InnerContentPane className={styles.viewPane} caption='View'>
            <EmotionSelector emotion={emotion} onChange={(nextEmotion) => onEmotionChange(nextEmotion, setRevision)} disabled={disabled}/>
            <LidLevelSelector lidLevel={lidLevel} onChange={(nextLidLevel) => onLidLevelChange(nextLidLevel, setRevision)} disabled={disabled}/>
            <TestVoiceSelector testVoiceType={testVoice} onChange={(nextTestVoice) => onTestVoiceChange(nextTestVoice, setRevision)} disabled={disabled}/>
          </InnerContentPane>
          {selectionPane}
        </div>
      </div>
      <ConfirmCancelDialog isOpen={modalDialog === ConfirmCancelDialog.name} onConfirm={() => {}} onCancel={() => {setModalDialog(null)}} title='Are You Sure?' description='Did you really think this through?' /> 
    </ScreenContainer>
  );
}

export default FaceBuilderScreen;
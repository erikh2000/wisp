import styles from './FaceBuilderScreen.module.css';
import Canvas from "ui/Canvas";
import EmotionSelector from "faceBuilderScreen/EmotionSelector";
import ExtraSelectionPane from "faceBuilderScreen/ExtraSelectionPane";
import HeadSelectionPane from "faceBuilderScreen/HeadSelectionPane";
import EyesSelectionPane from "faceBuilderScreen/EyesSelectionPane";
import LidLevelSelector from "faceBuilderScreen/LidLevelSelector";
import MouthSelectionPane from "faceBuilderScreen/MouthSelectionPane";
import PartSelector, {PartType} from "faceBuilderScreen/PartSelector";
import TestVoiceSelector, {TestVoiceType} from "faceBuilderScreen/TestVoiceSelector";
import ScreenContainer from 'ui/screen/ScreenContainer';
import Screen from 'ui/screen/screens';
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React, {useEffect, useState} from 'react';
import {AttentionController, BlinkController, CanvasComponent, loadFaceFromUrl} from "sl-web-face";
import RevisionManager from "../documents/RevisionManager";

function emptyCallback() {} // TODO delete when not using

type FaceScreenRevision = {
  testVoice:TestVoiceType,
  partType:PartType
};

let head:CanvasComponent|null = null;
let isInitialized = false;
const blinkController = new BlinkController();
const attentionController = new AttentionController();
const revisionManager:RevisionManager<FaceScreenRevision> = new RevisionManager<FaceScreenRevision>();

async function _init():Promise<void> {
  head = await loadFaceFromUrl('/faces/billy.yml');
  head.offsetX = 50;
  head.offsetY = 30;
  blinkController.start();
  attentionController.start();
}

function _onUndo(setRevision:any) {
  const nextRevision = revisionManager.prev();
  if (nextRevision) setRevision(nextRevision);
}

function _onRedo(setRevision:any) {
  const nextRevision = revisionManager.next();
  if (nextRevision) setRevision(nextRevision);
}

function _onDrawCanvas(context:CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  if (!isInitialized || !head) return;
  head.renderWithChildren(context);
}

function _onTestVoiceChange(testVoice:TestVoiceType, setRevision:any) {
  revisionManager.addChanges({testVoice});
  setRevision(revisionManager.currentRevision);
}

function _onPartTypeChange(partType:PartType, setRevision:any) {
  revisionManager.addChanges({partType});
  setRevision(revisionManager.currentRevision);
}

function _getRevisionForMount():FaceScreenRevision {
  let revision = revisionManager.currentRevision;
  if (!revision) {
    revision = {
      partType: PartType.HEAD,
      testVoice: TestVoiceType.MUTED
    };
    revisionManager.add(revision);
  }
  return revision;
}

function FaceBuilderScreen() {
  const [revision, setRevision] = useState<FaceScreenRevision>(_getRevisionForMount());
  const { partType, testVoice } = revision;
  
  useEffect(() => {
    if (isInitialized) return;
    _init()
      .then(() => isInitialized = true);
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0},
    {text:'Open', onClick:emptyCallback, groupNo:0},
    {text:'Undo', onClick:() => _onUndo(setRevision), groupNo:0},
    {text:'Redo', onClick:() => _onRedo(setRevision), groupNo:0},
    {text:'Rename', onClick:emptyCallback, groupNo:0},
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
  
  return (
    <ScreenContainer documentName='Old Billy' actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.FACES}>
      <div className={styles.container}>
        <InnerContentPane className={styles.facePane} caption='Face'>
          <PartSelector partType={partType} onChange={(nextPartType) => _onPartTypeChange(nextPartType, setRevision)} extraCount={0} />
          <Canvas className={styles.canvas} isAnimated={true} onDraw={_onDrawCanvas} />
        </InnerContentPane>
        <div className={styles.rightColumn}>
          <InnerContentPane className={styles.viewPane} caption='View'>
            <EmotionSelector />
            <LidLevelSelector />
            <TestVoiceSelector testVoiceType={testVoice} onChange={(nextTestVoice) => _onTestVoiceChange(nextTestVoice, setRevision)} />
          </InnerContentPane>
          {selectionPane}
        </div>
      </div>
    </ScreenContainer>
  );
}

export default FaceBuilderScreen;
import styles from './FacesScreen.module.css';
import {
  InitResults,
  Revision,
  UNSPECIFIED,
  deinit,
  getRevisionForMount,
  init,
  isHeadReady,
  onAddEyes, 
  onAddMouth,
  onAddNose,
  onDrawFaceCanvas,
  onEmotionChange,
  onEyesChanged,
  onLidLevelChange,
  onMouthChanged,
  onNoseChanged,
  onPartTypeChange,
  onRedo,
  onRemoveEyes, 
  onRemoveMouth,
  onRemoveNose,
  onReplaceEyes, 
  onReplaceMouth,
  onReplaceNose,
  onTestVoiceChange,
  onUndo 
} from "./facesScreenInteractions";
import MouthChooser from "./MouthChooser";
import NoseChooser from "./NoseChooser";
import useEffectAfterMount from "common/useEffectAfterMount";
import EmotionSelector from "facesScreen/EmotionSelector";
import ExtraSelectionPane from "facesScreen/ExtraSelectionPane";
import EyesChooser from "./EyesChooser";
import HeadSelectionPane from "facesScreen/HeadSelectionPane";
import EyesSelectionPane from "facesScreen/EyesSelectionPane";
import LidLevelSelector from "facesScreen/LidLevelSelector";
import MouthSelectionPane from "facesScreen/MouthSelectionPane";
import NoseSelectionPane from "./NoseSelectionPane";
import PartSelector, {PartType} from "facesScreen/PartSelector";
import TestVoiceSelector from "facesScreen/TestVoiceSelector";
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";
import ScreenContainer from 'ui/screen/ScreenContainer';
import Screen from 'ui/screen/screens';
import {LoadablePart} from "ui/partAuthoring/PartLoader";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React, {useState} from 'react';

function emptyCallback() {} // TODO delete when not using

function FacesScreen() {
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [eyeParts, setEyeParts] = useState<LoadablePart[]>([]);
  const [mouthParts, setMouthParts] = useState<LoadablePart[]>([]);
  const [noseParts, setNoseParts] = useState<LoadablePart[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const { partType, testVoice, emotion, lidLevel } = revision;
  
  useEffectAfterMount(() => {
    init(setRevision, setEyeParts, setMouthParts, setNoseParts, setDisabled).then((nextInitResults:InitResults) => {
      setInitResults(nextInitResults);
    });
    return deinit();
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0, disabled},
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
      selectionPane = <EyesSelectionPane className={styles.selectionPane} onAdd={() => onAddEyes(setModalDialog)} onReplace={() => onReplaceEyes(setModalDialog)} onRemove={() => onRemoveEyes(setRevision)} isSpecified={revision.eyesPartNo !== UNSPECIFIED} disabled={disabled}/>
      break;
    case PartType.MOUTH:
      selectionPane = <MouthSelectionPane className={styles.selectionPane} onAdd={() => onAddMouth(setModalDialog)} onReplace={() => onReplaceMouth(setModalDialog)} onRemove={() => onRemoveMouth(setRevision)} isSpecified={revision.mouthPartNo !== UNSPECIFIED} disabled={disabled}/>
      break;
    case PartType.NOSE:
      selectionPane = <NoseSelectionPane className={styles.selectionPane} onAdd={() => onAddNose(setModalDialog)} onReplace={() => onReplaceNose(setModalDialog)} onRemove={() => onRemoveNose(setRevision)} isSpecified={revision.nosePartNo !== UNSPECIFIED} disabled={disabled}/>
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
      <NoseChooser 
        isOpen={modalDialog === NoseChooser.name} 
        onChange={(partNo:number) => onNoseChanged(noseParts, partNo, setModalDialog, setRevision)} 
        onCancel={() => setModalDialog(null)} 
        parts={noseParts} 
        selectedPartNo={revision.nosePartNo}
      />
      <MouthChooser
        isOpen={modalDialog === MouthChooser.name}
        onChange={(partNo:number) => onMouthChanged(mouthParts, partNo, setModalDialog, setRevision)}
        onCancel={() => setModalDialog(null)}
        parts={mouthParts}
        selectedPartNo={revision.mouthPartNo}
      />
      <EyesChooser
        isOpen={modalDialog === EyesChooser.name}
        onChange={(partNo:number) => onEyesChanged(eyeParts, partNo, setModalDialog, setRevision)}
        onCancel={() => setModalDialog(null)}
        parts={eyeParts}
        selectedPartNo={revision.eyesPartNo}
      />
    </ScreenContainer>
  );
}

export default FacesScreen;
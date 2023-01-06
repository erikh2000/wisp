import styles from                      './FacesScreen.module.css';
import PartSelector, {PartType} from    "./PartSelector";
import {getHead, isHeadReady, UNSPECIFIED} from "./interactions/coreUtil";
import {
  InitResults,
  deinit,
  getRevisionForMount,
  init,
  onDrawFaceCanvas,
  onPartTypeChange
} from                                  "./interactions/generalInteractions";
import {
  onChooseEyes,
  onChooseHead,
  onChooseMouth,
  onChooseNose,
  onEyesChanged,
  onHeadChanged,
  onMouthChanged,
  onNoseChanged,
  onRemoveEyes,
  onRemoveMouth,
  onRemoveNose
} from                                  "./interactions/partChooserInteractions";
import {onRedo, onUndo, Revision} from  "./interactions/revisionUtil";
import {
  onHairColorChange, 
  onSkinToneChange
} from "./interactions/recolorUtil";
import {
  onEmotionChange, 
  onLidLevelChange, 
  onTestVoiceChange
} from                                  "./interactions/viewSettingsInteractions";
import HeadChooser from                 "./partChoosers/HeadChooser";
import MouthChooser from                "./partChoosers/MouthChooser";
import NoseChooser from                 "./partChoosers/NoseChooser";
import EyesSelectionPane from           "./selectionPanes/EyesSelectionPane";
import ExtraSelectionPane from          "./selectionPanes/ExtraSelectionPane";
import HeadSelectionPane from           "./selectionPanes/HeadSelectionPane";
import MouthSelectionPane from          "./selectionPanes/MouthSelectionPane";
import NoseSelectionPane from           "./selectionPanes/NoseSelectionPane";
import EyesChooser from                 "./partChoosers/EyesChooser";
import EmotionSelector from             "./view/EmotionSelector";
import LidLevelSelector from            "./view/LidLevelSelector";
import TestVoiceSelector from           "./view/TestVoiceSelector";
import useEffectAfterMount from         "common/useEffectAfterMount";
import Canvas from                      "ui/Canvas";
import LoadingBox from                  "ui/LoadingBox";
import ScreenContainer from             'ui/screen/ScreenContainer';
import Screen from                      'ui/screen/screens';
import {LoadablePart} from              "ui/partAuthoring/PartLoader";
import InnerContentPane from            "ui/innerContentPane/InnerContentPane";

import React, {useState} from 'react';

function emptyCallback() {} // TODO delete when not using

function FacesScreen() {
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [eyeParts, setEyeParts] = useState<LoadablePart[]>([]);
  const [headParts, setHeadParts] = useState<LoadablePart[]>([]);
  const [mouthParts, setMouthParts] = useState<LoadablePart[]>([]);
  const [noseParts, setNoseParts] = useState<LoadablePart[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const { partType, testVoice, emotion, lidLevel } = revision;
  
  useEffectAfterMount(() => {
    init(setRevision, setEyeParts, setHeadParts, setMouthParts, setNoseParts, setDisabled).then((nextInitResults:InitResults) => {
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
  
  const _getThumbnail = (parts:LoadablePart[], partNo:number):ImageBitmap|null => 
    partNo !== UNSPECIFIED && partNo < parts.length ? parts[partNo].thumbnail : null;
  
  let selectionPane:JSX.Element|null;
  switch(partType) {
    case PartType.HEAD:
      selectionPane = <HeadSelectionPane 
        className={styles.selectionPane} 
        onReplace={() => {onChooseHead(setModalDialog)}} 
        onHairColorChange={(hairColor) => onHairColorChange(hairColor, setRevision)}
        onSkinToneChange={(skinTone) => onSkinToneChange(skinTone, setRevision)}
        disabled={disabled}
        thumbnailBitmap={_getThumbnail(headParts, revision.headPartNo)}
      />
      break;
    case PartType.EYES:
      selectionPane = <EyesSelectionPane 
        className={styles.selectionPane} 
        onAdd={() => onChooseEyes(setModalDialog)} 
        onReplace={() => onChooseEyes(setModalDialog)} 
        onRemove={() => onRemoveEyes(setRevision)}
        thumbnailBitmap={_getThumbnail(eyeParts, revision.eyesPartNo)}
        isSpecified={revision.eyesPartNo !== UNSPECIFIED} 
        disabled={disabled}
      />
      break;
    case PartType.MOUTH:
      selectionPane = <MouthSelectionPane 
        className={styles.selectionPane} 
        onAdd={() => onChooseMouth(setModalDialog)} 
        onReplace={() => onChooseMouth(setModalDialog)}
        onRemove={() => onRemoveMouth(setRevision)}
        thumbnailBitmap={_getThumbnail(mouthParts, revision.mouthPartNo)}
        isSpecified={revision.mouthPartNo !== UNSPECIFIED} 
        disabled={disabled}
      />
      break;
    case PartType.NOSE:
      selectionPane = <NoseSelectionPane 
        className={styles.selectionPane} 
        onAdd={() => onChooseNose(setModalDialog)} 
        onReplace={() => onChooseNose(setModalDialog)} 
        onRemove={() => onRemoveNose(setRevision)}
        thumbnailBitmap={_getThumbnail(noseParts, revision.nosePartNo)}
        isSpecified={revision.nosePartNo !== UNSPECIFIED} 
        disabled={disabled}
      />
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
      <HeadChooser
        isOpen={modalDialog === HeadChooser.name}
        onChange={(partNo:number) => onHeadChanged(headParts, partNo, setModalDialog, setRevision)}
        onCancel={() => setModalDialog(null)}
        parts={headParts}
        selectedPartNo={revision.headPartNo}
      />
    </ScreenContainer>
  );
}

export default FacesScreen;
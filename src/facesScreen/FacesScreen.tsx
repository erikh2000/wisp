import styles from './FacesScreen.module.css';
import PartSelector, {PartType} from "./PartSelector";
import {isHeadReady, UNSPECIFIED} from "./interactions/coreUtil";
import {
  deinit,
  getRevisionForMount,
  init,
  InitResults,
  onDrawFaceCanvas,
  onPartTypeChange
} from "./interactions/generalInteractions";
import {
  onChooseExtra,
  onChooseEyes,
  onChooseHead,
  onChooseMouth,
  onChooseNose, onExtraChanged,
  onEyesChanged,
  onHeadChanged,
  onMouthChanged,
  onNoseChanged,
  onRemoveEyes,
  onRemoveExtra,
  onRemoveMouth,
  onRemoveNose
} from "./interactions/partChooserInteractions";
import {onRedo, onUndo, Revision} from "./interactions/revisionUtil";
import {onHairColorChange, onIrisColorChange, onSkinToneChange} from "./interactions/recolorUtil";
import {onEmotionChange, onLidLevelChange, onTestVoiceChange} from "./interactions/viewSettingsInteractions";
import ExtraChooser from "./partChoosers/ExtraChooser";
import HeadChooser from "./partChoosers/HeadChooser";
import MouthChooser from "./partChoosers/MouthChooser";
import NoseChooser from "./partChoosers/NoseChooser";
import EyesSelectionPane from "./selectionPanes/EyesSelectionPane";
import ExtraSelectionPane from "./selectionPanes/ExtraSelectionPane";
import HeadSelectionPane from "./selectionPanes/HeadSelectionPane";
import MouthSelectionPane from "./selectionPanes/MouthSelectionPane";
import NoseSelectionPane from "./selectionPanes/NoseSelectionPane";
import EyesChooser from "./partChoosers/EyesChooser";
import EmotionSelector from "./view/EmotionSelector";
import LidLevelSelector from "./view/LidLevelSelector";
import TestVoiceSelector from "./view/TestVoiceSelector";
import useEffectAfterMount from "common/useEffectAfterMount";
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";
import ScreenContainer from 'ui/screen/ScreenContainer';
import Screen from 'ui/screen/screens';
import {LoadablePart} from "ui/partAuthoring/PartLoader";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React, {useState} from 'react';

function emptyCallback() {} // TODO delete when not using

function _getThumbnail(parts:LoadablePart[], partNo:number):ImageBitmap|null {
  return partNo !== UNSPECIFIED && partNo < parts.length ? parts[partNo].thumbnail : null;
}

function _getExtraSlotNo(partType:PartType):number { return partType - PartType.EXTRA1; }

function _getSelectedPartNoForSlot(extraPartNos:number[], slotNo:number):number {
  return slotNo < extraPartNos.length ? extraPartNos[slotNo] : UNSPECIFIED;
}

function _renderSelectionPane(partType:PartType, disabled:boolean, revision:Revision, headParts:LoadablePart[], 
    eyeParts:LoadablePart[], extraParts:LoadablePart[], mouthParts:LoadablePart[], noseParts:LoadablePart[], setModalDialog:any, 
    setRevision:any):JSX.Element {
  
  switch(partType) {
    case PartType.HEAD:
      return <HeadSelectionPane
        className={styles.selectionPane}
        onReplace={() => {onChooseHead(setModalDialog)}}
        onHairColorChange={(hairColor) => onHairColorChange(hairColor, setRevision)}
        onSkinToneChange={(skinTone) => onSkinToneChange(skinTone, setRevision)}
        disabled={disabled}
        thumbnailBitmap={_getThumbnail(headParts, revision.headPartNo)}
      />
    case PartType.EYES:
      return <EyesSelectionPane
        className={styles.selectionPane}
        onAdd={() => onChooseEyes(setModalDialog)}
        onIrisColorChange={(irisColor) => onIrisColorChange(irisColor, setRevision)}
        onReplace={() => onChooseEyes(setModalDialog)}
        onRemove={() => onRemoveEyes(setRevision)}
        thumbnailBitmap={_getThumbnail(eyeParts, revision.eyesPartNo)}
        isSpecified={revision.eyesPartNo !== UNSPECIFIED}
        disabled={disabled}
      />
    case PartType.MOUTH:
      return <MouthSelectionPane
        className={styles.selectionPane}
        onAdd={() => onChooseMouth(setModalDialog)}
        onReplace={() => onChooseMouth(setModalDialog)}
        onRemove={() => onRemoveMouth(setRevision)}
        thumbnailBitmap={_getThumbnail(mouthParts, revision.mouthPartNo)}
        isSpecified={revision.mouthPartNo !== UNSPECIFIED}
        disabled={disabled}
      />
    case PartType.NOSE:
      return <NoseSelectionPane
        className={styles.selectionPane}
        onAdd={() => onChooseNose(setModalDialog)}
        onReplace={() => onChooseNose(setModalDialog)}
        onRemove={() => onRemoveNose(setRevision)}
        thumbnailBitmap={_getThumbnail(noseParts, revision.nosePartNo)}
        isSpecified={revision.nosePartNo !== UNSPECIFIED}
        disabled={disabled}
      />
    default:
      const slotNo = _getExtraSlotNo(partType);
      const extraPartNo = _getSelectedPartNoForSlot(revision.extraPartNos, slotNo);
      return <ExtraSelectionPane 
        slotNo={slotNo} 
        className={styles.selectionPane} 
        onAdd={() => onChooseExtra(setModalDialog)} 
        onReplace={() => onChooseExtra(setModalDialog)} 
        onRemove={() => onRemoveExtra(slotNo, revision.extraPartNos, setRevision)} 
        isSpecified={slotNo < revision.extraPartNos.length} 
        disabled={disabled}
        thumbnailBitmap={_getThumbnail(extraParts, extraPartNo)}
      />
  }
}

function FacesScreen() {
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [eyeParts, setEyeParts] = useState<LoadablePart[]>([]);
  const [extraParts, setExtraParts] = useState<LoadablePart[]>([]);
  const [headParts, setHeadParts] = useState<LoadablePart[]>([]);
  const [mouthParts, setMouthParts] = useState<LoadablePart[]>([]);
  const [noseParts, setNoseParts] = useState<LoadablePart[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const { partType, testVoice, emotion, lidLevel } = revision;
  
  useEffectAfterMount(() => {
    init(setRevision, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts, setDisabled).then((nextInitResults:InitResults) => {
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
  
  const selectionPane:JSX.Element = _renderSelectionPane(partType, disabled, revision, headParts,
    eyeParts, extraParts, mouthParts, noseParts, setModalDialog, setRevision);
  
  const faceContent:JSX.Element = isHeadReady() 
    ? <Canvas className={styles.canvas} isAnimated={true} onDraw={onDrawFaceCanvas} 
              onMouseMove={initResults?.onFaceCanvasMouseMove} onMouseDown={initResults?.onFaceCanvasMouseDown} 
              onMouseUp={initResults?.onFaceCanvasMouseUp} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  const extraSlotNo = _getExtraSlotNo(partType);
  
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
      <ExtraChooser
        isOpen={modalDialog === ExtraChooser.name}
        onChange={(partNo:number) => onExtraChanged(extraSlotNo, extraParts, revision.extraPartNos, partNo, setModalDialog, setRevision)}
        onCancel={() => setModalDialog(null)}
        parts={extraParts}
        selectedPartNo={_getSelectedPartNoForSlot(revision.extraPartNos, extraSlotNo)}
      />
    </ScreenContainer>
  );
}

export default FacesScreen;
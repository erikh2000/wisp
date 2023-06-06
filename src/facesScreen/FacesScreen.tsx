import styles from './FacesScreen.module.css';
import ConfirmDeleteFaceDialog from "./fileDialogs/ConfirmDeleteFaceDialog";
import NewFaceDialog from "./fileDialogs/NewFaceDialog";
import RenameFaceDialog from "./fileDialogs/RenameFaceDialog";
import OpenFaceChooser from "./fileDialogs/OpenFaceChooser";
import PartSelector, {PartType} from "./PartSelector";
import {isHeadReady, UNSPECIFIED} from "./interactions/coreUtil";
import {
  exportFace,
  importFace, onCancelOpenFace,
  onConfirmDeleteFace,
  onNewFace,
  onNewFaceName,
  onOpenFace,
  onRenameFace
} from "./interactions/fileInteractions";
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
import {onHairColorChange, onIrisColorChange, onSkinToneChange} from "./interactions/recolorUtil";
import {onRedo, onUndo, Revision} from "./interactions/revisionUtil";
import {
  getDefaultScreenSettings,
  getTestVoiceCredits,
  onEmotionChange,
  onEmotionClick,
  onLidLevelChange,
  onTestVoiceChange
} from "./interactions/viewSettingsInteractions";
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
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import useEffectAfterMount from "common/useEffectAfterMount";
import {UNSPECIFIED_NAME} from "persistence/projects";
import Canvas from "ui/Canvas";
import LoadingBox from "ui/LoadingBox";
import ScreenContainer from 'ui/screen/ScreenContainer';
import Screen from 'ui/screen/screens';
import InnerContentPane from "ui/innerContentPane/InnerContentPane";
import {LoadablePart} from "ui/partAuthoring/PartLoader";

import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import FacesScreenSettings from "./FacesScreenSettings";

function _getThumbnail(parts:LoadablePart[], partNo:number):ImageBitmap|null {
  return partNo !== UNSPECIFIED && partNo < parts.length ? parts[partNo].thumbnail : null;
}

function _getExtraSlotNo(partType:PartType):number { return partType - PartType.EXTRA1; }

function _getSelectedPartNoForSlot(extraSlotPartNos:number[], slotNo:number):number {
  return slotNo < extraSlotPartNos.length ? extraSlotPartNos[slotNo] : UNSPECIFIED;
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
      const extraPartNo = _getSelectedPartNoForSlot(revision.extraSlotPartNos, slotNo);
      return <ExtraSelectionPane 
        slotNo={slotNo} 
        className={styles.selectionPane} 
        onAdd={() => onChooseExtra(setModalDialog)} 
        onReplace={() => onChooseExtra(setModalDialog)} 
        onRemove={() => onRemoveExtra(slotNo, revision.extraSlotPartNos, setRevision)} 
        isSpecified={slotNo < revision.extraSlotPartNos.length} 
        disabled={disabled}
        thumbnailBitmap={_getThumbnail(extraParts, extraPartNo)}
      />
  }
}

function FacesScreen() {
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [eyeParts, setEyeParts] = useState<LoadablePart[]>([]);
  const [extraParts, setExtraParts] = useState<LoadablePart[]>([]);
  const [headParts, setHeadParts] = useState<LoadablePart[]>([]);
  const [mouthParts, setMouthParts] = useState<LoadablePart[]>([]);
  const [noseParts, setNoseParts] = useState<LoadablePart[]>([]);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [screenSettings, setScreenSettings] = useState<FacesScreenSettings>(getDefaultScreenSettings());
  const navigate = useNavigate();
  const { partType} = revision;
  
  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init(setRevision, setEyeParts, setExtraParts, setHeadParts, setMouthParts, setNoseParts, setDisabled).then((nextInitResults:InitResults) => {
      if (nextInitResults.faceName === UNSPECIFIED_NAME) { 
        setModalDialog(nextInitResults.faceCount ? OpenFaceChooser.name : NewFaceDialog.name);
      } else {
        setDocumentName(nextInitResults.faceName);
      }
      setScreenSettings(nextInitResults.screenSettings);
      setInitResults(nextInitResults);
      setDisabled(false);
    });
    return deinit();
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:() => onNewFace(setModalDialog, setDocumentName, setRevision), groupNo:0, disabled},
    {text:'Open', onClick:() => setModalDialog(OpenFaceChooser.name), groupNo:0, disabled},
    {text:'Rename', onClick:() => setModalDialog(RenameFaceDialog.name), groupNo:0, disabled},
    {text:'Delete', onClick:() => setModalDialog(ConfirmDeleteFaceDialog.name), groupNo:0, disabled},
    {text:'Import', onClick:() => importFace(setModalDialog, setDocumentName, setRevision), groupNo:0, disabled},
    {text:'Export', onClick:() => exportFace(documentName), groupNo:0, disabled},
    
    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:1, disabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:1, disabled}
  ];
  
  const selectionPane:JSX.Element = _renderSelectionPane(partType, disabled, revision, headParts,
    eyeParts, extraParts, mouthParts, noseParts, setModalDialog, setRevision);
  
  const faceContent:JSX.Element = isHeadReady() 
    ? <Canvas className={styles.canvas} isAnimated={true} onDraw={onDrawFaceCanvas} 
              onMouseMove={initResults?.onFaceCanvasMouseMove} onMouseDown={initResults?.onFaceCanvasMouseDown} 
              onMouseUp={initResults?.onFaceCanvasMouseUp} />
    : <LoadingBox className={styles.faceLoadingBox} text='loading face' />;
  const extraSlotNo = _getExtraSlotNo(partType);
  const extraCount = revision.extraSlotPartNos.length;
  
  return (
    <ScreenContainer documentName={documentName} actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.FACES}>
      <div className={styles.container}>
        <InnerContentPane className={styles.facePane} caption='Face'>
          <PartSelector partType={partType} onChange={(nextPartType) => onPartTypeChange(nextPartType, setRevision)} extraCount={extraCount} disabled={disabled}/>
          {faceContent}
        </InnerContentPane>
        <div className={styles.rightColumn}>
          <InnerContentPane className={styles.viewPane} caption='View' comment={getTestVoiceCredits()}>
            <EmotionSelector emotion={screenSettings.emotion} onChange={(nextEmotion) => onEmotionChange(nextEmotion, setScreenSettings)} onClick={(nextEmotion) => onEmotionClick(nextEmotion)} disabled={disabled}/>
            <LidLevelSelector lidLevel={screenSettings.lidLevel} onChange={(nextLidLevel) => onLidLevelChange(nextLidLevel, setScreenSettings)} disabled={disabled}/>
            <TestVoiceSelector testVoiceType={screenSettings.testVoice} onChange={(nextTestVoice) => onTestVoiceChange(nextTestVoice, setScreenSettings)} disabled={disabled}/>
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
        onChange={(partNo:number) => onExtraChanged(extraSlotNo, extraParts, revision.extraSlotPartNos, partNo, setModalDialog, setRevision)}
        onCancel={() => setModalDialog(null)}
        parts={extraParts}
        selectedPartNo={_getSelectedPartNoForSlot(revision.extraSlotPartNos, extraSlotNo)}
      />
      <NewFaceDialog
        isOpen={modalDialog === NewFaceDialog.name}
        onSubmit={(nextFaceName:string) => onNewFaceName(nextFaceName, setModalDialog, setDocumentName) }
      />
      <RenameFaceDialog
        isOpen={modalDialog === RenameFaceDialog.name}
        onSubmit={(nextFaceName:string) => onRenameFace(nextFaceName, setModalDialog, setDocumentName) }
        onCancel={() => setModalDialog(null)}
      />
      <OpenFaceChooser
        isOpen={modalDialog === OpenFaceChooser.name}
        onChoose={(nextFaceName:string) => onOpenFace(nextFaceName, setModalDialog, setDocumentName, setRevision) }
        onCancel={() =>  onCancelOpenFace(documentName, setModalDialog, setDocumentName, setRevision) }
        originalDocumentName={documentName}
      />
      <ConfirmDeleteFaceDialog
        isOpen={modalDialog === ConfirmDeleteFaceDialog.name}
        documentName={documentName}
        onConfirm={() => onConfirmDeleteFace(documentName, navigate)}
        onCancel={() => setModalDialog(null)}
      />
    </ScreenContainer>
  );
}

export default FacesScreen;
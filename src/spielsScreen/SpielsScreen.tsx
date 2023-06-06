import styles from "./SpielsScreen.module.css";
import ConfirmDeleteSpielDialog from "./fileDialogs/ConfirmDeleteSpielDialog";
import RenameSpielDialog from "./fileDialogs/RenameSpielDialog";
import {getHeadIfReady} from "./interactions/coreUtil";
import {
  createDragMeasurements,
  DragMeasurements,
  onNodeDrag,
  onNodeDragEnd,
  updateDragMeasurements,
  updateDragMeasurementsToMatchNodeCount
} from "./interactions/dragInteractions";
import {
  addReplyToSelectedNode,
  addRootReply,
  addSpielNode,
  deleteSelectedNode,
  deleteSelectedReply,
  deleteSelectedRootReply,
  editSelectedReply,
  editSelectedRootReply,
  editSpielNode,
  openDialogToAddReply,
  openDialogToAddSpielNode,
  openDialogToEditReply,
  openDialogToEditRootReply,
  selectSpielNode,
  updateNodeAfterEdit
} from "./interactions/editInteractions";
import {
  exportSpiel,
  importSpiel, onCancelOpenSpiel, onConfirmDeleteSpiel,
  onNewSpiel,
  onNewSpielName,
  onOpenSpiel,
  onRenameSpiel
} from "./interactions/fileInteractions";
import {init, InitResults} from "./interactions/generalInteractions";
import {
  getDefaultScreenSettings,
  onChangeFace,
  setFaceEmotionFromSpiel,
  startTest,
  stopTest,
  updateTestOptions
} from "./interactions/testInteractions";
import {getRevisionForMount, onRedo, onUndo, Revision} from "./interactions/revisionUtil";
import AddLineDialog from "./spielDialogs/AddLineDialog";
import AddReplyDialog from "./spielDialogs/AddReplyDialog";
import EditLineDialog from "./spielDialogs/EditLineDialog";
import EditSpielNodeDialog from "./spielDialogs/EditLineDialog";
import EditReplyDialog from "./spielDialogs/EditReplyDialog";
import AddRootReplyDialog from "./spielDialogs/AddRootReplyDialog";
import EditRootReplyDialog from "./spielDialogs/EditRootReplyDialog";
import TestOptionsDialog from "./testDialogs/TestOptionsDialog";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import useEffectAfterMount from "common/useEffectAfterMount";
import ConversationSpeed from "conversations/ConversationSpeed";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ChangeFaceChooser from "./fileDialogs/ChangeFaceChooser";
import NewSpielDialog from "./fileDialogs/NewSpielDialog";
import {InsertPosition} from "./panes/SpielNodeView";
import SpielPane from "./panes/SpielPane";
import TestPane from "./panes/TestPane";
import TranscriptPane from "./panes/TranscriptPane";
import OpenSpielChooser from "spielsCommon/dialogs/OpenSpielChooser";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import {TextConsoleLine} from "ui/TextConsoleBuffer";

import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Spiel, SpielLine, SpielReply} from "sl-spiel";
import {getSpielCount} from "../persistence/spiels";
import SpielsScreenSettings from "./SpielsScreenSettings";

function _getSelectedReply(spiel:Spiel, selectedReplyNo:number):SpielReply|null {
  const selectedNode = spiel.currentNode;
  if (!selectedNode) return null;
  return selectedNode.replies[selectedReplyNo];
}

function _getSelectedRootReply(spiel:Spiel, selectedRootReplyNo:number):SpielReply|null {
  if (selectedRootReplyNo >= spiel.rootReplies.length) return null;
  return spiel.rootReplies[selectedRootReplyNo];
}

function _getSelectedLineForReply(spiel:Spiel):SpielLine {
  const selectedNode = spiel.currentNode;
  if (!selectedNode) return new SpielLine('', []);
  return selectedNode.line;
}

function SpielsScreen() {
  const [screenSettings, setScreenSettings] = useState<SpielsScreenSettings>(getDefaultScreenSettings());
  const [playFullScreen, setPlayFullScreen] = useState<boolean>(false); // Purposefully distnct from screenSettings - this is the current full screen state, rather than the setting.
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [dragMeasurements, setDragMeasurements] = useState<DragMeasurements>(createDragMeasurements());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [insertAfterNodeNo, setInsertAfterNodeNo] = useState<InsertPosition|null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [selectedReplyNo, setSelectedReplyNo] = useState<number>(-1);
  const [selectedRootReplyNo, setSelectedRootReplyNo] = useState<number>(-1);
  const [subtitle, setSubtitle] = useState<string>('');
  const [transcriptLines, setTranscriptLines] = useState<TextConsoleLine[]>([]);
  const [testNodeNo, setTestNodeNo] = useState<number>(0);
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init(setTranscriptLines, setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.spielName === UNSPECIFIED_NAME) {
        setModalDialog(nextInitResults.spielCount ? OpenSpielChooser.name : NewSpielDialog.name);
      } else {
        setDocumentName(nextInitResults.spielName);
      }
      setScreenSettings(nextInitResults.screenSettings);
      setInitResults(nextInitResults);
      setDisabled(false);
    });
  }, []);
  
  useEffect(() => {
    if (!revision) return;
    const nodeCount = revision.spiel.nodes.length;
    updateDragMeasurementsToMatchNodeCount(nodeCount, dragMeasurements, setDragMeasurements);
    setFaceEmotionFromSpiel(revision.spiel);
  }, [revision, dragMeasurements]);
  
  useEffect(() => {
    if (isTestRunning) return;
    setSubtitle('');
    setFaceEmotionFromSpiel(revision.spiel);
  }, [isTestRunning, revision.spiel]);
  
  const actionBarButtons = [
    {text:'New', onClick:() => onNewSpiel(setModalDialog, setDocumentName, setRevision), groupNo:0, disabled},
    {text:'Open', onClick:() => setModalDialog(OpenSpielChooser.name), groupNo:0, disabled},
    {text:'Rename', onClick:() => setModalDialog(RenameSpielDialog.name), groupNo:0, disabled},
    {text:'Delete', onClick:() => setModalDialog(ConfirmDeleteSpielDialog.name), groupNo:0, disabled},
    {text:'Import', onClick:() => importSpiel(setModalDialog, setDocumentName, setRevision), groupNo:0, disabled},
    {text:'Export', onClick:() => exportSpiel(documentName), groupNo:0, disabled},
    
    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:1, disabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:1, disabled}
  ];
  
  const isSpielsPaneDisabled = disabled || isTestRunning;

  return (
    <ScreenContainer documentName={documentName} actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.SPIELS}>
      <div className={styles.container}>
        <SpielPane 
          spiel={revision.spiel}
          disabled={isSpielsPaneDisabled}
          insertAfterNodeNo={insertAfterNodeNo}
          onNodeDrag={(event, nodeNo) => onNodeDrag(event, nodeNo, dragMeasurements, setInsertAfterNodeNo)}
          onNodeDragEnd={(event, nodeNo) => onNodeDragEnd(nodeNo, insertAfterNodeNo, revision.spiel, setRevision, setInsertAfterNodeNo)}
          onAddLine={() => openDialogToAddSpielNode(setModalDialog)}
          onAddReplyToSelectedNode={() => openDialogToAddReply(setModalDialog)}
          onAddRootReply={() => setModalDialog(AddRootReplyDialog.name)}
          onReceiveNodeHeight={(nodeNo, height) => updateDragMeasurements(nodeNo, height, dragMeasurements, setDragMeasurements)}
          onSelectNode={(nodeNo) => selectSpielNode(revision.spiel, nodeNo, setRevision)}
          onSelectNodeForEdit={(nodeNo) => editSpielNode(revision.spiel, nodeNo, setRevision, setModalDialog)}
          onSelectNodeReplyForEdit={(nodeNo, replyNo) => openDialogToEditReply(revision.spiel, nodeNo, replyNo, setRevision, setSelectedReplyNo, setModalDialog)}
          onSelectRootReplyForEdit={(replyNo) => openDialogToEditRootReply(revision.spiel, replyNo, setRevision, setSelectedRootReplyNo, setModalDialog)}
          selectedNodeNo={isTestRunning ? testNodeNo : revision.spiel.currentNodeIndex}
        />
        <div className={styles.rightColumn}>
          <TestPane 
            headComponent={getHeadIfReady()} 
            onChangeFace={() => setModalDialog(ChangeFaceChooser.name)}
            isTestRunning={isTestRunning}
            onExitFullScreen={() => setPlayFullScreen(false)}
            onOptions={() => setModalDialog(TestOptionsDialog.name)}
            onStart={() => startTest(revision.spiel, documentName, screenSettings.playFullScreen, setPlayFullScreen, setIsTestRunning, setTestNodeNo, setSubtitle)}
            onStop={() => stopTest(setIsTestRunning)}
            playFullScreen={playFullScreen}
            disabled={disabled}
            subtitle={subtitle}
          />
          <TranscriptPane lines={transcriptLines}/>
        </div>
      </div>
      <ChangeFaceChooser
        isOpen={modalDialog === ChangeFaceChooser.name}
        originalDocumentName={initResults?.faceName ?? UNSPECIFIED_NAME}
        onChoose={(nextFaceName) => onChangeFace(nextFaceName, setModalDialog)}
        onCancel={() => setModalDialog(null)}
      />
      <NewSpielDialog
        isOpen={modalDialog === NewSpielDialog.name}
        onSubmit={(nextSpielName) => onNewSpielName(nextSpielName, setModalDialog, setDocumentName)}
      />
      <EditLineDialog
        isOpen={modalDialog === EditSpielNodeDialog.name}
        originalNode={revision.spiel.currentNode}
        onSubmit={(nextNode) => updateNodeAfterEdit(nextNode, revision.spiel, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
        onDelete={() => deleteSelectedNode(revision.spiel, setRevision, setModalDialog)}
      />
      <EditReplyDialog
        inResponseToLine={_getSelectedLineForReply(revision.spiel)}
        isOpen={modalDialog === EditReplyDialog.name}
        originalReply={_getSelectedReply(revision.spiel, selectedReplyNo)}
        onSubmit={(nextReply) => editSelectedReply(revision.spiel, selectedReplyNo, nextReply, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
        onDelete={() => deleteSelectedReply(revision.spiel, selectedReplyNo, setRevision, setModalDialog)}
      />
      <AddReplyDialog
        inResponseToLine={_getSelectedLineForReply(revision.spiel)}
        isOpen={modalDialog === AddReplyDialog.name}
        defaultCharacter={revision.spiel.defaultCharacter}
        onSubmit={(nextReply) => addReplyToSelectedNode(revision.spiel, nextReply, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
      />
      <AddRootReplyDialog
        isOpen={modalDialog === AddRootReplyDialog.name}
        defaultCharacter={revision.spiel.defaultCharacter}
        onSubmit={(nextReply) => addRootReply(revision.spiel, nextReply, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
      />
      <EditRootReplyDialog
        isOpen={modalDialog === EditRootReplyDialog.name}
        onSubmit={(nextReply) => editSelectedRootReply(revision.spiel, selectedRootReplyNo, nextReply, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
        onDelete={() => deleteSelectedRootReply(revision.spiel, selectedRootReplyNo, setRevision, setModalDialog)}
        originalReply={_getSelectedRootReply(revision.spiel, selectedRootReplyNo)}
      />
      <AddLineDialog 
        defaultCharacter={revision.spiel.defaultCharacter}
        isOpen={modalDialog === AddLineDialog.name} 
        onSubmit={(nextLine) => addSpielNode(revision.spiel, nextLine, setRevision, setModalDialog)} 
        onCancel={() => setModalDialog(null)} 
      />
      <TestOptionsDialog
        defaultConversationSpeed={screenSettings.conversationSpeed}
        defaultPlayFullScreen={screenSettings.playFullScreen}
        isOpen={modalDialog === TestOptionsDialog.name}
        onCancel={() => setModalDialog(null)}
        onSubmit={(nextConversationSpeed, nextPlayFullScreen) => updateTestOptions(nextConversationSpeed, nextPlayFullScreen, screenSettings, setScreenSettings, setModalDialog)}
      />
      <RenameSpielDialog
        isOpen={modalDialog === RenameSpielDialog.name}
        onCancel={() => setModalDialog(null)}
        onSubmit={(nextSpielName) => onRenameSpiel(documentName, nextSpielName, setModalDialog, setDocumentName)}
      />
      <OpenSpielChooser
        isOpen={modalDialog === OpenSpielChooser.name}
        onCancel={() => onCancelOpenSpiel(documentName, setModalDialog, setDocumentName, setRevision)}
        onChoose={(nextDocumentName) => onOpenSpiel(nextDocumentName, setModalDialog, setDocumentName, setRevision)}
        originalDocumentName={documentName}
      />
      <ConfirmDeleteSpielDialog
        isOpen={modalDialog === ConfirmDeleteSpielDialog.name}
        onCancel={() => setModalDialog(null)}
        onConfirm={() => onConfirmDeleteSpiel(documentName, navigate)}
        spielName={documentName}
      />
    </ScreenContainer>
  );
}

export default SpielsScreen;
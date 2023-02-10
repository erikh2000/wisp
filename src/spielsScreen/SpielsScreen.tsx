import styles from "./SpielsScreen.module.css";
import AddReplyDialog from "./spielDialogs/AddReplyDialog";
import EditReplyDialog from "./spielDialogs/EditReplyDialog";
import AddRootReplyDialog from "./spielDialogs/AddRootReplyDialog";
import EditRootReplyDialog from "./spielDialogs/EditRootReplyDialog";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import useEffectAfterMount from "common/useEffectAfterMount";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ChangeFaceChooser from "spielsScreen/fileDialogs/ChangeFaceChooser";
import NewSpielDialog from "spielsScreen/fileDialogs/NewSpielDialog";
import {getHeadIfReady} from "spielsScreen/interactions/coreUtil";
import {
  addRootReply,
  addReplyToSelectedNode, deleteSelectedNode, deleteSelectedReply, editSelectedReply,
  editSpielNode,
  openDialogToAddReply, openDialogToEditReply,
  selectSpielNode,
  updateNodeAfterEdit, openDialogToEditRootReply, editSelectedRootReply, deleteSelectedRootReply
} from "spielsScreen/interactions/editInteractions";
import {exportSpiel, importSpiel, onNewSpielName} from "spielsScreen/interactions/fileInteractions";
import {init, InitResults} from "spielsScreen/interactions/generalInteractions";
import {onChangeFace} from "spielsScreen/interactions/testInteractions";
import {getRevisionForMount, onRedo, onUndo, Revision} from "spielsScreen/interactions/revisionUtil";
import SpielPane from "spielsScreen/panes/SpielPane";
import TestPane from "spielsScreen/panes/TestPane";
import TranscriptPane from "spielsScreen/panes/TranscriptPane";
import EditSpielNodeDialog from "spielsScreen/spielDialogs/EditSpielNodeDialog";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import {TextConsoleLine} from "ui/TextConsoleBuffer";

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Spiel, SpielReply} from "sl-spiel";

function doNothing() {} // TODO - delete after not used

function _getSelectedReply(spiel:Spiel, selectedReplyNo:number):SpielReply|null {
  const selectedNode = spiel.currentNode;
  if (!selectedNode) return null;
  return selectedNode.replies[selectedReplyNo];
}

function _getSelectedRootReply(spiel:Spiel, selectedRootReplyNo:number):SpielReply|null {
  if (selectedRootReplyNo >= spiel.rootReplies.length) return null;
  return spiel.rootReplies[selectedRootReplyNo];
}

function SpielsScreen() {
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision|null>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [selectedReplyNo, setSelectedReplyNo] = useState<number>(-1);
  const [selectedRootReplyNo, setSelectedRootReplyNo] = useState<number>(-1);
  const [transcriptLines, setTranscriptLines] = useState<TextConsoleLine[]>([]);
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init(setTranscriptLines, setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.spielName === UNSPECIFIED_NAME) {
        setModalDialog(NewSpielDialog.name);
      } else {
        setDocumentName(nextInitResults.spielName);
      }
      setInitResults(nextInitResults);
      setDisabled(false);
    });
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:doNothing, groupNo:0, disabled},
    {text:'Open', onClick:doNothing, groupNo:0, disabled},
    {text:'Rename', onClick:doNothing, groupNo:0, disabled},
    {text:'Delete', onClick:doNothing, groupNo:0, disabled},
    {text:'Import', onClick:() => importSpiel(setModalDialog, setDocumentName, setRevision), groupNo:0, disabled},
    {text:'Export', onClick:() => exportSpiel(documentName), groupNo:0, disabled},
    
    {text:'Undo', onClick:() => onUndo(setRevision), groupNo:1, disabled},
    {text:'Redo', onClick:() => onRedo(setRevision), groupNo:1, disabled}
  ];
  
  if (!revision) return null;

  return (
    <ScreenContainer documentName={documentName} actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.SPIELS}>
      <div className={styles.container}>
        <SpielPane 
          spiel={revision.spiel} 
          disabled={disabled}
          onAddReplyToSelectedNode={() => openDialogToAddReply(setModalDialog)}
          onAddRootReply={() => setModalDialog(AddRootReplyDialog.name)}
          onSelectNode={(nodeNo) => selectSpielNode(revision.spiel, nodeNo, setRevision)}
          onSelectNodeForEdit={(nodeNo) => editSpielNode(revision.spiel, nodeNo, setRevision, setModalDialog)}
          onSelectNodeReplyForEdit={(nodeNo, replyNo) => openDialogToEditReply(revision.spiel, nodeNo, replyNo, setRevision, setSelectedReplyNo, setModalDialog)}
          onSelectRootReplyForEdit={(replyNo) => openDialogToEditRootReply(revision.spiel, replyNo, setRevision, setSelectedRootReplyNo, setModalDialog)}
          selectedNodeNo={revision.spiel.currentNodeIndex}
        />
        <div className={styles.rightColumn}>
          <TestPane headComponent={getHeadIfReady()} onChangeFace={() => setModalDialog(ChangeFaceChooser.name)} disabled={disabled} />
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
      <EditSpielNodeDialog
        isOpen={modalDialog === EditSpielNodeDialog.name}
        originalNode={revision.spiel.currentNode}
        onSubmit={(nextNode) => updateNodeAfterEdit(nextNode, revision.spiel, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
        onDelete={() => deleteSelectedNode(revision.spiel, setRevision, setModalDialog)}
      />
      <EditReplyDialog
        isOpen={modalDialog === EditReplyDialog.name}
        originalReply={_getSelectedReply(revision.spiel, selectedReplyNo)}
        onSubmit={(nextReply) => editSelectedReply(revision.spiel, selectedReplyNo, nextReply, setRevision, setModalDialog)}
        onCancel={() => setModalDialog(null)}
        onDelete={() => deleteSelectedReply(revision.spiel, selectedReplyNo, setRevision, setModalDialog)}
      />
      <AddReplyDialog
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
    </ScreenContainer>
  );
}

export default SpielsScreen;
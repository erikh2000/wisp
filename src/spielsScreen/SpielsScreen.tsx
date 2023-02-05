import styles from "./SpielsScreen.module.css";
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ChangeFaceChooser from "spielsScreen/fileDialogs/ChangeFaceChooser";
import NewSpielDialog from "spielsScreen/fileDialogs/NewSpielDialog";
import {getHeadIfReady} from "spielsScreen/interactions/coreUtil";
import {exportSpiel, importSpiel, onNewSpielName} from "spielsScreen/interactions/fileInteractions";
import {init, InitResults} from "spielsScreen/interactions/generalInteractions";
import {onChangeFace} from "spielsScreen/interactions/testInteractions";
import {getRevisionForMount, onRedo, onUndo, Revision} from "spielsScreen/interactions/revisionUtil";
import SpielPane from "spielsScreen/panes/SpielPane";
import TestPane from "spielsScreen/panes/TestPane";
import TranscriptPane from "spielsScreen/panes/TranscriptPane";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";
import {TextConsoleLine} from "ui/TextConsoleBuffer";

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

function doNothing() {} // TODO - delete after not used

function SpielsScreen() {
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision|null>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [disabled, setDisabled] = useState<boolean>(true);
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

  return (
    <ScreenContainer documentName={documentName} actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.SPIELS}>
      <div className={styles.container}>
        <SpielPane spiel={revision?.spiel ?? null} disabled={true}/>
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
    </ScreenContainer>
  );
}

export default SpielsScreen;
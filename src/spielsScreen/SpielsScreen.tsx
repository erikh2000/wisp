import styles from "./SpielsScreen.module.css";
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ChangeFaceChooser from "spielsScreen/fileDialogs/ChangeFaceChooser";
import {getHeadIfReady} from "spielsScreen/interactions/coreUtil";
import {init, InitResults} from "spielsScreen/interactions/generalInteractions";
import {onChangeFace} from "spielsScreen/interactions/testInteractions";
import SpielPane from "spielsScreen/panes/SpielPane";
import TestPane from "spielsScreen/panes/TestPane";
import TranscriptPane from "spielsScreen/panes/TranscriptPane";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

function doNothing() {} // TODO - delete after not used

function SpielsScreen() {
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  //const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [disabled, setDisabled] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init().then(nextInitResults => {
        setInitResults(nextInitResults);
        setDisabled(false);
      });
  }, []);
  
  const actionBarButtons = [
    {text:'New', onClick:doNothing, groupNo:0, disabled},
    {text:'Open', onClick:doNothing, groupNo:0, disabled},
    {text:'Rename', onClick:doNothing, groupNo:0, disabled},
    {text:'Delete', onClick:doNothing, groupNo:0, disabled},
    {text:'Import', onClick:doNothing, groupNo:0, disabled},
    {text:'Export', onClick:doNothing, groupNo:0, disabled},
    
    {text:'Undo', onClick:doNothing, groupNo:1, disabled},
    {text:'Redo', onClick:doNothing, groupNo:1, disabled}
  ];

  return (
    <ScreenContainer documentName={documentName} actionBarButtons={actionBarButtons} isControlPaneOpen={true} activeScreen={Screen.SPIELS}>
      <div className={styles.container}>
        <SpielPane />
        <div className={styles.rightColumn}>
          <TestPane headComponent={getHeadIfReady()} onChangeFace={() => setModalDialog(ChangeFaceChooser.name)} disabled={disabled} />
          <TranscriptPane />
        </div>
      </div>
      <ChangeFaceChooser
        isOpen={modalDialog === ChangeFaceChooser.name}
        originalDocumentName={initResults?.faceName ?? UNSPECIFIED_NAME}
        onChoose={(nextFaceName) => onChangeFace(nextFaceName, setModalDialog)}
        onCancel={() => setModalDialog(null)}
      />
    </ScreenContainer>
  );
}

export default SpielsScreen;
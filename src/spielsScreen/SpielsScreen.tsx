import styles from "./SpielsScreen.module.css";
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import SpielPane from "./panes/SpielPane";
import TestPane from "./panes/TestPane";
import TranscriptPane from "./panes/TranscriptPane";
import {UNSPECIFIED_NAME} from "persistence/projects";
import Screen from "ui/screen/screens";
import ScreenContainer from "ui/screen/ScreenContainer";

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

function doNothing() {} // TODO - delete after not used

function SpielsScreen() {
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  //const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  //const [initResults, setInitResults] = useState<InitResults|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [disabled, setDisabled] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    /*init(setRevision).then(nextInitResults => {
        if (nextInitResults.faceName === UNSPECIFIED_NAME) { 
          setModalDialog(NewFaceDialog.name);
        } else {
          setDocumentName(nextInitResults.faceName);
        }
        setInitResults(nextInitResults);
        setDisabled(false);
      });
     */
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
          <TestPane disabled={disabled} />
          <TranscriptPane />
        </div>
      </div>
    </ScreenContainer>
  );
}

export default SpielsScreen;
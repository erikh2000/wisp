import styles from "./SpeechScreen.module.css";
import SpielSpeechPane from "./SpielSpeechPane";
import {init} from './interactions/generalInteractions';
import {getRevisionForMount, Revision} from "./interactions/revisionUtil";
import {onChangeRowSelection} from "./interactions/speechTableInteractions";
import useEffectAfterMount from "common/useEffectAfterMount";
import {navigateToHomeIfMissingAudioContext} from "common/navigationUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen, {screenConfigs} from "ui/screen/screens";

import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

const emptyCallback = () => {}; // TODO delete when not using

function SpeechScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const navigate = useNavigate();

  useEffectAfterMount(() => {
    if (navigateToHomeIfMissingAudioContext(navigate)) return;
    init(setDisabled, setRevision).then(nextInitResults => {
      if (nextInitResults.spielName === UNSPECIFIED_NAME) {
        // setModalDialog(NeedSpielDialog.name); TODO--show dialog explaining that a spiel must be created first.
        navigate(screenConfigs[Screen.HOME].url); // TODO delete
      } else {
        setDocumentName(nextInitResults.spielName);
      }
      setDisabled(false);
    });
  }, []);
  
  const actionBarButtons = [
    {text:'Change Spiel', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Import Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export Audio', onClick:emptyCallback, groupNo:0, disabled:true},
    
    {text:'Undo', onClick:emptyCallback, groupNo:1, disabled:true},
    {text:'Redo', onClick:emptyCallback, groupNo:1, disabled:true}
  ];
  
  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.SPEECH} actionBarButtons={actionBarButtons}>
      <div className={styles.container}>
        <SpielSpeechPane 
          onChangeRowSelection={(rowNo, isSelected) => onChangeRowSelection(rowNo, isSelected, revision.speechTable, setRevision) } 
          speechTable={revision.speechTable} 
        />
      </div>
    </ScreenContainer>
  );
}

export default SpeechScreen;
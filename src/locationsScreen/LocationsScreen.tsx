
import BackgroundChooser from "./dialogs/BackgroundChooser";
import {onChooseBackground} from "./interactions/backgroundImageInteractions";
import {init} from './interactions/initialization';
import {getRevisionForMount, onUndo, onRedo, updateUndoRedoDisabled, Revision} from "./interactions/revisionUtil";
import LocationSettingsPane from "./panes/LocationSettingsPane";
import useEffectAfterMount from "common/useEffectAfterMount";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, {useEffect, useState} from "react";

const emptyCallback = () => {}; // TODO delete when not using

function LocationsScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [undoDisabled, setUndoDisabled] = useState<boolean>(true);
  const [redoDisabled, setRedoDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [backgroundImage, setBackgroundImage] = useState<ImageBitmap|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);

  useEffect(() => {
    init(setDisabled, setRevision).then(nextInitResults => {
      setDocumentName(nextInitResults.locationName);
      setBackgroundImage(nextInitResults.backgroundImage);
      setDisabled(false);
    });
  }, []);

  useEffect(() => {
    updateUndoRedoDisabled(disabled, setUndoDisabled, setRedoDisabled);
  }, [disabled, revision, setUndoDisabled, setRedoDisabled]);

  const actionBarButtons = [
    {text:'New', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Open', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Rename', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Delete', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Import', onClick:emptyCallback, groupNo:0, disabled:true},
    {text:'Export', onClick:emptyCallback, groupNo:0, disabled:true},

    {text:'Undo', onClick:() => onUndo(setRevision, setBackgroundImage), groupNo:1, disabled:undoDisabled},
    {text:'Redo', onClick:() => onRedo(setRevision, setBackgroundImage), groupNo:1, disabled:redoDisabled}
  ];

  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.LOCATIONS} actionBarButtons={actionBarButtons}>
        <LocationSettingsPane
          backgroundImage={backgroundImage}
          onAddFace={emptyCallback}
          onDeleteFace={emptyCallback}
          onChooseBackground={() => setModalDialog(BackgroundChooser.name)}
          disabled={disabled}
        />
        <BackgroundChooser 
          isOpen={modalDialog === BackgroundChooser.name} 
          onCancel={() => setModalDialog(null)} 
          onChoose={(nextBackgroundImage, backgroundImageKey) => 
            onChooseBackground(nextBackgroundImage, backgroundImageKey, setBackgroundImage, setModalDialog, setRevision)} 
        />
    </ScreenContainer>
  );
}

export default LocationsScreen;
import BackgroundChooser from "./dialogs/BackgroundChooser";
import NewLocationDialog from "./dialogs/NewLocationDialog";
import OpenLocationChooser from "./dialogs/OpenLocationChooser";
import {onChooseBackground} from "./interactions/backgroundImageInteractions";
import {init} from './interactions/initialization';
import {getRevisionForMount, onUndo, onRedo, updateUndoRedoDisabled, Revision} from "./interactions/revisionUtil";
import LocationSettingsPane from "./panes/LocationSettingsPane";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, {useEffect, useState} from "react";
import {onNewLocation, onOpenLocation, onRenameLocation} from "./interactions/fileInteractions";
import RenameLocationDialog from "./dialogs/RenameLocationDialog";

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
    init(setDisabled, setRevision).then(initResults => {
      setDocumentName(initResults.locationName);
      setBackgroundImage(initResults.backgroundImage);
      setDisabled(false);
      if (initResults.locationName === UNSPECIFIED_NAME) {
        setModalDialog(initResults.locationCount === 0 ? NewLocationDialog.name : OpenLocationChooser.name);
      }
    });
  }, []);

  useEffect(() => {
    updateUndoRedoDisabled(disabled, setUndoDisabled, setRedoDisabled);
  }, [disabled, revision, setUndoDisabled, setRedoDisabled]);

  const actionBarButtons = [
    {text:'New', onClick:() => setModalDialog(NewLocationDialog.name), groupNo:0, disabled},
    {text:'Open', onClick:() => setModalDialog(OpenLocationChooser.name), groupNo:0, disabled},
    {text:'Rename', onClick:() => setModalDialog(RenameLocationDialog.name), groupNo:0, disabled},
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
          locationName={documentName}
          onCancel={() => setModalDialog(null)} 
          onChoose={(nextBackgroundImage, backgroundImageKey) => 
            onChooseBackground(nextBackgroundImage, backgroundImageKey, setBackgroundImage, setModalDialog, setRevision)} 
        />
        <NewLocationDialog 
          isOpen={modalDialog === NewLocationDialog.name} 
          onCancel={() => setModalDialog(null)}
          onSubmit={(locationName) => onNewLocation(locationName, setDocumentName, setBackgroundImage, setModalDialog, setRevision)}
        />
        <OpenLocationChooser 
          isOpen={modalDialog === OpenLocationChooser.name} 
          onCancel={() => setModalDialog(null)} 
          onChoose={(locationName) => onOpenLocation(locationName, setDocumentName, setBackgroundImage, setModalDialog, setRevision)} 
          originalDocumentName={documentName} 
        />
        <RenameLocationDialog
          isOpen={modalDialog === RenameLocationDialog.name}
          onCancel={() => setModalDialog(null)}
          onSubmit={(locationName) => onRenameLocation(documentName, locationName, setDocumentName, setModalDialog)}
        />
    </ScreenContainer>
  );
}

export default LocationsScreen;
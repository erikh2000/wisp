import BackgroundChooser from "./dialogs/BackgroundChooser";
import ConfirmDeleteLocationDialog from "./dialogs/ConfirmDeleteLocationDialog";
import NewLocationDialog from "./dialogs/NewLocationDialog";
import OpenLocationChooser from "./dialogs/OpenLocationChooser";
import RenameLocationDialog from "./dialogs/RenameLocationDialog";
import {onChooseBackground} from "./interactions/backgroundImageInteractions";
import {
  onConfirmDeleteLocation,
  onNewLocation,
  onOpenLocation,
  onRenameLocation
} from "./interactions/fileInteractions";
import {init, InitResults} from './interactions/initialization';
import {onAddFace, onRemoveFace} from "./interactions/placementInteractions";
import {getRevisionForMount, onUndo, onRedo, updateUndoRedoDisabled, Revision} from "./interactions/revisionUtil";
import LocationSettingsPane from "./panes/LocationSettingsPane";
import OpenFaceChooser from "facesCommon/dialogs/OpenFaceChooser";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ScreenContainer from "ui/screen/ScreenContainer";
import Screen from "ui/screen/screens";

import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

function LocationsScreen() {
  const [disabled, setDisabled] = useState<boolean>(true);
  const [undoDisabled, setUndoDisabled] = useState<boolean>(true);
  const [redoDisabled, setRedoDisabled] = useState<boolean>(true);
  const [documentName, setDocumentName] = useState<string>(UNSPECIFIED_NAME);
  const [revision, setRevision] = useState<Revision>(getRevisionForMount());
  const [backgroundImage, setBackgroundImage] = useState<ImageBitmap|null>(null);
  const [modalDialog, setModalDialog] = useState<string|null>(null);
  const [initResults, setInitResults] = useState<InitResults|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    init(setDisabled, setRevision).then(initResults => {
      setInitResults(initResults);
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
    {text:'Delete', onClick:() => setModalDialog(ConfirmDeleteLocationDialog.name), groupNo:0, disabled},

    {text:'Undo', onClick:() => onUndo(setRevision, setBackgroundImage), groupNo:1, disabled:undoDisabled},
    {text:'Redo', onClick:() => onRedo(setRevision, setBackgroundImage), groupNo:1, disabled:redoDisabled}
  ];

  return (
    <ScreenContainer documentName={documentName} isControlPaneOpen={true} activeScreen={Screen.LOCATIONS} actionBarButtons={actionBarButtons}>
        <LocationSettingsPane
          backgroundImage={backgroundImage}
          facePlacements={revision.location.facePlacements}
          locationFaces={revision.locationFaces}
          onAddFace={() => setModalDialog(OpenFaceChooser.name)}
          onCanvasMouseDown={initResults?.onCanvasMouseDown}
          onCanvasMouseMove={initResults?.onCanvasMouseMove}
          onCanvasMouseUp={initResults?.onCanvasMouseUp}
          onRemoveFace={(removeFaceNo) => onRemoveFace(removeFaceNo, setRevision)}
          onChooseBackground={() => setModalDialog(BackgroundChooser.name)}
          selectedFaceNo={revision.selectedFaceNo}
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
        <ConfirmDeleteLocationDialog
          isOpen={modalDialog === ConfirmDeleteLocationDialog.name}
          locationName={documentName}
          onCancel={() => setModalDialog(null)}
          onConfirm={() => onConfirmDeleteLocation(documentName, navigate)}
        />
        <OpenFaceChooser
          isOpen={modalDialog === OpenFaceChooser.name}
          onCancel={() => setModalDialog(null)}
          onChoose={(faceName) => onAddFace(faceName, setModalDialog, setRevision)}
          originalDocumentName={UNSPECIFIED_NAME}
        />
    </ScreenContainer>
  );
}

export default LocationsScreen;
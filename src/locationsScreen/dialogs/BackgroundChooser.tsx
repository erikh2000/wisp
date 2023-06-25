import DocumentChooser from "ui/dialog/DocumentChooser";
import {KeyValueRecord} from "persistence/pathStore";
import {getAllLocationRecords} from "persistence/locations";
import {UNSPECIFIED_NAME} from "persistence/projects";

import {useEffect, useState} from "react";
import ConfirmCancelDialog from "../../ui/dialog/ConfirmCancelDialog";
import {onImportImage} from "../interactions/backgroundImageInteractions";

function _onChooseLocation(locationName:string) {
  //TODO
}

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onChoose:(backgroundImage:ImageBitmap, backgroundImageKey:string) => void
}

const TITLE = 'Choose Background Image';
const IMPORT_IMAGE = 'Import Image';

function BackgroundChooser(props:IProps) {
  const { isOpen, onCancel, onChoose } = props;
  const [locationDocuments, setLocationDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllLocationRecords().then(records => setLocationDocuments(records));
  }, [isOpen]);

  const mustImport = locationDocuments.length === 0;
  
  return mustImport ?
    <ConfirmCancelDialog
      confirmText={IMPORT_IMAGE}
      description="Import this location's background image from your local files."
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={() => onImportImage(onChoose)}
      title={TITLE}
    /> :
    <DocumentChooser
      chooseText='Copy Image'
      description="This location's background image can be copied from another location. Or you can import an image from your local files."
      documents={locationDocuments}
      isOpen={isOpen}
      newText={IMPORT_IMAGE}
      onCancel={onCancel}
      onChoose={(locationName) => _onChooseLocation(locationName)}
      onNew={() => onImportImage(onChoose)}
      originalDocumentName={UNSPECIFIED_NAME}
      title={TITLE}
    />;
}

export default BackgroundChooser;
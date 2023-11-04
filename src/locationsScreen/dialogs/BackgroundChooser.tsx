import {onImportImage} from "locationsScreen/interactions/backgroundImageInteractions";
import {KeyValueRecord} from "persistence/pathStore";
import {getAllLocationRecords, getLocation, getLocationImage} from "persistence/locations";
import {keyToName} from "persistence/pathUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";
import DocumentChooser from "ui/dialog/DocumentChooser";
import { importantToast } from "ui/toasts/toastUtil";

import {useEffect, useState} from "react";
import { pngBytesToImageBitmap } from "sl-web-face";

async function _onChooseLocation(locationName:string, onChoose:Function) {
  const location = await getLocation(locationName);
  if (!location) throw Error('Unexpected');
  if (!location.backgroundImageKey) { importantToast(`"${locationName}" location does not have a background image to copy.`); return; }
  const imageBytes = await getLocationImage(location.backgroundImageKey);
  if (!imageBytes) throw Error('Unexpected');
  const imageBitmap = await pngBytesToImageBitmap(imageBytes);
  onChoose(imageBitmap, location.backgroundImageKey);
}

interface IProps {
  locationName:string,
  isOpen:boolean,
  onCancel:() => void,
  onChoose:(backgroundImage:ImageBitmap, backgroundImageKey:string) => void
}

const TITLE = 'Choose Background Image';
const IMPORT_IMAGE = 'Import Image';

function BackgroundChooser(props:IProps) {
  const { isOpen, onCancel, onChoose, locationName } = props;
  const [locationDocuments, setLocationDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllLocationRecords().then(records => {
      const excludingCurrentLocation = records.filter(record => keyToName(record.key) !== locationName);
      setLocationDocuments(excludingCurrentLocation);
    });
  }, [isOpen, locationName]);

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
      onChoose={(locationName) => _onChooseLocation(locationName, onChoose)}
      onNew={() => onImportImage(onChoose)}
      originalDocumentName={UNSPECIFIED_NAME}
      title={TITLE}
    />;
}

export default BackgroundChooser;
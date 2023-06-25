import DocumentChooser, {ChooseCallback} from "ui/dialog/DocumentChooser";
import {getAllLocationRecords} from "persistence/locations";
import { KeyValueRecord } from 'persistence/pathStore'

import { useState, useEffect } from 'react';

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onChoose:ChooseCallback,
  originalDocumentName:string
}

function OpenLocationChooser(props:IProps) {
  const { isOpen, onCancel, onChoose, originalDocumentName } = props;
  const [locationDocuments, setLocationDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllLocationRecords().then(records => setLocationDocuments(records));
  }, [isOpen]);

  return (
    <DocumentChooser
      chooseText='Open'
      documents={locationDocuments}
      isOpen={isOpen}
      onCancel={onCancel}
      onChoose={onChoose}
      originalDocumentName={originalDocumentName}
      title='Open Location'
    />
  );
}

export default OpenLocationChooser;
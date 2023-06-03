import DocumentChooser, {ChooseCallback} from "ui/dialog/DocumentChooser";
import {getAllSpielRecords} from "persistence/spiels";
import { KeyValueRecord } from 'persistence/pathStore'

import { useState, useEffect } from 'react';

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onChoose:ChooseCallback,
  originalDocumentName:string
}

function OpenSpielChooser(props:IProps) {
  const { isOpen, onCancel, onChoose, originalDocumentName } = props;
  const [spielDocuments, setSpielDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllSpielRecords().then(records => setSpielDocuments(records));
  }, [isOpen]);

  return (
    <DocumentChooser
      chooseText='Open'
      documents={spielDocuments}
      isOpen={isOpen}
      onCancel={onCancel}
      onChoose={onChoose}
      originalDocumentName={originalDocumentName}
      title='Open Spiel'
    />
  );
}

export default OpenSpielChooser;
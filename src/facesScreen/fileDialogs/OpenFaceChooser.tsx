import DocumentChooser, {ChooseCallback} from "ui/dialog/DocumentChooser";
import { getAllFaceRecords } from "persistence/faces";
import { KeyValueRecord } from 'persistence/pathStore'

import { useState, useEffect } from 'react';

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onChoose:ChooseCallback,
  originalDocumentName:string
}

function OpenFaceChooser(props:IProps) {
  const { isOpen, onCancel, onChoose, originalDocumentName } = props;
  const [faceDocuments, setFaceDocuments] = useState<KeyValueRecord[]>([]);
  
  useEffect(() => {
    if (!isOpen) return;
    getAllFaceRecords().then(records => setFaceDocuments(records));
  }, [isOpen]);
  
  return (
    <DocumentChooser 
      chooseText='Open' 
      documents={faceDocuments} 
      isOpen={isOpen} 
      onCancel={onCancel} 
      onChoose={onChoose} 
      originalDocumentName={originalDocumentName} 
      title='Open Face' 
    />
  );
}

export default OpenFaceChooser;
import DocumentChooser, {ChooseCallback} from "ui/dialog/DocumentChooser";
import {getAllProjectRecords, getProjectNameFromKey} from "persistence/projects";
import { KeyValueRecord } from 'persistence/pathStore'

import { useState, useEffect } from 'react';

interface IProps {
  isOpen:boolean,
  onCancel:() => void,
  onChoose:ChooseCallback,
  originalDocumentName:string
}

function OpenProjectChooser(props:IProps) {
  const { isOpen, onCancel, onChoose, originalDocumentName } = props;
  const [projectDocuments, setProjectDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllProjectRecords().then(records => setProjectDocuments(records));
  }, [isOpen]);

  return (
    <DocumentChooser
      chooseText='Open'
      documents={projectDocuments}
      isOpen={isOpen}
      onCancel={onCancel}
      onChoose={onChoose}
      onGetNameFromKey={getProjectNameFromKey}
      originalDocumentName={originalDocumentName}
      title='Open Project'
    />
  );
}

export default OpenProjectChooser;
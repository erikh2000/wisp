import DocumentChooser, {ChooseCallback} from "ui/dialog/DocumentChooser";
import {getAllProjectRecords, getProjectNameFromKey} from "persistence/projects";
import { KeyValueRecord } from 'persistence/pathStore'

import { useState, useEffect } from 'react';

interface IProps { 
  isOpen:boolean,
  onChoose:ChooseCallback,
  onNew:() => void,
  originalDocumentName:string
}

function OpenOrNewProjectChooser(props:IProps) {
  const { isOpen, onChoose, onNew, originalDocumentName } = props;
  const [projectDocuments, setProjectDocuments] = useState<KeyValueRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getAllProjectRecords().then(records => setProjectDocuments(records));
  }, [isOpen]);

  return ( // No onCancel, because this dialog forces a choice that will leave user with a project.
    <DocumentChooser
      chooseText='Open Project'
      description="Hey, you gotta have a project. Pick an old one or make a new one."
      documents={projectDocuments}
      isOpen={isOpen}
      newText='New Project'
      onChoose={onChoose}
      onGetNameFromKey={getProjectNameFromKey}
      onNew={onNew}
      originalDocumentName={originalDocumentName}
      title='Pick Your Project'
    />
  );
}

export default OpenOrNewProjectChooser;
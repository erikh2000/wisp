import styles from './DocumentChooser.module.css';
import {getDateGrouping} from "common/dateUtil";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";
import {KeyValueRecord} from "persistence/pathStore";
import {keyToName} from "persistence/pathUtil";

import { useState, useEffect } from 'react';
import DocumentChooserRow from "./DocumentChooserRow";

export type ChooseCallback = (documentName:string) => void;

interface IProps {
  chooseText?:string,
  description?:string,
  documents:KeyValueRecord[],
  isOpen:boolean,
  newText?:string,
  originalDocumentName:string,
  onCancel?:() => void,
  onChoose:ChooseCallback,
  onNew?:() => void,
  onGetNameFromKey?:(key:string) => string, // Use if key does not have a display-friendly name at end of path.
  title:string
}

function _renderRows(documents:KeyValueRecord[], originalDocumentName:string, selectedDocumentName:string|null, setSelectedDocumentName:Function, onChoose:Function, getNameFromKey:Function):JSX.Element[] {
  documents.sort((a, b) => b.lastModified - a.lastModified);
  let lastDateGrouping = '';
  return documents.map((document) => {
    const name = getNameFromKey(document.key);
    const dateGrouping = getDateGrouping(document.lastModified);
    const displayGrouping = dateGrouping === lastDateGrouping ? '' : dateGrouping;
    lastDateGrouping = dateGrouping;
    return <DocumentChooserRow
      documentName={name}
      dateGrouping={displayGrouping}
      key={name} 
      isSelected={name===selectedDocumentName} 
      isSelectable={name!==selectedDocumentName && name!==originalDocumentName}
      onClick={() => setSelectedDocumentName(name)}
      onDoubleClick={name!==originalDocumentName ? () => onChoose(name) : undefined}
    />
  });
}

function DocumentChooser(props:IProps) {
  const { description, isOpen, onCancel, onChoose, onGetNameFromKey, onNew, chooseText, documents, originalDocumentName, title } = props;
  const getNameFromKey = onGetNameFromKey ?? keyToName;
  const [selectedDocumentName, setSelectedDocumentName] = useState<string|null>(null);
  const [rows, setRows] = useState<JSX.Element[]>(_renderRows(documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName, onChoose, getNameFromKey));
  
  useEffect(() => {
    if (!isOpen) return;
    const nextRows = _renderRows(documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName, onChoose, getNameFromKey);
    setRows(nextRows);
  }, [isOpen, documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName, getNameFromKey, onChoose]);

  const disabled = selectedDocumentName === null;
  const cancelButtonRender = onCancel ? <DialogButton onClick={onCancel} text={'Cancel'} /> : null;
  const newButtonRender = onNew ? <DialogButton onClick={onNew} text={props.newText ?? 'New'} /> : null;
  const descriptionRender = description ? <p>{description}</p> : null;
  
  return (
    <ModalDialog title={title} onCancel={onCancel} isOpen={isOpen}>
      {descriptionRender}
      <ul className={styles.rowList}>
        {rows}
      </ul>
      <DialogFooter>
        {cancelButtonRender}
        {newButtonRender}
        <DialogButton onClick={() => {if (selectedDocumentName) onChoose(selectedDocumentName)}} text={chooseText ?? 'Choose'} disabled={disabled} isPrimary/>
      </DialogFooter>
    </ModalDialog>
  )
}

export default DocumentChooser;
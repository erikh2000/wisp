import styles from './DocumentChooser.module.css';
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";
import {KeyValueRecord} from "persistence/pathStore";
import {keyToName} from "persistence/pathUtil";

import { useState, useEffect } from 'react';
import DocumentChooserRow from "./DocumentChooserRow";
import {getDateGrouping} from "../../common/dateUtil";

export type ChooseCallback = (documentName:string) => void;

interface IProps {
  chooseText?:string,
  documents:KeyValueRecord[],
  isOpen:boolean,
  originalDocumentName:string,
  onCancel:() => void,
  onChoose:ChooseCallback,
  title:string
}

function _renderRows(documents:KeyValueRecord[], originalDocumentName:string, selectedDocumentName:string|null, setSelectedDocumentName:Function, onChoose:Function):JSX.Element[] {
  documents.sort((a, b) => b.lastModified - a.lastModified);
  let lastDateGrouping = '';
  return documents.map((document) => {
    const name = keyToName(document.key);
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
  const { isOpen, onCancel, onChoose, chooseText, documents, originalDocumentName, title } = props;
  const [selectedDocumentName, setSelectedDocumentName] = useState<string|null>(null);
  const [rows, setRows] = useState<JSX.Element[]>(_renderRows(documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName, onChoose));

  useEffect(() => {
    if (!isOpen) return;
    const nextRows = _renderRows(documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName, onChoose);
    setRows(nextRows);
  }, [isOpen, documents, originalDocumentName, selectedDocumentName, setSelectedDocumentName]);

  const disabled = selectedDocumentName === null;
  
  return (
    <ModalDialog title={title} onCancel={onCancel} isOpen={isOpen}>
      <ul className={styles.rowList}>
        {rows}
      </ul>
      <DialogFooter>
        <DialogButton onClick={() => {if (selectedDocumentName) onChoose(selectedDocumentName)}} text={chooseText ?? 'Choose'} disabled={disabled} isPrimary/>
        <DialogButton onClick={onCancel} text={'Cancel'} />
      </DialogFooter>
    </ModalDialog>
  )
}

export default DocumentChooser;
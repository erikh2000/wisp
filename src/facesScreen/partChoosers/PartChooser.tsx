import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";
import {LoadablePart} from "ui/partAuthoring/PartLoader";
import PartThumbnail from "./PartThumbnail";
import styles from './PartChooser.module.css';

import { useState, useEffect } from 'react';

export type ChangeCallback = (partNo:number) => void;

interface IProps {
  isOpen:boolean,
  selectedPartNo:number,
  onChange:ChangeCallback,
  onCancel:() => void,
  parts:LoadablePart[],
  title:string
}

function _renderAvailableParts(parts:LoadablePart[], selectedPartNo:number, onChange:ChangeCallback):JSX.Element[] {
  return parts.map((part, partNo) => {
    return <PartThumbnail key={partNo} isSelected={selectedPartNo===partNo} bitmap={part.thumbnail} onClick={() => onChange(partNo)}/>
  });
}

function PartChooser(props:IProps) {
  const { isOpen, onCancel, onChange, parts, selectedPartNo, title } = props;
  const [availablePartElements, setAvailablePartElements] = useState<JSX.Element[]>(_renderAvailableParts(parts, selectedPartNo, onChange));
  
  useEffect(() => {
    const nextPartElements = _renderAvailableParts(parts, selectedPartNo, onChange);
    setAvailablePartElements(nextPartElements);
  }, [parts, onChange, selectedPartNo]);
  
  return (
    <ModalDialog title={title} onCancel={onCancel} isOpen={isOpen}>
      <div className={styles.partList}>
        {availablePartElements}
      </div>
      <DialogFooter>
        <DialogButton onClick={onCancel} text={'Cancel'} />
      </DialogFooter>
    </ModalDialog>
  )
}

export default PartChooser;
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";
import {LoadablePart} from "ui/partAuthoring/PartLoader";
import PartThumbnail from "./PartThumbnail";
import styles from './PartChooser.module.css';

import { useState, useEffect } from 'react';

type ChangeCallback = (partUrl:string) => void;

interface IProps {
  isOpen:boolean,
  onChange:ChangeCallback,
  onCancel:() => void,
  parts:LoadablePart[],
  title:string
}

function _renderAvailableParts(parts:LoadablePart[], onChange:ChangeCallback):JSX.Element[] {
  return parts.map((part, partNo) => <PartThumbnail key={partNo} bitmap={part.thumbnail} onClick={() => onChange(part.url)}/>);
}

function PartChooser(props:IProps) {
  const { isOpen, onCancel, onChange, parts, title } = props;
  const [availablePartElements, setAvailablePartElements] = useState<JSX.Element[]>(_renderAvailableParts(parts, onChange));
  
  useEffect(() => {
    const nextPartElements = _renderAvailableParts(parts, onChange);
    setAvailablePartElements(nextPartElements);
  }, [parts, onChange]);
  
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
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogTextInput from "ui/dialog/DialogTextInput";

import {SpielNode} from "sl-spiel";
import {useState, useEffect} from "react";

interface IProps {
  isOpen:boolean,
  originalNode:SpielNode|null;
  onCancel:() => void,
  onSubmit:(node:SpielNode) => void
}

function EditSpielNodeDialog(props:IProps) {
  const {isOpen, originalNode, onCancel, onSubmit} = props;
  const [character, setCharacter] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const isSubmitDisabled = false; // TODO - validation
  
  useEffect(() => {
    if (!isOpen || !originalNode) return;
    setCharacter(originalNode.line.character);
    setDialogue(originalNode.line.dialogue.join(' / '));
  }, [isOpen, originalNode]);

  if (!originalNode) return null;

  // TODO onsubmit handling below
  return (
    <ModalDialog title='Edit Line' isOpen={isOpen} onCancel={onCancel}>
      <DialogTextInput labelText='Character' value={character} onChangeText={(text:string) => setCharacter(text)} />
      <DialogTextInput labelText='Dialogue' value={dialogue} onChangeText={(text:string) => setDialogue(text)} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        <DialogButton text='Update' onClick={() => onSubmit(originalNode)} disabled={isSubmitDisabled} isPrimary/> 
      </DialogFooter>
    </ModalDialog>
  )
}

export default EditSpielNodeDialog;
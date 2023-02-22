import ConversationSpeedSelector from "./ConversationSpeedSelector";
import ConversationSpeed from "conversations/ConversationSpeed";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";

import {useState, useEffect} from "react";

interface IProps {
  defaultConversationSpeed:ConversationSpeed,
  isOpen:boolean,
  onCancel:() => void,
  onSubmit:(conversationSpeed:ConversationSpeed) => void
}

function TestOptionDialog(props:IProps) {
  const {defaultConversationSpeed, isOpen, onCancel, onSubmit} = props;
  const [conversationSpeed, setConversationSpeed] = useState<ConversationSpeed>(defaultConversationSpeed);
  
  useEffect(() => {
    if (!isOpen) return;
    setConversationSpeed(defaultConversationSpeed);
  }, [isOpen, defaultConversationSpeed]);

  return (
    <ModalDialog title='Test Options' isOpen={isOpen} onCancel={onCancel}>
      <ConversationSpeedSelector conversationSpeed={conversationSpeed} onChange={nextConversationSpeed => setConversationSpeed(nextConversationSpeed)} />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        <DialogButton text='Update' onClick={() => onSubmit(conversationSpeed)} isPrimary/>
      </DialogFooter>
    </ModalDialog>
  )
}

export default TestOptionDialog;
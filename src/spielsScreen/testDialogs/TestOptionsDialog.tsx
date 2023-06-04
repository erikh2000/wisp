import ConversationSpeedSelector from "./ConversationSpeedSelector";
import ConversationSpeed from "conversations/ConversationSpeed";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";

import {useState, useEffect} from "react";

interface IProps {
  defaultConversationSpeed:ConversationSpeed,
  defaultPlayFullScreen:boolean,
  isOpen:boolean,
  onCancel:() => void,
  onSubmit:(conversationSpeed:ConversationSpeed, platFullScreen:boolean) => void
}

function TestOptionDialog(props:IProps) {
  const {defaultConversationSpeed, defaultPlayFullScreen, isOpen, onCancel, onSubmit} = props;
  const [conversationSpeed, setConversationSpeed] = useState<ConversationSpeed>(defaultConversationSpeed);
  const [playFullScreen, setPlayFullScreen] = useState<boolean>(defaultPlayFullScreen);
  
  useEffect(() => {
    if (!isOpen) return;
    setConversationSpeed(defaultConversationSpeed);
    setPlayFullScreen(defaultPlayFullScreen);
  }, [isOpen, defaultConversationSpeed, defaultPlayFullScreen]);

  return (
    <ModalDialog title='Test Options' isOpen={isOpen} onCancel={onCancel}>
      <ConversationSpeedSelector conversationSpeed={conversationSpeed} onChange={nextConversationSpeed => setConversationSpeed(nextConversationSpeed)} />
      <label htmlFor='playFullScreenCheckboc'>Play full-screen:</label>
      <input 
        type='checkbox' 
        name='playFullScreenCheckboc' 
        checked={playFullScreen} 
        onChange={(event) => setPlayFullScreen(event.target.checked)} 
      />
      <DialogFooter>
        <DialogButton text='Cancel' onClick={onCancel} />
        <DialogButton text='Update' onClick={() => onSubmit(conversationSpeed, playFullScreen)} isPrimary/>
      </DialogFooter>
    </ModalDialog>
  )
}

export default TestOptionDialog;
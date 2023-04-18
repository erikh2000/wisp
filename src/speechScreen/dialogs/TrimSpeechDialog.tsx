import styles from "./TrimSpeechDialog.module.css";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";
import ModalDialog from "ui/dialog/ModalDialog";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

function TrimSpeechDialog(props:IProps) {
  const {isOpen, onCancel, onComplete} = props;
  
  return (
  <ModalDialog isOpen={isOpen} title={'Select Rows'} onCancel={onCancel}>
    <p>Trim silence or other unwanted audio from your speech by adjusting start and end points below.</p>
    <DialogFooter>
      <DialogButton text="Cancel" onClick={onCancel} />
      <DialogButton text="Test" onClick={() => {}} />
      <DialogButton text="Next" onClick={onComplete} isPrimary />
    </DialogFooter>
  </ModalDialog>);
}

export default TrimSpeechDialog;
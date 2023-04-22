import styles from "./GenerateLipAnimationDialog.module.css";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import ProgressBar from "ui/progressBar/ProgressBar";

interface IProps {
  audioBuffer:AudioBuffer|null,
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

function GenerateLipAnimationDialog(props:IProps) {
  const {isOpen, onCancel, onComplete} = props;
  
  return (
    <ModalDialog isOpen={isOpen} title="Finalize Take - Lip Animation" onCancel={onCancel}>
      <p className={styles.descriptionText}>Your speech is being analyzed to generate timings used for lip sync animation.</p>
      
      <div className={styles.progressBarContainer}>
        <ProgressBar percentComplete={0.5} />
      </div>
      
      <DialogFooter>
        <DialogButton text="Cancel" onClick={onCancel} />
      </DialogFooter>
    </ModalDialog>);
}

export default GenerateLipAnimationDialog;
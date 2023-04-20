import TrimSlider from "./TrimSlider";
import styles from "./TrimSpeechDialog.module.css";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import WaveformVisualizer from "ui/waveformVisualizer/WaveformVisualizer";
import Slider from "../../ui/Slider";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

function TrimSpeechDialog(props:IProps) {
  const {isOpen, onCancel, onComplete} = props;
  
  return (
  <ModalDialog isOpen={isOpen} title="Finalize Take - Trim Audio" onCancel={onCancel}>
    <p className={styles.descriptionText}>Trim silence or other unwanted audio from your speech by adjusting start and end points below.</p>
    <WaveformVisualizer 
      amplitudeMarkers={[]} 
      blockMarkers={[]} 
      timeMarkers={[]} 
      className={styles.waveformContainer} 
      beginSampleNo={0} 
      endSampleNo={0} 
      samples={null} 
      needleSampleNo={0} 
    />
    <TrimSlider leftValue={0} rightValue={100} onLeftChange={() => {}} onRightChange={() => {}} />
    <div className={styles.autoAdjustContainer}>
      <span className={styles.autoAdjustLabel}>Auto-Adjust</span>
      <div className={styles.autoAdjustSliderContainer}>
        <span className={styles.looserLabel}>Looser</span>
        <Slider value={100} onChange={() => {}} />
        <span className={styles.tighterLabel}>Tighter</span>
      </div>
    </div>
    <DialogFooter>
      <DialogButton text="Cancel" onClick={onCancel} />
      <DialogButton text="Test" onClick={() => {}} />
      <DialogButton text="Next" onClick={onComplete} isPrimary />
    </DialogFooter>
  </ModalDialog>);
}

export default TrimSpeechDialog;
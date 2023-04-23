import styles from "./GenerateLipAnimationDialog.module.css";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import ProgressBar from "ui/progressBar/ProgressBar";

import { useEffect, useState } from "react";
import { init, generateLipzTextFromAudioBuffer, loadLipzFromText, LipzEvent } from "sl-web-speech";

const FRAME_INTERVAL = 1000/20;
let wasCanceled = false;

interface IProps {
  audioBuffer:AudioBuffer|null,
  isOpen: boolean;
  onCancel: () => void;
  onComplete: (lipzEvents:LipzEvent[]) => void;
}

async function _generateLipAnimation(audioBuffer:AudioBuffer):Promise<LipzEvent[]> {
  await init();
  const lipzText = await generateLipzTextFromAudioBuffer(audioBuffer);
  return loadLipzFromText(lipzText);
}

function _calcProgressComplete(startTime:number, predictedDuration:number):number {
  const WAIT_NEAR_END = 95;
  const elapsed = (Date.now() - startTime) / 1000;
  const completePercent = elapsed / predictedDuration;
  return completePercent > WAIT_NEAR_END ? WAIT_NEAR_END : completePercent;
}

function _predictDuration(audioBuffer:AudioBuffer):number {
  if (!audioBuffer) return 0;
  const GENERATE_OVERHEAD_TIME = 1;
  return GENERATE_OVERHEAD_TIME + audioBuffer.duration;
}

function GenerateLipAnimationDialog(props:IProps) {
  const {audioBuffer, isOpen, onCancel, onComplete} = props;
  const [frameNo, setFrameNo] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [predictedDuration, setPredictedDuration] = useState<number>(0);
  
  useEffect(() => { // Handle mount/reopen.
    if (!isOpen || !audioBuffer) return;
    wasCanceled = false;
    setStartTime(Date.now());
    setPredictedDuration(_predictDuration(audioBuffer));
    _generateLipAnimation(audioBuffer).then((lipzEvents) => {
      if (!wasCanceled) onComplete(lipzEvents);
    });
  }, [audioBuffer, isOpen, onComplete]);

  useEffect(() => { // Cause re-render at regular interval.
    const timer = setTimeout(() => setFrameNo(frameNo + 1), FRAME_INTERVAL);
    return () => clearTimeout(timer);
  }, [frameNo]);
  
  const progressComplete = _calcProgressComplete(startTime, predictedDuration);
  
  return (
    <ModalDialog isOpen={isOpen} title="Finalize Take - Lip Animation" onCancel={onCancel}>
      <p className={styles.descriptionText}>Your speech is being analyzed to generate timings used for lip sync animation.</p>
      
      <div className={styles.progressBarContainer}>
        <ProgressBar percentComplete={progressComplete} />
      </div>
      
      <DialogFooter>
        <DialogButton text="Cancel" onClick={() => {
          wasCanceled = true; 
          onCancel();
        }} />
      </DialogFooter>
    </ModalDialog>);
}

export default GenerateLipAnimationDialog;
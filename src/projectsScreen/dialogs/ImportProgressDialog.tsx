import styles from "./ImportProgressDialog.module.css";
import {ProjectArchive} from "persistence/impExpUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import ProgressBar from "ui/progressBar/ProgressBar";

import { useEffect, useState } from "react";

const FRAME_INTERVAL = 1000/20;
let wasCanceled = false;

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
  projectArchive:ProjectArchive|null;
}

function _calcProgressComplete(startTime:number, predictedDuration:number):number {
  const WAIT_NEAR_END = 95;
  const elapsed = (Date.now() - startTime) / 1000;
  const completePercent = elapsed / predictedDuration;
  return completePercent > WAIT_NEAR_END ? WAIT_NEAR_END : completePercent;
}

function _predictDuration(projectArchive:ProjectArchive):number {
  const fileCount = projectArchive.relativePaths.length
  const GENERATE_OVERHEAD_TIME = 1;
  const AVERAGE_TIME_PER_FILE = 0.004;
  return GENERATE_OVERHEAD_TIME + fileCount * AVERAGE_TIME_PER_FILE;
}

function ImportProgressDialog(props:IProps) {
  const {projectArchive, isOpen, onCancel, onComplete} = props;
  const [frameNo, setFrameNo] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [predictedDuration, setPredictedDuration] = useState<number>(0);
  
  useEffect(() => { // Handle mount/reopen.
    if (!isOpen || projectArchive === null) return;
    wasCanceled = false;
    setStartTime(Date.now());
    const nextPredictedDuration = _predictDuration(projectArchive);
    setPredictedDuration(nextPredictedDuration);
    // return downloadProjectZip(projectName);   TODO--import.
    if (!wasCanceled) onComplete();
  }, [projectArchive, isOpen, onComplete]);

  useEffect(() => { // Cause re-render at regular interval.
    const timer = setTimeout(() => setFrameNo(frameNo + 1), FRAME_INTERVAL);
    return () => clearTimeout(timer);
  }, [frameNo]);

  if (!isOpen || projectArchive === null) return null;
  
  const progressComplete = _calcProgressComplete(startTime, predictedDuration);

  return (
    <ModalDialog isOpen={isOpen} title="Import Project" onCancel={onCancel}>
      <p className={styles.descriptionText}>Importing project archive.</p>

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

export default ImportProgressDialog;
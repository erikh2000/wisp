import styles from "./ExportProgressDialog.module.css";
import {ExportProjectSettings} from "./ExportSettingsDialog";
import {getAllKeysForProject} from "persistence/projects";
import {downloadProjectZip} from "persistence/impExpUtil";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";
import ProgressBar from "ui/progressBar/ProgressBar";

import { useEffect, useState } from "react";

const FRAME_INTERVAL = 1000/20;
let wasCanceled = false;

interface IProps {
  isOpen: boolean;
  exportSettings: ExportProjectSettings;
  onCancel: () => void;
  onComplete: () => void;
  projectName:string;
}

function _calcProgressComplete(startTime:number, predictedDuration:number):number {
  const WAIT_NEAR_END = 95;
  const elapsed = (Date.now() - startTime) / 1000;
  const completePercent = elapsed / predictedDuration;
  return completePercent > WAIT_NEAR_END ? WAIT_NEAR_END : completePercent;
}

async function _predictDuration(projectName:string):Promise<number> {
  const keys = await getAllKeysForProject(projectName);
  const GENERATE_OVERHEAD_TIME = 1;
  const AVERAGE_TIME_PER_KEY = 0.004;
  return GENERATE_OVERHEAD_TIME + keys.length * AVERAGE_TIME_PER_KEY;
}

function ExportProgressDialog(props:IProps) {
  const {projectName, isOpen, onCancel, onComplete} = props;
  const [frameNo, setFrameNo] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [predictedDuration, setPredictedDuration] = useState<number>(0);

  useEffect(() => { // Handle mount/reopen.
    if (!isOpen || !projectName.length) return;
    wasCanceled = false;
    setStartTime(Date.now());
    _predictDuration(projectName)
      .then((duration) => {
        setPredictedDuration(duration);
        return downloadProjectZip(projectName);
      }).then(() => {
        if (!wasCanceled) onComplete();
      });
  }, [projectName, isOpen, onComplete]);

  useEffect(() => { // Cause re-render at regular interval.
    const timer = setTimeout(() => setFrameNo(frameNo + 1), FRAME_INTERVAL);
    return () => clearTimeout(timer);
  }, [frameNo]);

  const progressComplete = _calcProgressComplete(startTime, predictedDuration);

  return (
    <ModalDialog isOpen={isOpen} title="Export Project" onCancel={onCancel}>
      <p className={styles.descriptionText}>Exporting Zip archive for {projectName}.</p>

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

export default ExportProgressDialog;
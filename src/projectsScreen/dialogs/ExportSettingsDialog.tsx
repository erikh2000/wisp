import styles from "./ExportSettingsDialog.module.css";
import DialogButton from "ui/dialog/DialogButton";
import DialogFooter from "ui/dialog/DialogFooter";
import ModalDialog from "ui/dialog/ModalDialog";

import { useEffect, useState } from "react";

export type ExportProjectSettings = {
  standalonePlayer:boolean
}

export function defaultExportProjectSettings():ExportProjectSettings {
  return {standalonePlayer:false};
}

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onContinue: (exportSettings:ExportProjectSettings) => void;
  projectName:string;
}

function ExportSettingsDialog(props:IProps) {
  const {projectName, isOpen, onCancel, onContinue} = props;
  
  const [exportSettings, setExportSettings] = useState<ExportProjectSettings>(defaultExportProjectSettings());

  useEffect(() => { // Handle mount/reopen.
    if (!isOpen || !projectName.length) return;
  }, [projectName, isOpen, onContinue]);
  
  function _toggleExportSettings() { setExportSettings({standalonePlayer:!exportSettings.standalonePlayer}); }

  return (
    <ModalDialog isOpen={isOpen} title="Export Project" onCancel={onCancel}>
      <p className={styles.descriptionText}>This action will download an archive with the &quot;{projectName}&quot; 
        project's content. (Good for backing up your work or transferring it to another device.) If you'd like 
        to include extra files to allow hosting from a website, choose the &quot;export as standalone player&quot; 
        option below.</p>
      
      <input type="checkbox" name="standaloneCheckbox" checked={exportSettings.standalonePlayer} onChange={() => _toggleExportSettings()}/>
      <label htmlFor="standaloneCheckbox" onClick={() => _toggleExportSettings()}>Export as standalone player</label>
      
      <DialogFooter>
        <DialogButton text="Cancel" onClick={onCancel} />
        <DialogButton text="Continue" onClick={onContinue} isPrimary/>
      </DialogFooter>
    </ModalDialog>);
}

export default ExportSettingsDialog;
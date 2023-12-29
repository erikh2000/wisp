import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  isOpen: boolean;
  projectName:string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmMergeProjectDialog(props:IProps) {
  const { isOpen, onCancel, onConfirm, projectName } = props;

  const description = `A "${projectName}" project already exists. Do you want to import the project archive into the same project, merging the two? This may overwrite existing faces, spiels, and speech.`;
  return <ConfirmCancelDialog
    isOpen={isOpen}
    title="Merge Import into Existing Project?"
    description={description}
    onCancel={onCancel}
    onConfirm={onConfirm}
    confirmText='Merge'
  />;
}

export default ConfirmMergeProjectDialog;
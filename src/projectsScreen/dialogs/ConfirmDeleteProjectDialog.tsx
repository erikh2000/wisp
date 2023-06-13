import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  isOpen: boolean;
  projectName:string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteProjectDialog(props:IProps) {
  const { isOpen, onCancel, onConfirm, projectName } = props;
  
  const description = `Do you really want to delete "${projectName}" along with any associated faces, spiels, and speech? You can't undo it.`;
  return <ConfirmCancelDialog
    isOpen={isOpen}
    title="Delete Project"
    description={description}
    onCancel={onCancel}
    onConfirm={onConfirm}
    confirmText='Delete Forever'
  />;
}

export default ConfirmDeleteProjectDialog;
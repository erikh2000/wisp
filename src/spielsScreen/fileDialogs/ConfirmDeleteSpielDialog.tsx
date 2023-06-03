import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  isOpen: boolean;
  spielName:string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteSpielDialog(props:IProps) {
  const { isOpen, onCancel, onConfirm, spielName } = props;

  const description = `Do you really want to delete "${spielName}" and any of its recorded speech or scene settings? You can't undo it.`;
  return <ConfirmCancelDialog
    isOpen={isOpen}
    title="Delete Spiel"
    description={description}
    onCancel={onCancel}
    onConfirm={onConfirm}
    confirmText='Delete Forever'
  />;
}

export default ConfirmDeleteSpielDialog;
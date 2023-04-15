import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteAllTakesDialog(props:IProps) {
  const { isOpen, onCancel, onConfirm } = props;
  
  return <ConfirmCancelDialog
      isOpen={isOpen}
      title="Delete All Takes"
      description="Are you sure you want to delete all recorded takes (including final) for this spiel?"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />;
}

export default ConfirmDeleteAllTakesDialog;
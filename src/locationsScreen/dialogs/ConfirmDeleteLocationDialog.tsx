import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  isOpen: boolean;
  locationName:string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteLocationDialog(props:IProps) {
  const { isOpen, onCancel, onConfirm, locationName } = props;

  const description = `Do you really want to delete "${locationName}"? You can't undo it.`;
  return <ConfirmCancelDialog
    isOpen={isOpen}
    title="Delete Location"
    description={description}
    onCancel={onCancel}
    onConfirm={onConfirm}
    confirmText='Delete Forever'
  />;
}

export default ConfirmDeleteLocationDialog;
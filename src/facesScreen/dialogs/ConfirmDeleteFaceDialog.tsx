import ConfirmCancelDialog from "ui/dialog/ConfirmCancelDialog";

interface IProps {
  documentName:string;
  isOpen:boolean;
  onConfirm:() => void;
  onCancel:() => void;
}

function ConfirmDeleteFaceDialog(props:IProps) {
  const {documentName, isOpen, onConfirm, onCancel} = props;
  return (
    <ConfirmCancelDialog 
      confirmText='Delete Forever'
      description={`Do you really want to delete ${documentName}? You won't be able to undo it.`}
      isOpen={isOpen} 
      onCancel={onCancel} 
      onConfirm={onConfirm} 
      title='Delete Face'
    />
  );
}

export default ConfirmDeleteFaceDialog;
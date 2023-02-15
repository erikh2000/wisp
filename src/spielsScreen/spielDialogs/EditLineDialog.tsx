import LineDialogBase from "./LineDialogueBase";
import {SpielNode} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  originalNode:SpielNode|null;
  onCancel:() => void,
  onSubmit:(node:SpielNode) => void,
  onDelete?:() => void,
}

function EditLineDialog(props:IProps) {
  if (!props.originalNode) return null;
  return <LineDialogBase {...props} title='Edit Line' />;
}

export default EditLineDialog;
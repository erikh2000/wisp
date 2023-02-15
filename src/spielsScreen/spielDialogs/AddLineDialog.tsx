import LineDialogBase from "./LineDialogueBase";
import {SpielNode} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  defaultCharacter:string,
  onCancel:() => void,
  onSubmit:(node:SpielNode) => void,
}

function AddLineDialog(props:IProps) {
  return <LineDialogBase {...props} originalNode={null} title='Add Line' />;
}

export default AddLineDialog;
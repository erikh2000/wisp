import ReplyDialogBase from "./ReplyDialogBase";

import {SpielReply} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  defaultCharacter:string,
  onCancel:() => void,
  onSubmit:(node:SpielReply) => void
}

function AddRootReplyDialog(props:IProps) {
  return <ReplyDialogBase {...props} originalReply={null} title='Add General Reply' />;
}

export default AddRootReplyDialog;
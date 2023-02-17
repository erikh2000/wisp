import ReplyDialogBase from "./ReplyDialogBase";

import {SpielReply, SpielLine} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  defaultCharacter:string,
  
  inResponseToLine:SpielLine,
  onCancel:() => void,
  onSubmit:(node:SpielReply) => void
}

function AddReplyDialog(props:IProps) {
  return <ReplyDialogBase {...props} originalReply={null} title='Add Reply' />;
}

export default AddReplyDialog;
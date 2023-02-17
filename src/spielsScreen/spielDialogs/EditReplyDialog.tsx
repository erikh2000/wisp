import ReplyDialogBase from "./ReplyDialogBase";

import {SpielLine, SpielReply} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  originalReply:SpielReply|null;
  inResponseToLine:SpielLine,
  onCancel:() => void,
  onDelete:() => void,
  onSubmit:(node:SpielReply) => void,
}

function EditReplyDialog(props:IProps) {
  const {originalReply} = props;
  if (!originalReply) return null;
  return <ReplyDialogBase {...props} originalReply={originalReply} title='Edit Reply' />;
}

export default EditReplyDialog;
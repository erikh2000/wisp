import ReplyDialogBase from "./ReplyDialogBase";

import {SpielReply} from "sl-spiel";

interface IProps {
  isOpen:boolean,
  originalReply:SpielReply;
  onCancel:() => void,
  onDelete:() => void,
  onSubmit:(node:SpielReply) => void,
}

function EditRootReplyDialog(props:IProps) {
  const {originalReply} = props;
  return <ReplyDialogBase {...props} originalReply={originalReply} title='Edit General Reply' />;
}

export default EditRootReplyDialog;
import styles from './SpielRootRepliesView.module.css';
import SpielReplyView from "spielsScreen/panes/SpielReplyView";

import { SpielReply } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  rootReplies:SpielReply[]
  onEditRootReply:(replyNo:number) => void
}

function SpielNodesView(props:IProps) {
  const { onEditRootReply, rootReplies, disabled } = props;
  if (!rootReplies.length) return null;
  return (
    <div className={styles.container}>
      <hr />
      <h1>General Replies:</h1>
      {rootReplies.map((reply, replyNo) => 
        <SpielReplyView 
          key={replyNo} 
          reply={reply} 
          disabled={disabled} 
          onEditReply={() => onEditRootReply(replyNo)}
        />)}
    </div>
  );
}

export default SpielNodesView;
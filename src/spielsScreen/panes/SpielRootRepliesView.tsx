import styles from './SpielRootRepliesView.module.css';
import SpielReplyView from "spielsScreen/panes/SpielReplyView";

import { SpielReply } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  rootReplies:SpielReply[]
}

function SpielNodesView(props:IProps) {
  const { rootReplies, disabled } = props;
  if (!rootReplies.length) return null;
  return (
    <div className={styles.container}>
      <hr />
      <h1>General Replies:</h1>
      {rootReplies.map((reply, replyNo) => <SpielReplyView key={replyNo} reply={reply} disabled={disabled}/>)}
    </div>
  );
}

export default SpielNodesView;
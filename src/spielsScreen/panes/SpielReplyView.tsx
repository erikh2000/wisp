import styles from './SpielReplyView.module.css';
import { SpielReply } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  reply:SpielReply
}

function SpielReplyView(props:IProps) {
  return (
    <div className={styles.container}>{props.reply.line.dialogue}</div>
  );
}

export default SpielReplyView;
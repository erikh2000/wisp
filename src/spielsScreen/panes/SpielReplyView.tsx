import styles from './SpielReplyView.module.css';
import {summarizeTextArray} from "common/textFormatUtil";

import { SpielReply } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  reply:SpielReply
}

function _getReplySummaryText(reply:SpielReply) {
  return `${summarizeTextArray(reply.matchCriteria)} = ${summarizeTextArray(reply.line.dialogue)}`;
}

function SpielReplyView(props:IProps) {
  const {reply} = props;
  return (
    <div className={styles.container}>{_getReplySummaryText(reply)}</div>
  );
}

export default SpielReplyView;
import styles from './SpielReplyView.module.css';
import {summarizeTextArray} from "common/textFormatUtil";

import { SpielReply } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  onEditReply:() => void,
  reply:SpielReply
}

function _onDoubleClick(event:any, onEditReply:() => void) {
  event.stopPropagation();
  onEditReply();
}

function SpielReplyView(props:IProps) {
  const {reply, onEditReply} = props;
  return (
    <div className={styles.container} onDoubleClick={(event) => _onDoubleClick(event, onEditReply)}>
      {summarizeTextArray(reply.matchCriteria)} &#8594; {summarizeTextArray(reply.line.dialogue)}</div>
  );
}

export default SpielReplyView;
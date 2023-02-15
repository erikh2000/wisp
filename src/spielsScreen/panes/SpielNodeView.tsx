import styles from './SpielNodeView.module.css';
import SpielReplyView from "./SpielReplyView";
import {spielEmotionToParenthetical} from "spielsScreen/interactions/spielEmotionUtil";

import { SpielNode, SpielReply } from 'sl-spiel';
import { Emotion } from 'sl-web-face'

interface IProps {
  disabled?:boolean,
  isSelected:boolean,
  lastCharacterName:string,
  lastEmotion:Emotion,
  node:SpielNode,
  onSelect:() => void
  onSelectForEdit:() => void,
  onSelectReplyForEdit:(replyNo:number) => void,
}

function _renderReplies(replies:SpielReply[], onSelectReplyForEdit:(replyNo:number) => void) {
  if (replies.length === 0) return null;
  const renderedReplies = replies.map((reply, replyNo) => (
    <SpielReplyView 
      onEditReply={() => onSelectReplyForEdit(replyNo)} 
      key={replyNo} 
      reply={reply} />
  ));
  return <div className={styles.replyContainer}>{renderedReplies}</div>;
}
function SpielNodeView(props:IProps) {
  const { isSelected, lastCharacterName, lastEmotion, node, onSelect, onSelectForEdit, onSelectReplyForEdit } = props;
  const parenthetical = node.line.emotion !== lastEmotion 
    ? <span className={styles.parenthetical}>{spielEmotionToParenthetical(node.line.emotion)}</span> : null;
  const character = node.line.character === lastCharacterName ? null : <span className={styles.character}>{node.line.character}</span>;
  const renderedReplies = _renderReplies(node.replies, onSelectReplyForEdit);
  return (
    <div 
        className={isSelected ? styles.containerSelected : styles.container}
        onClick={() => onSelect()}
        onDoubleClick={() => onSelectForEdit()}
        draggable
    >
      {character}
      {parenthetical}
      <span className={styles.dialogue}>{node.line.dialogue}</span>
      {renderedReplies}
    </div>
  );
}

export default SpielNodeView;
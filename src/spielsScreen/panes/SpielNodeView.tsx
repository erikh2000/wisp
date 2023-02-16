import styles from './SpielNodeView.module.css';
import SpielReplyView from "./SpielReplyView";
import {spielEmotionToParenthetical} from "spielsScreen/interactions/spielEmotionUtil";

import { SpielNode, SpielReply } from 'sl-spiel';
import { Emotion } from 'sl-web-face';
import { useEffect, useRef } from "react";

export enum InsertPosition {
  NONE,
  BEFORE,
  AFTER
}

interface IProps {
  disabled?:boolean,
  isSelected:boolean,
  displayInsertPosition:InsertPosition,
  lastCharacterName:string,
  lastEmotion:Emotion,
  node:SpielNode,
  onNodeDrag:(event:any) => void,
  onNodeDragEnd:(event:any) => void,
  onReceiveNodeHeight:(height:number) => void,
  onSelect:() => void
  onSelectForEdit:() => void,
  onSelectReplyForEdit:(replyNo:number) => void,
}

function _getStyleForInsertPosition(insertPosition:InsertPosition) {
  switch (insertPosition) {
    case InsertPosition.BEFORE: return styles.insertBefore;
    case InsertPosition.AFTER: return styles.insertAfter;
    default: return '';
  }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { displayInsertPosition, isSelected, lastCharacterName, lastEmotion, node, onNodeDrag, onNodeDragEnd,
    onReceiveNodeHeight, onSelect, onSelectForEdit, onSelectReplyForEdit } = props;
  const parenthetical = node.line.emotion !== lastEmotion 
    ? <span className={styles.parenthetical}>{spielEmotionToParenthetical(node.line.emotion)}</span> : null;
  const character = node.line.character === lastCharacterName ? null : <span className={styles.character}>{node.line.character}</span>;
  const renderedReplies = _renderReplies(node.replies, onSelectReplyForEdit);
  const className = `${isSelected ? styles.containerSelected : styles.container} ${_getStyleForInsertPosition(displayInsertPosition)}`;
  
  useEffect(() => {
    if (!containerRef.current) return;
    onReceiveNodeHeight(containerRef.current.clientHeight);
  }, [containerRef.current?.clientHeight]);
  
  return (
    <div 
        className={className}
        onClick={() => onSelect()}
        onDoubleClick={() => onSelectForEdit()}
        onDrag={onNodeDrag}
        onDragEnd={onNodeDragEnd}
        ref={containerRef}
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
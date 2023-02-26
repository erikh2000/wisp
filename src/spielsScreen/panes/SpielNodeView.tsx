import styles from './SpielNodeView.module.css';
import SpielReplyView from "./SpielReplyView";
import {spielEmotionToParenthetical} from "conversations/spielEmotionUtil";

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

function _renderReplies(replies:SpielReply[], onSelectReplyForEdit:(replyNo:number) => void, disabled?:boolean) {
  if (replies.length === 0) return null;
  const renderedReplies = replies.map((reply, replyNo) => (
    <SpielReplyView 
      onEditReply={() => onSelectReplyForEdit(replyNo)} 
      key={replyNo} 
      reply={reply} 
      disabled={disabled}
    />
  ));
  return <div className={styles.replyContainer}>{renderedReplies}</div>;
}

function _getContainerStyle(isSelected:boolean, insertPosition:InsertPosition, disabled?:boolean) {
  if (disabled) return isSelected ? styles.containerDisabledSelected : styles.containerDisabled;
  return `${isSelected ? styles.containerSelected : styles.container} ${_getStyleForInsertPosition(insertPosition)}`
}
function SpielNodeView(props:IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { disabled, displayInsertPosition, isSelected, lastCharacterName, lastEmotion, node, onNodeDrag, onNodeDragEnd,
    onReceiveNodeHeight, onSelect, onSelectForEdit, onSelectReplyForEdit } = props;
  const parenthetical = node.line.emotion !== lastEmotion 
    ? <span className={styles.parenthetical}>{spielEmotionToParenthetical(node.line.emotion)}</span> : null;
  const character = node.line.character === lastCharacterName ? null : <span className={styles.character}>{node.line.character}</span>;
  const renderedReplies = _renderReplies(node.replies, onSelectReplyForEdit, disabled);
  const className = _getContainerStyle(isSelected, displayInsertPosition, disabled);
  
  useEffect(() => {
    if (!containerRef.current) return;
    onReceiveNodeHeight(containerRef.current.clientHeight);
  }, [containerRef.current?.clientHeight, onReceiveNodeHeight]);
  
  return (
    <div 
        className={className}
        onClick={!disabled ? () => onSelect() : undefined}
        onDoubleClick={!disabled ? () => onSelectForEdit() : undefined}
        onDrag={!disabled ? onNodeDrag : undefined}
        onDragEnd={!disabled ? onNodeDragEnd : undefined}
        ref={containerRef}
        draggable={!disabled}
    >
      {character}
      {parenthetical}
      <span className={styles.dialogue}>{node.line.dialogue}</span>
      {renderedReplies}
    </div>
  );
}

export default SpielNodeView;
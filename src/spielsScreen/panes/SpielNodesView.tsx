import styles from './SpielNodesView.module.css';
import { SpielNode, Emotion as SpielEmotion } from 'sl-spiel';
import SpielNodeView, { InsertPosition }  from "./SpielNodeView";

interface IProps {
  disabled?:boolean,
  insertAfterNodeNo:number|null, // null means don't display. -1 means insert at beginning.
  nodes:SpielNode[],
  onNodeDrag:(event:any, nodeNo:number) => void,
  onNodeDragEnd:(event:any, nodeNo:number) => void,
  onReceiveNodeHeight:(nodeNo:number, height:number) => void,
  onSelect:(nodeNo:number) => void,
  onSelectForEdit:(nodeNo:number) => void,
  onSelectReplyForEdit:(nodeNo:number, replyNo:number) => void,
  selectedNodeNo:number
}

function _getInsertPosition(nodeNo:number, insertAfterNodeNo:number|null):InsertPosition {
  if (insertAfterNodeNo === null) return InsertPosition.NONE;
  if (insertAfterNodeNo === -1) return nodeNo === 0 ? InsertPosition.BEFORE : InsertPosition.NONE;
  return nodeNo === insertAfterNodeNo ? InsertPosition.AFTER : InsertPosition.NONE;
}

function SpielNodesView(props:IProps) {
  const { insertAfterNodeNo, nodes, disabled, onNodeDrag, onNodeDragEnd, onReceiveNodeHeight, onSelect, 
    onSelectForEdit, onSelectReplyForEdit, selectedNodeNo } = props;
  let lastCharacterName = '';
  let lastEmotion = SpielEmotion.NEUTRAL;
  return (
    <div className={styles.container}>
      {nodes.map((node, nodeNo) => {
        const displayInsertPosition = _getInsertPosition(nodeNo, insertAfterNodeNo);
        const rendered = (<SpielNodeView 
          disabled={disabled}
          displayInsertPosition={displayInsertPosition}
          isSelected={nodeNo === selectedNodeNo}
          key={nodeNo} 
          lastCharacterName={lastCharacterName}
          lastEmotion={lastEmotion}
          node={node} 
          onNodeDrag={(event:any) => onNodeDrag(event, nodeNo)}
          onNodeDragEnd={(event:any) => onNodeDragEnd(event, nodeNo)}
          onReceiveNodeHeight={(height:number) => onReceiveNodeHeight(nodeNo, height)}
          onSelect={() => onSelect(nodeNo)}
          onSelectForEdit={() => onSelectForEdit(nodeNo)} 
          onSelectReplyForEdit={(replyNo) => onSelectReplyForEdit(nodeNo, replyNo)}
        />);
        lastCharacterName = node.replies.length ? 'Player' : node.line.character;
        lastEmotion = node.line.emotion;
        return rendered;
      })}
    </div>
  );
}

export default SpielNodesView;
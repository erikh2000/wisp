import styles from './SpielNodesView.module.css';
import { SpielNode, Emotion as SpielEmotion } from 'sl-spiel';
import SpielNodeView from "./SpielNodeView";

interface IProps {
  disabled?:boolean,
  nodes:SpielNode[],
  onSelect:(nodeNo:number) => void,
  onSelectForEdit:(nodeNo:number) => void,
  onSelectReplyForEdit:(nodeNo:number, replyNo:number) => void,
  selectedNodeNo:number
}

function SpielNodesView(props:IProps) {
  const { nodes, disabled, onSelect, onSelectForEdit, onSelectReplyForEdit, selectedNodeNo } = props;
  let lastCharacterName = '';
  let lastEmotion = SpielEmotion.NEUTRAL;
  return (
    <div className={styles.container}>
      {nodes.map((node, nodeNo) => {
        const rendered = (<SpielNodeView 
          disabled={disabled}
          isSelected={nodeNo === selectedNodeNo}
          key={nodeNo} 
          lastCharacterName={lastCharacterName}
          lastEmotion={lastEmotion}
          node={node} 
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
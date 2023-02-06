import styles from './SpielNodesView.module.css';
import { SpielNode } from 'sl-spiel';
import SpielNodeView from "./SpielNodeView";

interface IProps {
  disabled?:boolean,
  nodes:SpielNode[],
  onSelect:(nodeNo:number) => void,
  onSelectForEdit:(nodeNo:number) => void,
  selectedNodeNo:number
}

function SpielNodesView(props:IProps) {
  const { nodes, disabled, onSelect, onSelectForEdit, selectedNodeNo } = props;
  let lastCharacterName = '';
  return (
    <div className={styles.container}>
      {nodes.map((node, nodeNo) => {
        const rendered = (<SpielNodeView 
          disabled={disabled}
          isSelected={nodeNo === selectedNodeNo}
          key={nodeNo} 
          lastCharacterName={lastCharacterName} 
          node={node} 
          onSelect={() => onSelect(nodeNo)}
          onSelectForEdit={() => onSelectForEdit(nodeNo)} 
        />);
        lastCharacterName = node.replies.length ? 'Player' : node.line.character;
        return rendered;
      })}
    </div>
  );
}

export default SpielNodesView;
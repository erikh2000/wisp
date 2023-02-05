import styles from './SpielNodesView.module.css';
import { SpielNode } from 'sl-spiel';
import SpielNodeView from "./SpielNodeView";

interface IProps {
  disabled?:boolean,
  nodes:SpielNode[]
}

function SpielNodesView(props:IProps) {
  const { nodes, disabled } = props;
  let lastCharacterName = '';
  return (
    <div className={styles.container}>
      {nodes.map((node, nodeNo) => {
        const rendered = <SpielNodeView key={nodeNo} node={node} lastCharacterName={lastCharacterName} disabled={disabled}/>;
        lastCharacterName = node.replies.length ? 'Player' : node.line.character;
        return rendered;
      })}
    </div>
  );
}

export default SpielNodesView;
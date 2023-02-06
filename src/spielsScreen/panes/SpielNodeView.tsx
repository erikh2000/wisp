import styles from './SpielNodeView.module.css';

import { SpielNode } from 'sl-spiel';
import { Emotion } from 'sl-web-face'

interface IProps {
  disabled?:boolean,
  isSelected:boolean,
  lastCharacterName:string,
  node:SpielNode,
  onSelect:() => void
  onSelectForEdit:() => void
}

function SpielNodeView(props:IProps) {
  const { isSelected, lastCharacterName, node, onSelect, onSelectForEdit } = props;
  const parenthetical = node.line.emotion !== Emotion.NEUTRAL 
    ? <span className={styles.parenthetical}>`(${node.line.emotion})`</span> : null;
  const character = node.line.character === lastCharacterName ? null : <span className={styles.character}>{node.line.character}</span>;
  return (
    <div 
        className={isSelected ? styles.containerSelected : styles.container}
        onClick={() => onSelect()}
        onDoubleClick={() => onSelectForEdit()}
    >
      {character}
      {parenthetical}
      <span className={styles.dialogue}>{node.line.dialogue}</span>
    </div>
  );
}

export default SpielNodeView;
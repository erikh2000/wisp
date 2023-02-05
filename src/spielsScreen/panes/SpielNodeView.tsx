import styles from './SpielNodeView.module.css';

import { SpielNode } from 'sl-spiel';
import { Emotion } from 'sl-web-face'

interface IProps {
  lastCharacterName:string,
  disabled?:boolean,
  node:SpielNode
}

function SpielNodeView(props:IProps) {
  const { node, lastCharacterName } = props;
  const parenthetical = node.line.emotion !== Emotion.NEUTRAL 
    ? <span className={styles.parenthetical}>`(${node.line.emotion})`</span> : null;
  const character = node.line.character === lastCharacterName ? null : <span className={styles.character}>{node.line.character}</span>;
  return (
    <div className={styles.container}>
      {character}
      {parenthetical}
      <span className={styles.dialogue}>{node.line.dialogue}</span>
    </div>
  );
}

export default SpielNodeView;
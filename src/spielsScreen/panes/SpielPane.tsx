import styles from "./SpielPane.module.css";
import SpielNodesView from "spielsScreen/panes/SpielNodesView";
import SpielRootRepliesView from "spielsScreen/panes/SpielRootRepliesView";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React from "react";
import { Spiel } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  onSelectNode:(nodeNo:number) => void,
  onSelectNodeForEdit:(nodeNo:number) => void,
  selectedNodeNo:number,
  spiel:Spiel|null
}

function _generateButtonDefinitions(disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Add Line', onClick:() => null, disabled},
    {text:'Add General Reply', onClick:() => null, disabled},
  ];
}

function SpielPane(props:IProps) {
  const {disabled, onSelectNode, onSelectNodeForEdit, selectedNodeNo, spiel} = props;
  if (!spiel) return null;
  
  const buttons:ButtonDefinition[] = _generateButtonDefinitions(disabled);
  
  return (
    <InnerContentPane className={styles.spielPane} caption='Spiel' buttons={buttons}>
      <SpielNodesView 
        nodes={spiel.nodes} 
        disabled={disabled}
        onSelect={(nodeNo) => onSelectNode(nodeNo)}
        onSelectForEdit={(nodeNo) => onSelectNodeForEdit(nodeNo)}
        selectedNodeNo={selectedNodeNo}
      />
      <SpielRootRepliesView rootReplies={spiel.rootReplies} disabled={disabled}/>
    </InnerContentPane>
  );
}

export default SpielPane;
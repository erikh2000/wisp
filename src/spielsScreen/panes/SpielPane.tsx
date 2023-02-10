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
  onSelectNodeReplyForEdit:(nodeNo:number, replyNo:number) => void,
  onAddReplyToSelectedNode:() => void,
  onAddRootReply:() => void,
  onSelectRootReplyForEdit:(replyNo:number) => void,
  selectedNodeNo:number,
  spiel:Spiel|null
}

function _generateButtonDefinitions(onSelectRootReplyForEdit:Function, onAddReplyToSelectedNode:Function, disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Add Line', onClick:() => null, disabled},
    {text:'Add Reply', onClick:() => onAddReplyToSelectedNode(), disabled},
    {text:'Add General Reply', onClick:() => onSelectRootReplyForEdit(), disabled}
  ];
}

function SpielPane(props:IProps) {
  const {disabled, onAddRootReply, onAddReplyToSelectedNode, onSelectRootReplyForEdit, onSelectNode, onSelectNodeForEdit, onSelectNodeReplyForEdit, selectedNodeNo, spiel} = props;
  if (!spiel) return null;
  
  const buttons:ButtonDefinition[] = _generateButtonDefinitions(onAddRootReply, onAddReplyToSelectedNode, disabled);
  
  return (
    <InnerContentPane className={styles.spielPane} caption='Spiel' buttons={buttons}>
      <div className={styles.scrollingContainer}>
        <SpielNodesView 
          nodes={spiel.nodes} 
          disabled={disabled}
          onSelect={(nodeNo) => onSelectNode(nodeNo)}
          onSelectForEdit={(nodeNo) => onSelectNodeForEdit(nodeNo)}
          onSelectReplyForEdit={(nodeNo, replyNo) => onSelectNodeReplyForEdit(nodeNo, replyNo)}
          selectedNodeNo={selectedNodeNo}
        />
        <SpielRootRepliesView rootReplies={spiel.rootReplies} disabled={disabled} onEditRootReply={onSelectRootReplyForEdit}/>
      </div>
    </InnerContentPane>
  );
}

export default SpielPane;
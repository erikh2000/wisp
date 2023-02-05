import styles from "./SpielPane.module.css";
import SpielNodesView from "spielsScreen/panes/SpielNodesView";
import SpielRootRepliesView from "spielsScreen/panes/SpielRootRepliesView";
import InnerContentPane from "ui/innerContentPane/InnerContentPane";

import React from "react";
import { Spiel } from 'sl-spiel';

interface IProps {
  disabled?:boolean,
  spiel:Spiel|null
}

function SpielPane(props:IProps) {
  const {disabled, spiel} = props;
  if (!spiel) return null;
  
  return (
    <InnerContentPane className={styles.spielPane} caption='Spiel'>
      <SpielNodesView nodes={spiel.nodes} disabled={disabled}/>
      <SpielRootRepliesView rootReplies={spiel.rootReplies} disabled={disabled}/>
    </InnerContentPane>
  );
}

export default SpielPane;
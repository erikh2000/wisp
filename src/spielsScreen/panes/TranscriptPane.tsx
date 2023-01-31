import styles from "./TranscriptPane.module.css";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React from "react";

interface IProps {
  disabled?:boolean
}

function _generateButtonDefinitions(disabled?:boolean):ButtonDefinition[] {
  return [{text:'Clear', onClick:() => {}, disabled}];
}

function TranscriptPane(props:IProps) {
  const {disabled} = props;
  return (
    <InnerContentPane className={styles.transcriptPane} caption='Transcript' buttons={_generateButtonDefinitions(disabled)}>
    </InnerContentPane>
  );
}

export default TranscriptPane;
import styles from "./TranscriptPane.module.css";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";
import TextConsole from "ui/TextConsole";
import {TextConsoleLine} from "ui/TextConsoleBuffer";
import {clearTranscript} from "spielsScreen/interactions/transcriptInteractions";

import React from "react";

interface IProps {
  disabled?:boolean,
  lines:TextConsoleLine[]
}

function _onRenderLine(key:number, text:string):JSX.Element {
  if (text === '---') return (<hr key={key} />);
  if (text.startsWith('*')) {
    // Get rid of asterisk at beginning and end of line.
    text = text.trim().substring(1, text.length - 1);
    return (<p key={key} className={styles.textItalics}>{text}</p>);
  }
  return (<p key={key}>{text}</p>);
}

function _generateButtonDefinitions(disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Clear', onClick:() => clearTranscript(), disabled}
  ];
}

function TranscriptPane(props:IProps) {
  const {disabled, lines} = props;
  return (
    <InnerContentPane className={styles.transcriptPane} caption='Transcript' buttons={_generateButtonDefinitions(disabled)}>
      <TextConsole className={styles.textConsole} lines={lines} onRenderLine={_onRenderLine} />
    </InnerContentPane>
  );
}

export default TranscriptPane;
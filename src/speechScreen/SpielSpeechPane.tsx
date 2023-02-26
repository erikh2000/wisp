import InnerContentPane, {ButtonDefinition} from "../ui/innerContentPane/InnerContentPane";
import styles from "./SpielSpeechPane.module.css";
import React from "react";
import SpeechTable from "./speechTable/types/SpeechTable";
import SpeechTableHeader from "./speechTable/SpeechTableHeader";
import SpeechTableRows from "./speechTable/SpeechTableRows";

interface IProps {
  disabled?:boolean,
  onChangeRowSelection: (rowNo:number, selected:boolean) => void,
  speechTable:SpeechTable|null
}

function _generateButtonDefinitions(disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Select By...', onClick:() => () => {}, disabled},
    {text:'Record Selected', onClick:() => () => {}, disabled}
  ];
}



function SpielSpeechPane(props:IProps) {
  const {disabled, onChangeRowSelection, speechTable} = props;
  const buttons = _generateButtonDefinitions(disabled);
    
  return  (
    <InnerContentPane className={styles.spielSpeechPane} caption='Spiel Speech' buttons={buttons}>
      <SpeechTableHeader />
      <SpeechTableRows speechTable={speechTable} onChangeRowSelection={onChangeRowSelection}/>
    </InnerContentPane>
  );
}

export default SpielSpeechPane;
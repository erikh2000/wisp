import styles from "./SpielSpeechPane.module.css";
import {areAllSpeechTableRowsSelected} from "./speechTable/speechTableUtil";
import SpeechTable from "./speechTable/types/SpeechTable";
import SpeechTableHeader from "./speechTable/SpeechTableHeader";
import SpeechTableRows from "./speechTable/SpeechTableRows";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React, {useEffect, useState} from "react";

interface IProps {
  disabled?:boolean,
  onChangeRowSelection: (rowNo:number, selected:boolean) => void,
  onOpenSelectByDialog: () => void,
  onSelectAllRows: () => void,
  onDeselectAllRows: () => void,
  speechTable:SpeechTable|null
}

function _generateButtonDefinitions(onOpenSelectByDialog:Function, disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Select By...', onClick:() => onOpenSelectByDialog(), disabled},
    {text:'Record Selected', onClick:() => {}, disabled}
  ];
}

function SpielSpeechPane(props:IProps) {
  const {disabled, onChangeRowSelection, onOpenSelectByDialog, onSelectAllRows, onDeselectAllRows, speechTable} = props;
  const buttons = _generateButtonDefinitions(onOpenSelectByDialog, disabled);
  const [areAllSelected, setAreAllSelected] = useState(false);
  
  useEffect(() => {
    if (speechTable === null) return;
    const nextAllSelected = areAllSpeechTableRowsSelected(speechTable);
    setAreAllSelected(nextAllSelected);
  }, [speechTable, setAreAllSelected]);
  
  return  (
    <InnerContentPane className={styles.spielSpeechPane} caption='Spiel Speech' buttons={buttons}>
      <SpeechTableHeader areAllRowsSelected={areAllSelected} onSelectAllRows={onSelectAllRows} onDeselectAllRows={onDeselectAllRows}/>
      <SpeechTableRows speechTable={speechTable} onChangeRowSelection={onChangeRowSelection}/>
    </InnerContentPane>
  );
}

export default SpielSpeechPane;
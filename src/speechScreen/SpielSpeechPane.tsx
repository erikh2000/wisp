import styles from "./SpielSpeechPane.module.css";
import {areAllSpeechTableRowsSelected, getSelectedRowCount} from "./speechTable/speechTableUtil";
import SpeechTable from "./speechTable/types/SpeechTable";
import SpeechTableHeader from "./speechTable/SpeechTableHeader";
import SpeechTableRows from "./speechTable/SpeechTableRows";
import InnerContentPane, {ButtonDefinition} from "ui/innerContentPane/InnerContentPane";

import React, {useEffect, useState} from "react";

interface IProps {
  disabled?:boolean,
  onChangeRowSelection: (rowNo:number, selected:boolean) => void,
  onDeleteAllTakes: () => void,
  onDeleteTake: (takeWavKey:string) => void,
  onDeselectAllRows: () => void,
  onFinalizeTake: (takeWavKey:string) => void,
  onOpenSelectByDialog: () => void,
  onRecordSelected: () => void,
  onSelectAllRows: () => void,
  speechTable:SpeechTable|null
}

function _getSelectedRowCount(speechTable:SpeechTable|null):number {
  return speechTable ? getSelectedRowCount(speechTable) : 0;
}

function _generateButtonDefinitions(onDeleteAllTakes:Function, onOpenSelectByDialog:Function, onRecordSelected:Function,  
                                    selectedRowCount:number, disabled?:boolean):ButtonDefinition[] {
  return [
    {text:'Delete All Takes', onClick:() => onDeleteAllTakes(), disabled},
    {text:'Select By...', onClick:() => onOpenSelectByDialog(), disabled},
    {text:'Record Selected', onClick:() => onRecordSelected(), disabled:disabled || !selectedRowCount}
  ];
}

function SpielSpeechPane(props:IProps) {
  const {disabled, onChangeRowSelection, onDeleteTake, onDeleteAllTakes, onFinalizeTake, onOpenSelectByDialog, onRecordSelected, onSelectAllRows, onDeselectAllRows, speechTable} = props;
  const buttons = _generateButtonDefinitions(onDeleteAllTakes, onOpenSelectByDialog, onRecordSelected, _getSelectedRowCount(speechTable), disabled);
  const [areAllSelected, setAreAllSelected] = useState(false);
  
  useEffect(() => {
    if (!speechTable) return;
    const nextAllSelected = areAllSpeechTableRowsSelected(speechTable);
    setAreAllSelected(nextAllSelected);
  }, [speechTable, setAreAllSelected]);
  
  return  (
    <InnerContentPane className={styles.spielSpeechPane} caption='Spiel Speech' buttons={buttons}>
      <SpeechTableHeader areAllRowsSelected={areAllSelected} onSelectAllRows={onSelectAllRows} onDeselectAllRows={onDeselectAllRows}/>
      <SpeechTableRows speechTable={speechTable} onChangeRowSelection={onChangeRowSelection} onDeleteTake={onDeleteTake} onFinalizeTake={onFinalizeTake}/>
    </InnerContentPane>
  );
}

export default SpielSpeechPane;
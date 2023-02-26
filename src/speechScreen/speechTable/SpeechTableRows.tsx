import CharacterRow from "./CharacterRow";
import DialogueRow from "./DialogueRow";
import ParentheticalRow from "./ParentheticalRow";
import SpaceRow from "./SpaceRow";
import styles from './SpeechTable.module.css';
import SpeechTable from "./types/SpeechTable";
import {SpeechRowType} from "./types/SpeechRow";

import React from "react";

type ChangeRowSelectionCallback = (rowNo:number, selected:boolean) => void;

interface IProps {
  onChangeRowSelection: ChangeRowSelectionCallback;
  speechTable:SpeechTable|null
}

function _renderSpeechTableRows(speechTable:SpeechTable|null, onChangeRowSelection:(rowNo:number, selected:boolean) => void) {
  const speechTableRows = speechTable?.rows ?? [];
  return speechTableRows.map((row, rowNo) => {
    const isOdd = rowNo % 2 === 1;
    switch(row.rowType) {
      case SpeechRowType.CHARACTER: return <CharacterRow isOdd={isOdd} key={rowNo} text={row.text} />
      case SpeechRowType.PARENTHETICAL: return <ParentheticalRow isOdd={isOdd} key={rowNo} text={row.text} />
      case SpeechRowType.DIALOGUE: 
        return (
          <DialogueRow isOdd={isOdd} isSelected={row.isSelected} 
                       onToggleSelection={(isSelected) => onChangeRowSelection(rowNo, isSelected)} 
                       key={rowNo} text={row.text} 
          />);
      default: return <SpaceRow isOdd={isOdd} key={rowNo} />
    }
  });
}

function SpeechTableRows(props:IProps) {
  const {speechTable, onChangeRowSelection} = props;
  const rowElements = _renderSpeechTableRows(speechTable, onChangeRowSelection);
  
  return (
    <div className={styles.scrollableRows}>
      {rowElements}
    </div>
  );
}

export default SpeechTableRows;
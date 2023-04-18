import CharacterRow from "./CharacterRow";
import DialogueRow from "./DialogueRow";
import ParentheticalRow from "./ParentheticalRow";
import SpaceRow from "./SpaceRow";
import styles from './SpeechTable.module.css';
import SpeechTable from "./types/SpeechTable";
import {SpeechRowType} from "./types/SpeechRow";
import {UNSPECIFIED_NAME} from "persistence/projects";

import React from "react";
import { PLAYER_CHARACTER_NAME } from "sl-spiel";

type ChangeRowSelectionCallback = (rowNo:number, selected:boolean) => void;

interface IProps {
  onDeleteTake: (takeWavKey:string) => void;
  onFinalizeTake: (takeWavKey:string) => void;
  onChangeRowSelection: ChangeRowSelectionCallback;
  speechTable:SpeechTable|null
}

function _renderSpeechTableRows(speechTable:SpeechTable|null, onChangeRowSelection:Function, onDeleteTake:Function, onFinalizeTake:Function) {
  const speechTableRows = speechTable?.rows ?? [];
  let character = UNSPECIFIED_NAME;
  return speechTableRows.map((row, rowNo) => {
    const { isSelected, rowType, text, takeWavKeys, finalTakeNo } = row;
    const isOdd = rowNo % 2 === 1;
    switch(rowType) {
      case SpeechRowType.CHARACTER: 
        character=text; 
        return <CharacterRow isOdd={isOdd} key={rowNo} text={text} />
      
      case SpeechRowType.PARENTHETICAL: 
        return <ParentheticalRow isOdd={isOdd} key={rowNo} text={text} />
      
      case SpeechRowType.DIALOGUE:
        return (
          <DialogueRow isOdd={isOdd} isSelected={isSelected} isSelectable={character !== UNSPECIFIED_NAME && character !== PLAYER_CHARACTER_NAME}
                       onDeleteTake={(takeWavKey) => onDeleteTake(takeWavKey)}
                       onFinalizeTake={(takeWavKey) => onFinalizeTake(takeWavKey)}
                       onToggleSelection={(isSelected) => onChangeRowSelection(rowNo, isSelected)}
                       finalTakeNo={finalTakeNo}
                       takeWavKeys={takeWavKeys}
                       key={rowNo} text={text} 
          />);
      
        default: 
          return <SpaceRow isOdd={isOdd} key={rowNo} />
    }
  });
}

function SpeechTableRows(props:IProps) {
  const {speechTable, onChangeRowSelection, onDeleteTake, onFinalizeTake} = props;
  const rowElements = _renderSpeechTableRows(speechTable, onChangeRowSelection, onDeleteTake, onFinalizeTake);
  
  return (
    <div className={styles.scrollableRows}>
      {rowElements}
    </div>
  );
}

export default SpeechTableRows;
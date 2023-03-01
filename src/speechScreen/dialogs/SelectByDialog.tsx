import styles from "./SelectByDialog.module.css";
import ModalDialog from "ui/dialog/ModalDialog";
import DialogFooter from "ui/dialog/DialogFooter";
import DialogButton from "ui/dialog/DialogButton";

import { useEffect, useState } from "react";

export type SelectionCriteria = {
  characterName: string|null;
  notRecorded: boolean;
};

interface IProps {
  isOpen: boolean;
  characterNames: string[];
  onSelectRowsBy: (selectionCriteria:SelectionCriteria) => void;
  onCancel: () => void;
}

const ALL_CHARACTERS = '___ALL___';

function _setCharacterNameSelectionCriteria(selectionCriteria:SelectionCriteria, setSelectionCriteria:Function, characterName:string) {
  setSelectionCriteria({
    ...selectionCriteria, 
    characterName: characterName === ALL_CHARACTERS ? null : characterName
  });
}
function _toggleNotRecordedSelectionCriteria(selectionCriteria:SelectionCriteria, setSelectionCriteria:Function) {
  setSelectionCriteria({
    ...selectionCriteria,
    notRecorded: !selectionCriteria.notRecorded
  });
}

function SelectByDialog(props:IProps) {
  const {isOpen, characterNames, onSelectRowsBy, onCancel} = props;
  const [selectionCriteria, setSelectionCriteria] = useState<SelectionCriteria>({characterName: null, notRecorded: true});
  const [optionElements, setOptionElements] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const nextOptionElements = characterNames.map(characterName => <option key={characterName} value={characterName}>{characterName}</option>);
    nextOptionElements.unshift(<option key={ALL_CHARACTERS} value={ALL_CHARACTERS}>all characters</option>);
    setOptionElements(nextOptionElements);
  }, [characterNames, setOptionElements]);
  
  return (
    <ModalDialog isOpen={isOpen} title={'Select Rows'} onCancel={onCancel}>
      <label htmlFor='characterName'>Select rows for </label>
      <select className={styles.characterNameSelect} name='characterName' value={selectionCriteria.characterName ?? ''} 
              onChange={event => _setCharacterNameSelectionCriteria(selectionCriteria, setSelectionCriteria, event.target.value)}>
        {optionElements}
      </select>
      <br />
      <input className={styles.notRecordedCheckbox} type='checkbox' name='notRecorded' checked={selectionCriteria.notRecorded} 
             onChange={() => _toggleNotRecordedSelectionCriteria(selectionCriteria, setSelectionCriteria)}/>
      <label htmlFor='notRecorded' onClick={() => _toggleNotRecordedSelectionCriteria(selectionCriteria, setSelectionCriteria)}>that have not been recorded</label>
      <DialogFooter>
        <DialogButton text={'Cancel'} onClick={onCancel} />
        <DialogButton text={'Select'} onClick={() => onSelectRowsBy(selectionCriteria)} isPrimary />
      </DialogFooter>
    </ModalDialog>
  );
}

export default SelectByDialog
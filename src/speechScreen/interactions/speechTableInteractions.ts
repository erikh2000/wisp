import {updateRevisionForSpeechTable} from "./revisionUtil";
import {SelectionCriteria} from "speechScreen/dialogs/SelectByDialog";
import SpeechRow, {SpeechRowType} from "speechScreen/speechTable/types/SpeechRow";
import SpeechTable from "speechScreen/speechTable/types/SpeechTable";

import { PLAYER_CHARACTER_NAME } from "sl-spiel";
import {UNSPECIFIED_NAME} from "../../persistence/projects";

export function onChangeRowSelection(rowNo:number, isSelected:boolean, speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows[rowNo].isSelected = isSelected;
  updateRevisionForSpeechTable(speechTable, setRevision);
}

export function onSelectAllRows(speechTable:SpeechTable, setRevision:Function) {
  let lastCharacter = UNSPECIFIED_NAME;
  speechTable.rows.forEach((row) => {
    if (row.rowType === SpeechRowType.CHARACTER) lastCharacter = row.text;
    if (lastCharacter === PLAYER_CHARACTER_NAME || lastCharacter === UNSPECIFIED_NAME) return;
    row.isSelected = row.rowType === SpeechRowType.DIALOGUE;
  });
  updateRevisionForSpeechTable(speechTable, setRevision);
}

export function onDeselectAllRows(speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows.forEach((row) => row.isSelected = false);
  updateRevisionForSpeechTable(speechTable, setRevision);
}

function isDialogueRecorded(row:SpeechRow):boolean {
  return row.takeWavKeys.length > 0;
}

export function selectRowsByCriteria(criteria:SelectionCriteria, speechTable:SpeechTable, setRevision:Function, setModalDialog:Function) {
  let lastCharacter:string|null = null;
  function _shouldSelectRow(row:SpeechRow, criteria:SelectionCriteria):boolean {
    if (row.rowType === SpeechRowType.CHARACTER) lastCharacter = row.text;
    if (criteria.characterName !== null && criteria.characterName !== lastCharacter) return false;
    if (lastCharacter === PLAYER_CHARACTER_NAME) return false;
    if (row.rowType !== SpeechRowType.DIALOGUE) return false;
    
    return !(criteria.notRecorded && isDialogueRecorded(row));
  }
  
  speechTable.rows.forEach((row) => row.isSelected = _shouldSelectRow(row, criteria));
  updateRevisionForSpeechTable(speechTable, setRevision);
  setModalDialog(null);
}
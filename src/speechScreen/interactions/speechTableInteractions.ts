import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import {updateRevisionForSpeechTable} from "./revisionUtil";
import {SelectionCriteria} from "../dialogs/SelectByDialog";
import SpeechRow, {SpeechRowType} from "../speechTable/types/SpeechRow";

export function onChangeRowSelection(rowNo:number, isSelected:boolean, speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows[rowNo].isSelected = isSelected;
  updateRevisionForSpeechTable(speechTable, setRevision);
}

export function onSelectAllRows(speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows.forEach((row) => row.isSelected = true);
  updateRevisionForSpeechTable(speechTable, setRevision);
}

export function onDeselectAllRows(speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows.forEach((row) => row.isSelected = false);
  updateRevisionForSpeechTable(speechTable, setRevision);
}

function isDialogueRecorded(row:SpeechRow):boolean {
  return row.recordedTakes.length > 0;
}

export function selectRowsByCriteria(criteria:SelectionCriteria, speechTable:SpeechTable, setRevision:Function, setModalDialog:Function) {
  let lastCharacter:string|null = null;
  function _shouldSelectRow(row:SpeechRow, criteria:SelectionCriteria):boolean {
    if (row.rowType === SpeechRowType.CHARACTER) lastCharacter = row.text;
    if (criteria.characterName !== null && criteria.characterName !== lastCharacter) return false;
    
    return !(criteria.notRecorded && isDialogueRecorded(row));
  }
  
  speechTable.rows.forEach((row) => row.isSelected = _shouldSelectRow(row, criteria));
  updateRevisionForSpeechTable(speechTable, setRevision);
  setModalDialog(null);
}
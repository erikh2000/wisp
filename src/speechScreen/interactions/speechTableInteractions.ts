import SpeechTable from "speechScreen/speechTable/types/SpeechTable";
import {updateRevisionForSpeechTable} from "./revisionUtil";

export function onChangeRowSelection(rowNo:number, isSelected:boolean, speechTable:SpeechTable, setRevision:Function) {
  speechTable.rows[rowNo].isSelected = isSelected;
  updateRevisionForSpeechTable(speechTable, setRevision);
}
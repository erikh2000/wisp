import SpeechRow, {duplicateSpeechRow} from "./SpeechRow";

type SpeechTable = {
  rows: SpeechRow[];
};

export function duplicateSpeechTable(speechTable:SpeechTable):SpeechTable {
  const rows = speechTable.rows.map((row) => duplicateSpeechRow(row));
  return { rows };
}

export default SpeechTable;
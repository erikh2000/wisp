export enum SpeechRowType {
  CHARACTER,
  PARENTHETICAL,
  DIALOGUE,
  SPACE
};

type RecordedTake = {
  // TODO audio binding
}

type FinalTake = {
  // TODO audio binding
};

type SpeechRow = {
  rowType: SpeechRowType;
  text: string;
  isSelected: boolean;
  recordedTakes: RecordedTake[];
  finalTake: FinalTake|null;
};

export function duplicateSpeechRow(speechRow:SpeechRow):SpeechRow {
  const recordedTakes:RecordedTake[] = [];
  const finalTake = null;
  return { ...speechRow, recordedTakes, finalTake };
}

export default SpeechRow;
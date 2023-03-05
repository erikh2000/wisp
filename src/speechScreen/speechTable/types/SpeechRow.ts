export const UNSPECIFIED_TAKE_NO = -1;
export enum SpeechRowType {
  CHARACTER,
  PARENTHETICAL,
  DIALOGUE,
  SPACE
};

type SpeechRow = {
  rowType: SpeechRowType;
  text: string;
  isSelected: boolean;
  speechId:string;
  takeWavKeys: string[];
  finalTakeNo: number
};

export function duplicateSpeechRow(speechRow:SpeechRow):SpeechRow {
  return { ...speechRow };
}

export default SpeechRow;
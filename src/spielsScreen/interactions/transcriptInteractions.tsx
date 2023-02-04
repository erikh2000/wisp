import TextConsoleBuffer from "ui/TextConsoleBuffer";

const MAX_TRANSCRIPT_LINE_COUNT = 500;

const textConsoleBuffer:TextConsoleBuffer = new TextConsoleBuffer(MAX_TRANSCRIPT_LINE_COUNT);
let setTranscriptLines:any = null;

export function bindSetTranscriptLines(_setTranscriptLines:any) {
  setTranscriptLines = _setTranscriptLines;
  _setTranscriptLines(textConsoleBuffer.lines);
}

export function initTranscript(_setTranscriptLines:any) {
  bindSetTranscriptLines(_setTranscriptLines);
}

export function sendText(text:string) {
  textConsoleBuffer.addLine(text);
  if (setTranscriptLines) setTranscriptLines(textConsoleBuffer.lines);
}

export function sendJunkText() { // TODO delete
  sendText('The quick brown fox jumped over the lazy dog.');
  sendText('The lazy dog hated that.');
  sendText('Just cuz your lazy does not mean people should jump over you.');
  sendText('Let sleeping dogs lie.');
}
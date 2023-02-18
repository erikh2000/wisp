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

export function addText(text:string) {
  textConsoleBuffer.addLine(text);
  if (setTranscriptLines) setTranscriptLines(textConsoleBuffer.lines);
}

export function clearTranscript() {
  textConsoleBuffer.clear();
  if (setTranscriptLines) setTranscriptLines(textConsoleBuffer.lines);
}
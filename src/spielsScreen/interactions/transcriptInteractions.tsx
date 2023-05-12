import TextConsoleBuffer, {TextConsoleLine} from "ui/TextConsoleBuffer";

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

function _doesTextAddToLastLine(text:string, lines:TextConsoleLine[]):boolean {
  if (lines.length === 0) return false;
  const lastLine = lines[lines.length - 1];
  return text.startsWith(lastLine.text);
}

export function addText(text:string, replaceIfAddsToLine?:boolean) {
  if (replaceIfAddsToLine && _doesTextAddToLastLine(text, textConsoleBuffer.lines)) {
    textConsoleBuffer.replaceLastLine(text);
  } else {
    textConsoleBuffer.addLine(text);
  }
  if (setTranscriptLines) setTranscriptLines(textConsoleBuffer.lines);
}

export function clearTranscript() {
  textConsoleBuffer.clear();
  if (setTranscriptLines) setTranscriptLines(textConsoleBuffer.lines);
}
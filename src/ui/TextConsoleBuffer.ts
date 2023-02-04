export type TextConsoleLine = { key:number, text:string };


class TextConsoleBuffer {
  private readonly _maxLineCount:number;
  private _lines:TextConsoleLine[];
  private _nextKey:number;
  
  constructor(maxLineCount:number) {
    this._lines = [];
    this._maxLineCount = maxLineCount;
    this._nextKey = 0;
  }
  
  addLine(text:string) {
    const key = this._nextKey++;
    this._lines.push({key, text})
    if (this._lines.length >= this._maxLineCount) this._lines.shift();
  }
  
  clear() {
    this._lines = [];
  }
  
  get lines():TextConsoleLine[] {
    return [...(this._lines)];
  }
}

export default TextConsoleBuffer;
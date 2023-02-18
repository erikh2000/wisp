import {spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";

import { Emotion } from 'sl-web-face';
import { Spiel, SpielLine } from 'sl-spiel';

export enum ConversationState {
  STOPPED,
  TALKING,
  IDLE
}

type SayLineCallback = (line: SpielLine) => void;
type SetEmotionCallback = (emotion: Emotion) => void;

class ConversationManager {
  private _spiel: Spiel|null;
  private _state: ConversationState;
  private _onSayLine: SayLineCallback|null;
  private _onSetEmotion: SetEmotionCallback|null;
  
  constructor() {
    this._spiel = null;
    this._state = ConversationState.STOPPED;
    this._onSayLine = null;
    this._onSetEmotion = null;
  }
  
  bindOnSayLine(onSayLine: SayLineCallback) {
    this._onSayLine = onSayLine;
  }
  
  bindOnSetEmotion(onSetEmotion: SetEmotionCallback) {
    this._onSetEmotion = onSetEmotion;
  }
  
  _playCurrentNode() {
    if (!this._spiel) return;
    const currentNode = this._spiel.currentNode;
    if (!currentNode) {
      this._state = ConversationState.IDLE;
      return;
    }
    this._state = ConversationState.TALKING;
    if (this._onSayLine) this._onSayLine(currentNode.line);
    if (this._onSetEmotion) this._onSetEmotion(spielEmotionToEmotion(currentNode.line.emotion));
    setTimeout(() => { // TODO replace with something better.
      if (!this._spiel || this._state === ConversationState.STOPPED) return;
      if (!this._spiel.hasNext) { this._state = ConversationState.IDLE; return; }
      this._spiel.moveNext();
      this._playCurrentNode();
    }, 1000);
  }
  
  play(spiel: Spiel) {
    this._spiel = spiel.duplicate();
    if (!this._spiel.currentNode) {
      this._state = ConversationState.IDLE;
      return;
    }
    this._playCurrentNode();
  }
  
}

export default ConversationManager;
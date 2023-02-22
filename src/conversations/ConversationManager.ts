import SpeechAudioIndex from "./SpeechAudioIndex";
import {setSpeechAudioSpeakingFace} from "facesCommon/interactions/faceEventUtil";
import {spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";

import {Emotion, FakeSpeechAudio, ISpeechAudio} from 'sl-web-face';
import { Spiel } from 'sl-spiel';
import {calcEndOfDialoguePause} from "sl-web-speech";

export enum ConversationState {
  STOPPED,
  TALKING,
  IDLE
}

type SayLineCallback = (nodeNo:number, character: string, emotion:Emotion, dialogue:string) => void;
type SetEmotionCallback = (emotion: Emotion) => void;

function _onLineEnd(spiel:Spiel, conversationManager:ConversationManager) {
  if (conversationManager.state === ConversationState.STOPPED) return;
  if (!spiel.hasNext) { conversationManager.setIdle(); return; }
  
  setTimeout(() => {
    spiel.moveNext();
    conversationManager._playCurrentNode();
  }, conversationManager.pendingPauseDuration);
}

// Call init() from sl-web-speech before using this class.
class ConversationManager {
  private _spiel: Spiel|null;
  private _spielName: string;
  private _state: ConversationState;
  private _onSayLine: SayLineCallback|null;
  private _onSetEmotion: SetEmotionCallback|null;
  private _speechAudioIndex: SpeechAudioIndex|null;
  private _currentSpeechAudio: ISpeechAudio|null;
  private _pendingPauseDuration: number;
  
  constructor() {
    this._spiel = null;
    this._spielName = UNSPECIFIED_NAME
    this._state = ConversationState.STOPPED;
    this._onSayLine = null;
    this._onSetEmotion = null;
    this._speechAudioIndex = null;
    this._currentSpeechAudio = null;
    this._pendingPauseDuration = 0;
  }
  
  get state() { return this._state; }
  
  get pendingPauseDuration() { return this._pendingPauseDuration; }
  
  bindOnSayLine(onSayLine: SayLineCallback) {
    this._onSayLine = onSayLine;
  }
  
  bindOnSetEmotion(onSetEmotion: SetEmotionCallback) {
    this._onSetEmotion = onSetEmotion;
  }
  
  bindSpeechAudioIndex(speechAudioIndex: SpeechAudioIndex) {
    this._speechAudioIndex = speechAudioIndex;
  }
  
  _playCurrentNode() {
    this._pendingPauseDuration = 0;
    if (!this._spiel) return;
    const currentNode = this._spiel.currentNode;
    if (!currentNode) {
      this._state = ConversationState.IDLE;
      this._currentSpeechAudio = null;
      return;
    }
    this._state = ConversationState.TALKING;
    const dialogue = currentNode.line.nextDialogue();
    const character = currentNode.line.character;
    const emotion = spielEmotionToEmotion(currentNode.line.emotion);
    if (this._onSayLine) this._onSayLine(this._spiel.currentNodeIndex, character, emotion, dialogue);
    if (this._onSetEmotion) this._onSetEmotion(spielEmotionToEmotion(currentNode.line.emotion));
    
    if (this._currentSpeechAudio) this._currentSpeechAudio.stop();
    this._currentSpeechAudio = this._speechAudioIndex?.findSpeechAudio(this._spielName, character, emotion, dialogue) || null;
    if (!this._currentSpeechAudio) this._currentSpeechAudio = new FakeSpeechAudio(dialogue);
    setSpeechAudioSpeakingFace(this._currentSpeechAudio);
    this._pendingPauseDuration = calcEndOfDialoguePause(dialogue);
    
    this._currentSpeechAudio.play(() => _onLineEnd(this._spiel as Spiel, this));
  }
  
  play(spiel: Spiel, spielName:string) {
    this._spiel = spiel.duplicate();
    this._spielName = spielName;
    if (!this._spiel.currentNode) {
      this._state = ConversationState.IDLE;
      this._currentSpeechAudio = null;
      return;
    }
    this._playCurrentNode();
  }
  
  stop() {
    this._state = ConversationState.STOPPED;
  }
  
  setIdle() {
    this._state = ConversationState.IDLE;
  }
}

export default ConversationManager;
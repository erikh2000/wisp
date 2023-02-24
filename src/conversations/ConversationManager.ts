import ConversationSpeed, {getMultiplierForConversationSpeed} from "./ConversationSpeed";
import SpeechAudioIndex from "./SpeechAudioIndex";
import {setSpeechAudioSpeakingFace} from "facesCommon/interactions/faceEventUtil";
import {spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";

import {Emotion, FakeSpeechAudio, ISpeechAudio} from 'sl-web-face';
import {Spiel} from 'sl-spiel';
import {calcEndOfDialoguePause, Recognizer} from "sl-web-speech";

export enum ConversationState {
  STOPPED,
  TALKING,
  IDLE
}

type SayLineCallback = (nodeNo:number, character: string, emotion:Emotion, dialogue:string) => void;
type SetEmotionCallback = (emotion: Emotion) => void;

function _onLineEnd(spiel:Spiel, conversationManager:ConversationManager, recognizer:Recognizer|null) {
  if (recognizer) recognizer.unmute();
  if (conversationManager.state === ConversationState.STOPPED) return;
  if (!spiel.hasNext) { conversationManager.setIdle(); return; }
  
  setTimeout(() => {
    if (conversationManager.state === ConversationState.STOPPED) return;
    spiel.moveNext();
    conversationManager._playCurrentNode();
  }, conversationManager.pendingPauseDuration);
}

// Call init() from sl-web-speech before using this class.
class ConversationManager {
  private _conversationSpeed: ConversationSpeed;
  private _currentSpeechAudio: ISpeechAudio|null;
  private _onSayLine: SayLineCallback|null;
  private _onSetEmotion: SetEmotionCallback|null;
  private _pendingPauseDuration: number;
  private _recognizer: Recognizer|null;
  private _speechAudioIndex: SpeechAudioIndex|null;
  private _speedMultiplier: number;
  private _spiel: Spiel|null;
  private _spielName: string;
  private _state: ConversationState;
  
  constructor() {
    this._conversationSpeed = ConversationSpeed.SLOW;
    this._currentSpeechAudio = null;
    this._onSayLine = null;
    this._onSetEmotion = null;
    this._pendingPauseDuration = 0;
    this._recognizer = null;
    this._speechAudioIndex = null;
    this._speedMultiplier = getMultiplierForConversationSpeed(this._conversationSpeed);
    this._spiel = null;
    this._spielName = UNSPECIFIED_NAME
    this._state = ConversationState.STOPPED;
  }
  
  get state() { return this._state; }
  
  get conversationSpeed() { return this._conversationSpeed; }
  
  set conversationSpeed(conversationSpeed: ConversationSpeed) {
    this._conversationSpeed = conversationSpeed;
    this._speedMultiplier = getMultiplierForConversationSpeed(this._conversationSpeed);
  }
  
  get pendingPauseDuration() { return this._pendingPauseDuration; }
  
  bindOnSayLine(onSayLine: SayLineCallback) {
    this._onSayLine = onSayLine;
  }
  
  bindOnSetEmotion(onSetEmotion: SetEmotionCallback) {
    this._onSetEmotion = onSetEmotion;
  }
  
  bindRecognizer(recognizer:Recognizer) {
    this._recognizer = recognizer;
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
    if (!this._currentSpeechAudio) this._currentSpeechAudio = new FakeSpeechAudio(dialogue, this._speedMultiplier);
    setSpeechAudioSpeakingFace(this._currentSpeechAudio);
    this._pendingPauseDuration = calcEndOfDialoguePause(dialogue, this._speedMultiplier);
    
    if(this._recognizer) this._recognizer.mute();
    this._currentSpeechAudio.play(() => _onLineEnd(this._spiel as Spiel, this, this._recognizer));
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
    if (this._currentSpeechAudio) { 
      this._currentSpeechAudio.stop();
      this._currentSpeechAudio = null;
    }
    this._state = ConversationState.STOPPED;
  }
  
  setIdle() {
    this._state = ConversationState.IDLE;
  }
}

export default ConversationManager;
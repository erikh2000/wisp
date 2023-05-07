import ConversationSpeed, {getMultiplierForConversationSpeed} from "./ConversationSpeed";
import SpeechAudioIndex from "./SpeechAudioIndex";
import {spielEmotionToEmotion} from "./spielEmotionUtil";
import {setSpeechAudioSpeakingFace} from "facesCommon/interactions/faceEventUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";

import {Emotion, FakeSpeechAudio, ISpeechAudio} from 'sl-web-face';
import {Spiel, SpielLine, SpielReply} from 'sl-spiel';
import {calcEndOfDialoguePause, Recognizer} from "sl-web-speech";

// See README.md for a description of the ConversationManager's state machine.
export enum ConversationState {
  STOPPED,
  SPEAKING_LINE,
  PAUSE_AFTER_LINE,
  SPEAKING_REPLY,
  PAUSE_AFTER_REPLY,
  LISTENING,
  IDLE,
}

type SayLineCallback = (nodeNo:number, character: string, emotion:Emotion, dialogue:string) => void;
type SetEmotionCallback = (emotion: Emotion) => void;
type TranscribeCallback = (text:string) => void;


// Call init() from sl-web-speech before using this class.
class ConversationManager {
  private _conversationSpeed: ConversationSpeed;
  private _currentSpeechAudio: ISpeechAudio|null;
  private _lastPartialText: string;
  private _onSayLine: SayLineCallback|null;
  private _onSetEmotion: SetEmotionCallback|null;
  private _onTranscribe: TranscribeCallback|null;
  private _pendingPauseDuration: number;
  private _pendingReply: SpielReply|null;
  private _recognizer: Recognizer|null;
  private _speedMultiplier: number;
  private _spiel: Spiel|null;
  private _spielName: string;
  private _state: ConversationState;
  private _speechAudioIndex: SpeechAudioIndex;
  
  constructor() {
    this._conversationSpeed = ConversationSpeed.SLOW;
    this._currentSpeechAudio = null;
    this._lastPartialText = '';
    this._onSayLine = null;
    this._onSetEmotion = null;
    this._onTranscribe = null;
    this._pendingPauseDuration = 0;
    this._pendingReply = null;
    this._recognizer = null;
    this._speedMultiplier = getMultiplierForConversationSpeed(this._conversationSpeed);
    this._spiel = null;
    this._spielName = UNSPECIFIED_NAME;
    this._state = ConversationState.STOPPED;
    this._speechAudioIndex = new SpeechAudioIndex();
  }
  
  private _canStartListening(state:ConversationState) {
    return state === ConversationState.IDLE || state === ConversationState.PAUSE_AFTER_LINE;
  }

  private _handleStartSpeaking() {
    try {
      this._lastPartialText = '';
      if (this._onTranscribe) this._onTranscribe('*PLAYER started speaking.*');
      if (this._canStartListening(this._state)) this._goToListening();
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private _handleStopSpeaking() {
    if (!this._spiel) throw Error('Unexpected');
    try {
      if (this._onTranscribe) {
        this._onTranscribe('PLAYER: ' + this._lastPartialText);
        this._onTranscribe('*PLAYER stopped speaking.*');
      }
      if (this._state !== ConversationState.LISTENING) return;
      if (!this._spiel.hasNext) return this._goToIdle();
      this._spiel.moveNext();
      this._goToSpeakingLine().then(() => {});
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }
  
  private _handlePartial(text:string) {
    if (!this._spiel) throw Error('Unexpected');
    try {
      this._lastPartialText = text;
      if (this._state === ConversationState.LISTENING) {
        this._pendingReply = this._spiel.checkForMatch(text);
        if (this._pendingReply) return this._goToSpeakingReply();
      }
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private _stopAnySpeaking() {
    if (this._currentSpeechAudio) this._currentSpeechAudio.stop();
    this._currentSpeechAudio = null;
  }

  private _goToStopped() {
    this._state = ConversationState.STOPPED;
    try {
      this._stopAnySpeaking();
      if (this._recognizer) this._recognizer.mute();
    } catch(e) {
      console.error(e);
    }
  }
  
  private _startNextLineTimer() {
    const startingState = this._state;
    setTimeout(() => {
      if (!this._spiel) throw Error('Unexpected');
      if (this._state !== startingState) return;
      if (!this._spiel.hasNext) return this._goToIdle();
      this._spiel.moveNext();
      this._goToSpeakingLine().then(() => {});
    }, this._pendingPauseDuration);
  }

  private _goToPauseAfterLine() {
    if (!this._recognizer) throw Error('Unexpected');
    try {
      this._stopAnySpeaking();
      this._recognizer.unmute();
      this._state = ConversationState.PAUSE_AFTER_LINE;
      this._startNextLineTimer();
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private _goToPauseAfterReply() {
    if (!this._recognizer) throw Error('Unexpected');
    try {
      this._stopAnySpeaking();
      this._recognizer.mute();
      this._state = ConversationState.PAUSE_AFTER_REPLY;
      this._startNextLineTimer();
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private _goToListening() {
    if (!this._recognizer) throw Error('Unexpected');
    try {
      this._stopAnySpeaking();
      this._recognizer.unmute();
      this._state = ConversationState.LISTENING;
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private _goToIdle() {
    if (!this._recognizer) throw Error('Unexpected');
    try {
      this._stopAnySpeaking();
      this._recognizer.unmute();
      this._state = ConversationState.IDLE;
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private async _speak(line:SpielLine, onSpeakEnd:() => void) {
    if (!this._spiel) throw Error('Unexpected');
    const dialogue = line.nextDialogue();
    const character = line.character;
    const speechId = line.speechIds[line.lastDialogueNo];
    const emotion = spielEmotionToEmotion(line.emotion);
    
    if (this._onSayLine) this._onSayLine(this._spiel.currentNodeIndex, character, emotion, dialogue);
    if (this._onSetEmotion) this._onSetEmotion(spielEmotionToEmotion(line.emotion));
    
    this._stopAnySpeaking();
    this._currentSpeechAudio = await this._speechAudioIndex.findSpeechAudio(this._spielName, character, speechId, dialogue);
    if (!this._currentSpeechAudio) this._currentSpeechAudio = new FakeSpeechAudio(dialogue, this._speedMultiplier);
    setSpeechAudioSpeakingFace(this._currentSpeechAudio);

    this._pendingPauseDuration = calcEndOfDialoguePause(dialogue, this._speedMultiplier);
    this._currentSpeechAudio.play(onSpeakEnd.bind(this));
  }
  
  private async _goToSpeakingLine() {
    const currentNode = this._spiel?.currentNode;
    if (!this._spiel || !this._speechAudioIndex || !this._recognizer || !currentNode) throw Error('Unexpected');
    try {
      this._recognizer.mute();
      this._state = ConversationState.SPEAKING_LINE;
      await this._speak(currentNode.line, this._goToPauseAfterLine);
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  private async _goToSpeakingReply() {
    if (!this._spiel || !this._recognizer || !this._pendingReply) throw Error('Unexpected');
    try {
      this._recognizer.mute();
      this._state = ConversationState.SPEAKING_REPLY;
      const { line } = this._pendingReply;
      this._pendingReply = null;
      await this._speak(line, this._goToPauseAfterReply);
    } catch(e) {
      console.error(e);
      this._goToStopped();
    }
  }

  bindOnSayLine(onSayLine: SayLineCallback) {
    this._onSayLine = onSayLine;
  }

  bindOnSetEmotion(onSetEmotion: SetEmotionCallback) {
    this._onSetEmotion = onSetEmotion;
  }

  bindOnTranscribe(onTranscribe:TranscribeCallback) {
    this._onTranscribe = onTranscribe;
  }

  bindRecognizer(recognizer:Recognizer) {
    this._recognizer = recognizer;
    this._recognizer.bindCallbacks(
      (text:string) => this._handlePartial(text),
      () => this._handleStartSpeaking(),
      () => this._handleStopSpeaking());
  }

  get conversationSpeed() { return this._conversationSpeed; }

  set conversationSpeed(conversationSpeed: ConversationSpeed) {
    this._conversationSpeed = conversationSpeed;
    this._speedMultiplier = getMultiplierForConversationSpeed(this._conversationSpeed);
  }

  get state() { return this._state; }

  play(spiel: Spiel, spielName:string) {
    if (!this._recognizer) throw Error('Bind recognizer before playing');
    this._spiel = spiel.duplicate();
    this._spielName = spielName;
    this._goToSpeakingLine();
  }

  stop() { this._goToStopped(); }
}

export default ConversationManager;
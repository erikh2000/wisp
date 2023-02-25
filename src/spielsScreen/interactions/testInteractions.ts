import {addText} from "./transcriptInteractions";
import {centerCanvasComponent} from "common/canvasComponentUtil";
import ConversationManager from "conversations/ConversationManager";
import ConversationSpeed from "conversations/ConversationSpeed";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import {setEmotion} from "facesCommon/interactions/faceEventUtil";
import {setHead} from "spielsScreen/interactions/coreUtil"
import {spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";

import {CanvasComponent, Emotion} from "sl-web-face";
import { Spiel } from 'sl-spiel';
import { Recognizer} from "sl-web-speech";

let conversationManager:ConversationManager|null = null;
let recognizer:Recognizer|null = null;
let _isRecognizerReady:boolean = false;

export function onDrawFaceCanvas(context:CanvasRenderingContext2D, headComponent:CanvasComponent) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  centerCanvasComponent(headComponent, canvasWidth, canvasHeight);
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  headComponent.render(context);
}

export async function onChangeFace(faceName:string, setModalDialog:any) {
  try {
    if (faceName === UNSPECIFIED_NAME) throw Error('Unexpected');
    await setActiveFaceName(UNSPECIFIED_NAME);
    const head = await loadFaceFromName(faceName);
    setHead(head);
    await setActiveFaceName(faceName);
  } finally {
    setModalDialog(null);
  }
}
export function setFaceEmotionFromSpiel(spiel:Spiel) {
  const spielEmotion = spiel.currentNode?.line.emotion;
  if (spielEmotion === undefined) return;
  const emotion = spielEmotionToEmotion(spielEmotion);
  setEmotion(emotion);
}

export async function initTest():Promise<void> {
  conversationManager = new ConversationManager();
  conversationManager.bindOnSetEmotion((emotion) => {
    setEmotion(emotion);
  });
  if (!recognizer) {
    return new Promise((resolve) => {
      recognizer = new Recognizer(() => {
        _isRecognizerReady = true;
        if (!recognizer || !conversationManager) throw Error('Unexpected');
        conversationManager.bindRecognizer(recognizer);
        conversationManager.bindOnTranscribe(addText);
        resolve();
      });
    });
  }
}

export function isRecognizerReady():boolean { return _isRecognizerReady; }

function _onSayLine(nodeNo:number, character:string, _emotion:Emotion, dialogue:string, setTestNodeNo:Function, setSubtitle:Function) {
  setSubtitle(dialogue);
  addText(`${character}: ${dialogue}`);
  setTestNodeNo(nodeNo);
}

export function startTest(spiel:Spiel, spielName:string, setIsTestRunning:Function, setTestNodeNo:Function, setSubtitle:Function) {
  if (!conversationManager || !isRecognizerReady || !recognizer) throw Error('Unexpected');
  addText('*Started test.*');
  recognizer.unmute();
  conversationManager.bindOnSayLine((nodeNo:number, character:string, emotion:Emotion, dialogue:string) => 
    _onSayLine(nodeNo, character, emotion, dialogue, setTestNodeNo, setSubtitle));
  conversationManager.play(spiel, spielName);
  setIsTestRunning(true);
}

export function stopTest(setIsTestRunning:Function) {
  if (!conversationManager) throw Error('Unexpected');
  recognizer?.mute();
  addText('*Stopped test.*');
  addText('---');
  conversationManager.stop();
  setIsTestRunning(false);
}

export function updateTestOptions(conversationSpeed:ConversationSpeed, setConversationSpeed:Function, setModalDialog:Function) {
  if (!conversationManager) throw Error('Unexpected');
  conversationManager.conversationSpeed = conversationSpeed;
  setConversationSpeed(conversationSpeed);
  setModalDialog(null);
}
import {addText} from "./transcriptInteractions";
import ConversationManager from "conversations/ConversationManager";
import {loadFaceFromName} from "facesCommon/interactions/fileInteractions";
import {setActiveFaceName, UNSPECIFIED_NAME} from "persistence/projects";
import {setEmotion} from "facesCommon/interactions/faceEventUtil";
import {setHead} from "spielsScreen/interactions/coreUtil"
import {spielEmotionToEmotion} from "spielsScreen/interactions/spielEmotionUtil";

import {CanvasComponent} from "sl-web-face";
import { Spiel } from 'sl-spiel';

let conversationManager:ConversationManager|null = null;

function _centerCanvasComponent(component:CanvasComponent, canvasWidth:number, canvasHeight:number) {
  const componentWidth = component.width, componentHeight = component.height;
  component.offsetX = Math.round((canvasWidth - componentWidth) / 2);
  component.offsetY = Math.round((canvasHeight - componentHeight) / 2);
}

export function onDrawFaceCanvas(context:CanvasRenderingContext2D, headComponent:CanvasComponent) {
  const canvasWidth = context.canvas.width, canvasHeight = context.canvas.height;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  _centerCanvasComponent(headComponent, canvasWidth, canvasHeight);
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

export function initTest() {
  conversationManager = new ConversationManager();
  conversationManager.bindOnSayLine((line) => {
    addText(`${line.character}: ${line.dialogue}`);
  });
  conversationManager.bindOnSetEmotion((emotion) => {
    setEmotion(emotion);
  });
}

export function startTest(spiel:Spiel) {
  if (!conversationManager) throw Error('Unexpected');
  conversationManager.play(spiel);
}
import EditSpielNodeDialog from "spielsScreen/spielDialogs/EditSpielNodeDialog";
import {updateRevisionForSpiel} from "spielsScreen/interactions/revisionUtil";
import {emotionToSpielEmotion} from "spielsScreen/interactions/spielEmotionUtil";

import { Spiel, SpielNode } from 'sl-spiel';

export function editSpielNode(spiel:Spiel, nodeNo:number, setRevision:Function, setModalDialog:Function) {
  const nextSpiel = spiel.duplicate();
  nextSpiel.moveTo(nodeNo);
  updateRevisionForSpiel(nextSpiel, setRevision);
  setModalDialog(EditSpielNodeDialog.name);
}

export function selectSpielNode(spiel:Spiel, nodeNo:number, setRevision:Function) {
  const nextSpiel = spiel.duplicate();
  nextSpiel.moveTo(nodeNo);
  updateRevisionForSpiel(nextSpiel, setRevision);
}

export function updateNodeAfterEdit(nextNode:SpielNode, spiel:Spiel, setRevision:Function, setModalDialog:Function) {
  const line = spiel.currentNode?.line;
  if (!line) throw Error('Unexpected');
  line.character = nextNode.line.character;
  line.emotion = nextNode.line.emotion;
  spiel.updateDialogue(nextNode.line.dialogue);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}
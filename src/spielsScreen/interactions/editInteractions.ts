import EditSpielNodeDialog from "spielsScreen/spielDialogs/EditSpielNodeDialog";
import EditReplyDialog from 'spielsScreen/spielDialogs/EditReplyDialog';
import {updateRevisionForSpiel} from "spielsScreen/interactions/revisionUtil";

import { Spiel, SpielNode, SpielReply } from 'sl-spiel';

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

export function openDialogToAddReply(setModalDialog:Function) {
  setModalDialog(EditReplyDialog.name);
}

export function addReplyToSelectedNode(spiel:Spiel, reply:SpielReply, setRevision:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.addReply(reply.matchCriteria, reply.line.dialogue, reply.line.character, reply.line.emotion);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}
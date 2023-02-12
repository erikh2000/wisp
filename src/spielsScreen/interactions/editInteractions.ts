import AddLineDialog from "spielsScreen/spielDialogs/AddLineDialog";
import AddReplyDialog from "spielsScreen/spielDialogs/AddReplyDialog";
import EditLineDialog from "spielsScreen/spielDialogs/EditLineDialog";
import EditReplyDialog from 'spielsScreen/spielDialogs/EditReplyDialog';
import EditRootReplyDialog from "spielsScreen/spielDialogs/EditRootReplyDialog";
import {updateRevisionForSpiel} from "spielsScreen/interactions/revisionUtil";

import { Spiel, SpielNode, SpielReply } from 'sl-spiel';

export function editSpielNode(spiel:Spiel, nodeNo:number, setRevision:Function, setModalDialog:Function) {
  const nextSpiel = spiel.duplicate();
  nextSpiel.moveTo(nodeNo);
  updateRevisionForSpiel(nextSpiel, setRevision);
  setModalDialog(EditLineDialog.name);
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
  setModalDialog(AddReplyDialog.name);
}

export function addReplyToSelectedNode(spiel:Spiel, reply:SpielReply, setRevision:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.addReply(reply.matchCriteria, reply.line.dialogue, reply.line.character, reply.line.emotion);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function editSelectedReply(spiel:Spiel, selectedReplyNo:number, nextReply:SpielReply, setRevision:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.updateReply(selectedReplyNo, nextReply.matchCriteria, nextReply.line.dialogue, nextReply.line.character, nextReply.line.emotion);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function openDialogToEditReply(spiel:Spiel, nodeNo:number, replyNo:number, setRevision:Function, setSelectedReplyNo:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.moveTo(nodeNo);
  setSelectedReplyNo(replyNo); // TODO - move to revision.
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(EditReplyDialog.name);
}

export function deleteSelectedReply(spiel:Spiel, replyNo:number, setRevision:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.removeReply(replyNo);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function deleteSelectedNode(spiel:Spiel, setRevision:Function, setModalDialog:Function) {
  if (!spiel.currentNode) throw Error('Unexpected');
  spiel.removeCurrentNode();
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function addRootReply(spiel:Spiel, reply:SpielReply, setRevision:Function, setModalDialog:Function) {
  spiel.addRootReply(reply.matchCriteria, reply.line.dialogue, reply.line.character, reply.line.emotion);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function openDialogToEditRootReply(spiel:Spiel, replyNo:number, setRevision:Function, setSelectedRootReplyNo:Function, setModalDialog:Function) {
  setSelectedRootReplyNo(replyNo); // TODO - move to revision.
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(EditRootReplyDialog.name);
}

export function editSelectedRootReply(spiel:Spiel, rootReplyNo:number, nextReply:SpielReply, setRevision:Function, setModalDialog:Function) {
  spiel.updateRootReply(rootReplyNo, nextReply.matchCriteria, nextReply.line.dialogue, nextReply.line.character, nextReply.line.emotion);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function deleteSelectedRootReply(spiel:Spiel, rootReplyNo:number, setRevision:Function, setModalDialog:Function) {
  spiel.removeRootReply(rootReplyNo);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}

export function openDialogToAddSpielNode(setModalDialog:Function) {
  setModalDialog(AddLineDialog.name);
}

export function addSpielNode(spiel:Spiel, node:SpielNode, setRevision:Function, setModalDialog:Function) {
  spiel.createNode(node.line.character, node.line.emotion, node.line.dialogue);
  updateRevisionForSpiel(spiel, setRevision);
  setModalDialog(null);
}
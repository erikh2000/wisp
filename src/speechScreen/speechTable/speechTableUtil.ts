import SpeechRow, {SpeechRowType, UNSPECIFIED_TAKE_NO} from "./types/SpeechRow";
import SpeechTable from './types/SpeechTable';
import {summarizeTextArray} from "common/textFormatUtil";
import {spielEmotionToParenthetical} from "conversations/spielEmotionUtil";
import {UNSPECIFIED_NAME} from "persistence/projects";
import {getTakeKeys, isKeyForFinal} from "persistence/speech";

import {Emotion as SpielEmotion, PLAYER_CHARACTER_NAME, Spiel} from 'sl-spiel';

const DEFAULT_PARENTHETICAL = '(neutral)';

export type DialogTextKeyInfo = {
  characterName:string,
  dialogueText:string,
  projectName:string,
  speechId:string,
  spielName:string
}

function _trimSeparator(dialogueText:string):string {
  let trimmed = dialogueText.trim();
  if (!trimmed.endsWith('/')) return trimmed; 
  return trimmed.substring(0, trimmed.length - 1).trim();
}

function _createCharacterRow(character:string):SpeechRow {
  return {
    rowType: SpeechRowType.CHARACTER,
    text: character,
    isSelected: false,
    speechId: UNSPECIFIED_NAME,
    takeWavKeys: [],
    finalTakeNo: UNSPECIFIED_TAKE_NO
  } as SpeechRow;
}

function _createParentheticalRow(emotion:SpielEmotion):SpeechRow {
  return {
    rowType: SpeechRowType.PARENTHETICAL,
    text: spielEmotionToParenthetical(emotion),
    isSelected: false,
    speechId: UNSPECIFIED_NAME,
    takeWavKeys: [],
    finalTakeNo: UNSPECIFIED_TAKE_NO
  } as SpeechRow;
}

function _createDialogueRow(dialogue:string, speechId:string, isLastDialogue:boolean):SpeechRow {
  return {
    rowType: SpeechRowType.DIALOGUE,
    text: isLastDialogue ? dialogue : `${dialogue} /`,
    isSelected: false,
    speechId,
    takeWavKeys: [],
    finalTakeNo: UNSPECIFIED_TAKE_NO
  } as SpeechRow;
}

function _createSpaceRow():SpeechRow {
  return {
    rowType: SpeechRowType.SPACE,
    text: '',
    isSelected: false,
    speechId: UNSPECIFIED_NAME,
    takeWavKeys: [],
    finalTakeNo: UNSPECIFIED_TAKE_NO
  } as SpeechRow;
}

const UNSPECIFIED_EMOTION = -1;

export function spielToSpeechTable(spiel:Spiel):SpeechTable {
  let lastCharacter = '';
  let lastEmotion:SpielEmotion = UNSPECIFIED_EMOTION;
  const rows:SpeechRow[] = [];
  
  for(let nodeI = 0; nodeI < spiel.nodes.length; ++nodeI) {
    const node = spiel.nodes[nodeI];
    const character = node.line.character;
    if (character !== lastCharacter) { 
      rows.push(_createCharacterRow(character));
      lastCharacter = character;
    }
    const emotion = node.line.emotion;
    if (emotion !== lastEmotion) {
      rows.push(_createParentheticalRow(emotion));
      lastEmotion = emotion;
    }
    const dialogues = node.line.dialogue;
    dialogues.forEach((dialogue:string, dialogueNo:number) => {
      const speechId = node.line.speechIds[dialogueNo];
      rows.push(_createDialogueRow(dialogue, speechId, dialogueNo === dialogues.length - 1));
    });
    
    const replies = node.replies;
    if (replies.length) {
      rows.push(_createSpaceRow());
      rows.push(_createCharacterRow(PLAYER_CHARACTER_NAME));
      replies.forEach(reply => {
        rows.push(_createDialogueRow(summarizeTextArray(reply.matchCriteria), UNSPECIFIED_NAME, true));
        rows.push(_createSpaceRow());
        rows.push(_createCharacterRow(reply.line.character));
        const dialogues = reply.line.dialogue;
        dialogues.forEach((dialogue:string, dialogueNo:number) => {
          const speechId = reply.line.speechIds[dialogueNo];
          rows.push(_createDialogueRow(dialogue, speechId, dialogueNo === dialogues.length - 1));
        });
      });
    }
    
    if (nodeI !== spiel.nodes.length - 1) rows.push(_createSpaceRow());
  }
  
  for(let rootReplyI = 0; rootReplyI < spiel.rootReplies.length; ++rootReplyI) {
    const rootReply = spiel.rootReplies[rootReplyI];
    rows.push(_createSpaceRow());
    rows.push(_createCharacterRow(PLAYER_CHARACTER_NAME));
    rows.push(_createDialogueRow(summarizeTextArray(rootReply.matchCriteria), UNSPECIFIED_NAME, true));
    rows.push(_createSpaceRow());
    rows.push(_createCharacterRow(rootReply.line.character));
    const dialogues = rootReply.line.dialogue;
    dialogues.forEach((dialogue:string, dialogueNo:number) => {
      const speechId = rootReply.line.speechIds[dialogueNo];
      rows.push(_createDialogueRow(dialogue, speechId, dialogueNo === dialogues.length - 1));
    });
    if (rootReplyI !== spiel.rootReplies.length - 1) rows.push(_createSpaceRow());
  }
  
  return { rows } as SpeechTable;
}

export function getUniqueCharacterNames(speechTable:SpeechTable):string[] {
  const characterNames:string[] = [];
  speechTable.rows.forEach((row) => {
    if (row.rowType === SpeechRowType.CHARACTER) {
      const character = row.text;
      if (character !== PLAYER_CHARACTER_NAME && !characterNames.includes(character)) characterNames.push(character);
    }
  });
  return characterNames;
}

function _findFinalTakeNo(takeWavKeys:string[]):number {
  for(let takeNo = 0; takeNo < takeWavKeys.length; ++takeNo) {
    if (isKeyForFinal(takeWavKeys[takeNo])) return takeNo;
  }
  return UNSPECIFIED_TAKE_NO;
}

export async function updateSpeechTableWithTakes(spielName:string, speechTable:SpeechTable):Promise<void> {
  const rowCount = speechTable.rows.length;
  let lastCharacter = UNSPECIFIED_NAME;
  for(let rowI = 0; rowI < rowCount; ++rowI) {
    const row = speechTable.rows[rowI];
    if (row.rowType === SpeechRowType.CHARACTER) lastCharacter = row.text;
    if (lastCharacter === PLAYER_CHARACTER_NAME || lastCharacter === UNSPECIFIED_NAME || row.rowType !== SpeechRowType.DIALOGUE) continue;
    row.takeWavKeys = await getTakeKeys(spielName, lastCharacter, row.speechId, row.text);
    row.finalTakeNo = _findFinalTakeNo(row.takeWavKeys);
  }
}

export function areAllSpeechTableRowsSelected(speechTable:SpeechTable):boolean {
  const rowCount = speechTable.rows.length;
  let lastCharacter = UNSPECIFIED_NAME;
  for (let rowI = 0; rowI < rowCount; ++rowI) {
    const row = speechTable.rows[rowI];
    if (row.rowType === SpeechRowType.CHARACTER) lastCharacter = row.text;
    if (lastCharacter === PLAYER_CHARACTER_NAME || lastCharacter === UNSPECIFIED_NAME || row.rowType !== SpeechRowType.DIALOGUE) continue;
    if (!row.isSelected) return false;
  }
  return true;
}

export function getSelectedRowCount(speechTable:SpeechTable):number {
  let count = 0;
  speechTable.rows.forEach(row => {
    if (row.isSelected) ++count;
  });
  return count;
}

export function findDialogueText(speechTable:SpeechTable, dialogueTextNo:number):[characterName:string, parenthetical:string, dialogueText:string, speechId:string] {
  let characterName = UNSPECIFIED_NAME;
  let parenthetical = DEFAULT_PARENTHETICAL;
  let currentDialogueTextNo = 0;
  for(let rowI = 0; rowI < speechTable.rows.length; ++rowI) {
    const row = speechTable.rows[rowI];
    if (row.rowType === SpeechRowType.CHARACTER) characterName = row.text;
    if (row.rowType === SpeechRowType.PARENTHETICAL) parenthetical = row.text;
    if (row.rowType === SpeechRowType.DIALOGUE) {
      if (!row.isSelected) continue;
      if (currentDialogueTextNo === dialogueTextNo) {
        const dialogueText = _trimSeparator(row.text);
        return [characterName, parenthetical, dialogueText, row.speechId];        
      }
      ++currentDialogueTextNo;
    }
  }
  return [UNSPECIFIED_NAME, UNSPECIFIED_NAME, UNSPECIFIED_NAME, UNSPECIFIED_NAME];
}

export function getDialogTextKeyInfoFromSpeechTable(spielName:string, speechTable:SpeechTable, projectName:string):DialogTextKeyInfo[] {
  const dialogTextKeyInfos:DialogTextKeyInfo[] = [];
  let characterName = UNSPECIFIED_NAME;
  for(let rowI = 0; rowI < speechTable.rows.length; ++rowI) {
    const row = speechTable.rows[rowI];
    if (row.rowType === SpeechRowType.CHARACTER) characterName = row.text;
    if (row.rowType === SpeechRowType.DIALOGUE) {
      if (characterName === PLAYER_CHARACTER_NAME) continue;
      const dialogueText = _trimSeparator(row.text);
      dialogTextKeyInfos.push({
        characterName,
        dialogueText,
        projectName,
        speechId:row.speechId,
        spielName
      });
    }
  }
  return dialogTextKeyInfos;
}

export function duplicateSpeechTable(speechTable:SpeechTable):SpeechTable {
  const nextSpeechTable = { rows: [] } as SpeechTable;
  nextSpeechTable.rows = [...speechTable.rows];
  return nextSpeechTable;
}
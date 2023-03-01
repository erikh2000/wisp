import SpeechTable from './types/SpeechTable';
import SpeechRow, {SpeechRowType} from "./types/SpeechRow";
import {spielEmotionToParenthetical} from "conversations/spielEmotionUtil";

import { Spiel, Emotion as SpielEmotion } from 'sl-spiel';

function _createCharacterRow(character:string):SpeechRow {
  return {
    rowType: SpeechRowType.CHARACTER,
    text: character,
    isSelected: false,
    recordedTakes: [],
    finalTake: null
  } as SpeechRow;
}

function _createParentheticalRow(emotion:SpielEmotion):SpeechRow {
  return {
    rowType: SpeechRowType.PARENTHETICAL,
    text: spielEmotionToParenthetical(emotion),
    isSelected: false,
    recordedTakes: [],
    finalTake: null
  } as SpeechRow;
}

function _createDialogueRow(dialogue:string, isLastDialogue:boolean):SpeechRow {
  return {
    rowType: SpeechRowType.DIALOGUE,
    text: isLastDialogue ? dialogue : `${dialogue} /`,
    isSelected: false,
    recordedTakes: [],
    finalTake: null
  } as SpeechRow;
}

function _createSpaceRow():SpeechRow {
  return {
    rowType: SpeechRowType.SPACE,
    text: '',
    isSelected: false,
    recordedTakes: [],
    finalTake: null
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
      rows.push(_createDialogueRow(dialogue, dialogueNo === dialogues.length - 1));
    });
    
    if (nodeI !== spiel.nodes.length - 1) rows.push(_createSpaceRow());
  }
  
  return { rows } as SpeechTable;
}

export function getUniqueCharacterNames(speechTable:SpeechTable):string[] {
  const characterNames:string[] = [];
  speechTable.rows.forEach((row) => {
    if (row.rowType === SpeechRowType.CHARACTER) {
      if (!characterNames.includes(row.text)) characterNames.push(row.text);
    }
  });
  return characterNames;
}
import {isWord} from "./charUtil";

export function splitText(text:string):string[] {
  return text
    .split('/')
    .map(splitText => splitText.trim())
    .filter(splitText => splitText.length > 0);
}

export function joinText(textArray:string[]):string {
  return textArray.join(' / ');
}

export function summarizeTextArray(textArray:string[]):string {
  const count = textArray.length;
  return count === 0
    ? ''
    : count === 1
      ? textArray[0]
      : `${textArray[0]}+${count-1}`;
}

export function splitTextToWordsWithTrailingSeparator(textToSplit:string):string[] {
  const text = textToSplit.trim();
  const words:string[] = [];
  let wordStartPos = 0, pos = 1;
  while (pos < text.length) {
    if (isWord(text[pos])) {
      ++pos;
      continue;
    }

    while(pos < text.length && !isWord(text[pos])) { ++pos }
    words.push(text.substring(wordStartPos, pos));
    wordStartPos = pos;
  }
  if (pos - wordStartPos > 1) words.push(text.substring(wordStartPos)); // Handle case of sentence that doesn't end with punctuation.
  return words;
}

export function splitAndTrimText(textToSplit:string, separator:string):string[] {
  const trimmedText = textToSplit.trim();
  if (trimmedText.length === 0) return [];
  return trimmedText
    .split(separator)
    .map(word => word.trim())
    .filter(word => word.length > 0);
}
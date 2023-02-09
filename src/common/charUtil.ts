const ALPHA_NUMERIC_REGEX = /^[a-zA-Z0–9]+$/i

const WORD_REGEX = /^[a-zA-Z0–9']+$/i

export const isAlphaNumeric = (text:string):boolean => ALPHA_NUMERIC_REGEX.test(text);

export const isWord = (text:string):boolean => WORD_REGEX.test(text);
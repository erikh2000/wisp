import {
  joinText,
  splitAndTrimText,
  splitText,
  splitTextToWordsWithTrailingSeparator,
  summarizeTextArray
} from "../textFormatUtil";

describe('textFormatUtil', () => {
  describe('joinText()', () => {
    it('return empty string when passed empty array', () => {
      const splitText:string[] = [];
      const expected = '';
      const joined = joinText(splitText);
      expect(joined).toEqual(expected);
    });

    it('joins a single line of dialogue', () => {
      const splitText = ['one line'];
      const expected = 'one line';
      const joined = joinText(splitText);
      expect(joined).toEqual(expected);
    });

    it('joins two lines of dialogue', () => {
      const splitText = ['one', 'two'];
      const expected = 'one / two';
      const joined = joinText(splitText);
      expect(joined).toEqual(expected);
    });

    it('joins three lines of dialogue', () => {
      const splitText = ['one', 'two', 'three'];
      const expected = 'one / two / three';
      const joined = joinText(splitText);
      expect(joined).toEqual(expected);
    });
  });

  describe('splitText()', () => {
    it('returns one element for dialogue with no split markers', () => {
      const joined = 'i am unsplittable';
      const expected = ['i am unsplittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });

    it('returns two elements for dialogue with one split marker', () => {
      const joined = 'i am/splittable';
      const expected = ['i am','splittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });

    it('returns three elements for dialogue with two split markers', () => {
      const joined = 'i/am/splittable';
      const expected = ['i','am','splittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });

    it('removes empty strings when splitting', () => {
      const joined = 'i/am//splittable';
      const expected = ['i','am','splittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });

    it('trims whitespace', () => {
      const joined = 'i / am /  splittable   ';
      const expected = ['i','am','splittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });

    it('removes strings that are entirely whitespace', () => {
      const joined = 'i / am /  / splittable   ';
      const expected = ['i','am','splittable'];
      const split = splitText(joined);
      expect(split).toEqual(expected);
    });
  });

  describe('splitTextToWordsWithTrailingSeparator', () => {
    it('returns empty array for empty string', () => {
      const text = '';
      const expected:string[] = [];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('returns single word with punctuation at end', () => {
      const text = 'Hi.';
      const expected:string[] = ['Hi.'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('returns single word without punctuation at end', () => {
      const text = 'Hi';
      const expected:string[] = ['Hi'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('returns two words separated by white space', () => {
      const text = 'Hi there!';
      const expected:string[] = ['Hi ', 'there!'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('returns two words separated by hyphen', () => {
      const text = 'Able-bodied';
      const expected:string[] = ['Able-', 'bodied'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('returns two words separated by multiple characters of white space', () => {
      const text = 'Hi  there!';
      const expected:string[] = ['Hi  ', 'there!'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('excludes white space from beginning of text', () => {
      const text = '     Hi there!';
      const expected:string[] = ['Hi ', 'there!'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });

    it('excludes white space from end of text', () => {
      const text = 'Hi there!    ';
      const expected:string[] = ['Hi ', 'there!'];
      const split = splitTextToWordsWithTrailingSeparator(text);
      expect(split).toEqual(expected);
    });
  });

  describe('splitAndTrimText()', () => {
    it('returns empty array for empty text', () => {
      const text = '';
      const separator = ' ';
      const expected:string[] = [];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns empty array for whitespace that matches separator', () => {
      const text = '   ';
      const separator = ' ';
      const expected:string[] = [];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns empty array for whitespace that does not match separator', () => {
      const text = '   ';
      const separator = ':';
      const expected:string[] = [];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns one-element array for text with no separator', () => {
      const text = 'cow';
      const separator = ' ';
      const expected:string[] = ['cow'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns trimmed one-element array', () => {
      const text = '  cow  ';
      const separator = ' ';
      const expected:string[] = ['cow'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns two-element array for two whitespace-separated words', () => {
      const text = 'cow beef';
      const separator = ' ';
      const expected:string[] = ['cow','beef'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns two-element array for two non-whitespace-separated words', () => {
      const text = 'cow:beef';
      const separator = ':';
      const expected:string[] = ['cow','beef'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns two-element array for two multichar-separated words', () => {
      const text = 'cow...beef';
      const separator = '...';
      const expected:string[] = ['cow','beef'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });

    it('returns array that omits separated whitespace', () => {
      const text = 'cow... ...beef';
      const separator = '...';
      const expected:string[] = ['cow','beef'];
      const tokens = splitAndTrimText(text, separator);
      expect(tokens).toEqual(expected);
    });
  });

  describe('summarizeTextArray', () => {
    it('returns empty string for empty array', () => {
      const textArray:string[] = [];
      const expected = '';
      const summary = summarizeTextArray(textArray);
      expect(summary).toEqual(expected);
    });

    it('returns first string of one-element array', () => {
      const textArray:string[] = ['dog'];
      const expected = 'dog';
      const summary = summarizeTextArray(textArray);
      expect(summary).toEqual(expected);
    });

    it('returns shortened summary of multi-element array', () => {
      const textArray:string[] = ['dog', 'cat', 'spider'];
      const expected = 'dog+2';
      const summary = summarizeTextArray(textArray);
      expect(summary).toEqual(expected);
    });
  });
});
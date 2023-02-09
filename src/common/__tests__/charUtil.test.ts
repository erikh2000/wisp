import { isAlphaNumeric } from "../charUtil";

describe('charUtil', () => {
  describe('hasAlphaNumeric()', () => {
    it('returns false for empty string', () => {
      expect(isAlphaNumeric('')).toBeFalsy();
    });

    it('returns true for one lower-case alpha', () => {
      expect(isAlphaNumeric('a')).toBeTruthy();
    });

    it('returns true for one upper-case alpha', () => {
      expect(isAlphaNumeric('A')).toBeTruthy();
    });

    it('returns true for one numeric', () => {
      expect(isAlphaNumeric('0')).toBeTruthy();
    });

    it('returns false for one non-alpha-numerice', () => {
      expect(isAlphaNumeric(' ')).toBeFalsy();
    });

    it('returns false if string contains a mix of alphanumeric and not', () => {
      expect(isAlphaNumeric('A ')).toBeFalsy();
    });
  });
});
import {pathFromKey, nameFromKey, pathAndNameFromKey} from '../keyStorePathUtil';

describe('keyStorePathUtil', () => {
  describe('pathFromKey()', () => {
    it('returns empty string for empty string', () => {
      const key = '';
      const expected = '';
      const path = pathFromKey(key);
      expect(path).toEqual(expected);
    });

    it('returns empty string for key with no path', () => {
      const key = 'dog';
      const expected = '';
      const path = pathFromKey(key);
      expect(path).toEqual(expected);
    });

    it('returns / for key with a root path', () => {
      const key = '/dog';
      const expected = '/';
      const path = pathFromKey(key);
      expect(path).toEqual(expected);
    });

    it('returns /path/ for key with one folder', () => {
      const key = '/pets/dog';
      const expected = '/pets/';
      const path = pathFromKey(key);
      expect(path).toEqual(expected);
    });

    it('returns multi-folder path from key', () => {
      const key = '/pets/furry/dog';
      const expected = '/pets/furry/';
      const path = pathFromKey(key);
      expect(path).toEqual(expected);
    });
  });

  describe('nameFromKey()', () => {
    it('returns empty string for empty string', () => {
      const key = '';
      const expected = '';
      const name = nameFromKey(key);
      expect(name).toEqual(expected);
    });

    it('returns empty string for key with path but no name', () => {
      const key = '/pets/furry/';
      const expected = '';
      const name = nameFromKey(key);
      expect(name).toEqual(expected);
    });

    it('returns name for key with name but no path', () => {
      const key = 'dog';
      const expected = 'dog';
      const name = nameFromKey(key);
      expect(name).toEqual(expected);
    });

    it('returns name for key with path and name', () => {
      const key = '/pets/furry/dog';
      const expected = 'dog';
      const name = nameFromKey(key);
      expect(name).toEqual(expected);
    });
  });
});
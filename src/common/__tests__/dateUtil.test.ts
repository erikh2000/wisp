import { getDateGrouping } from "../dateUtil";

const MSECS_IN_HOUR = 60 * 60 * 1000;
const MSECS_IN_DAY = 24 * MSECS_IN_HOUR;

describe('dateUtil', () => {
  describe('getDateGrouping()', () => {
    it('returns Today for a date in the future', () => {
      const date = Date.now() + 5000;
      const expected = 'Today';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns Today for a date <24 hours past', () => {
      const date = Date.now() - (23 * MSECS_IN_HOUR);
      const expected = 'Today';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns Yesterday for 1d > date > 2d', () => {
      const date = Date.now() - (1.5 * MSECS_IN_DAY);
      const expected = 'Yesterday';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns 2 Days Ago for 2d > date > 3d', () => {
      const date = Date.now() - (2.5 * MSECS_IN_DAY);
      const expected = '2 Days Ago';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns This Week for 3d > date > 7d', () => {
      const date = Date.now() - (3.5 * MSECS_IN_DAY);
      const expected = 'This Week';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns Last Week for 7d > date > 14d', () => {
      const date = Date.now() - (8 * MSECS_IN_DAY);
      const expected = 'Last Week';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    it('returns Previous 30 Days for 14d > date > 30d', () => {
      const date = Date.now() - (15 * MSECS_IN_DAY);
      const expected = 'Previous 30 Days';
      expect(getDateGrouping(date)).toEqual(expected);
    });

    // There are a few more cases for showing the year, but I'd need
    // to stub out Date.now() and it doesn't seem worth the effort.
  });
});
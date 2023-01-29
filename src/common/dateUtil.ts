const MSECS_IN_HOUR = 60 * 60 * 1000;
const MSECS_IN_DAY = 24 * MSECS_IN_HOUR;

export function getDateGrouping(sinceDate:number):string {
  const now = Date.now();
  if (sinceDate > now) sinceDate = now; // Treat future dates the same as now. Could be caused by clock/calendar changes made by user.

  // Any date from a previous year will just get a year heading.
  const currentYear = new Date(now).getFullYear();
  const sinceYear = new Date(sinceDate).getFullYear();
  if (sinceYear < currentYear) return `${sinceYear}`;

  const elapsed = Date.now() - sinceDate;
  const elapsedDays = Math.floor(elapsed / MSECS_IN_DAY);
  if (elapsedDays > 30) return `${sinceYear}`;
  if (elapsedDays > 14) return 'Previous 30 Days';
  if (elapsedDays > 7) return 'Last Week';
  if (elapsedDays > 2) return 'This Week';
  if (elapsedDays > 1) return '2 Days Ago';
  const elapsedHours = Math.floor(elapsed / MSECS_IN_HOUR);
  if (elapsedHours > 24) return 'Yesterday';
  return 'Today';
}
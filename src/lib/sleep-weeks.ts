import { INITIAL_WEEK, type SleepNight } from "./sleep-log";

export const DAY_WINDOW = 30;

// Use calendar days (not 24-hour milliseconds) so local DST transitions are safe.
export function shiftDate(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  result.setDate(result.getDate() + days);
  return result;
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export const shortDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fullDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

export function sleepWeekDates(today: Date, offset: number) {
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6 - Math.max(0, offset) * 7));
  const start = dates[0];
  const end = dates[6];
  if (!start || !end) throw new Error("A sleep week must contain seven dates");
  const format = (date: Date) => date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", ...(start.getFullYear() !== end.getFullYear() ? { year: "numeric" as const } : {}),
  });
  const range = `${format(start)} – ${format(end)}`;
  return { dates, label: offset === 0 ? `This Week (${range})` : offset === 1 ? `Last Week (${range})` : range };
}

export function sleepDayDate(today: Date, offset: number) {
  const date = shiftDate(today, Math.max(0, Math.min(DAY_WINDOW - 1, offset)) * -1);
  const label = fullDate(date);
  return { date, label: offset === 0 ? `Today (${label})` : offset === 1 ? `Yesterday (${label})` : label };
}

const history = [
  [["22:35", "23:05", "06:15", 1], ["22:50", "23:30", "06:10", 2], ["22:25", "23:00", "06:20", 1], ["23:00", "23:45", "06:00", 3], ["22:40", "23:05", "07:05", 1], ["23:15", "23:55", "07:10", 2], ["22:30", "23:00", "06:40", 1]],
  [["22:15", "23:20", "05:50", 3], ["22:40", "23:35", "06:10", 2], ["23:10", "00:10", "06:00", 3], ["22:30", "23:20", "06:20", 2], ["22:50", "23:25", "07:00", 1], ["23:20", "00:15", "06:45", 3], ["22:45", "23:35", "06:05", 2]],
  [["22:30", "23:45", "05:45", 4], ["22:20", "23:30", "05:50", 3], ["23:00", "00:20", "05:40", 4], ["22:45", "23:50", "06:00", 3], ["22:40", "23:35", "06:35", 2], ["23:10", "00:25", "06:25", 3], ["22:30", "23:40", "06:10", 3]],
] as const;

// Samples are keyed to calendar dates so Week and Day always agree.
export function selectedSleepDay(current: SleepNight[], today: Date, daysAgo: number): SleepNight {
  const date = shiftDate(today, -daysAgo);
  const live = daysAgo >= 0 && daysAgo < 7 ? current[6 - daysAgo] : undefined;
  const serial = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const samples = history.flat();
  const sample = samples[((serial % samples.length) + samples.length) % samples.length];
  const fallback = INITIAL_WEEK[0];
  if (!fallback || !sample) throw new Error("Sleep samples are missing");
  const [bed, asleep, wake, wakes] = sample;
  return { ...(live ?? { ...fallback, bed, asleep, wake, wakes }), day: date.toLocaleDateString("en-US", { weekday: "long" }) };
}

export function selectedSleepWeek(current: SleepNight[], offset: number, today: Date): SleepNight[] {
  return Array.from({ length: 7 }, (_, index) => selectedSleepDay(current, today, offset * 7 + 6 - index));
}

export const moveSleepWeek = (offset: number, direction: -1 | 1) => Math.max(0, offset + direction);
export const moveSleepDay = (offset: number, direction: -1 | 1) => Math.max(0, Math.min(DAY_WINDOW - 1, offset + direction));

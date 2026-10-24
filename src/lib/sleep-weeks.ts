import { INITIAL_WEEK, type SleepNight } from "./sleep-log";

// Floor 1's requested display dates are independent of the shared log's day keys.
export const SLEEP_WEEKS = [
  { label: "This Week (Oct 18 – 24)", dates: ["Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24"] },
  { label: "Last Week (Oct 11 – 17)", dates: ["Oct 11", "Oct 12", "Oct 13", "Oct 14", "Oct 15", "Oct 16", "Oct 17"] },
  { label: "2 Weeks Ago (Oct 4 – 10)", dates: ["Oct 4", "Oct 5", "Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10"] },
  { label: "3 Weeks Ago (Sep 27 – Oct 3)", dates: ["Sep 27", "Sep 28", "Sep 29", "Sep 30", "Oct 1", "Oct 2", "Oct 3"] },
] as const;

const history = [
  [["22:35", "23:05", "06:15", 1], ["22:50", "23:30", "06:10", 2], ["22:25", "23:00", "06:20", 1], ["23:00", "23:45", "06:00", 3], ["22:40", "23:05", "07:05", 1], ["23:15", "23:55", "07:10", 2], ["22:30", "23:00", "06:40", 1]],
  [["22:15", "23:20", "05:50", 3], ["22:40", "23:35", "06:10", 2], ["23:10", "00:10", "06:00", 3], ["22:30", "23:20", "06:20", 2], ["22:50", "23:25", "07:00", 1], ["23:20", "00:15", "06:45", 3], ["22:45", "23:35", "06:05", 2]],
  [["22:30", "23:45", "05:45", 4], ["22:20", "23:30", "05:50", 3], ["23:00", "00:20", "05:40", 4], ["22:45", "23:50", "06:00", 3], ["22:40", "23:35", "06:35", 2], ["23:10", "00:25", "06:25", 3], ["22:30", "23:40", "06:10", 3]],
] as const;

export const HISTORICAL_WEEKS: SleepNight[][] = history.map(nights => nights.map(([bed, asleep, wake, wakes], index) => ({
  day: INITIAL_WEEK[index]?.day ?? "Sunday", bed, asleep, wake, wakes,
})));

export function selectedSleepWeek(current: SleepNight[], offset: number): SleepNight[] {
  return offset === 0 ? current : HISTORICAL_WEEKS[offset - 1] ?? current;
}

export function moveSleepWeek(offset: number, direction: -1 | 1) {
  return Math.max(0, Math.min(SLEEP_WEEKS.length - 1, offset + direction));
}
import { describe, expect, it } from "vitest";
import { averageSleep, INITIAL_WEEK } from "../lib/sleep-log";
import { HISTORICAL_WEEKS, moveSleepWeek, selectedSleepWeek, SLEEP_WEEKS } from "../lib/sleep-weeks";

describe("Floor 1 week selection", () => {
  it("covers Oct 18–24 and the three requested preceding ranges", () => {
    expect(SLEEP_WEEKS.map(week => [week.dates[0], week.dates[6]])).toEqual([
      ["Oct 18", "Oct 24"], ["Oct 11", "Oct 17"], ["Oct 4", "Oct 10"], ["Sep 27", "Oct 3"],
    ]);
  });
  it("prevents navigation beyond this week and three weeks ago", () => {
    expect(moveSleepWeek(0, -1)).toBe(0);
    expect(moveSleepWeek(0, 1)).toBe(1);
    expect(moveSleepWeek(3, 1)).toBe(3);
    expect(moveSleepWeek(3, -1)).toBe(2);
  });
  it("uses all seven sample nights to re-average each historical week", () => {
    for (let offset = 1; offset <= 3; offset++) {
      const nights = selectedSleepWeek(INITIAL_WEEK, offset);
      expect(nights).toHaveLength(7);
      expect(nights).toBe(HISTORICAL_WEEKS[offset - 1]);
      expect(averageSleep(nights).total).not.toBe(averageSleep(INITIAL_WEEK).total);
    }
    expect(averageSleep(selectedSleepWeek(INITIAL_WEEK, 1)).total).toBeCloseTo((430 + 400 + 440 + 375 + 480 + 435 + 460) / 420);
  });
  it("keeps Today edits in the current week without changing history", () => {
    const oldHistory = averageSleep(selectedSleepWeek(INITIAL_WEEK, 1));
    const updated = INITIAL_WEEK.map((night, index) => index === 6 ? { ...night, bed: "22:00", asleep: "23:00", wake: "07:00", wakes: 4 } : night);
    expect(selectedSleepWeek(updated, 0)).toBe(updated);
    expect(averageSleep(selectedSleepWeek(updated, 0)).total).toBeCloseTo(48 / 7);
    expect(averageSleep(selectedSleepWeek(updated, 1))).toEqual(oldHistory);
  });
});
import { describe, expect, it } from "vitest";
import { averageSleep, INITIAL_WEEK } from "../lib/sleep-log";
import { dateKey, moveSleepDay, moveSleepWeek, selectedSleepDay, selectedSleepWeek, shiftDate, sleepDayDate, sleepWeekDates } from "../lib/sleep-weeks";

describe("Floor 1 local rolling calendar", () => {
  it("ends the current seven-day window on the live local date", () => {
    const today = new Date(2026, 9, 24);
    expect(sleepWeekDates(today, 0).dates.map(dateKey)).toEqual(["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"]);
    expect(today.getDate()).toBe(24);
  });
  it("crosses November into October with exact seven-day steps", () => {
    const today = new Date(2026, 10, 3);
    expect(sleepWeekDates(today, 0).dates.map(dateKey)).toEqual(["2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-1", "2026-11-2", "2026-11-3"]);
    expect(dateKey(sleepWeekDates(today, 1).dates[6] ?? today)).toBe("2026-10-27");
  });
  it("crosses January into the preceding December", () => {
    expect(sleepWeekDates(new Date(2027, 0, 2), 0).dates.map(dateKey)).toEqual(["2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-1-1", "2027-1-2"]);
  });
  it("handles leap days and daylight-saving calendar steps", () => {
    expect(dateKey(shiftDate(new Date(2028, 2, 1), -1))).toBe("2028-2-29");
    expect(dateKey(shiftDate(new Date(2026, 2, 8), -1))).toBe("2026-3-7");
    expect(dateKey(shiftDate(new Date(2026, 10, 1), 1))).toBe("2026-11-2");
  });
  it("allows 30 daily dates and prevents future navigation", () => {
    expect(moveSleepDay(29, 1)).toBe(29);
    expect(moveSleepDay(0, -1)).toBe(0);
    expect(moveSleepDay(28, 1)).toBe(29);
    expect(dateKey(sleepDayDate(new Date(2027, 0, 2), 29).date)).toBe("2026-12-4");
  });
  it("allows four and more previous weeks without future weeks", () => {
    expect(moveSleepWeek(4, 1)).toBe(5);
    expect(moveSleepWeek(0, -1)).toBe(0);
    expect(dateKey(sleepWeekDates(new Date(2026, 10, 3), 5).dates[6] ?? new Date())).toBe("2026-9-29");
  });
  it("uses the same dated samples in Week and Day views", () => {
    const today = new Date(2026, 9, 24);
    for (let offset = 0; offset <= 5; offset++) {
      const week = selectedSleepWeek(INITIAL_WEEK, offset, today);
      week.forEach((night, index) => expect(night).toEqual(selectedSleepDay(INITIAL_WEEK, today, offset * 7 + 6 - index)));
    }
  });
  it("synchronizes Today inputs without changing historical samples", () => {
    const today = new Date(2026, 9, 24);
    const history = selectedSleepWeek(INITIAL_WEEK, 1, today);
    const updated = INITIAL_WEEK.map((night, index) => index === 6 ? { ...night, bed: "22:00", asleep: "23:00", wake: "07:00", wakes: 4 } : night);
    expect(selectedSleepDay(updated, today, 0)).toMatchObject({ asleep: "23:00", wake: "07:00", wakes: 4 });
    expect(averageSleep(selectedSleepWeek(updated, 0, today)).total).toBeCloseTo(48 / 7);
    expect(selectedSleepWeek(updated, 1, today)).toEqual(history);
  });
});

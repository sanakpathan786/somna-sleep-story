import { describe, expect, it } from "vitest";
import { averageSleep, INITIAL_WEEK, nightMetrics } from "../lib/sleep-log";

describe("shared Monday–Sunday sleep log", () => {
  it("uses Sunday as Last Night and keeps all seven days in order", () => {
    expect(INITIAL_WEEK.map(n => n.day)).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    expect(INITIAL_WEEK.slice(0, 6).map(n => nightMetrics(n).total)).toEqual([6.5, 7.2, 5.5, 6.8, 8, 6]);
  });
  it("calculates overnight times and Sunday awakenings", () => {
    expect(nightMetrics({ day: "Sunday", bed: "22:00", asleep: "23:00", wake: "07:00", wakes: 4 })).toEqual({ latency: 60, sleepMinutes: 480, total: 8, wakes: 4, efficiency: 480 / 540 * 100 });
  });
  it("re-averages all four metrics from seven nights when Sunday changes", () => {
    const updated = INITIAL_WEEK.map(n => n.day === "Sunday" ? { ...n, bed: "22:00", asleep: "23:00", wake: "07:00", wakes: 4 } : n);
    const avg = averageSleep(updated);
    expect(avg.latency).toBeCloseTo(341 / 7);
    expect(avg.total).toBeCloseTo(48 / 7);
    expect(avg.wakes).toBeCloseTo(18 / 7);
    expect(avg.efficiency).toBeCloseTo((390/432 + 432/497 + 330/368 + 408/463 + 480/510 + 360/411 + 480/540) * 100 / 7);
    expect(INITIAL_WEEK[6]?.wake).toBe("06:20");
  });
});
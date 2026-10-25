import { describe, expect, it } from "vitest";
import { dietarySummary, reportProfile } from "../lib/care-summary";
import { parseJournalNote, type JournalNote } from "../lib/journal-log";
import { INITIAL_WEEK } from "../lib/sleep-log";

const today = { ...INITIAL_WEEK[6], day: "Sunday", bed: "22:00", asleep: "23:00", wake: "07:00", wakes: 4 };
describe("Care Summary timeframe rules", () => {
  it("uses today's live sleep inputs", () => {
    expect(reportProfile("Today (1 Night)", today)).toMatchObject({ nights: 1, total: 8, latency: 60, wakes: 4, efficiency: 480 / 540 * 100 });
  });
  it("uses the requested seven-day profile", () => {
    expect(reportProfile("Past 7 Days", today)).toMatchObject({ nights: 7, total: 6.8, latency: 42, wakes: 1.8, efficiency: 82 });
  });
  it("uses the requested fourteen-day profile", () => {
    expect(reportProfile("Bi-Weekly (14 Days)", today)).toMatchObject({ nights: 14, total: 6.5, latency: 46, wakes: 2.1 });
  });
  it.each(["Past Month (30 Days)", "Past 3 Months"] as const)("uses the requested long-term profile for %s", range => {
    expect(reportProfile(range, today)).toMatchObject({ nights: range === "Past 3 Months" ? 90 : 30, total: 6.7, latency: 39, wakes: 1.6, efficiency: 84 });
  });
  it("reads recent saved dinner, evening foods, meal timing and late caffeine", () => {
    const now = new Date(2026, 9, 25, 12);
    const text = "Pasta for dinner around 7 PM, chocolate snack at 10 PM, coffee at 9 PM.";
    const notes: JournalNote[] = [{ id: "saved", at: new Date(2026, 9, 24, 23), text, sections: parseJournalNote(text) }];
    const result = dietarySummary(notes, now, 1, "23:00");
    expect(result.mealItems).toEqual(["Pasta for dinner around 7 PM"]);
    expect(result.eveningItems).toEqual(["chocolate snack at 10 PM"]);
    expect(result.mealTime).toBe("7:00 PM — Approx 4.0 hrs before sleep");
    expect(result.snackNights).toBe(1);
    expect(result.triggers).toContain("Late caffeine: coffee @ 9 pm");
    expect(result.triggers).not.toContain("Late caffeine: cola @ 10 pm");
  });
  it("omits older or future notes from today's report", () => {
    const now = new Date(2026, 9, 25, 12);
    const text = "Pizza for dinner at 7 PM.";
    const notes = [new Date(2026, 9, 23), new Date(2026, 9, 26)].map((at, i) => ({ id: String(i), at, text, sections: parseJournalNote(text) }));
    expect(dietarySummary(notes, now, 1, "23:00").mealItems).toEqual([]);
  });
});
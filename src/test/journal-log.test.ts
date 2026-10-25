import { describe, expect, it } from "vitest";
import { FALLBACK_NOTE, journalHeader, noteStamp, parseJournalNote, sampleNotes } from "@/lib/journal-log";

describe("parseJournalNote", () => {
  it("categorizes the fallback note into lunch, dinner and triggers, omitting skipped breakfast", () => {
    const sections = parseJournalNote(FALLBACK_NOTE);
    const titles = sections.map((s) => s.title);
    expect(titles).toContain("Lunch");
    expect(titles).toContain("Dinner");
    expect(titles).toContain("Triggers / Sleep Aids");
    expect(titles).not.toContain("Breakfast");
  });

  it("omits categories that are never mentioned", () => {
    const sections = parseJournalNote("Had a latte at 9 AM.");
    const titles = sections.map((s) => s.title);
    expect(titles).toEqual(["Triggers / Sleep Aids"]);
    expect(sections[0]!.items[0]).toContain("Caffeine: Latte @ 9 AM");
  });

  it("routes late-night items to Midnight Snack / Evening", () => {
    const sections = parseJournalNote("Ate some chocolate at 11:30 PM.");
    expect(sections.map((s) => s.title)).toContain("Midnight Snack / Evening");
  });

  it("extracts alcohol and sleep aids as triggers", () => {
    const sections = parseJournalNote("Glass of wine with dinner, then 3mg melatonin before bed.");
    const triggers = sections.find((s) => s.title === "Triggers / Sleep Aids")!;
    expect(triggers.items.some((i) => i.startsWith("Alcohol:"))).toBe(true);
    expect(triggers.items.some((i) => i.startsWith("Sleep Aid:"))).toBe(true);
    expect(sections.map((s) => s.title)).toContain("Dinner");
  });

  it("returns no sections for an empty note", () => {
    expect(parseJournalNote("   ")).toEqual([]);
  });
});

describe("journalHeader", () => {
  it("formats weekday, date and time", () => {
    const d = new Date(2026, 9, 24, 20, 15); // Saturday, Oct 24, 8:15 PM
    expect(journalHeader(d)).toBe("Saturday, Oct 24 • 8:15 PM");
  });
});

describe("noteStamp", () => {
  const now = new Date(2026, 9, 24, 22, 44);
  it("labels today and yesterday", () => {
    expect(noteStamp(new Date(2026, 9, 24, 13, 45), now)).toBe("Today • 1:45 PM");
    expect(noteStamp(new Date(2026, 9, 23, 21, 20), now)).toBe("Yesterday • 9:20 PM");
  });
  it("falls back to month/day for older notes", () => {
    expect(noteStamp(new Date(2026, 9, 20, 7, 5), now)).toBe("Oct 20 • 7:05 AM");
  });
});

describe("sampleNotes", () => {
  it("provides two pre-populated notes with sections", () => {
    const notes = sampleNotes(new Date());
    expect(notes).toHaveLength(2);
    expect(notes[0]!.sections.map((s) => s.title)).toEqual(["Lunch", "Triggers / Sleep Aids"]);
    expect(notes[1]!.sections.map((s) => s.title)).toEqual(["Dinner", "Midnight Snack / Evening"]);
  });
});

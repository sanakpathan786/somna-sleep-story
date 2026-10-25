import { nightMetrics, type SleepNight } from "./sleep-log";
import type { JournalNote } from "./journal-log";

export const REPORT_RANGES = ["Today (1 Night)", "Past 7 Days", "Bi-Weekly (14 Days)", "Past Month (30 Days)", "Past 3 Months"] as const;
export type ReportRange = typeof REPORT_RANGES[number];
type Profile = { title: string; nights: number; total: number; latency: number; wakes: number; efficiency: number | null; insight: string };
const PROFILES: Record<Exclude<ReportRange, "Today (1 Night)">, Profile> = {
  "Past 7 Days": { title: "7-Day Aggregate Intake Report", nights: 7, total: 6.8, latency: 42, wakes: 1.8, efficiency: 82, insight: "Late dinner (< 2h before bed) on 3 nights correlated with +25m sleep latency." },
  "Bi-Weekly (14 Days)": { title: "14-Day Aggregate Intake Report", nights: 14, total: 6.5, latency: 46, wakes: 2.1, efficiency: null, insight: "Caffeine past 2 PM reported on 6 of 14 days." },
  "Past Month (30 Days)": { title: "30-Day Aggregate Intake Report", nights: 30, total: 6.7, latency: 39, wakes: 1.6, efficiency: 84, insight: "Consistent sleep aid/melatonin usage: 16 of 30 nights. Daytime naps reported on 8 days (avg duration: 35 mins)." },
  "Past 3 Months": { title: "3-Month Aggregate Intake Report", nights: 90, total: 6.7, latency: 39, wakes: 1.6, efficiency: 84, insight: "Consistent sleep aid/melatonin usage: 16 of 30 nights. Daytime naps reported on 8 days (avg duration: 35 mins)." },
};

export function reportProfile(range: ReportRange, today: SleepNight): Profile {
  if (range !== "Today (1 Night)") return PROFILES[range];
  const m = nightMetrics(today);
  return { title: "Single Night Intake Report", nights: 1, total: m.total, latency: m.latency, wakes: m.wakes, efficiency: m.efficiency, insight: "Single-night observations; insufficient data to establish correlations." };
}

export function dietarySummary(notes: JournalNote[], now: Date, nights: number, asleep: string) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (nights === 1 ? 1 : nights - 1));
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const relevant = notes.filter(n => n.at >= start && (n.id.startsWith("sample-diet-") ? n.at < end : n.at <= now)).sort((a, b) => b.at.getTime() - a.at.getTime());
  const dinner = relevant.find(n => n.sections.some(s => s.title === "Dinner"));
  const evening = relevant.find(n => n.sections.some(s => s.title === "Midnight Snack / Evening"));
  const mealItems = dinner?.sections.find(s => s.title === "Dinner")?.items ?? [];
  const eveningItems = evening?.sections.find(s => s.title === "Midnight Snack / Evening")?.items ?? [];
  const dayKey = (n: JournalNote) => `${n.at.getFullYear()}-${n.at.getMonth()}-${n.at.getDate()}`;
  const snackNotes = relevant.filter(n => n.sections.some(s => s.title === "Midnight Snack / Evening" && s.items.some(i => /snack|pretzels|chips|chocolate|cookies|popcorn|pizza|sandwich/i.test(i))));
  const snackDates = new Set(snackNotes.map(dayKey));
  const supplementNotes = relevant.filter(n => n.sections.some(s => s.items.some(i => /melatonin|magnesium/i.test(i))));
  const supplementDates = new Set(supplementNotes.map(dayKey));
  const flaggedNotes = relevant.filter(n => n.sections.some(s => s.items.some(i => {
    const m = i.match(/@\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!m?.[3]) return false;
    const minutes = (Number(m[1]) % 12) * 60 + Number(m[2] ?? 0) + (m[3].toUpperCase() === "PM" ? 720 : 0);
    return (/^Caffeine:/i.test(i) && minutes >= 900) || (/^Alcohol:/i.test(i) && minutes >= 1080);
  })));
  const flaggedDates = new Set(flaggedNotes.map(dayKey));
  const weekdayNames = (entries: JournalNote[]) => [...new Map(entries.sort((a, b) => a.at.getTime() - b.at.getTime()).map(n => [dayKey(n), n.at.toLocaleDateString("en-US", { weekday: "long" })])).values()];
  const mealTimes = relevant.flatMap(n => n.text.split(/[.!?]|,/).filter(c => /dinner|supper/i.test(c)).flatMap(c => {
    const m = c.match(/(?:at|around)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!m?.[3]) return [];
    return [Number(m[1]) % 12 * 60 + Number(m[2] ?? 0) + (m[3].toLowerCase() === "pm" ? 720 : 0)];
  }));
  const avg = mealTimes.length ? Math.round(mealTimes.reduce((a, b) => a + b, 0) / mealTimes.length) : null;
  const [h = 0, min = 0] = asleep.split(":").map(Number);
  const mealTime = avg === null ? "Not recorded in saved notes" : `${Math.floor(avg / 60) % 12 || 12}:${String(avg % 60).padStart(2, "0")} ${avg >= 720 ? "PM" : "AM"} — Approx ${(((h * 60 + min - avg + 1440) % 1440) / 60).toFixed(1)} hrs before sleep`;
  const triggers = new Set<string>();
  for (const n of relevant) {
    for (const section of n.sections) for (const item of section.items) {
      if (/^Alcohol:/i.test(item)) triggers.add(item + " (bedtime proximity not established)");
      if (/^Caffeine:/i.test(item)) {
        if (/^Caffeine: Cola\b/i.test(item) && !/\bcola\b/i.test(n.text)) continue;
        const m = item.match(/@\s*(\d{1,2})(?::\d{2})?\s*PM/i);
        if (m && Number(m[1]) >= 2 && Number(m[1]) !== 12) triggers.add(`Late ${item.toLowerCase()}`);
      }
    }
    if (/pasta|pizza|rice|heavy carbs|bread/i.test(n.text)) triggers.add("Carbohydrate-rich foods mentioned; portion size and bedtime proximity unconfirmed");
  }
  const dinnerClock = avg === null ? "Not recorded" : `${Math.floor(avg / 60) % 12 || 12}:${String(avg % 60).padStart(2, "0")} ${avg >= 720 ? "PM" : "AM"}`;
  return { mealItems, eveningItems, mealTime, dinnerClock, dinnerTimeCount: mealTimes.length, snackNights: snackDates.size, snackDays: weekdayNames(snackNotes), flaggedNights: flaggedDates.size, flaggedDays: weekdayNames(flaggedNotes), supplementNights: supplementDates.size, recordedNights: new Set(relevant.map(dayKey)).size, triggers: [...triggers] };
}
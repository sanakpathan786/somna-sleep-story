export type JournalSection = { icon: string; title: string; items: string[] };
export type JournalNote = { id: string; at: Date; text: string; sections: JournalSection[] };

export const FALLBACK_NOTE =
  "Skipped breakfast. Had a grilled chicken bowl and iced tea at 1:30 PM, pasta for dinner around 7 PM, and a cup of chamomile tea with melatonin at 10 PM.";

const CAFFEINE = /(double espresso|espresso|iced green tea|green tea|black tea|iced tea|coffee|latte|cappuccino|macchiato|matcha|energy drink|soda|cola)/i;
const ALCOHOL = /(glass of wine|wine|beer|whiskey|whisky|vodka|alcohol|cocktail|margarita)/i;
const AID = /(melatonin|magnesium|chamomile(?: tea)?|zolpidem|ambien|trazodone|benadryl|valerian)/i;
const TIME = /(?:at|around)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

const MEAL_ORDER: { title: string; icon: string; match: RegExp }[] = [
  { title: "Breakfast", icon: "🍳", match: /breakfast|brunch/i },
  { title: "Lunch", icon: "☀️", match: /lunch/i },
  { title: "Dinner", icon: "🌙", match: /dinner|supper/i },
  { title: "Midnight Snack / Evening", icon: "🦉", match: /midnight|snack|evening|late[- ]night/i },
];

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const cleanItem = (sentence: string) =>
  sentence
    .replace(/^(had|ate|eaten|took|drank|had a|a cup of|a glass of)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();

function timeLabel(sentence: string): string | null {
  const m = sentence.match(TIME);
  if (!m) return null;
  return `${m[1]}${m[2] ? `:${m[2]}` : ""} ${m[3]!.toUpperCase()}`;
}

function eveningHour(sentence: string): boolean {
  const m = sentence.match(TIME);
  if (!m) return false;
  const hour = Number(m[1]) % 12 + (m[3]!.toLowerCase() === "pm" ? 12 : 0);
  return hour >= 21 || hour < 4;
}

/** Parse a freeform journal note into meal/trigger sections. Only mentioned categories appear. */
export function parseJournalNote(text: string): JournalSection[] {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const meals = new Map<string, string[]>();
  const triggers: string[] = [];

  for (const sentence of sentences) {
    const skipped = /\b(skipped|skip|didn't (eat|have)|no)\b/i.test(sentence);
    const caf = sentence.match(CAFFEINE);
    const alc = sentence.match(ALCOHOL);
    const aid = sentence.match(AID);
    const meal = MEAL_ORDER.find((m) => m.match.test(sentence));
    const at = timeLabel(sentence);

    if (skipped && !meal?.match.test(sentence.replace(/skipped|skip|didn't (eat|have)|no/gi, "")) && !caf && !alc && !aid) {
      continue; // e.g. "Skipped breakfast." — omit the meal entirely
    }

    if (caf) triggers.push(`Caffeine: ${cap(caf[1]!)}${at ? ` @ ${at}` : ""}`);
    if (alc) triggers.push(`Alcohol: ${cap(alc[1]!)}${at ? ` @ ${at}` : ""}`);
    if (aid) triggers.push(`Sleep Aid: ${cap(aid[1]!)}${at ? ` @ ${at}` : ""}`);

    const triggerOnly = (caf || alc || aid) && !meal && !/(bowl|pasta|pizza|salad|rice|steak|chicken|burger|soup|salmon|sandwich|chocolate|cheese|curry|dinner|lunch|breakfast)/i.test(sentence);
    if (triggerOnly) continue;

    let target = meal?.title ?? null;
    if (!target && at) {
      target = eveningHour(sentence) ? "Midnight Snack / Evening" : "Lunch";
    }
    if (!target && /evening|night/i.test(sentence)) target = "Midnight Snack / Evening";
    if (target) {
      const list = meals.get(target) ?? [];
      list.push(cleanItem(sentence));
      meals.set(target, list);
    }
  }

  const sections: JournalSection[] = [];
  for (const m of MEAL_ORDER) {
    const items = meals.get(m.title);
    if (items?.length) sections.push({ icon: m.icon, title: m.title, items });
  }
  if (triggers.length) sections.push({ icon: "⚡", title: "Triggers / Sleep Aids", items: triggers });
  return sections;
}

const timeFmt = (d: Date) => {
  let h = d.getHours();
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${mer}`;
};

/** "Saturday, Oct 24 • 8:15 PM" */
export function journalHeader(now: Date): string {
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${date} • ${timeFmt(now)}`;
}

/** "Today • 8:15 PM" / "Yesterday • 9:20 PM" / "Oct 22 • 7:05 PM" */
export function noteStamp(at: Date, now: Date): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(at)) / 86_400_000);
  const label =
    diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : at.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${label} • ${timeFmt(at)}`;
}

/** Two realistic sample notes so the history feed is visible immediately. */
export function sampleNotes(now: Date): JournalNote[] {
  const today = new Date(now);
  today.setHours(13, 45, 0, 0);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(21, 20, 0, 0);
  return [
    {
      id: "sample-lunch",
      at: today,
      text: "Lunch was a quinoa chicken bowl with an iced green tea at 1:30 PM.",
      sections: [
        { icon: "☀️", title: "Lunch", items: ["Quinoa chicken bowl"] },
        { icon: "⚡", title: "Triggers / Sleep Aids", items: ["Caffeine: Iced Green Tea @ 1:30 PM"] },
      ],
    },
    {
      id: "sample-dinner",
      at: yesterday,
      text: "Grilled salmon & vegetables for dinner. Chamomile tea and 3mg melatonin in the evening.",
      sections: [
        { icon: "🌙", title: "Dinner", items: ["Grilled salmon & vegetables"] },
        { icon: "🦉", title: "Midnight Snack / Evening", items: ["Chamomile tea & 3mg Melatonin"] },
      ],
    },
  ];
}

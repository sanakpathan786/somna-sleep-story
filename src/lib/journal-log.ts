export type JournalSection = { icon: string; title: string; items: string[] };
export type JournalNote = { id: string; at: Date; text: string; sections: JournalSection[] };

export const FALLBACK_NOTE =
  "Skipped breakfast. Had a grilled chicken bowl and iced tea at 1:30 PM, pasta for dinner around 7 PM, and a cup of chamomile tea with melatonin at 10 PM.";

const CAFFEINE = /\b(cold brew|drip coffee|iced matcha|double espresso|espresso|iced green tea|green tea|black tea|iced tea|coffee|latte|cappuccino|macchiato|matcha|energy drink|soda|cola)\b/i;
const ALCOHOL = /(glass of wine|wine|beer|whiskey|whisky|vodka|alcohol|cocktail|margarita)/i;
const AID = /(melatonin|magnesium|chamomile(?: tea)?|zolpidem|ambien|trazodone|benadryl|valerian)/gi;
const FOOD = /(bowl|pasta|pizza|salad|rice|steak|chicken|burger|soup|salmon|sandwich|chocolate|cheese|curry|eggs|toast|oatmeal|yogurt|fruit|snack)/i;
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
    .replace(/^(?:lunch|dinner|breakfast|midnight snack|late snack|evening)\s*:\s*/i, "")
    .replace(/^(and|then|also)\s+/i, "")
    .replace(/^(had|ate|eaten|took|drank|finished|made)\s+/i, "")
    .replace(/^(a|an|some|the|cup of|glass of|a cup of|a glass of)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();

function timeLabel(sentence: string): string | null {
  const m = sentence.match(TIME);
  if (!m?.[3]) return null;
  return `${m[1]}${m[2] ? `:${m[2]}` : ""} ${m[3].toUpperCase()}`;
}

function eveningHour(sentence: string): boolean {
  const m = sentence.match(TIME);
  if (!m?.[3]) return false;
  const hour = Number(m[1]) % 12 + (m[3].toLowerCase() === "pm" ? 12 : 0);
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
  let lastTarget: string | null = null;

  for (const sentence of sentences) {
    for (const clause of sentence.split(/\s*,\s*/)) {
      const skipped = /\b(skipped|skip|didn't (eat|have)|no)\b/i.test(clause);
      const caf = clause.match(CAFFEINE);
      const alc = clause.match(ALCOHOL);
      const aids = [...new Set((clause.match(AID) ?? []).map((a) => cap(a)))];
      const meal = MEAL_ORDER.find((m) => m.match.test(clause));
      const at = timeLabel(clause);

      if (skipped && !caf && !alc && !aids.length) {
        continue; // e.g. "Skipped breakfast." — omit the meal entirely
      }

      if (caf?.[1]) triggers.push(`Caffeine: ${cap(caf[1])}${at ? ` @ ${at}` : ""}`);
      if (alc?.[1]) triggers.push(`Alcohol: ${cap(alc[1])}${at ? ` @ ${at}` : ""}`);
      for (const a of aids) triggers.push(`Sleep Aid: ${a}${at ? ` @ ${at}` : ""}`);

      const triggerOnly = (caf || alc || aids.length) && !meal && !FOOD.test(clause);
      if (triggerOnly) continue;

      let target = meal?.title ?? null;
      if (!target && at) {
        target = eveningHour(clause) ? "Midnight Snack / Evening" : "Lunch";
      }
      if (!target && /evening|night/i.test(clause)) target = "Midnight Snack / Evening";
      if (!target) target = lastTarget;
      if (target) {
        const list = meals.get(target) ?? [];
        list.push(cleanItem(clause));
        meals.set(target, list);
        lastTarget = target;
      }
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

/** Seven rolling local-calendar days, with the supplied weekday meal patterns. */
export function sampleNotes(now: Date): JournalNote[] {
  const patterns = [
    { hour: 13, minute: 15, text: "Lunch: Quinoa grain bowl. Caffeine: Iced green tea at 2:00 PM. Dinner: Salmon & roasted broccoli at 7:00 PM. Sleep Aid: Melatonin 3mg at 9:45 PM." },
    { hour: 21, minute: 30, text: "Lunch: Chicken salad at 12:30 PM. Caffeine: Drip coffee at 2:00 PM. Dinner: Salmon & rice at 7:00 PM. Evening: Herbal tea at 9:30 PM." },
    { hour: 23, minute: 15, text: "Lunch: Turkey sandwich at 1:00 PM. Trigger: Late energy drink at 3:30 PM. Dinner: Pizza slice at 8:30 PM. Late snack: Chips at 11:00 PM." },
    { hour: 22, minute: 15, text: "Lunch: Lentil soup & bread at 1:15 PM. Dinner: Tofu vegetable stir-fry at 6:45 PM. Evening: Chamomile tea at 10:00 PM." },
    { hour: 22, minute: 0, text: "Lunch: Burrito bowl at 1:30 PM. Caffeine: Iced matcha at 2:15 PM. Dinner: Pasta marinara at 7:15 PM. Supplement: Magnesium glycinate at 9:45 PM." },
    { hour: 23, minute: 30, text: "Lunch: Caesar salad at 12:45 PM. Dinner: Sushi at 8:00 PM. Evening Trigger: 1 glass of wine at 9:30 PM. Midnight snack: Pretzels at 11:15 PM." },
    { hour: 19, minute: 30, text: "Dinner: Grilled chicken & sweet potato. Caffeine: Cold brew at 1:00 PM. Evening: Chamomile tea at 10:15 PM." },
  ];
  return Array.from({ length: 7 }, (_, offset) => {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const pattern = patterns[at.getDay()];
    if (!pattern) throw new Error("Missing weekday journal pattern");
    at.setHours(pattern.hour, pattern.minute, 0, 0);
    const sections = parseJournalNote(pattern.text).map(section => ({ ...section, items: section.items.map(item => item.replace("Sleep Aid: Melatonin @", "Sleep Aid: Melatonin 3mg @").replace("Sleep Aid: Magnesium @", "Supplement: Magnesium glycinate @")) }));
    return { id: `sample-diet-${at.getFullYear()}-${at.getMonth()}-${at.getDate()}`, at, text: pattern.text, sections };
  });
}

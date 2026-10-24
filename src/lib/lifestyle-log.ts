import { createContext, useContext } from "react";

export const NAP_TIMINGS = ["Morning (Before 12 PM)", "Early Afternoon (12–2 PM)", "Late Afternoon (2–5 PM)", "Evening (After 5 PM)"] as const;
export const MEDICATIONS = ["Melatonin", "Magnesium", "Prescription Sleep Aid", "ADHD / Stimulant", "Decongestant / Allergy", "Antidepressant"] as const;
export const MEDICATION_TIMINGS = ["Morning", "Afternoon", "Bedtime"] as const;
export const CAFFEINE_CUTOFFS = ["Before 12 PM", "12–3 PM", "3–6 PM", "After 6 PM"] as const;
export const ALCOHOL_CUTOFFS = ["With dinner", "2-3 hrs before bed", "Right before bed"] as const;
export const LIFESTYLE_LIMITS = { nap: { min: 10, max: 120 }, screen: { min: 0, max: 120 }, anxiety: { min: 1, max: 10 } } as const;

export interface LifestyleLog {
  naps: boolean;
  napCount: 1 | 2 | 3;
  napMinutes: number;
  napTiming: typeof NAP_TIMINGS[number];
  medications: string[];
  customMedications: string[];
  medicationTiming: typeof MEDICATION_TIMINGS[number];
  caffeineServings: number;
  caffeineCutoff: typeof CAFFEINE_CUTOFFS[number];
  alcohol: boolean;
  alcoholDrinks: number;
  alcoholCutoff: typeof ALCOHOL_CUTOFFS[number];
  screenMinutes: number;
  anxiety: number;
  apneaFlag: boolean;
}

export const INITIAL_LIFESTYLE: LifestyleLog = {
  naps: false, napCount: 1, napMinutes: 45, napTiming: "Early Afternoon (12–2 PM)",
  medications: [], customMedications: [], medicationTiming: "Bedtime",
  caffeineServings: 3, caffeineCutoff: "12–3 PM", alcohol: false,
  alcoholDrinks: 1, alcoholCutoff: "With dinner", screenMinutes: 75, anxiety: 7, apneaFlag: true,
};

export function napNeedsWarning(log: Pick<LifestyleLog, "naps" | "napMinutes" | "napTiming">) {
  return log.naps && (log.napMinutes > 45 || log.napTiming === NAP_TIMINGS[2] || log.napTiming === NAP_TIMINGS[3]);
}

export function toggleMedication(selected: string[], medication: string) {
  return selected.includes(medication) ? selected.filter(item => item !== medication) : [...selected, medication];
}

export function addCustomMedication(log: LifestyleLog, name: string): LifestyleLog {
  const trimmed = name.trim();
  if (!trimmed) return log;
  const existing = [...MEDICATIONS, ...log.customMedications].find(item => item.toLowerCase() === trimmed.toLowerCase());
  const medication = existing ?? trimmed;
  return {
    ...log,
    customMedications: existing ? log.customMedications : [...log.customMedications, medication],
    medications: log.medications.includes(medication) ? log.medications : [...log.medications, medication],
  };
}

// Available to every floor, including Care Summary, without changing its current report.
export const LifestyleContext = createContext<{ log: LifestyleLog; update: (patch: Partial<LifestyleLog>) => void; addCustom: (name: string) => void } | null>(null);

export function useLifestyleLog() {
  const value = useContext(LifestyleContext);
  if (!value) throw new Error("Lifestyle logging requires the shared Somna provider");
  return value;
}
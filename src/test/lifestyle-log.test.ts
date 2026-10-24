import { describe, expect, it } from "vitest";
import { INITIAL_LIFESTYLE, LIFESTYLE_LIMITS, NAP_TIMINGS, addCustomMedication, napNeedsWarning, toggleMedication } from "../lib/lifestyle-log";

describe("Floor 2 clinical lifestyle rules", () => {
  it("warns only above 45 minutes for early naps", () => {
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: true, napMinutes: 45 })).toBe(false);
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: true, napMinutes: 46 })).toBe(true);
  });
  it("warns for late afternoon naps regardless of duration", () => {
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: true, napMinutes: 10, napTiming: NAP_TIMINGS[2] })).toBe(true);
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: true, napMinutes: 10, napTiming: NAP_TIMINGS[1] })).toBe(false);
  });
  it("warns for evening naps regardless of duration", () => {
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: true, napMinutes: 10, napTiming: NAP_TIMINGS[3] })).toBe(true);
  });
  it("hides nap warnings when no naps were taken", () => {
    expect(napNeedsWarning({ ...INITIAL_LIFESTYLE, naps: false, napMinutes: 120, napTiming: NAP_TIMINGS[3] })).toBe(false);
  });
  it("limits total nap duration to 10–120 minutes", () => { expect(LIFESTYLE_LIMITS.nap).toEqual({ min: 10, max: 120 }); });
  it("limits screen time to 0–120 minutes", () => { expect(LIFESTYLE_LIMITS.screen).toEqual({ min: 0, max: 120 }); });
  it("limits anxiety to 1–10", () => { expect(LIFESTYLE_LIMITS.anxiety).toEqual({ min: 1, max: 10 }); });
  it("selects multiple medications independently and toggles each off", () => {
    const selected = toggleMedication(toggleMedication([], "Melatonin"), "Magnesium");
    expect(selected).toEqual(["Melatonin", "Magnesium"]);
    expect(toggleMedication(selected, "Melatonin")).toEqual(["Magnesium"]);
  });
  it("adds and selects custom medication without duplicate names", () => {
    const added = addCustomMedication(INITIAL_LIFESTYLE, "  Vitamin D  ");
    expect(added.customMedications).toEqual(["Vitamin D"]);
    expect(added.medications).toEqual(["Vitamin D"]);
    expect(addCustomMedication(added, "vitamin d").customMedications).toEqual(["Vitamin D"]);
    expect(addCustomMedication(added, " ")).toBe(added);
  });
});
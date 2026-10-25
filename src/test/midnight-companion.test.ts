import { describe, expect, it } from "vitest";
import { chooseSupportIndex, companionIntent } from "@/lib/midnight-companion";

describe("Midnight Companion conversation rules", () => {
  it.each(["exam", "test", "school", "fail", "pressure"])("recognizes %s concerns", keyword => {
    expect(companionIntent(`I am worried about ${keyword}`)).toBe("exam");
  });
  it.each(["My mind is racing tonight", "I can't sleep", "I'm awake", "I can’t sleep"])("grounds sleeplessness: %s", text => {
    expect(companionIntent(text)).toBe("grounding");
  });
  it.each([
    ["My mind is racing", "breathing"],
    ["Play a calming trivia quiz", "fact"],
    ["Tell me a sleepy story", "story"],
  ] as const)("dispatches suggestion %s", (text, intent) => {
    expect(companionIntent(text)).toBe(intent);
  });
  it("continues peaceful facts when the user agrees", () => {
    expect(companionIntent("Yes please", "fact")).toBe("fact");
    expect(companionIntent("Yes please", "story")).toBe("support");
  });
  it("never chooses the previous default, including after all three have been used", () => {
    for (const previous of [0, 1, 2]) {
      for (const random of [0, 0.25, 0.5, 0.99]) {
        expect(chooseSupportIndex(previous, random)).not.toBe(previous);
      }
    }
  });
  it("can choose each of the three defaults", () => {
    expect([0, 0.4, 0.9].map(random => chooseSupportIndex(null, random))).toEqual([0, 1, 2]);
  });
});
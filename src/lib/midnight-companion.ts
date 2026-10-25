export type CompanionIntent = "exam" | "grounding" | "fact" | "story" | "breathing" | "support";
export type CompanionReply = { text: string; choices?: string[] };

export const SUPPORTIVE_REPLIES = [
  "Your mind has been running all day, so it makes sense it takes time to power down. You don't have to solve tomorrow tonight.",
  "Take a slow, deep breath in... and let it out softly. Tonight's only job is being kind to yourself and letting your body rest.",
  "Whatever is on your plate will still be there tomorrow, but you'll carry it much better after some rest. Just let yourself be still for a moment.",
];

const FACTS = [
  "Did you know that sea otters hold hands while they sleep so they don't drift away in the currents? 🦦 Would you like another peaceful fact?",
  "Moonlight is sunlight reflected softly from the Moon's surface. 🌙 Would you like another peaceful fact?",
  "Some trees share nutrients through networks of fungi beneath the forest floor. 🌲 Would you like another peaceful fact?",
  "On Venus, one rotation takes longer than a journey around the Sun. ✨ Would you like another peaceful fact?",
];

export function companionIntent(raw: string, previousIntent?: CompanionIntent): CompanionIntent {
  const text = raw.toLowerCase().replace(/’/g, "'").trim();
  // Explicit experiences take priority; ordinary worry messages never become quizzes.
  if (text === "my mind is racing" || /\bbreath(?:e|ing)?\b|4[-–]7[-–]8/.test(text)) return "breathing";
  if (/\b(?:exam\w*|tests?|school|fail\w*|pressure)\b/.test(text)) return "exam";
  if (/\b(?:racing|awake|insomnia)\b|can(?:not|'t| not) sleep/.test(text)) return "grounding";
  if (/\b(?:trivia|quiz|peaceful fact|another fact)\b/.test(text)) return "fact";
  if (/\b(?:story|stories)\b/.test(text)) return "story";
  if (previousIntent === "fact" && /^(?:yes|yeah|sure|please|another|one more)(?:\b|$)/.test(text)) return "fact";
  return "support";
}

export function chooseSupportIndex(previousIndex: number | null, random = Math.random()): number {
  const available = SUPPORTIVE_REPLIES.map((_, index) => index).filter(index => index !== previousIndex);
  return available[Math.min(available.length - 1, Math.max(0, Math.floor(random * available.length)))] ?? 0;
}

export function companionReply(intent: CompanionIntent, supportIndex = 0, factIndex = 0): CompanionReply {
  switch (intent) {
    case "exam": return { text: "Exams and expectations feel magnified at night when the world is quiet. You've worked harder than your tired mind is letting you believe right now. Let tonight be for resting—your brain will be much sharper once you've slept." };
    case "grounding": return { text: "It's okay that sleep hasn't come yet; fighting it only makes the mind louder. Try unclenching your jaw, letting your shoulders drop, and just resting your eyes without pressure to sleep." };
    case "breathing": return { text: "Let's do a quick breathing reset together. Breathe in gently for 4 seconds... hold for 7... and exhale slowly like a sigh for 8. Let's do that once more." };
    case "story": return { text: "Imagine a quiet cabin nestled deep in a pine forest. Soft, gentle rain is tapping against the window pane, and the air smells like fresh cedar. Wrapped in a warm blanket, there is nothing in the world you need to do right now." };
    case "fact": return { text: FACTS[factIndex % FACTS.length] ?? FACTS[0] ?? "", choices: ["Another peaceful fact", "Tell me a sleepy story"] };
    case "support": return { text: SUPPORTIVE_REPLIES[supportIndex] ?? SUPPORTIVE_REPLIES[0] ?? "" };
  }
}
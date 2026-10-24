import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Somna — AI Sleep Tracker for Insomnia Care" },
      { name: "description", content: "Track sleep, habits and triggers, then share a clinical summary with your physician." },
      { property: "og:title", content: "Somna — AI Sleep Tracker" },
      { property: "og:description", content: "A bridge between insomnia patients and their physicians." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Somna,
});

const FLOORS = [
  { n: 5, name: "Midnight Companion" },
  { n: 4, name: "Doctor's Pass" },
  { n: 3, name: "Habit Journal" },
  { n: 2, name: "Lifestyle" },
  { n: 1, name: "Sleep Chronology" },
];

function Somna() {
  const [floor, setFloor] = useState(1);
  const [doors, setDoors] = useState(true);
  useEffect(() => { const t = setTimeout(() => setDoors(false), 2200); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen md:pl-28 pb-24 md:pb-0">
      {doors && (
        <div className="fixed inset-0 z-50 flex pointer-events-none no-print">
          <div className="door-left w-1/2 h-full bg-surface border-r-2 border-primary/60 flex items-center justify-end pr-4">
            <span className="font-display text-4xl text-primary text-glow">Som</span>
          </div>
          <div className="door-right w-1/2 h-full bg-surface border-l-2 border-primary/60 flex items-center pl-4">
            <span className="font-display text-4xl text-primary text-glow">na</span>
          </div>
        </div>
      )}

      <nav className="no-print fixed z-40 bottom-0 inset-x-0 md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:w-28 bg-surface/95 backdrop-blur border-t md:border-t-0 md:border-r flex md:flex-col items-center justify-around md:justify-center gap-2 md:gap-5 p-3">
        <div className="hidden md:block font-display text-primary text-xl mb-4">Somna</div>
        {FLOORS.map((f) => (
          <button key={f.n} onClick={() => setFloor(f.n)} aria-label={`Floor ${f.n}: ${f.name}`}
            className={`h-12 w-12 rounded-full border-2 font-display text-lg transition-all ${floor === f.n ? "bg-primary text-primary-foreground border-primary glow" : "border-border text-lavender hover:border-primary/60"}`}>
            {f.n}
          </button>
        ))}
      </nav>

      <header className="no-print px-5 pt-6 max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Floor {floor}</p>
          <h1 className="font-display text-2xl text-foreground">{FLOORS.find((f) => f.n === floor)!.name}</h1>
        </div>
        <div className="rounded-lg border border-primary/50 px-3 py-1 font-mono text-primary text-glow text-xl">{floor}</div>
      </header>

      <main key={floor} className="px-5 py-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {floor === 1 && <Floor1 />}
        {floor === 2 && <Floor2 />}
        {floor === 3 && <Floor3 />}
        {floor === 4 && <Floor4 />}
        {floor === 5 && <Floor5 />}
      </main>
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border p-5 mb-4">
      {title && <h2 className="text-sm uppercase tracking-wider text-lavender mb-3">{title}</h2>}
      {children}
    </section>
  );
}

function Slider({ label, value, set, min, max, display }: { label: string; value: number; set: (n: number) => void; min: number; max: number; display?: string }) {
  return (
    <label className="block mb-4">
      <div className="flex justify-between text-sm mb-1"><span>{label}</span><span className="text-primary font-semibold">{display ?? value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="w-full" />
    </label>
  );
}

function Counter({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => set(Math.max(0, value - 1))} className="h-9 w-9 rounded-full bg-secondary text-lg">−</button>
        <span className="w-6 text-center text-xl text-primary font-semibold">{value}</span>
        <button onClick={() => set(value + 1)} className="h-9 w-9 rounded-full bg-secondary text-lg">+</button>
      </div>
    </div>
  );
}

function Check({ label, checked, set }: { label: string; checked: boolean; set: (b: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
      <span>{label}</span>
    </label>
  );
}

const inputCls = "w-full rounded-lg bg-secondary border px-3 py-2 text-foreground";

const WEEK = [
  { d: "M", lat: 42, sleep: 5.8 }, { d: "T", lat: 65, sleep: 5.1 }, { d: "W", lat: 38, sleep: 6.2 },
  { d: "T", lat: 55, sleep: 5.5 }, { d: "F", lat: 30, sleep: 6.6 }, { d: "S", lat: 51, sleep: 5.9 }, { d: "S", lat: 55, sleep: 5.4 },
];

function Floor1() {
  const [bed, setBed] = useState("22:45");
  const [asleep, setAsleep] = useState("23:33");
  const [wake, setWake] = useState("06:20");
  const [aw, setAw] = useState(2);
  const [energy, setEnergy] = useState(4);
  const [fog, setFog] = useState(2);
  const [head, setHead] = useState(true);
  const fogLabels = ["None", "Mild", "Moderate", "Severe"];
  const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const latency = (mins(asleep) - mins(bed) + 1440) % 1440;
  const total = ((mins(wake) - mins(asleep) + 1440) % 1440) / 60;
  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[["Latency", `${latency}m`], ["Asleep", `${total.toFixed(1)}h`], ["Wakes", aw]].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-card border p-3 text-center">
            <p className="text-xs text-muted-foreground">{k}</p><p className="text-2xl font-display text-primary">{v}</p>
          </div>
        ))}
      </div>
      <Card title="7-day sleep latency (min)">
        <div className="flex items-end justify-between h-28 gap-2">
          {WEEK.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${w.lat * 1.4}px` }} />
              <span className="text-xs text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Last night">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[["Into bed", bed, setBed], ["Fell asleep", asleep, setAsleep], ["Final wake", wake, setWake]].map(([l, v, s]) => (
            <label key={l as string} className="text-xs text-muted-foreground">{l as string}
              <input type="time" value={v as string} onChange={(e) => (s as (x: string) => void)(e.target.value)} className={inputCls + " mt-1"} />
            </label>
          ))}
        </div>
        <Counter label="Middle-of-night awakenings" value={aw} set={setAw} />
        <Slider label="Morning energy level" value={energy} set={setEnergy} min={1} max={10} />
        <Slider label="Daytime brain fog / fatigue" value={fog} set={setFog} min={0} max={3} display={fogLabels[fog]} />
        <Check label="Did you experience morning headaches or dry mouth?" checked={head} set={setHead} />
      </Card>
    </>
  );
}

function Floor2() {
  const [cups, setCups] = useState(3);
  const [cut, setCut] = useState("14:00");
  const [alc, setAlc] = useState(false);
  const [alcTime, setAlcTime] = useState("Evening (6–9 PM)");
  const [screen, setScreen] = useState(75);
  const [anx, setAnx] = useState(7);
  const [snore, setSnore] = useState(true);
  return (
    <>
      <Card title="Caffeine">
        <Counter label="Cups today" value={cups} set={setCups} />
        <label className="text-sm">Cut-off time of last cup
          <select value={cut} onChange={(e) => setCut(e.target.value)} className={inputCls + " mt-1"}>
            {["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        {+cut.slice(0, 2) >= 14 && <p className="text-xs text-primary mt-2">⚠ Caffeine after 2 PM may delay sleep onset.</p>}
      </Card>
      <Card title="Alcohol">
        <div className="flex gap-2 mb-3">
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => setAlc(v)} className={`flex-1 py-2 rounded-lg border ${alc === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary"}`}>{v ? "Yes" : "No"}</button>
          ))}
        </div>
        {alc && (
          <select value={alcTime} onChange={(e) => setAlcTime(e.target.value)} className={inputCls}>
            {["Afternoon", "Evening (6–9 PM)", "Within 2h of bed"].map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </Card>
      <Card title="Evening wind-down">
        <Slider label="Pre-bed screen time" value={screen} set={setScreen} min={0} max={120} display={screen >= 120 ? "120+ min" : `${screen} min`} />
        <Slider label="Racing mind / bedtime anxiety" value={anx} set={setAnx} min={1} max={10} />
      </Card>
      <Card title="Apnea risk">
        <Check label="Loud snoring or waking up gasping" checked={snore} set={setSnore} />
        {snore && <p className="text-xs text-primary mt-2">Flagged for your physician's review.</p>}
      </Card>
    </>
  );
}

const SAMPLE_NOTE = "Had a double espresso at 2 PM, pasta with chicken at 7:30 PM, took 5mg melatonin at 10 PM.";

function extractTags(text: string) {
  const tags: { k: string; v: string }[] = [];
  const t = text.toLowerCase();
  const caf = text.match(/(double espresso|espresso|coffee|latte|tea|energy drink)[^,.]*?(at \d{1,2}(:\d{2})?\s?(am|pm))?/i);
  if (caf) tags.push({ k: "Caffeine", v: caf[0].replace(/^had an? /i, "").replace(" at ", " @ ") });
  const foods = ["pasta", "chicken", "pizza", "salad", "rice", "steak", "chocolate", "cheese", "curry"].filter((f) => t.includes(f));
  if (foods.length) tags.push({ k: "Food", v: foods.map((f) => f[0].toUpperCase() + f.slice(1)).join(" & ") });
  const aid = text.match(/(\d+\s?mg)?\s?(melatonin|zolpidem|ambien|trazodone|benadryl|magnesium)/i);
  if (aid) tags.push({ k: "Sleep Aid Detected", v: aid[0].trim() });
  if (/wine|beer|whiskey|alcohol|cocktail/.test(t)) tags.push({ k: "Alcohol", v: "Detected" });
  return tags;
}

function Floor3() {
  const [rec, setRec] = useState(false);
  const [note, setNote] = useState(SAMPLE_NOTE);
  const toggle = () => {
    if (rec) {
      setRec(false);
      setNote((n) => n + " Glass of red wine at 9 PM.");
    } else setRec(true);
  };
  const tags = extractTags(note);
  return (
    <>
      <Card>
        <div className="flex flex-col items-center py-4">
          <button onClick={toggle} aria-label="Record Daily Habit Note"
            className={`h-28 w-28 rounded-full flex items-center justify-center text-4xl transition-all ${rec ? "bg-primary text-primary-foreground glow scale-105 animate-pulse" : "bg-secondary border-2 border-primary text-primary"}`}>
            🎙
          </button>
          <p className="mt-3 font-semibold">{rec ? "Listening… tap to stop" : "Record Daily Habit Note"}</p>
          <div className="flex items-center gap-1 h-12 mt-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={`w-1 rounded-full bg-primary ${rec ? "wave-bar" : "opacity-30"}`}
                style={{ height: `${20 + ((i * 37) % 28)}px`, animationDelay: `${(i % 6) * 0.12}s` }} />
            ))}
          </div>
        </div>
      </Card>
      <Card title="Transcribed note">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className={inputCls} />
        <p className="text-xs text-muted-foreground mt-4 mb-2">✨ AI-extracted tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.k} className={`rounded-full px-3 py-1 text-xs border ${t.k.startsWith("Sleep") ? "border-primary text-primary" : "border-lavender/50 text-lavender"}`}>
              <b>{t.k}:</b> {t.v}
            </span>
          ))}
          {!tags.length && <span className="text-xs text-muted-foreground">No items detected yet.</span>}
        </div>
      </Card>
    </>
  );
}

const RANGES: Record<string, { lat: number; aw: number; tst: number; n: number }> = {
  "Today": { lat: 48, aw: 2, tst: 6.8, n: 1 },
  "Past 7 Days": { lat: 48, aw: 2.4, tst: 5.8, n: 7 },
  "Bi-Weekly (14 Days)": { lat: 51, aw: 2.6, tst: 5.7, n: 14 },
  "Past Month (30 Days)": { lat: 54, aw: 2.8, tst: 5.5, n: 30 },
  "Past 3 Months": { lat: 58, aw: 3.1, tst: 5.3, n: 90 },
};

function Floor4() {
  const [range, setRange] = useState("Past 7 Days");
  const r = RANGES[range];
  return (
    <>
      <div className="no-print mb-4">
        <select value={range} onChange={(e) => setRange(e.target.value)} className={inputCls}>
          {Object.keys(RANGES).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <article className="print-area rounded-xl bg-paper text-paper-foreground p-6 shadow-2xl font-sans">
        <div className="flex justify-between border-b-2 border-paper-foreground/80 pb-3 mb-4">
          <div>
            <h2 className="font-display text-xl">Sleep Clinical Intake Summary</h2>
            <p className="text-xs opacity-70">Patient-reported · Somna · {range} ({r.n} night{r.n > 1 ? "s" : ""})</p>
          </div>
          <div className="text-right text-xs opacity-70">Patient: J. Doe<br />DOB: 03/14/1986</div>
        </div>
        <Section t="A. Sleep Chronology Averages">
          <ul className="grid grid-cols-2 gap-y-1">
            <li>Avg sleep latency: <b>{r.lat} mins</b></li>
            <li>Avg awakenings: <b>{r.aw}/night</b></li>
            <li>Avg total sleep: <b>{r.tst} h</b></li>
            <li>Sleep efficiency: <b>{Math.round(r.tst / 8 * 100)}%</b></li>
          </ul>
        </Section>
        <Section t="B. Key Identified Lifestyle Correlations">
          <ul className="list-disc pl-5 space-y-1">
            <li>Screen time &gt; 60m correlates with <b>+35m</b> to fall asleep.</li>
            <li>Caffeine after 2 PM associated with <b>+1.1</b> awakenings/night.</li>
            <li>Bedtime anxiety ≥ 7 on <b>{Math.round(r.n * 0.57)}</b> of {r.n} nights.</li>
          </ul>
        </Section>
        <Section t="C. Daytime Functioning & Sleep Aid History">
          <p>Avg morning energy 4.2/10; moderate brain fog reported. Morning headaches/dry mouth on {Math.round(r.n * 0.43)} nights. Melatonin 5mg used {Math.round(r.n * 0.6)}× in period.</p>
        </Section>
        <Section t="D. Apnea Screening Note for Physician">
          <p className="border-l-4 border-primary pl-3">Patient reports loud snoring / waking up gasping plus morning headaches and dry mouth. <b>Consider STOP-BANG screening and polysomnography referral.</b></p>
        </Section>
        <p className="text-[10px] opacity-60 mt-4">Self-reported data. Not a diagnosis.</p>
      </article>
      <button onClick={() => window.print()} className="no-print w-full mt-5 py-4 rounded-xl bg-primary text-primary-foreground font-bold glow">
        Export PDF / Print for Physician
      </button>
    </>
  );
}

function Section({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 text-sm">
      <h3 className="font-bold uppercase text-xs tracking-wider mb-1 opacity-80">{t}</h3>
      {children}
    </div>
  );
}

type Msg = { from: "ai" | "me"; text: string };

function reply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("racing") || t.includes("anx") || t.includes("worry")) return "That sounds exhausting. Let's slow things down together: breathe in for 4… hold for 7… out for 8. Try it three times. Whatever's on your mind can wait on paper until morning — want to jot one worry down and set it aside?";
  if (t.includes("trivia") || t.includes("quiz")) return "Gentle trivia 🌙 — Which animal can sleep standing up, and only needs about 3 hours a day? (Hint: it gallops.) Take your time, no rush.";
  if (t.includes("horse")) return "Yes — horses! 🐴 Lovely. Next one: what's the name for a group of owls? (Hint: it sounds wise.)";
  if (t.includes("parliament")) return "A parliament of owls — perfect. Let your eyes rest a moment. You're doing great.";
  if (t.includes("story")) return "Once, in a quiet valley, a lighthouse keeper climbed the stairs each night, one slow step at a time… the lamp hummed softly, the waves rolled in and out, in and out… and the keeper's eyes grew heavy, as heavy as the warm wool blanket on the chair…";
  if (t.includes("can't sleep") || t.includes("awake")) return "Being awake at night is so frustrating. If it's been more than 20 minutes, it's okay to get up, keep lights dim, and do something calm until you feel sleepy again. I'm here with you.";
  return "Thank you for sharing that. You're not alone at this hour. Would a breathing exercise, a gentle story, or a little trivia help right now?";
}

function Floor5() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Hi, I'm here. It's okay to be awake. How are you feeling right now?" }]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { from: "ai", text: reply(text) }]), 700);
  };
  return (
    <>
      <div className="rounded-full border border-primary/60 bg-primary/10 text-primary text-xs px-4 py-2 mb-4 text-center">
        🌙 Compassionate AI companion — Non-medical support only.
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {["My mind is racing", "Play a calming trivia quiz", "Tell me a sleepy story"].map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full bg-secondary border px-3 py-2 text-sm hover:border-primary">{q}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-card border p-4 h-[50vh] overflow-y-auto space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.text}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 mt-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type softly…" className={inputCls} />
        <button className="px-5 rounded-lg bg-primary text-primary-foreground font-semibold">Send</button>
      </form>
    </>
  );
}

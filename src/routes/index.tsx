import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Somna — Your Midnight Companion for Insomnia Care" },
      { name: "description", content: "Track sleep, habits and triggers, then share a clinical summary with your physician." },
      { property: "og:title", content: "Somna — Your Midnight Companion" },
      { property: "og:description", content: "A bridge between insomnia patients and their physicians." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Somna,
});

const FLOORS = [
  { n: 5, name: "Midnight Companion" },
  { n: 4, name: "Care Summary", sub: "Doctor's Pass" },
  { n: 3, name: "Diet & Habit Journal" },
  { n: 2, name: "Caffeine & Lifestyle Factors" },
  { n: 1, name: "Sleep Chronology & Recovery" },
];

type Phase = "closed" | "opening" | "done";

function Somna() {
  const [floor, setFloor] = useState(0); // 0 = lobby
  const [phase, setPhase] = useState<Phase>("closed");
  useEffect(() => {
    if (phase === "closed") { const t = setTimeout(() => setPhase("opening"), 3500); return () => clearTimeout(t); }
    if (phase === "opening") { const t = setTimeout(() => setPhase("done"), 2300); return () => clearTimeout(t); }
    return undefined;
  }, [phase]);

  const current = FLOORS.find((f) => f.n === floor);

  return (
    <div className="min-h-screen bg-background sm:py-6">
      <div className="print-shell relative mx-auto max-w-md min-h-screen sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:border bg-background overflow-hidden">
        {phase !== "done" && <Doors phase={phase} skip={() => setPhase("done")} />}

        {floor === 0 ? (
          <Lobby go={setFloor} />
        ) : (
          <>
            <header className="no-print px-5 pt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Floor {floor}</p>
                <h1 className="font-display text-xl text-foreground">{current!.name}</h1>
              </div>
              <div className="rounded-md border border-primary/40 bg-card px-3 py-1 font-mono text-primary text-glow text-lg">{floor}</div>
            </header>
            <main key={floor} className="px-5 pt-5 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {floor === 1 && <Floor1 />}
              {floor === 2 && <Floor2 />}
              {floor === 3 && <Floor3 />}
              {floor === 4 && <Floor4 />}
              {floor === 5 && <Floor5 />}
            </main>
            <Dock floor={floor} go={setFloor} />
          </>
        )}
      </div>
    </div>
  );
}

function Doors({ phase, skip }: { phase: Phase; skip: () => void }) {
  const open = phase === "opening";
  return (
    <div className="no-print absolute inset-0 z-50 flex">
      <div className={`w-1/2 h-full bg-door border-r border-border ${open ? "door-open-left" : ""}`} />
      <div className={`w-1/2 h-full bg-door border-l border-border ${open ? "door-open-right" : ""}`} />
      <div className={`absolute inset-0 flex flex-col items-center pointer-events-none transition-opacity duration-1000 ${open ? "opacity-0" : "opacity-100"}`}>
        <div className="mt-16 flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`font-mono text-xs ${n === 1 ? "text-primary text-glow flicker" : "text-muted-foreground/40"}`}>{n}</span>
          ))}
          <span className="ml-1 text-primary text-glow text-xs">▲</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-display text-5xl tracking-[0.4em] pl-[0.4em] text-primary text-glow">SOMNA</h1>
          <p className="mt-4 text-sm tracking-[0.2em] text-muted-foreground">Your Midnight Companion</p>
        </div>
      </div>
      {!open && (
        <button onClick={skip} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase text-muted-foreground/70 hover:text-primary">
          Tap to skip
        </button>
      )}
    </div>
  );
}

function Lobby({ go }: { go: (n: number) => void }) {
  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center px-6 py-10 animate-in fade-in duration-700">
      <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Lobby</p>
      <h1 className="font-display text-3xl tracking-[0.3em] text-primary text-glow mt-1 mb-8">SOMNA</h1>
      <div className="w-full rounded-[2rem] border bg-card p-6">
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-lavender mb-5">Elevator Control Panel</p>
        <div className="space-y-4">
          {FLOORS.map((f) => (
            <button key={f.n} onClick={() => go(f.n)} className="group w-full flex items-center gap-4 text-left">
              <span className="h-14 w-14 shrink-0 rounded-full border-2 border-primary/50 bg-background flex items-center justify-center font-display text-xl text-primary group-hover:glow group-hover:border-primary transition-all">
                {f.n}
              </span>
              <span>
                <span className="block text-sm text-foreground">{f.name}</span>
                <span className="block text-xs text-muted-foreground">{f.sub ?? `Floor ${f.n}`}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dock({ floor, go }: { floor: number; go: (n: number) => void }) {
  return (
    <nav className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[24rem] rounded-full border bg-card/95 backdrop-blur px-3 py-2 flex items-center justify-between">
      <button onClick={() => go(0)} className="h-10 px-3 rounded-full text-xs uppercase tracking-wider text-lavender hover:text-primary">Lobby</button>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => go(n)} aria-label={`Floor ${n}`}
          className={`h-10 w-10 rounded-full border font-display transition-all ${floor === n ? "bg-primary text-primary-foreground border-primary glow" : "text-muted-foreground hover:border-primary/60"}`}>
          {n}
        </button>
      ))}
    </nav>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border p-5 mb-4">
      {title && <h2 className="text-xs uppercase tracking-[0.2em] text-lavender mb-4">{title}</h2>}
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
        <button onClick={() => set(Math.max(0, value - 1))} className="h-9 w-9 rounded-full bg-secondary border text-lg">−</button>
        <span className="w-6 text-center text-xl text-primary font-semibold">{value}</span>
        <button onClick={() => set(value + 1)} className="h-9 w-9 rounded-full bg-secondary border text-lg">+</button>
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

const inputCls = "w-full rounded-lg bg-field border border-input px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60";

const WEEK = [
  { d: "M", lat: 42 }, { d: "T", lat: 65 }, { d: "W", lat: 38 },
  { d: "T", lat: 55 }, { d: "F", lat: 30 }, { d: "S", lat: 51 }, { d: "S", lat: 55 },
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
  const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };
  const latency = (mins(asleep) - mins(bed) + 1440) % 1440;
  const total = ((mins(wake) - mins(asleep) + 1440) % 1440) / 60;
  const inBed = ((mins(wake) - mins(bed) + 1440) % 1440) / 60;
  const eff = inBed ? Math.round((total / inBed) * 100) : 0;
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">7-day averages</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[["Latency", "48m"], ["Sleep", "5.8h"], ["Wakes", "2.4"], ["Efficiency", "78%"]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-card border p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{k}</p><p className="text-lg font-display text-primary">{v}</p>
          </div>
        ))}
      </div>
      <Card title="7-day sleep latency (min)">
        <div className="flex items-end justify-between h-28 gap-2">
          {WEEK.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{w.lat}</span>
              <div className={`w-full rounded-t-md ${i === 6 ? "bg-primary" : "bg-lavender/40"}`} style={{ height: `${w.lat * 1.2}px` }} />
              <span className="text-xs text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Last night">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {([["Into bed", bed, setBed], ["Fell asleep", asleep, setAsleep], ["Final wake", wake, setWake]] as const).map(([l, v, s]) => (
            <label key={l} className="text-xs text-muted-foreground">{l}
              <input type="time" value={v} onChange={(e) => s(e.target.value)} className={inputCls + " mt-1 px-2 text-sm"} />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Latency <span className="text-primary">{latency}m</span> · Asleep <span className="text-primary">{total.toFixed(1)}h</span> · Efficiency <span className="text-primary">{eff}%</span></p>
        <Counter label="Middle-of-night awakenings" value={aw} set={setAw} />
        <Slider label="Morning energy level" value={energy} set={setEnergy} min={1} max={10} />
        <Slider label="Daytime fatigue / brain fog" value={fog} set={setFog} min={0} max={3} display={fogLabels[fog]} />
        <Check label="Experienced morning headaches or dry mouth" checked={head} set={setHead} />
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
        {+cut.slice(0, 2) >= 14 && <p className="text-xs text-primary mt-2">Caffeine after 2 PM may delay sleep onset.</p>}
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
        <Slider label="Screen time before bed" value={screen} set={setScreen} min={0} max={120} display={screen >= 120 ? "120+ min" : `${screen} min`} />
        <Slider label="Racing mind / bedtime anxiety" value={anx} set={setAnx} min={1} max={10} />
      </Card>
      <Card title="Apnea risk">
        <Check label="Loud snoring or waking up gasping" checked={snore} set={setSnore} />
        {snore && <p className="text-xs text-primary mt-2">Flagged for your physician's review.</p>}
      </Card>
    </>
  );
}

const FALLBACK_NOTE = "Had a double espresso at 1:30 PM, grilled chicken salad at 7 PM, and took 3mg melatonin at 10 PM";

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function extractTags(text: string) {
  const tags: { k: string; v: string }[] = [];
  const t = text.toLowerCase();
  const caf = t.match(/(espresso|coffee|latte|cappuccino|tea|energy drink|soda|cola)/);
  if (caf) {
    const time = text.slice(caf.index).match(/at (\d{1,2}(:\d{2})?\s?(am|pm))/i);
    tags.push({ k: "Caffeine", v: cap(caf[1]!) + (time ? ` @ ${time[1]!.toUpperCase()}` : "") });
  }
  const dishes = ["chicken salad", "pasta", "pizza", "salad", "rice", "steak", "chocolate", "cheese", "curry", "chicken", "burger", "soup"];
  const foods: string[] = [];
  for (const d of dishes) if (t.includes(d) && !foods.some((f) => f.includes(d))) foods.push(d);
  if (foods.length) tags.push({ k: "Food", v: foods.map(cap).join(", ") });
  const aid = t.match(/(melatonin|zolpidem|ambien|trazodone|benadryl|magnesium)/);
  if (aid) tags.push({ k: "Sleep Aid", v: cap(aid[1]!) });
  if (/wine|beer|whiskey|alcohol|cocktail/.test(t)) tags.push({ k: "Alcohol", v: "Detected" });
  return tags;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Floor3() {
  const [rec, setRec] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const recRef = useRef<any>(null);

  const simulate = (why: string) => {
    setRec(false);
    setStatus(why + " — showing a sample note.");
    setNote(FALLBACK_NOTE);
  };

  const toggle = () => {
    if (rec) { recRef.current?.stop(); setRec(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return simulate("Voice input isn't available in this browser");
    try {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "en-US";
      const base = note ? note.trim() + " " : "";
      r.onresult = (e: any) => {
        let txt = "";
        for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
        setNote(base + txt);
      };
      r.onerror = (e: any) => simulate(e.error === "not-allowed" ? "Microphone access was denied" : "Voice input unavailable");
      r.onend = () => setRec(false);
      recRef.current = r;
      r.start();
      setStatus("Listening… speak naturally.");
      setRec(true);
    } catch { simulate("Voice input unavailable"); }
  };

  useEffect(() => () => recRef.current?.stop(), []);
  const tags = extractTags(note);

  return (
    <>
      <Card>
        <div className="flex flex-col items-center py-3">
          <button onClick={toggle} aria-label="Record Daily Habit Note"
            className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${rec ? "bg-primary text-primary-foreground glow scale-105" : "bg-background border-2 border-primary/60 text-primary"}`}>
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          </button>
          <p className="mt-3 text-sm">{rec ? "Listening… tap to stop" : "Record Daily Habit Note"}</p>
          <div className="flex items-center gap-1 h-10 mt-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={`w-1 rounded-full bg-primary ${rec ? "wave-bar" : "opacity-20"}`}
                style={{ height: `${16 + ((i * 37) % 24)}px`, animationDelay: `${(i % 6) * 0.12}s` }} />
            ))}
          </div>
          {status && <p className="text-xs text-muted-foreground mt-2 text-center">{status}</p>}
        </div>
      </Card>
      <Card title="Journal entry">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          placeholder="Type or speak what you ate, drank or took today…" className={inputCls + " text-sm leading-relaxed"} />
        <p className="text-xs text-muted-foreground mt-4 mb-2">Smart tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.k} className={`rounded-full px-3 py-1 text-xs border ${t.k === "Sleep Aid" ? "border-primary/60 text-primary" : "border-lavender/40 text-lavender"}`}>
              <b>{t.k}:</b> {t.v}
            </span>
          ))}
          {!tags.length && <span className="text-xs text-muted-foreground">No items detected yet.</span>}
        </div>
      </Card>
    </>
  );
}

const RANGES: Record<string, { lat: number; aw: number; tst: number; eff: number; n: number }> = {
  "Today": { lat: 48, aw: 2, tst: 6.8, eff: 81, n: 1 },
  "Past 7 Days": { lat: 48, aw: 2.4, tst: 5.8, eff: 78, n: 7 },
  "Bi-Weekly (14 Days)": { lat: 51, aw: 2.6, tst: 5.7, eff: 76, n: 14 },
  "Past Month (30 Days)": { lat: 54, aw: 2.8, tst: 5.5, eff: 74, n: 30 },
  "Past 3 Months": { lat: 58, aw: 3.1, tst: 5.3, eff: 71, n: 90 },
};

function Floor4() {
  const [range, setRange] = useState("Past 7 Days");
  const r = RANGES[range]!;
  return (
    <>
      <div className="no-print mb-4">
        <select value={range} onChange={(e) => setRange(e.target.value)} className={inputCls}>
          {Object.keys(RANGES).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <article className="print-area rounded-xl bg-paper text-paper-foreground p-5 font-sans">
        <div className="flex justify-between border-b-2 border-paper-foreground/80 pb-3 mb-4">
          <div>
            <h2 className="font-display text-lg">Sleep Clinical Intake Summary</h2>
            <p className="text-[11px] opacity-70">Patient-reported · Somna · {range} ({r.n} night{r.n > 1 ? "s" : ""})</p>
          </div>
          <div className="text-right text-[11px] opacity-70">Patient: J. Doe<br />DOB: 03/14/1986</div>
        </div>
        <Section t="A. Sleep Chronology Averages">
          <ul className="grid grid-cols-2 gap-y-1">
            <li>Sleep latency: <b>{r.lat} min</b></li>
            <li>Awakenings: <b>{r.aw}/night</b></li>
            <li>Total sleep: <b>{r.tst} h</b></li>
            <li>Sleep efficiency: <b>{r.eff}%</b></li>
          </ul>
        </Section>
        <Section t="B. Key Lifestyle Correlations">
          <ul className="list-disc pl-5 space-y-1">
            <li>Caffeine after 2 PM → <b>+22 min</b> time to fall asleep.</li>
            <li>Screen time &gt; 60 min → <b>+35 min</b> sleep latency.</li>
            <li>Bedtime anxiety ≥ 7 on <b>{Math.round(r.n * 0.57)}</b> of {r.n} nights.</li>
          </ul>
        </Section>
        <Section t="C. Daytime Functioning & Sleep Aid History">
          <p>Morning energy avg 4.2/10; moderate brain fog. Morning headaches / dry mouth on {Math.round(r.n * 0.43)} nights. Melatonin 3 mg used {Math.round(r.n * 0.6)}× in period.</p>
        </Section>
        <Section t="D. Apnea Risk Screening Note">
          <p className="border-l-4 border-primary pl-3">Patient reports loud snoring / waking up gasping with morning headaches and dry mouth. <b>Consider STOP-BANG screening and polysomnography referral.</b></p>
        </Section>
        <p className="text-[10px] opacity-60 mt-3">Self-reported data. Not a diagnosis.</p>
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
      <h3 className="font-bold uppercase text-[11px] tracking-wider mb-1 opacity-80">{t}</h3>
      {children}
    </div>
  );
}

/* ---------- Floor 5: companion ---------- */

type Msg = { from: "ai" | "me"; text: string; choices?: string[]; answer?: string };

const TRIVIA = [
  { q: "Which animal can sleep standing up?", c: ["Horse", "Rabbit", "Owl"], a: "Horse", f: "Horses lock their legs so they can doze on their feet." },
  { q: "What is a group of owls called?", c: ["A flock", "A parliament", "A choir"], a: "A parliament", f: "A parliament of owls — wise and quiet, like the night." },
  { q: "Which planet has the longest day?", c: ["Venus", "Mars", "Jupiter"], a: "Venus", f: "One day on Venus lasts longer than its whole year." },
  { q: "Sea otters hold what while they sleep?", c: ["Seaweed", "Hands", "Shells"], a: "Hands", f: "They hold hands so they don't drift apart. Gentle, isn't it?" },
];
const STORIES = [
  "Rain begins softly over a quiet forest. Each drop finds a leaf, then a fern, then the moss below… pat, pat, pat. The pines breathe out a cool, green scent. Somewhere a stream hums under the ferns, slow and patient. You don't need to go anywhere. The rain is doing all the work, washing the day away, leaf by leaf…",
  "The forest path is soft with fallen needles. Mist hangs low between the trees, silver in the moonlight. An owl calls once, far away, and then the woods settle into a deep, warm hush. Your footsteps slow… and slow… until you're simply standing, breathing with the trees…",
  "A small cabin sits at the edge of the woods, its window glowing amber. Inside, a kettle cools on the stove and a blanket waits on the chair. Outside, rain taps the roof in an even rhythm, steady as a heartbeat. Everything that needs doing is done for tonight…",
];
const pick = <T,>(arr: T[], used: Set<string>, key: (x: T) => string) => {
  const fresh = arr.filter((x) => !used.has(key(x)));
  const choice = (fresh.length ? fresh : arr)[Math.floor(Math.random() * (fresh.length || arr.length))]!;
  used.add(key(choice));
  return choice;
};
const vary = (opts: string[], used: Set<string>) => pick(opts, used, (s) => s);

function Floor5() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Hi, I'm here. It's okay to be awake. How are you feeling right now?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const used = useRef(new Set<string>());
  const pending = useRef<{ answer: string; fact: string } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, typing]);

  const trivia = (): Msg => {
    const t = pick(TRIVIA, used.current, (x) => x.q);
    pending.current = { answer: t.a, fact: t.f };
    return { from: "ai", text: `Gentle trivia 🌙 — ${t.q}`, choices: t.c };
  };
  const story = (): Msg => ({ from: "ai", text: pick(STORIES, used.current, (s) => s) });
  const breathing = (): Msg => ({ from: "ai", text: "Let's breathe together for two minutes. Breathe in through your nose for 4… hold gently for 7… and slowly out through your mouth for 8. Let your shoulders drop on the out-breath. We'll do four rounds — I'll be right here." });

  const respond = (raw: string): Msg => {
    const t = raw.toLowerCase().trim();
    const u = used.current;
    if (pending.current) {
      const p = pending.current;
      const guessed = TRIVIA.some((x) => x.c.some((c) => t.includes(c.toLowerCase())));
      if (guessed) {
        pending.current = null;
        const right = t.includes(p.answer.toLowerCase());
        return { from: "ai", text: `${right ? vary(["Yes, that's it!", "Lovely — correct.", "Exactly right."], u) : `Close — it's ${p.answer}.`} ${p.fact} Another question, or shall we rest a while?`, choices: ["Another question", "Tell me a story", "I'm getting sleepy"] };
      }
    }
    if (/trivia|quiz|another question|question/.test(t)) return trivia();
    if (/story|rain|forest|nature/.test(t)) return story();
    if (/breath|breathing/.test(t)) return breathing();
    if (/racing|anx|worr|panic|thoughts|overthink/.test(t))
      return { from: "ai", text: vary([
        "When the mind races at night, everything feels louder. You're safe right now. Try naming 3 things you can hear and 2 things you can feel — the blanket, the pillow. Would breathing together help?",
        "Racing thoughts are tiring, and you don't have to solve any of them tonight. Picture placing each one on a leaf and letting a slow stream carry it off. Want to try a breathing exercise with me?",
        "That restless feeling makes sense after a long day. Let's give your thoughts somewhere to rest — what's the loudest one? You can tell me, and we'll set it down until morning.",
      ], u), choices: ["2-min breathing", "Tell me a story"] };
    if (/^(hi|hey|hello|hiya|yo)\b|how are (u|you)|good (evening|night)/.test(t))
      return { from: "ai", text: vary([
        "I'm right here with you. The world is quiet right now. How are you feeling?",
        "Hello, night owl. It's peaceful here — no rush at all. What's keeping you company tonight?",
        "Hi there. I'm glad you reached out. How is your body feeling right now — tense, tired, restless?",
      ], u) };
    if (/^(yes|yeah|yep|sure|ok|okay|please|alright)\b/.test(t))
      return { from: "ai", text: "Lovely. What feels right for you right now?", choices: ["2-min breathing", "Peaceful trivia", "A nature story"] };
    if (/^(no|nah|not really)\b/.test(t))
      return { from: "ai", text: vary(["That's completely okay. We can just sit quietly together. I'm here whenever you want to talk.", "No pressure at all. Sometimes just resting your eyes is enough."], u) };
    if (/sleepy|tired|drowsy|yawn/.test(t))
      return { from: "ai", text: vary(["That's a wonderful sign. Let your phone rest face-down and let your eyes close. Goodnight 🌙", "Follow that heaviness — it's your body saying yes. Sleep well."], u) };
    if (/can'?t sleep|awake|insomnia|still up/.test(t))
      return { from: "ai", text: vary([
        "Lying awake can feel so lonely. If it's been more than 20 minutes, it's okay to get up, keep lights dim, and do something calm until sleepiness returns.",
        "You're not doing anything wrong by being awake. Let's take the pressure off sleep itself — just rest is enough for now.",
      ], u), choices: ["2-min breathing", "Peaceful trivia"] };
    if (/thank/.test(t)) return { from: "ai", text: vary(["Always. I'm here any hour.", "You're very welcome. Be gentle with yourself tonight."], u) };
    const snippet = raw.length > 50 ? raw.slice(0, 50) + "…" : raw;
    return { from: "ai", text: vary([
      `Thank you for telling me that — "${snippet}". That sounds like a lot to carry at this hour. What feels heaviest about it?`,
      "I hear you. You don't need to fix anything right now; just noticing how you feel is enough. Would you like to keep talking, or try something calming?",
      "That makes sense. Let's take one slow breath together before anything else… In… and out. What would feel most comforting right now?",
      "I'm listening. Whatever you're feeling is valid. If it helps, try relaxing your jaw and letting your shoulders soften as you tell me more.",
    ], u) };
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    const t = text.toLowerCase();
    const out = /calming trivia|peaceful trivia/.test(t) ? trivia() : /sleepy story|nature story/.test(t) ? story() : /2-min breathing/.test(t) ? breathing() : respond(text);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, out]); }, 700 + Math.random() * 600);
  };

  return (
    <>
      <div className="rounded-full border border-primary/40 bg-primary/10 text-primary text-xs px-4 py-2 mb-4 text-center">
        🌙 Compassionate AI companion — Non-medical support only.
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {["My mind is racing", "Play a calming trivia quiz", "Tell me a sleepy story"].map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full bg-card border px-3 py-2 text-xs text-lavender hover:border-primary/60 hover:text-primary">{q}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-card border p-4 h-[48vh] overflow-y-auto space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.text}</div>
            {m.choices && i === msgs.length - 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {m.choices.map((c) => (
                  <button key={c} onClick={() => send(c)} className="rounded-full border border-lavender/40 px-3 py-1 text-xs text-lavender hover:border-primary hover:text-primary">{c}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="text-xs text-muted-foreground animate-pulse">Somna is typing…</div>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 mt-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type softly…" className={inputCls} />
        <button className="px-5 rounded-lg bg-primary text-primary-foreground font-semibold">Send</button>
      </form>
    </>
  );
}

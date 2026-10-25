import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Floor2 } from "@/components/lifestyle-floor";
import { Floor4 } from "@/components/care-summary-floor";
import { INITIAL_LIFESTYLE, LifestyleContext, addCustomMedication, type LifestyleLog } from "@/lib/lifestyle-log";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { INITIAL_WEEK, averageSleep, nightMetrics, type SleepNight } from "@/lib/sleep-log";
import { DAY_WINDOW, dateKey, fullDate, moveSleepDay, moveSleepWeek, selectedSleepDay, selectedSleepWeek, sleepDayDate, sleepWeekDates } from "@/lib/sleep-weeks";
import { FALLBACK_NOTE, journalHeader, noteStamp, parseJournalNote, sampleNotes, type JournalNote } from "@/lib/journal-log";

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
  const [week, setWeek] = useState<SleepNight[]>(INITIAL_WEEK);
  const [lifestyle, setLifestyle] = useState<LifestyleLog>(INITIAL_LIFESTYLE);
  const [history, setHistory] = useState<JournalNote[]>([]);
  useEffect(() => { setHistory(sampleNotes(new Date())); }, []);
  const updateSunday = (patch: Partial<Omit<SleepNight, "day">>) => {
    setWeek(previous => previous.map(night => night.day === "Sunday" ? { ...night, ...patch } : night));
  };
  const [phase, setPhase] = useState<Phase>("closed");
  useEffect(() => {
    if (phase === "closed") { const t = setTimeout(() => setPhase("opening"), 3500); return () => clearTimeout(t); }
    if (phase === "opening") { const t = setTimeout(() => setPhase("done"), 2300); return () => clearTimeout(t); }
    return undefined;
  }, [phase]);

  const current = FLOORS.find((f) => f.n === floor);

  return (
    <LifestyleContext.Provider value={{ log: lifestyle, update: patch => setLifestyle(previous => ({ ...previous, ...patch })), addCustom: name => setLifestyle(previous => addCustomMedication(previous, name)) }}>
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
                <h1 className="font-display text-xl text-foreground">{current?.name}</h1>
              </div>
              <div className="rounded-md border border-primary/40 bg-card px-3 py-1 font-mono text-primary text-glow text-lg">{floor}</div>
            </header>
            <main key={floor} className="floor-content px-5 pt-5 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {floor === 1 && <Floor1 week={week} updateSunday={updateSunday} />}
              {floor === 2 && <Floor2 />}
              {floor === 3 && <Floor3 history={history} setHistory={setHistory} />}
              {floor === 4 && <Floor4 week={week} notes={history} />}
              {floor === 5 && <Floor5 />}
            </main>
            <Dock floor={floor} go={setFloor} />
          </>
        )}
      </div>
    </div>
    </LifestyleContext.Provider>
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

function Slider({ label, value, set, min, max, display }: { label: string; value: number; set: (n: number) => void; min: number; max: number; display?: string | undefined }) {
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

function SleepDuration({ nights, dates, today, label, mode, offset, navigate }: {
  nights: SleepNight[]; dates: Date[]; today: Date; label: string; mode: "week" | "day"; offset: number; navigate: (direction: -1 | 1) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const metrics = nights.map(nightMetrics);
  const ceiling = Math.max(10, ...metrics.map(night => night.total));
  const active = selected === null ? undefined : metrics[selected];
  const activeDate = selected === null ? undefined : dates[selected];
  return (
    <Card title={mode === "week" ? "Weekly sleep duration" : "Daily sleep duration"}>
      <div className="flex items-center justify-between gap-1">
        <Button variant="ghost" size="icon" aria-label={`Previous ${mode}`} title={`Previous ${mode}`} disabled={mode === "day" && offset === DAY_WINDOW - 1}
          onClick={() => navigate(1)} className="shrink-0 text-primary"><ChevronLeft className="size-5" /></Button>
        <h3 aria-live="polite" className="min-w-0 text-center text-xs font-semibold text-foreground">{label}</h3>
        <Button variant="ghost" size="icon" aria-label={`Next ${mode}`} title={`Next ${mode}`} disabled={offset === 0}
          onClick={() => navigate(-1)} className="shrink-0 text-primary"><ChevronRight className="size-5" /></Button>
      </div>
      <div className="relative pt-16">
        <div className="absolute inset-x-0 top-16 h-40 flex flex-col justify-between pointer-events-none" aria-hidden="true">
          {[ceiling, ceiling / 2, 0].map(hours => <div key={hours} className="border-t border-border/70"><span className="absolute right-0 text-[9px] text-muted-foreground bg-card pl-1">{hours.toFixed(0)}h</span></div>)}
        </div>
        {active && activeDate && selected !== null && (
          <div role="status" className="absolute z-10 w-[220px] max-w-full rounded-lg border border-primary/60 bg-popover px-3 py-2 text-center text-xs text-popover-foreground pointer-events-none transition-[bottom] duration-300 motion-reduce:transition-none"
            style={{ left: `clamp(0px, calc(${(selected + 0.5) / nights.length * 100}% - 110px), calc(100% - 220px))`, bottom: `${48 + active.total / ceiling * 160 + 8}px` }}>
            {fullDate(activeDate)} • {Math.floor(active.sleepMinutes / 60)}h {active.sleepMinutes % 60}m sleep • {active.wakes} wakes • {active.latency}m latency
          </div>
        )}
        <div className={`relative grid gap-2 pr-5 ${mode === "week" ? "grid-cols-7" : "grid-cols-1"}`}>
          {nights.map((night, index) => {
            const metric = metrics[index];
            const date = dates[index];
            if (!metric || !date) return null;
            const isToday = dateKey(date) === dateKey(today);
            return (
              <Button key={dateKey(date)} variant="ghost" aria-label={`${fullDate(date)} sleep duration${isToday ? ", Today" : ""}`} aria-pressed={selected === index}
                onClick={() => setSelected(index)} className="group h-[208px] min-w-0 flex-col justify-end gap-0 p-0 bg-transparent hover:bg-transparent">
                <span className={`flex h-40 items-end ${mode === "week" ? "w-full" : "w-16"}`}>
                  <span data-sleep-bar={dateKey(date)} className={`block w-full rounded-t-md transition-[height] duration-300 ease-out motion-reduce:transition-none ${selected === index || isToday ? "bg-primary/60 ring-2 ring-primary ring-offset-2 ring-offset-card" : "bg-lavender/40 group-hover:bg-lavender/60"}`}
                    style={{ height: `${metric.total / ceiling * 100}%` }} />
                </span>
                <span className={`flex h-12 flex-col justify-center gap-0.5 text-xs ${selected === index || isToday ? "text-primary" : "text-muted-foreground"}`}>
                  <span>{night.day[0]}</span><span className="text-[10px] text-muted-foreground">{date.getDate()}</span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function Floor1({ week, updateSunday }: { week: SleepNight[]; updateSunday: (patch: Partial<Omit<SleepNight, "day">>) => void }) {
  const sunday = week.find(night => night.day === "Sunday") ?? INITIAL_WEEK[6];
  const [today, setToday] = useState<Date | null>(null);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [energy, setEnergy] = useState(4);
  const [fog, setFog] = useState(2);
  const [head, setHead] = useState(true);
  useEffect(() => {
    const refresh = () => {
      const now = new Date();
      setToday(previous => previous && dateKey(previous) === dateKey(now) ? previous : now);
    };
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  const fogLabels = ["None", "Mild", "Moderate", "Severe"];
  if (!sunday || !today) return null;
  const { bed, asleep, wake, wakes: aw } = sunday;
  const { latency, total, efficiency } = nightMetrics(sunday);
  const displayWeek = sleepWeekDates(today, weekOffset);
  const displayDay = sleepDayDate(today, dayOffset);
  const displayedNights = mode === "week" ? selectedSleepWeek(week, weekOffset, today) : [selectedSleepDay(week, today, dayOffset)];
  const avg = averageSleep(displayedNights);
  return (
    <>
      <div role="group" aria-label="Sleep date view" className="mx-auto mb-4 flex w-fit rounded-full border bg-secondary p-1">
        {(["week", "day"] as const).map(view => <Button key={view} variant="ghost" aria-pressed={mode === view} onClick={() => setMode(view)}
          className={`h-8 rounded-full px-6 text-xs ${mode === view ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-muted-foreground"}`}>{view === "week" ? "Week" : "Day"}</Button>)}
      </div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{mode === "week" ? "7-day averages" : "Daily averages"}</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[["Latency", `${Math.round(avg.latency)}m`], ["Sleep", `${avg.total.toFixed(1)}h`], ["Wakes", avg.wakes.toFixed(1)], ["Efficiency", `${Math.round(avg.efficiency)}%`]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-card border px-1 py-3 text-center min-w-0">
            <p className="text-[10px] text-muted-foreground">{k}</p><p className="text-lg font-display text-primary">{v}</p>
          </div>
        ))}
      </div>
      <SleepDuration key={`${mode}-${mode === "week" ? weekOffset : dayOffset}-${dateKey(today)}`} nights={displayedNights}
        dates={mode === "week" ? displayWeek.dates : [displayDay.date]} today={today} label={mode === "week" ? displayWeek.label : displayDay.label}
        mode={mode} offset={mode === "week" ? weekOffset : dayOffset} navigate={direction => mode === "week" ? setWeekOffset(moveSleepWeek(weekOffset, direction)) : setDayOffset(moveSleepDay(dayOffset, direction))} />
      <Card>
        <h2 className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase text-lavender">
          <span>Log Sleep: Today ({fullDate(today)})</span>
          <span className="inline-flex items-center gap-1 text-primary"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />Active</span>
        </h2>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {([["Into bed", bed, "bed"], ["Fell asleep", asleep, "asleep"], ["Final wake", wake, "wake"]] as const).map(([l, v, field]) => (
            <label key={l} className="text-xs text-muted-foreground">{l}
              <input type="time" value={v} onChange={(e) => { if (e.target.value) updateSunday({ [field]: e.target.value }); }} className={inputCls + " mt-1 min-w-0 px-1 text-xs"} />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Latency <span className="text-primary">{latency}m</span> · Asleep <span className="text-primary">{total.toFixed(1)}h</span> · Efficiency <span className="text-primary">{Math.round(efficiency)}%</span></p>
        <Counter label="Middle-of-night awakenings" value={aw} set={wakes => updateSunday({ wakes })} />
        <Slider label="Morning energy level" value={energy} set={setEnergy} min={1} max={10} />
        <Slider label="Daytime fatigue / brain fog" value={fog} set={setFog} min={0} max={3} display={fogLabels[fog]} />
        <Check label="Experienced morning headaches or dry mouth" checked={head} set={setHead} />
      </Card>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Floor3({ history, setHistory }: { history: JournalNote[]; setHistory: React.Dispatch<React.SetStateAction<JournalNote[]>> }) {
  const [rec, setRec] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

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

  const save = () => {
    const text = note.trim();
    if (!text) return;
    const at = new Date();
    setHistory((prev) => [{ id: `note-${at.getTime()}`, at, text, sections: parseJournalNote(text) }, ...prev]);
    setNote("");
    setStatus("Note organized & saved below.");
  };

  return (
    <>
      <Card>
        <p className="text-sm text-lavender tracking-wide mb-3" suppressHydrationWarning>
          {now ? journalHeader(now) : " "}
        </p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5}
          placeholder="Speak or type anything you ate, drank, or took today..."
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 placeholder-zinc-500 text-sm leading-relaxed focus:outline-none focus:border-primary/60" />
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-background border px-4 py-3">
          <button onClick={toggle} aria-label="Record Daily Habit Note"
            className={`h-14 w-14 shrink-0 rounded-full flex items-center justify-center transition-all ${rec ? "bg-primary text-primary-foreground glow scale-105" : "bg-primary/15 border-2 border-primary/60 text-primary hover:glow"}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{rec ? "Listening… tap to stop" : "Tap the mic to speak"}</p>
            <div className="flex items-center gap-1 h-6 mt-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className={`w-1 rounded-full bg-primary ${rec ? "wave-bar" : "opacity-20"}`}
                  style={{ height: `${8 + ((i * 37) % 14)}px`, animationDelay: `${(i % 6) * 0.12}s` }} />
              ))}
            </div>
          </div>
        </div>
        {status && <p className="text-xs text-muted-foreground mt-2">{status}</p>}
        <button onClick={save} disabled={!note.trim()}
          className="mt-4 w-full rounded-xl bg-primary py-3.5 font-medium text-primary-foreground glow transition-opacity disabled:opacity-40 disabled:shadow-none">
          Organize &amp; Save Note
        </button>
      </Card>

      <h2 className="text-xs uppercase tracking-[0.2em] text-lavender mt-6 mb-3">Notes history</h2>
      <div className="space-y-4">
        {history.map((entry) => (
          <article key={entry.id} className="rounded-2xl bg-card border p-5">
            <p className="text-xs text-muted-foreground mb-2">{now ? noteStamp(entry.at, now) : ""}</p>
            <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2 mb-3">{entry.text}</p>
            {entry.sections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.sections.flatMap((s) =>
                  s.items.map((item, i) => (
                    <span key={`${s.title}-${i}`}
                      className={`rounded-full px-3 py-1 text-xs border ${s.title.startsWith("Triggers") ? "border-primary/60 text-primary" : "border-lavender/40 text-lavender"}`}>
                      {s.icon} <b>{s.title}:</b> {item}
                    </span>
                  )),
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
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

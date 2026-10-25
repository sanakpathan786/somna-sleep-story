import { createFileRoute } from "@tanstack/react-router";
import { chooseSupportIndex, companionIntent, companionReply, type CompanionIntent } from "@/lib/midnight-companion";
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

      <h2 className="text-xs uppercase tracking-[0.2em] text-lavender mt-6 mb-3">Recent Habit History</h2>
      <div className="space-y-4">
        {history.map((entry) => (
          <article key={entry.id} className="rounded-lg bg-card border p-5">
            <p className="text-sm font-semibold text-foreground mb-1">{entry.at.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
            <p className="text-xs text-muted-foreground mb-3">{now ? noteStamp(entry.at, now) : ""}{entry.id.startsWith("sample-diet-") ? " · Sample" : ""}</p>
            <p className="text-sm leading-relaxed text-foreground/90 line-clamp-2 mb-3">{entry.text}</p>
            {entry.sections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.sections.flatMap((s) =>
                  s.items.map((item, i) => (
                    <span key={`${s.title}-${i}`}
                      className={`rounded-full px-3 py-1 text-xs border ${s.title.startsWith("Triggers") ? "border-primary/60 text-primary" : "border-lavender/40 text-lavender"}`}>
                      {s.icon} <b>{s.title === "Midnight Snack / Evening" ? (/snack|chips|pretzels|chocolate/i.test(item) ? "Midnight Snack" : "Evening") : s.title.startsWith("Triggers") ? "Triggers/Aids" : s.title}:</b> {item}
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

type Msg = { from: "ai" | "me"; text: string; choices?: string[] };

function Floor5() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Hi, I'm here. It's okay to be awake. How are you feeling right now?" }]);
  const [input, setInput] = useState("");
  const previousDefault = useRef<number | null>(null);
  const previousIntent = useRef<CompanionIntent | undefined>(undefined);
  const factIndex = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const intent = companionIntent(text, previousIntent.current);
    if (intent === "support") previousDefault.current = chooseSupportIndex(previousDefault.current);
    const reply = companionReply(intent, previousDefault.current ?? 0, factIndex.current);
    if (intent === "fact") factIndex.current += 1;
    previousIntent.current = intent;
    setMsgs(previous => [...previous, { from: "me", text }, { from: "ai", ...reply }]);
    setInput("");
  };

  return (
    <>
      <div className="rounded-full border border-primary/40 bg-primary/10 text-primary text-xs px-4 py-2 mb-4 text-center">
        🌙 Compassionate AI companion — Non-medical support only.
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {["My mind is racing", "Play a calming trivia quiz", "Tell me a sleepy story"].map((q) => (
          <Button key={q} variant="outline" onClick={() => send(q)} className="h-auto whitespace-normal rounded-full bg-card border px-3 py-2 text-xs text-lavender hover:border-primary/60 hover:text-primary">{q}</Button>
        ))}
      </div>
      <div role="log" aria-label="Midnight Companion conversation" aria-live="polite" className="rounded-2xl bg-card border p-4 h-[48vh] overflow-y-auto space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed break-words ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{m.text}</div>
            {m.choices && i === msgs.length - 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {m.choices.map((c) => (
                  <Button key={c} variant="outline" onClick={() => send(c)} className="h-auto whitespace-normal rounded-full border border-lavender/40 px-3 py-1 text-xs text-lavender hover:border-primary hover:text-primary">{c}</Button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 mt-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message Midnight Companion" placeholder="Type softly…" className={inputCls + " min-w-0"} />
        <Button type="submit" disabled={!input.trim()} className="h-auto px-5 rounded-lg bg-primary text-primary-foreground font-semibold">Send</Button>
      </form>
    </>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLifestyleLog } from "@/lib/lifestyle-log";
import type { SleepNight } from "@/lib/sleep-log";
import type { JournalNote } from "@/lib/journal-log";
import { REPORT_RANGES, dietarySummary, reportProfile, type ReportRange } from "@/lib/care-summary";

export function Floor4({ week, notes }: { week: SleepNight[]; notes: JournalNote[] }) {
  const [range, setRange] = useState<ReportRange>("Past 7 Days");
  const [now, setNow] = useState<Date | null>(null);
  const { log } = useLifestyleLog();
  useEffect(() => { const refresh = () => setNow(new Date()); refresh(); window.addEventListener("focus", refresh); return () => window.removeEventListener("focus", refresh); }, []);
  const today = week.at(-1);
  if (!today) return null;
  const r = reportProfile(range, today);
  const single = range === "Today (1 Night)";
  const diet = now ? dietarySummary(notes, now, r.nights, today.asleep) : null;
  return <>
    <div className="no-print mb-5">
      <label htmlFor="report-range" className="block text-xs text-muted-foreground mb-2">Report timeframe</label>
      <select id="report-range" value={range} onChange={e => { const next = REPORT_RANGES.find(item => item === e.target.value); if (next) setRange(next); }} className="w-full rounded-lg bg-field border border-input px-3 py-3 text-sm text-foreground">
        {REPORT_RANGES.map(item => <option key={item}>{item}</option>)}
      </select>
    </div>
    <article aria-label="Physician intake report" className="care-report print-area bg-paper text-paper-foreground rounded-lg border border-paper-foreground/20 p-5 font-sans">
      <header className="border-b-2 border-paper-foreground pb-4 mb-5">
        <p className="text-[10px] uppercase tracking-widest mb-2">Somna / Doctor’s Pass</p>
        <h2 className="text-xl font-semibold leading-snug">{r.title}</h2>
        <p className="text-xs opacity-70 mt-2">Patient-reported · {r.nights} night{single ? "" : "s"} · {now?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        {!single && <p className="text-[11px] opacity-70 mt-2">Sample aggregate dataset — not calculated from your live log.</p>}
      </header>
      <ReportSection title={single ? "A. SINGLE NIGHT SLEEP CHRONOLOGY" : "A. SLEEP CHRONOLOGY AVERAGES"}>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Metric label={single ? "Sleep duration" : "Total sleep avg"} value={`${r.total.toFixed(1)} h`} />
          <Metric label={single ? "Sleep latency" : "Latency avg"} value={`${Math.round(r.latency)} min`} />
          <Metric label={single ? "Awakenings" : "Awakenings avg"} value={single ? String(r.wakes) : `${r.wakes.toFixed(1)}/night`} />
          <Metric label="Sleep efficiency" value={r.efficiency === null ? "Not provided" : `${Math.round(r.efficiency)}%`} />
        </dl>
        {single && <p className="mt-3 text-xs opacity-70">Into bed {today.bed} · Asleep {today.asleep} · Final wake {today.wake}</p>}
      </ReportSection>
      <ReportSection title="B. KEY LIFESTYLE CORRELATIONS">
        <p>{r.insight}</p>
        {range === "Past 3 Months" && <p className="text-xs opacity-70 mt-2">Usage and nap counts above describe a 30-night sample within the 3-month period.</p>}
        {single && <p className="mt-2">Caffeine: {log.caffeineServings} servings; last cutoff {log.caffeineCutoff}. Alcohol: {log.alcohol ? `${log.alcoholDrinks} drinks, ${log.alcoholCutoff}` : "None reported"}. Screen exposure: {log.screenMinutes} min; bedtime anxiety: {log.anxiety}/10.</p>}
      </ReportSection>
      <ReportSection title="C. DAYTIME FUNCTIONING & SLEEP AID HISTORY">
        {single ? <p>Naps: {log.naps ? `${log.napCount === 3 ? "3+" : log.napCount}, ${log.napMinutes} mins total; ${log.napTiming}` : "None reported"}. Medications / supplements: {log.medications.length ? log.medications.join(", ") + ` (${log.medicationTiming})` : "None selected"}. Morning functioning not included in this report.</p> : <p>{r.nights === 7 ? "Sample: daytime fatigue noted on 4 of 7 days; sleep aids reported on 3 nights." : r.nights === 14 ? "Sample: daytime fatigue noted on 8 of 14 days; sleep aids reported on 7 nights." : "Sample: daytime fatigue noted on 13 of 30 days; sleep aids on 16 of 30 nights, naps on 8 days averaging 35 mins."}</p>}
      </ReportSection>
      <ReportSection title="D. APNEA RISK SCREENING NOTE">
        <p>{log.apneaFlag ? "Current checklist: loud snoring, waking up gasping, or morning dry mouth reported. Physician may consider validated sleep apnea screening based on clinical assessment." : "Current checklist: no snoring, gasping, or dry-mouth flag selected. This does not exclude sleep apnea."}</p>
      </ReportSection>
      <ReportSection title="E. DIETARY TIMING & EVENING METABOLIC FACTORS">
        {single ? <>
          <p><b>Last night’s meal:</b> {diet?.mealItems.join("; ") || "No dinner recorded in recent saved notes"}</p>
          <p><b>Evening / midnight:</b> {diet?.eveningItems.join("; ") || "No evening snack recorded in recent saved notes"}</p>
          <p><b>Last meal time:</b> {diet?.mealTime ?? "Not recorded"}</p>
        </> : <>
          <p><b>Average last meal time:</b> {r.nights === 7 ? "7:45 PM — Approx 3.0 hrs before sleep" : r.nights === 14 ? "8:00 PM — Approx 2.5 hrs before sleep" : "7:30 PM — Approx 3.2 hrs before sleep"}</p>
          <p><b>Evening / midnight snacking:</b> Reported on {r.nights === 7 ? "2 of 7" : r.nights === 14 ? "5 of 14" : r.nights === 30 ? "9 of 30" : "27 of 90"} nights (sample).</p>
        </>}
        <p className="mt-2"><b>Trigger ingestion — saved notes:</b> {diet?.triggers.length ? diet.triggers.join("; ") : "No late caffeine, carbohydrate-rich foods, or alcohol identified in saved notes for this period."}</p>
        {!single && <p className="text-xs opacity-70 mt-2">Saved journal entries are shown separately from sample dietary averages.</p>}
        <p className="mt-3 border-l-2 border-paper-foreground/40 pl-3"><b>Clinical note for physician:</b> Patient-reported food diary indicates late-night snacks may correlate with middle-of-night awakenings.</p>
        <p className="text-xs opacity-70 mt-2">Association to review, not a confirmed patient-specific finding.</p>
      </ReportSection>
      <footer className="text-[10px] opacity-70">Self-reported information and clearly labeled demonstration data. Not a diagnosis. Patient identification to be completed by physician.</footer>
    </article>
    <Button onClick={() => window.print()} className="no-print w-full mt-5 h-auto py-4 px-3 whitespace-normal text-sm glow"><Printer />Export PDF / Print for Physician</Button>
  </>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[11px] opacity-70 mb-1">{label}</dt><dd className="text-lg font-semibold">{value}</dd></div>;
}
function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="report-section border-b border-paper-foreground/20 pb-4 mb-4 text-xs leading-relaxed space-y-1"><h3 className="font-bold text-[10px] tracking-wide mb-2">{title}</h3>{children}</section>;
}
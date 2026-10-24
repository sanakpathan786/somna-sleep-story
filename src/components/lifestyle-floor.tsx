import { useState, type ReactNode } from "react";
import { Minus, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ALCOHOL_CUTOFFS, CAFFEINE_CUTOFFS, LIFESTYLE_LIMITS, MEDICATIONS, MEDICATION_TIMINGS, NAP_TIMINGS, napNeedsWarning, toggleMedication, useLifestyleLog } from "@/lib/lifestyle-log";

const fieldClass = "mt-2 w-full min-w-0 rounded-lg border border-input bg-field px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
const pillClass = "h-auto min-h-8 rounded-full whitespace-normal px-3 py-2 text-xs";

function FactorSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-4 rounded-lg border bg-card p-5"><h2 className="mb-4 text-xs uppercase text-lavender">{title}</h2>{children}</section>;
}

function YesNoSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 text-sm"><span>{label}</span><span className="flex shrink-0 items-center gap-2"><span className="w-6 text-xs text-primary" aria-hidden="true">{checked ? "Yes" : "No"}</span><Switch aria-label={label} checked={checked} onCheckedChange={onChange} className="data-[state=checked]:glow" /></span></label>;
}

function FactorCounter({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (value: number) => void; min?: number }) {
  return <div className="mb-4 flex items-center justify-between gap-2"><span className="text-sm">{label}</span><div className="flex shrink-0 items-center gap-2"><Button variant="outline" size="icon" aria-label={`Decrease ${label}`} title={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="rounded-full"><Minus /></Button><output aria-label={label} className="min-w-7 text-center text-xl font-semibold text-primary">{value}</output><Button variant="outline" size="icon" aria-label={`Increase ${label}`} title={`Increase ${label}`} onClick={() => onChange(value + 1)} className="rounded-full"><Plus /></Button></div></div>;
}

function FactorRange({ label, value, min, max, display, onChange }: { label: string; value: number; min: number; max: number; display: string; onChange: (value: number) => void }) {
  return <div className="mb-5"><div className="mb-3 flex items-start justify-between gap-3 text-sm"><span>{label}</span><output className="shrink-0 font-semibold text-primary" aria-live="polite">{display}</output></div><Slider thumbLabel={label} value={[value]} min={min} max={max} step={1} onValueChange={values => { const next = values[0]; if (next !== undefined) onChange(next); }} className="py-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:glow" /></div>;
}

function FactorSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return <label className="block text-sm">{label}<select className={fieldClass} value={value} onChange={event => { const selected = options.find(option => option === event.target.value); if (selected) onChange(selected); }}>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}

export function Floor2() {
  const { log, update, addCustom } = useLifestyleLog();
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  return <div className="min-w-0">
    <FactorSection title="Daytime Naps Tracker">
      <YesNoSwitch label="Did you take any naps today?" checked={log.naps} onChange={naps => update({ naps })} />
      {log.naps && <div className="mt-4 space-y-4 border-t pt-4 animate-in fade-in duration-200 motion-reduce:animate-none">
        <div><p className="mb-2 text-sm">Nap Count</p><div role="group" aria-label="Nap Count" className="grid grid-cols-3 gap-2">{([1, 2, 3] as const).map(count => <Button key={count} variant={log.napCount === count ? "default" : "secondary"} aria-pressed={log.napCount === count} onClick={() => update({ napCount: count })} className={pillClass + (log.napCount === count ? " glow" : "")}>{count === 3 ? "3+ Naps" : `${count} ${count === 1 ? "Nap" : "Naps"}`}</Button>)}</div></div>
        <FactorRange label="Total Nap Duration" value={log.napMinutes} {...LIFESTYLE_LIMITS.nap} display={`${log.napMinutes} mins`} onChange={napMinutes => update({ napMinutes })} />
        <FactorSelect label="Timing of Last Nap" value={log.napTiming} options={NAP_TIMINGS} onChange={napTiming => update({ napTiming })} />
        {napNeedsWarning(log) && <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Late or extended naps can decrease nighttime homeostatic sleep pressure.</p>}
      </div>}
    </FactorSection>
    <FactorSection title="Medications & Supplements">
      <div role="group" aria-label="Medications & Supplements" className="mb-4 flex flex-wrap gap-2">{[...MEDICATIONS, ...log.customMedications].map(medication => <Button key={medication} variant={log.medications.includes(medication) ? "default" : "secondary"} aria-pressed={log.medications.includes(medication)} onClick={() => update({ medications: toggleMedication(log.medications, medication) })} className={pillClass + (log.medications.includes(medication) ? " glow" : "")}>{medication}</Button>)}<Button variant="outline" className={pillClass + " text-primary"} aria-expanded={addingCustom} onClick={() => setAddingCustom(value => !value)}><Plus />Add Custom</Button></div>
      {addingCustom && <form className="mb-4" onSubmit={event => { event.preventDefault(); if (!customName.trim()) return; addCustom(customName); setCustomName(""); setAddingCustom(false); }}><label className="text-sm">Custom medication or supplement<input autoFocus maxLength={80} value={customName} onChange={event => setCustomName(event.target.value)} className={fieldClass} /></label><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setAddingCustom(false); setCustomName(""); }}>Cancel</Button><Button type="submit" size="sm" disabled={!customName.trim()}><Plus />Add</Button></div></form>}
      <FactorSelect label="Timing" value={log.medicationTiming} options={MEDICATION_TIMINGS} onChange={medicationTiming => update({ medicationTiming })} />
    </FactorSection>
    <FactorSection title="Caffeine & Alcohol Intake">
      <h3 className="mb-3 text-sm font-semibold">Caffeine</h3>
      <FactorCounter label="Cups / servings" value={log.caffeineServings} onChange={caffeineServings => update({ caffeineServings })} />
      <FactorSelect label="Last Caffeine Cutoff" value={log.caffeineCutoff} options={CAFFEINE_CUTOFFS} onChange={caffeineCutoff => update({ caffeineCutoff })} />
      <div className="mt-5 border-t pt-4"><YesNoSwitch label="Consumed alcohol tonight?" checked={log.alcohol} onChange={alcohol => update({ alcohol })} />
        {log.alcohol && <div className="mt-4 animate-in fade-in duration-200 motion-reduce:animate-none"><FactorCounter label="Drinks" value={log.alcoholDrinks} min={1} onChange={alcoholDrinks => update({ alcoholDrinks })} /><FactorSelect label="Alcohol cutoff" value={log.alcoholCutoff} options={ALCOHOL_CUTOFFS} onChange={alcoholCutoff => update({ alcoholCutoff })} /></div>}
      </div>
    </FactorSection>
    <FactorSection title="Pre-Bed Mental State & Environment">
      <FactorRange label="Screen time within 1 hour of sleep" value={log.screenMinutes} {...LIFESTYLE_LIMITS.screen} display={log.screenMinutes === 120 ? "120+ mins" : `${log.screenMinutes} mins`} onChange={screenMinutes => update({ screenMinutes })} />
      <FactorRange label="Racing Mind / Bedtime Anxiety" value={log.anxiety} {...LIFESTYLE_LIMITS.anxiety} display={`${log.anxiety} / 10`} onChange={anxiety => update({ anxiety })} />
      <div className="-mt-3 mb-5 flex justify-between gap-2 text-[10px] text-muted-foreground"><span>1: Calm</span><span>10: Racing thoughts</span></div>
      <div className="border-t pt-4"><h3 className="mb-2 text-sm font-semibold">Sleep Apnea Risk Flag</h3><label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={log.apneaFlag} onChange={event => update({ apneaFlag: event.target.checked })} className="mt-0.5 size-4 shrink-0 accent-primary" /><span>Experienced loud snoring, waking up gasping, or morning dry mouth</span></label></div>
    </FactorSection>
  </div>;
}
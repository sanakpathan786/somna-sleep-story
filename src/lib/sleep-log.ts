export type SleepNight = {
  day: string;
  bed: string;
  asleep: string;
  wake: string;
  wakes: number;
};

export const INITIAL_WEEK: SleepNight[] = [
  { day: "Monday", bed: "22:48", asleep: "23:30", wake: "06:00", wakes: 2 },
  { day: "Tuesday", bed: "22:25", asleep: "23:30", wake: "06:42", wakes: 3 },
  { day: "Wednesday", bed: "23:22", asleep: "00:00", wake: "05:30", wakes: 2 },
  { day: "Thursday", bed: "22:35", asleep: "23:30", wake: "06:18", wakes: 3 },
  { day: "Friday", bed: "22:30", asleep: "23:00", wake: "07:00", wakes: 1 },
  { day: "Saturday", bed: "23:09", asleep: "00:00", wake: "06:00", wakes: 3 },
  { day: "Sunday", bed: "22:45", asleep: "23:33", wake: "06:20", wakes: 2 },
];

const minutes = (time: string) => {
  const [hours = 0, mins = 0] = time.split(":").map(Number);
  return hours * 60 + mins;
};
const elapsed = (start: string, end: string) => (minutes(end) - minutes(start) + 1440) % 1440;

export function nightMetrics(night: SleepNight) {
  const latency = elapsed(night.bed, night.asleep);
  const sleepMinutes = elapsed(night.asleep, night.wake);
  const inBedMinutes = latency + sleepMinutes;
  return { latency, sleepMinutes, total: sleepMinutes / 60, wakes: night.wakes,
    efficiency: inBedMinutes ? sleepMinutes / inBedMinutes * 100 : 0 };
}

export function averageSleep(nights: SleepNight[]) {
  const metrics = nights.map(nightMetrics);
  const mean = (key: keyof ReturnType<typeof nightMetrics>) =>
    metrics.length ? metrics.reduce((sum, night) => sum + night[key], 0) / metrics.length : 0;
  return { latency: mean("latency"), total: mean("total"), wakes: mean("wakes"), efficiency: mean("efficiency") };
}
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parses strings like:
//   "Mon,Tue,Wed,Thu,Fri 08:00-20:00"
//   "Mon-Fri 8:00-20:00, Sat 9:00-17:00"
// into a list of windows with allowed weekday indexes (0=Sun..6=Sat) and minute ranges.
export interface AvailabilityWindow {
  days: Set<number>;
  startMin: number;
  endMin: number;
}

const DAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export function parseAvailabilityWindows(raw?: string): AvailabilityWindow[] {
  if (!raw) return [];
  const regex = /([A-Za-z][A-Za-z,\-\s]*?)\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;
  const result: AvailabilityWindow[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    const daysSpec = m[1].trim().replace(/,$/, "");
    const startMin = parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
    const endMin = parseInt(m[4], 10) * 60 + parseInt(m[5], 10);
    const days = new Set<number>();
    daysSpec.split(",").forEach((tok) => {
      const t = tok.trim().toUpperCase();
      if (!t) return;
      if (t.includes("-")) {
        const [a, b] = t.split("-").map((x) => x.trim().slice(0, 3));
        const ai = DAY_MAP[a];
        const bi = DAY_MAP[b];
        if (ai === undefined || bi === undefined) return;
        let i = ai;
        while (true) {
          days.add(i);
          if (i === bi) break;
          i = (i + 1) % 7;
        }
      } else {
        const key = t.slice(0, 3);
        if (DAY_MAP[key] !== undefined) days.add(DAY_MAP[key]);
      }
    });
    if (days.size > 0) result.push({ days, startMin, endMin });
  }
  return result;
}

// True if the [slotStartMin, slotEndMin) range on the given weekday lies fully inside any window.
export function isWithinAvailability(
  windows: AvailabilityWindow[],
  weekday: number,
  slotStartMin: number,
  slotEndMin: number
): boolean {
  if (windows.length === 0) return true; // no restriction defined → treat as always available
  return windows.some(
    (w) => w.days.has(weekday) && slotStartMin >= w.startMin && slotEndMin <= w.endMin
  );
}

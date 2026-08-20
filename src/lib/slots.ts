// Λογική υπολογισμού διαθέσιμων ωρών ραντεβού μέσα στο ωράριο καταστήματος.
// Οι θέσεις ΔΕΝ είναι σταθερές — υπολογίζονται δυναμικά ώστε δύο υπηρεσίες
// διαφορετικής διάρκειας να χωράνε στο ίδιο δίωρο (π.χ. 14:00-15:00 & 15:00-16:00).

export const SHOP_OPEN_MINUTES = 8 * 60 + 30; // 08:30
export const SHOP_CLOSE_MINUTES = 18 * 60; // 18:00
export const SLOT_STEP_MINUTES = 30;

export interface BookedInterval {
  startMinutes: number;
  endMinutes: number;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
) {
  return aStart < bEnd && aEnd > bStart;
}

export interface SlotInfo {
  time: string;
  available: boolean;
}

/**
 * Επιστρέφει ΟΛΕΣ τις πιθανές ώρες έναρξης (ως "HH:mm") για μια υπηρεσία
 * συγκεκριμένης διάρκειας, με σημαία available/όχι — ώστε το UI να δείχνει
 * και τις πιασμένες ώρες (χωρίς όμως στοιχεία άλλου πελάτη) και να μην
 * επιτρέπει την επιλογή τους.
 */
export function computeSlots(
  durationMinutes: number,
  booked: BookedInterval[]
): SlotInfo[] {
  const slots: SlotInfo[] = [];

  for (
    let start = SHOP_OPEN_MINUTES;
    start + durationMinutes <= SHOP_CLOSE_MINUTES;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + durationMinutes;
    const overlaps = booked.some((b) =>
      intervalsOverlap(start, end, b.startMinutes, b.endMinutes)
    );
    slots.push({ time: minutesToTime(start), available: !overlaps });
  }

  return slots;
}

export function isSlotStillAvailable(
  startTime: string,
  durationMinutes: number,
  booked: BookedInterval[]
): boolean {
  const start = timeToMinutes(startTime);
  const end = start + durationMinutes;
  if (start < SHOP_OPEN_MINUTES || end > SHOP_CLOSE_MINUTES) return false;
  return !booked.some((b) =>
    intervalsOverlap(start, end, b.startMinutes, b.endMinutes)
  );
}

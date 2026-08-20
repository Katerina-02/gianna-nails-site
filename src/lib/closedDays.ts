import { parseDate } from "@/lib/dates";

// Το μαγαζί είναι κλειστό Σάββατο, Κυριακή και Δευτέρα.
const CLOSED_WEEKDAYS = new Set([0, 1, 6]); // 0=Κυριακή, 1=Δευτέρα, 6=Σάββατο

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Ημέρα του Ορθόδοξου Πάσχα (Κυριακή) για το δοσμένο έτος, σε Γρηγοριανό ημερολόγιο. */
function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=Μάρτιος, 4=Απρίλιος (Ιουλιανό)
  const day = ((d + e + 114) % 31) + 1;
  const julian = new Date(Date.UTC(year, month - 1, day));
  julian.setUTCDate(julian.getUTCDate() + 13); // μετατροπή σε Γρηγοριανό (ισχύει 1900-2099)
  return julian;
}

function addDaysUTC(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toISO(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const holidayCache = new Map<number, Set<string>>();

/** Επίσημες αργίες στην Ελλάδα για το δοσμένο έτος (σταθερές + κινητές του Πάσχα). */
export function getGreekHolidays(year: number): Set<string> {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const fixed = [
    `${year}-01-01`, // Πρωτοχρονιά
    `${year}-01-06`, // Θεοφάνεια
    `${year}-03-25`, // Ευαγγελισμός / Εθνική Εορτή
    `${year}-05-01`, // Εργατική Πρωτομαγιά
    `${year}-08-15`, // Κοίμηση της Θεοτόκου
    `${year}-10-28`, // Επέτειος του Όχι
    `${year}-12-25`, // Χριστούγεννα
    `${year}-12-26`, // Σύναξη Θεοτόκου
  ];

  const easter = orthodoxEaster(year);
  const movable = [
    toISO(addDaysUTC(easter, -48)), // Καθαρά Δευτέρα
    toISO(addDaysUTC(easter, -2)), // Μεγάλη Παρασκευή
    toISO(easter), // Κυριακή του Πάσχα
    toISO(addDaysUTC(easter, 1)), // Δευτέρα του Πάσχα
    toISO(addDaysUTC(easter, 50)), // Δευτέρα του Αγίου Πνεύματος
  ];

  const set = new Set([...fixed, ...movable]);
  holidayCache.set(year, set);
  return set;
}

/** true αν το μαγαζί είναι κλειστό αυτή την ημέρα (ΣΚ+Δευτέρα ή επίσημη αργία). */
export function isShopClosed(dateISO: string): boolean {
  const date = parseDate(dateISO);
  if (CLOSED_WEEKDAYS.has(date.getDay())) return true;
  const year = date.getFullYear();
  return getGreekHolidays(year).has(dateISO);
}

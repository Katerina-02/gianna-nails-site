const GREEK_WEEKDAYS = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];

const GREEK_MONTHS = [
  "Ιανουαρίου",
  "Φεβρουαρίου",
  "Μαρτίου",
  "Απριλίου",
  "Μαΐου",
  "Ιουνίου",
  "Ιουλίου",
  "Αυγούστου",
  "Σεπτεμβρίου",
  "Οκτωβρίου",
  "Νοεμβρίου",
  "Δεκεμβρίου",
];

/** Ερμηνεύει "YYYY-MM-DD" ως τοπική ημερομηνία (όχι UTC) για να αποφύγουμε μετατοπίσεις. */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateGreek(dateStr: string): string {
  const date = parseDate(dateStr);
  const weekday = GREEK_WEEKDAYS[date.getDay()];
  const month = GREEK_MONTHS[date.getMonth()];
  return `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

export function todayISO(): string {
  return formatDateISO(new Date());
}

export function daysBetween(a: string, b: string): number {
  const diff = parseDate(a).getTime() - parseDate(b).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

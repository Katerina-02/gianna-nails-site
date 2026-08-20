/** Φτιάχνει ένα κλικαρίσιμο tel: href από νούμερο τηλεφώνου πελάτη. */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  return `tel:+30${digits}`;
}

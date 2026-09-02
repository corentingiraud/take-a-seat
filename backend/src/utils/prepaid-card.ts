const PARIS_TZ = 'Europe/Paris';

// Same shape as getParisParts() in api/stat/services/stat.ts. Deliberately not
// 'en-CA' (which would give YYYY-MM-DD directly): that relies on non-en-US locale
// data, and a small-ICU build would silently fall back to M/D/YYYY.
const parisDayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: PARIS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** UTC booking instant -> the Paris calendar day it falls on, 'YYYY-MM-DD'. */
export function parisDay(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = parisDayFormatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

const DAY = /^\d{4}-\d{2}-\d{2}/;

type ValidatableCard = {
  validFrom?: unknown;
  expirationDate?: unknown;
  paymentStatus?: string;
};

/**
 * Why `card` may not pay for those bookings, or null if it may.
 *
 * Strapi `date` columns come back as plain 'YYYY-MM-DD' strings (the postgres
 * dialect disables Date casting), so the window check is a lexicographic string
 * compare against the Paris calendar day of each booking. No date arithmetic,
 * no DST edge cases. Mirrors the frontend rule in hooks/use-prepaid-cards.ts:
 * every booking date must fall inside [validFrom, expirationDate], bounds
 * included, and the card must be paid.
 *
 * Fails closed: anything we cannot read as a day is a rejection.
 */
export function prepaidCardRejection(
  card: ValidatableCard,
  startDates: Array<string | Date>,
): string | null {
  if (card.paymentStatus !== 'PAID') return 'Prepaid card is not paid yet';

  const bound = (value: unknown) =>
    typeof value === 'string' ? DAY.exec(value)?.[0] ?? null : null;
  const from = bound(card.validFrom);
  const until = bound(card.expirationDate);

  if (!from || !until) return 'Prepaid card has no usable validity window';

  for (const startDate of startDates) {
    const day = parisDay(startDate);

    if (!day) return `Invalid booking date: ${String(startDate)}`;

    if (day < from || day > until) {
      return `Booking on ${day} is outside the prepaid card validity window (${from} → ${until})`;
    }
  }

  return null;
}

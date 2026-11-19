// Pure helper, no path aliases so it can run under `node --test`. Times are epoch ms.
export type Range = { start: number; end: number };
export type DaySlot = Range & { seats: number };

/**
 * Slots still worth booking today: the in-progress slot and later ones, minus slots
 * that are full, and slots the user already holds.
 * `serviceBookings` must be non-cancelled bookings of the service (all users, own included).
 */
export function remainingSlots({
  slots,
  now,
  serviceBookings,
  ownBookings,
}: {
  slots: DaySlot[];
  now: number;
  serviceBookings: Range[];
  ownBookings: Range[];
}): DaySlot[] {
  const overlaps = (a: Range, b: Range) => a.start < b.end && a.end > b.start;

  return slots.filter(
    (s) =>
      s.end > now &&
      !ownBookings.some((b) => overlaps(s, b)) &&
      serviceBookings.filter((b) => overlaps(s, b)).length < s.seats,
  );
}

/** Merges contiguous slots into ranges. */
export function mergeRanges(ranges: Range[]): Range[] {
  const out: Range[] = [];

  for (const r of [...ranges].sort((a, b) => a.start - b.start)) {
    const last = out[out.length - 1];

    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else out.push({ start: r.start, end: r.end });
  }

  return out;
}

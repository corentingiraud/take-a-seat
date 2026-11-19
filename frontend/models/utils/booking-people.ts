export type PersonBooking = {
  name: string;
  start: Date | string;
  end: Date | string;
};

export type PersonPresence = {
  name: string;
  ranges: { start: Date; end: Date }[];
  label: string;
};

// 8h, 8h30 (local time)
function formatHour(d: Date): string {
  const m = d.getMinutes();
  return `${d.getHours()}h${m ? String(m).padStart(2, "0") : ""}`;
}

/**
 * Groups bookings by display name and merges contiguous or overlapping ranges.
 * People are sorted by first start then name; labels look like "8h-12h, 14h-18h".
 */
export function groupBookingsByPerson(bookings: PersonBooking[]): PersonPresence[] {
  const byName = new Map<string, { start: Date; end: Date }[]>();

  for (const b of bookings) {
    const range = { start: new Date(b.start), end: new Date(b.end) };
    byName.set(b.name, [...(byName.get(b.name) ?? []), range]);
  }

  const people: PersonPresence[] = [];

  for (const [name, list] of byName) {
    list.sort((a, b) => a.start.getTime() - b.start.getTime());

    const ranges: { start: Date; end: Date }[] = [];
    for (const r of list) {
      const last = ranges[ranges.length - 1];
      if (last && r.start.getTime() <= last.end.getTime()) {
        if (r.end.getTime() > last.end.getTime()) last.end = r.end;
      } else {
        ranges.push({ ...r });
      }
    }

    people.push({
      name,
      ranges,
      label: ranges.map((r) => `${formatHour(r.start)}-${formatHour(r.end)}`).join(", "),
    });
  }

  return people.sort(
    (a, b) =>
      a.ranges[0].start.getTime() - b.ranges[0].start.getTime() ||
      a.name.localeCompare(b.name),
  );
}

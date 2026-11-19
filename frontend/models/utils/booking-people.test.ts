import assert from "node:assert/strict";
import { test } from "node:test";

import { groupBookingsByPerson } from "./booking-people.ts";

const t = (h: number, m = 0) => new Date(2026, 0, 5, h, m);

test("merges contiguous and overlapping ranges", () => {
  const [p] = groupBookingsByPerson([
    { name: "Anna B.", start: t(8), end: t(10) },
    { name: "Anna B.", start: t(10), end: t(11, 30) },
    { name: "Anna B.", start: t(11), end: t(13) },
  ]);
  assert.equal(p.label, "8h-13h");
});

test("splits around lunch and formats minutes", () => {
  const [p] = groupBookingsByPerson([
    { name: "Anna B.", start: t(14), end: t(18) },
    { name: "Anna B.", start: t(8, 30), end: t(12) },
  ]);
  assert.equal(p.label, "8h30-12h, 14h-18h");
});

test("sorts people by first start then name", () => {
  const out = groupBookingsByPerson([
    { name: "Zoe C.", start: t(8), end: t(9) },
    { name: "Bob D.", start: t(9), end: t(10) },
    { name: "Al E.", start: t(8), end: t(9) },
  ]);
  assert.deepEqual(out.map((p) => p.name), ["Al E.", "Zoe C.", "Bob D."]);
});

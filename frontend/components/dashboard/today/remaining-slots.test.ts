import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeRanges, remainingSlots } from "./remaining-slots.ts";

const H = 3600_000;
const slots = [9, 10, 11, 14, 15].map((h) => ({ start: h * H, end: (h + 1) * H, seats: 2 }));
const base = { slots, now: 10.5 * H, serviceBookings: [], ownBookings: [] };

test("starts at the in-progress slot", () => {
  assert.deepEqual(remainingSlots(base).map((s) => s.start / H), [10, 11, 14, 15]);
});

test("drops full and own slots", () => {
  const full = [{ start: 11 * H, end: 12 * H }];
  const res = remainingSlots({
    ...base,
    serviceBookings: [...full, ...full, { start: 14 * H, end: 15 * H }],
    ownBookings: [{ start: 10 * H, end: 11 * H }],
  });

  assert.deepEqual(res.map((s) => s.start / H), [14, 15]);
});

test("merges contiguous ranges only", () => {
  assert.deepEqual(mergeRanges(slots), [
    { start: 9 * H, end: 12 * H },
    { start: 14 * H, end: 16 * H },
  ]);
});

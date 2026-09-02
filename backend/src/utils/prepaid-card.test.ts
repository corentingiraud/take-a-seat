import test from 'node:test';
import assert from 'node:assert/strict';

import { parisDay, prepaidCardRejection } from './prepaid-card.ts';

const august = {
  validFrom: '2026-08-01',
  expirationDate: '2026-08-31',
  paymentStatus: 'PAID',
};

test('parisDay projects a UTC instant onto the Paris calendar day', () => {
  assert.equal(parisDay('2026-08-15T07:00:00.000Z'), '2026-08-15');
  // Summer, +02:00: 22:00Z on Aug 31 is already Sep 1 in Paris.
  assert.equal(parisDay('2026-08-31T21:00:00.000Z'), '2026-08-31');
  assert.equal(parisDay('2026-08-31T22:00:00.000Z'), '2026-09-01');
  // Winter, +01:00.
  assert.equal(parisDay('2026-01-31T23:30:00.000Z'), '2026-02-01');
  assert.equal(parisDay('nonsense'), null);
});

test('a card only pays for bookings inside its window', () => {
  assert.equal(prepaidCardRejection(august, ['2026-08-15T07:00:00.000Z']), null);
  // Bounds are inclusive, as the frontend rule has been since 09eca14.
  assert.equal(prepaidCardRejection(august, ['2026-08-01T07:00:00.000Z']), null);
  assert.equal(prepaidCardRejection(august, ['2026-08-31T07:00:00.000Z']), null);

  // The reported incident: an August card paying for a September slot.
  assert.match(prepaidCardRejection(august, ['2026-09-02T07:00:00.000Z']), /outside/);
  assert.match(prepaidCardRejection(august, ['2026-07-31T07:00:00.000Z']), /outside/);

  // The case a naive UTC comparison would let through.
  assert.match(prepaidCardRejection(august, ['2026-08-31T22:00:00.000Z']), /outside/);

  // The whole batch is paid with one card, so one bad date rejects all of it.
  assert.match(
    prepaidCardRejection(august, ['2026-08-15T07:00:00.000Z', '2026-09-02T07:00:00.000Z']),
    /outside/,
  );
});

test('fails closed', () => {
  assert.match(prepaidCardRejection({ ...august, paymentStatus: 'PENDING' }, []), /not paid/);
  assert.match(prepaidCardRejection(august, ['nonsense']), /Invalid booking date/);
  assert.match(
    prepaidCardRejection({ paymentStatus: 'PAID' }, ['2026-08-15T07:00:00.000Z']),
    /no usable validity window/,
  );
  assert.match(
    prepaidCardRejection({ ...august, expirationDate: null }, ['2026-08-15T07:00:00.000Z']),
    /no usable validity window/,
  );
});

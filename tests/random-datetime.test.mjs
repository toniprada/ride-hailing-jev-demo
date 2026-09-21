import test from 'node:test';
import assert from 'node:assert/strict';
import {randomMadridLocalDateTime} from '../src/random-datetime.mjs';

test('random date and time covers the next seven Madrid-local calendar days', () => {
  const now = new Date('2026-09-21T12:00:00Z');
  const start = randomMadridLocalDateTime(now, () => 0);
  const end = randomMadridLocalDateTime(now, (() => {
    const values = [0.999999, 0.999999];
    return () => values.shift();
  })());

  assert.equal(start, '2026-09-21T00:00');
  assert.equal(end, '2026-09-27T23:59');
});

test('random date is based on Madrid local date across a UTC-day boundary', () => {
  const now = new Date('2026-09-21T22:30:00Z');
  assert.equal(randomMadridLocalDateTime(now, () => 0), '2026-09-22T00:00');
});

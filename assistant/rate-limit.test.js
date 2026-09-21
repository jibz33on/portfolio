import { test } from 'node:test';
import assert from 'node:assert';
import {
  DEFAULT_RULES,
  evaluateWindow,
  createRateLimiter,
  resolveRules
} from './rate-limit.js';

const SEC = 1000;
// A fixed epoch so every assertion about a reset boundary is exact rather than
// relative to wall-clock time. The limiter takes `now` as an argument precisely
// so these tests never sleep.
const T0 = 1_700_000_000_000;

const rule = (limit, windowSeconds) => ({ name: 'test', limit, windowSeconds });
const named = (name, limit, windowSeconds) => ({ name, limit, windowSeconds });

// --- evaluateWindow: the pure core ------------------------------------------

test('first request in a window is allowed and starts the count at one', () => {
  const result = evaluateWindow(undefined, T0, rule(3, 60));

  assert.equal(result.allowed, true);
  assert.equal(result.entry.count, 1);
  assert.equal(result.entry.windowStart, T0);
});

test('requests up to the limit are allowed', () => {
  let entry;
  for (let i = 1; i <= 3; i++) {
    const result = evaluateWindow(entry, T0, rule(3, 60));
    assert.equal(result.allowed, true, `request ${i} of 3 must be allowed`);
    assert.equal(result.entry.count, i);
    entry = result.entry;
  }
});

test('the request past the limit is blocked', () => {
  const entry = { count: 3, windowStart: T0 };

  const result = evaluateWindow(entry, T0, rule(3, 60));

  assert.equal(result.allowed, false);
});

test('a blocked request reports the seconds until the window resets', () => {
  const entry = { count: 3, windowStart: T0 };

  // 20 seconds into a 60-second window, so 40 remain.
  const result = evaluateWindow(entry, T0 + 20 * SEC, rule(3, 60));

  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterSeconds, 40);
});

test('retryAfterSeconds is always at least one second', () => {
  const entry = { count: 3, windowStart: T0 };

  // 59.5s in: 0.5s remain, which must not round down to a Retry-After of 0.
  const result = evaluateWindow(entry, T0 + 59_500, rule(3, 60));

  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterSeconds, 1);
});

test('a blocked request does not extend the window or raise the count', () => {
  const entry = { count: 3, windowStart: T0 };

  const result = evaluateWindow(entry, T0 + 20 * SEC, rule(3, 60));

  assert.equal(result.entry.count, 3, 'a rejected request must not be counted');
  assert.equal(
    result.entry.windowStart,
    T0,
    'a rejected request must not push the reset further away'
  );
});

test('the window resets once it has fully elapsed', () => {
  const entry = { count: 3, windowStart: T0 };

  const result = evaluateWindow(entry, T0 + 60 * SEC, rule(3, 60));

  assert.equal(result.allowed, true);
  assert.equal(result.entry.count, 1, 'a fresh window restarts the count');
  assert.equal(result.entry.windowStart, T0 + 60 * SEC);
});

// Immutability is a house rule, and here it is also load-bearing: the limiter
// evaluates every rule before committing any of them, so an evaluation that
// mutated its input would apply a write it then decided to roll back.
test('evaluateWindow does not mutate the entry it is given', () => {
  const entry = Object.freeze({ count: 1, windowStart: T0 });

  const result = evaluateWindow(entry, T0 + SEC, rule(3, 60));

  assert.equal(entry.count, 1, 'the original entry must be untouched');
  assert.notEqual(result.entry, entry, 'a new entry object must be returned');
});

// --- createRateLimiter: the store -------------------------------------------

test('a limiter allows requests up to the limit then blocks', () => {
  const limiter = createRateLimiter();
  const rules = [rule(3, 60)];

  for (let i = 1; i <= 3; i++) {
    assert.equal(limiter.check('1.2.3.4', T0, rules).allowed, true, `request ${i}`);
  }

  const blocked = limiter.check('1.2.3.4', T0, rules);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);
});

test('separate keys have independent budgets', () => {
  const limiter = createRateLimiter();
  const rules = [rule(2, 60)];

  limiter.check('1.1.1.1', T0, rules);
  limiter.check('1.1.1.1', T0, rules);
  assert.equal(limiter.check('1.1.1.1', T0, rules).allowed, false);

  assert.equal(
    limiter.check('2.2.2.2', T0, rules).allowed,
    true,
    'one heavy client must not exhaust the budget of another'
  );
});

// The reason two windows exist: a burst rule alone lets an attacker pace itself
// just under the per-minute cap forever.
test('the sustained rule blocks a client pacing itself under the burst rule', () => {
  const limiter = createRateLimiter();
  const rules = [named('burst', 2, 60), named('sustained', 3, 3600)];

  // Two requests per minute is always within the burst rule.
  assert.equal(limiter.check('9.9.9.9', T0, rules).allowed, true);
  assert.equal(limiter.check('9.9.9.9', T0 + 60 * SEC, rules).allowed, true);
  assert.equal(limiter.check('9.9.9.9', T0 + 120 * SEC, rules).allowed, true);

  const blocked = limiter.check('9.9.9.9', T0 + 180 * SEC, rules);
  assert.equal(blocked.allowed, false, 'the hourly rule must catch a slow flood');
  assert.equal(blocked.rule, 'sustained', 'the blocking rule is reported');
});

test('a request blocked by one rule does not consume budget from the other', () => {
  const limiter = createRateLimiter();
  const rules = [named('burst', 1, 60), named('sustained', 10, 3600)];

  assert.equal(limiter.check('5.5.5.5', T0, rules).allowed, true);
  // Blocked by burst. Must not spend one of the ten sustained slots.
  assert.equal(limiter.check('5.5.5.5', T0, rules).allowed, false);

  // After the burst window resets, nine sustained slots must remain.
  for (let i = 2; i <= 10; i++) {
    const at = T0 + i * 60 * SEC;
    assert.equal(
      limiter.check('5.5.5.5', at, rules).allowed,
      true,
      `sustained slot ${i} must still be available`
    );
  }
});

test('a blocked client is allowed again once the window passes', () => {
  const limiter = createRateLimiter();
  const rules = [rule(1, 60)];

  assert.equal(limiter.check('7.7.7.7', T0, rules).allowed, true);
  assert.equal(limiter.check('7.7.7.7', T0 + 30 * SEC, rules).allowed, false);
  assert.equal(limiter.check('7.7.7.7', T0 + 60 * SEC, rules).allowed, true);
});

// The limiter lives for the lifetime of a Worker isolate, so an unbounded map
// keyed by client IP is a slow memory leak.
test('expired entries are evicted so the store does not grow without bound', () => {
  const limiter = createRateLimiter({ maxKeys: 50 });
  const rules = [rule(5, 60)];

  for (let i = 0; i < 200; i++) {
    limiter.check(`10.0.0.${i}`, T0, rules);
  }
  // Every window above has long expired by now.
  limiter.check('10.1.1.1', T0 + 3600 * SEC, rules);

  assert.ok(
    limiter.size() <= 50,
    `store held ${limiter.size()} keys, above the 50 cap`
  );
});

// --- resolveRules: configuration --------------------------------------------

test('resolveRules falls back to the defaults when nothing is configured', () => {
  assert.deepEqual(resolveRules({}), DEFAULT_RULES);
  assert.deepEqual(resolveRules(undefined), DEFAULT_RULES);
});

test('resolveRules reads overrides from the environment', () => {
  const rules = resolveRules({
    RATE_LIMIT_BURST_MAX: '5',
    RATE_LIMIT_BURST_WINDOW_SECONDS: '30',
    RATE_LIMIT_SUSTAINED_MAX: '40',
    RATE_LIMIT_SUSTAINED_WINDOW_SECONDS: '600'
  });

  assert.deepEqual(rules, [
    { name: 'burst', limit: 5, windowSeconds: 30 },
    { name: 'sustained', limit: 40, windowSeconds: 600 }
  ]);
});

test('resolveRules overrides one rule without disturbing the other', () => {
  const rules = resolveRules({ RATE_LIMIT_BURST_MAX: '7' });

  assert.equal(rules[0].limit, 7);
  assert.equal(rules[0].windowSeconds, DEFAULT_RULES[0].windowSeconds);
  assert.deepEqual(rules[1], DEFAULT_RULES[1]);
});

// A typo in a dashboard environment variable must not silently disable the
// limiter, which is what Number('abc') -> NaN would do to every comparison.
test('resolveRules ignores values that are not positive integers', () => {
  for (const bad of ['0', '-5', 'abc', '', '  ', '1.5', 'Infinity', null]) {
    const rules = resolveRules({ RATE_LIMIT_BURST_MAX: bad });
    assert.equal(
      rules[0].limit,
      DEFAULT_RULES[0].limit,
      `RATE_LIMIT_BURST_MAX="${bad}" must fall back to the default`
    );
  }
});

test('the default rules are a sane shape', () => {
  for (const r of DEFAULT_RULES) {
    assert.ok(Number.isInteger(r.limit) && r.limit > 0, `${r.name} needs a positive limit`);
    assert.ok(
      Number.isInteger(r.windowSeconds) && r.windowSeconds > 0,
      `${r.name} needs a positive window`
    );
  }
});

// The widget lets one visitor send at most 10 questions. If the burst rule were
// ever tightened below that, a single ordinary conversation would start
// returning 429 and the assistant would look broken to a recruiter.
test('the default burst limit leaves room for a full widget conversation', () => {
  const burst = DEFAULT_RULES.find(r => r.name === 'burst');

  assert.ok(
    burst.limit >= 10,
    `burst limit ${burst.limit} is below the widget's own 10-turn conversation`
  );
});

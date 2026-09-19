import { test } from 'node:test';
import assert from 'node:assert';
import { validateMessages, MAX_MESSAGES, MAX_CONTENT_CHARS } from './chat-core.js';

const ok = c => ({ role: 'user', content: c });

test('accepts a well-formed conversation', () => {
  assert.deepEqual(
    validateMessages([ok('hi'), { role: 'assistant', content: 'hello' }, ok('more')]),
    { ok: true }
  );
});

test('rejects a non-array', () => {
  assert.equal(validateMessages('nope').ok, false);
  assert.equal(validateMessages(null).ok, false);
  assert.equal(validateMessages(undefined).ok, false);
});

test('rejects an empty conversation', () => {
  assert.equal(validateMessages([]).ok, false);
});

test('rejects more than MAX_MESSAGES', () => {
  const tooMany = Array.from({ length: MAX_MESSAGES + 1 }, () => ok('x'));
  assert.equal(validateMessages(tooMany).ok, false);
});

test('accepts exactly MAX_MESSAGES', () => {
  const atLimit = Array.from({ length: MAX_MESSAGES }, () => ok('x'));
  assert.equal(validateMessages(atLimit).ok, true);
});

test('rejects an unknown role', () => {
  assert.equal(validateMessages([{ role: 'system', content: 'x' }]).ok, false);
});

test('rejects non-string content', () => {
  assert.equal(validateMessages([{ role: 'user', content: 42 }]).ok, false);
  assert.equal(validateMessages([{ role: 'user' }]).ok, false);
});

test('rejects content longer than MAX_CONTENT_CHARS', () => {
  assert.equal(validateMessages([ok('x'.repeat(MAX_CONTENT_CHARS + 1))]).ok, false);
});

test('accepts content exactly at MAX_CONTENT_CHARS', () => {
  assert.equal(validateMessages([ok('x'.repeat(MAX_CONTENT_CHARS))]).ok, true);
});

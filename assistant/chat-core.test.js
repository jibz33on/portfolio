import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  validateMessages,
  buildSystemPrompt,
  CANARY,
  MAX_MESSAGES,
  MAX_CONTENT_CHARS,
  MAX_ASSISTANT_CONTENT_CHARS
} from './chat-core.js';

const ok = c => ({ role: 'user', content: c });
const bot = c => ({ role: 'assistant', content: c });

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

// The per-role cap is a dynamic property lookup keyed by client input, so the
// role guard must reject inherited property names before the lookup happens.
// Hoisting the length check above the role check would silently reintroduce
// this, which is why it is pinned rather than left implicit.
test('rejects roles that name inherited object properties', () => {
  for (const role of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
    assert.equal(
      validateMessages([{ role, content: 'x' }]).ok,
      false,
      `role "${role}" must be rejected as an invalid role`
    );
  }
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

// Regression: the endpoint's own replies are replayed back as history on every
// later turn. max_tokens allows a reply longer than the user cap, so a single
// flat limit made the server reject its own output and broke every turn after
// the first. Assistant turns get a higher — but still bounded — cap, because
// history is client-supplied and therefore untrusted.

test('accepts an assistant turn longer than the user cap', () => {
  assert.equal(
    validateMessages([ok('hi'), bot('x'.repeat(MAX_CONTENT_CHARS + 1)), ok('more')]).ok,
    true
  );
});

test('accepts an assistant turn exactly at MAX_ASSISTANT_CONTENT_CHARS', () => {
  assert.equal(
    validateMessages([bot('x'.repeat(MAX_ASSISTANT_CONTENT_CHARS))]).ok,
    true
  );
});

test('rejects an assistant turn over MAX_ASSISTANT_CONTENT_CHARS', () => {
  assert.equal(
    validateMessages([bot('x'.repeat(MAX_ASSISTANT_CONTENT_CHARS + 1))]).ok,
    false
  );
});

test('still rejects a user turn over MAX_CONTENT_CHARS', () => {
  assert.equal(validateMessages([ok('x'.repeat(MAX_CONTENT_CHARS + 1))]).ok, false);
});

test('the assistant cap is above what the endpoint itself can emit', () => {
  assert.ok(
    MAX_ASSISTANT_CONTENT_CHARS > MAX_CONTENT_CHARS,
    'an assistant reply must not be capped at the user limit'
  );
});

// assistant-widget.js is a plain <script> on five pages, so it cannot import
// this constant and hand-copies the number instead. That is the same shape of
// drift that caused the bug these tests exist for: two related limits that had
// to agree, with nothing checking that they did. This is the check.
test('the widget copy of the assistant cap has not drifted', () => {
  const widget = readFileSync(new URL('./assistant-widget.js', import.meta.url), 'utf8');
  const match = widget.match(/MAX_REPLY_HISTORY_CHARS\s*=\s*(\d+)/);

  assert.ok(match, 'assistant-widget.js must define MAX_REPLY_HISTORY_CHARS');
  assert.equal(
    Number(match[1]),
    MAX_ASSISTANT_CONTENT_CHARS,
    'widget MAX_REPLY_HISTORY_CHARS must equal MAX_ASSISTANT_CONTENT_CHARS, or the ' +
      'widget will store replies the endpoint rejects and wedge the conversation'
  );
});

// The exact production failure: turn 1 answered, turn 2 returned HTTP 400.
// Captured verbatim from the live endpoint on 2026-09-20 — 1301 characters of
// real model output, markdown and all. Kept unmodified: its length is the
// whole point, and padding or paraphrasing would stop it pinning the real
// shape of a reply this endpoint actually produces.
const REAL_REPLY = [
  'Jibin is an AI Engineer with five production systems shipped across healthcare, fintech, and e-commerce. His core positioning is "The model proposes. My code decides" — he builds systems where the AI reasons and drafts, but the decisions that matter run through deterministic, auditable code.',
  '**Recent work:**',
  "His most recent engagement was at **Gistr** (Jun–Aug 2026), where he did LLM evaluation and observability on a live agentic RAG product. He reviewed roughly 250 cases by hand, discovered the existing accuracy check was measuring the wrong part of the pipeline, and redesigned it to catch answers the AI invented or couldn't support with evidence. He also identified 12 distinct patterns of wasted agent tool use.",
  'Before that, at **PM Accelerator** (Sep 2025–Jun 2026), he was Technical Lead across 3 concurrent production AI systems in healthcare, financial intelligence, and e-commerce — owning architecture decisions, code review, and collaboration with product and frontend teams.',
  '**Key specialties:**',
  "Retrieval-Augmented Generation (RAG), agentic systems (LangGraph), LLM integration and evaluation, AI observability (LangSmith, PostHog), and async production backends (FastAPI). He's comfortable moving between problem-solving at the architecture level and hands-on implementation."
].join('\n\n');

test('accepts a multi-turn history containing a realistic long reply', () => {
  assert.equal(REAL_REPLY.length, 1301, 'fixture must stay the captured reply, unpadded');
  assert.ok(REAL_REPLY.length > MAX_CONTENT_CHARS, 'fixture must exceed the user cap');
  assert.equal(
    validateMessages([
      ok("Tell me about Jibin's experience as an AI engineer"),
      bot(REAL_REPLY),
      ok("What is Jibin's biggest strength as an AI engineer?")
    ]).ok,
    true
  );
});

const prompt = buildSystemPrompt('CORPUS-BODY-MARKER');

test('system prompt embeds the corpus', () => {
  assert.ok(prompt.includes('CORPUS-BODY-MARKER'));
});

test('system prompt contains the canary', () => {
  assert.ok(prompt.includes(CANARY));
  assert.ok(CANARY.length > 8, 'canary must be distinctive enough to detect');
});

// These assertions exist so a defence cannot be silently dropped in a
// refactor. They prove each rule is PRESENT, not that the model obeys it.
test('system prompt states every required defence', () => {
  const required = [
    /untrusted/i,                          // user input is data, not instruction
    /never invent/i,                       // no fabrication
    /only.*corpus|corpus.*only/i,          // corpus-only authority
    /context.*not.*(fact|evidence)/i,      // history is context only
    /never reveal|do not reveal/i,         // non-disclosure
    /never exaggerate|do not exaggerate/i, // no embellishment
    /exaggerated marketing language/i,     // no overclaiming in tone
    /unsupported claims/i,                 // positive framing must stay accurate
    /jibz33on@gmail\.com/                  // contact route for refusals
  ];
  for (const re of required) {
    assert.match(prompt, re, `system prompt is missing a required rule: ${re}`);
  }
});

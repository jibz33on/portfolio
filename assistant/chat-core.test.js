import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  validateMessages,
  buildSystemPrompt,
  CANARY,
  MAX_MESSAGES,
  MAX_CONTENT_CHARS,
  MAX_ASSISTANT_CONTENT_CHARS,
  MAX_ANSWER_WORDS
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

// These assertions exist so a rule cannot be silently dropped in a refactor.
// They prove each rule is PRESENT, not that the model obeys it — whether the
// model complies is what the live suite samples.
// The prompt is hard-wrapped for readability, so a rule can straddle a line
// break. Match against a whitespace-collapsed copy or the assertions become a
// test of where the line wraps rather than of what the prompt says.
const flat = prompt.replace(/\s+/g, ' ');

test('system prompt states every response-quality rule', () => {
  const required = [
    /first sentence answers the question|lead with the answer/i, // answer first
    /decide which kind of question this is|match the length to the question/i, // adaptive length
    /hard limits, not targets/i,                // the per-type budgets bind
    new RegExp(`${MAX_ANSWER_WORDS} words`),    // an explicit ceiling exists
    /never begin a list .*you cannot finish/i,  // no knowingly truncated answers
    /follow-up/i,                               // progressive disclosure
    /evaluated .*built|never turn evaluated into built/i, // ownership vocabulary
    /never compare him to other engineers/i,    // no market-wide claims
    /framing device, not a refrain/i,           // tagline is not a slogan
    /never invent business impact/i,            // no fabricated outcomes
    /do not pitch/i,                            // no availability sales pitch
    /never use Markdown/i,                      // plain-text rendering surface
    /do not restate the same thesis/i,          // stop after the evidence
    /explicitly ties that technology to that specific project/i, // tech grounding
    /leave the project out/i,                   // the bright line that stops inference
    /never answer with a bare list/i,           // ownership verbs in tech answers
    /portfolio classifications/i,               // no inferred "case study" label
    /Exactly two roles, most recent first/i     // overview chronology
  ];
  for (const re of required) {
    assert.match(flat, re, `system prompt is missing a response rule: ${re}`);
  }
});

// The banned vocabulary from the response policy. Listed explicitly so removing
// one from the prompt is a deliberate edit that fails a test, not a silent loss.
test('system prompt bans the promotional adjectives by name', () => {
  for (const word of [
    'substantial', 'deep experience', 'extensive', 'rare',
    'highly reliable', 'industry-leading', 'at scale', 'exceptional', 'impressive'
  ]) {
    assert.ok(
      flat.includes(word),
      `system prompt must name "${word}" as an adjective to avoid`
    );
  }
});

// max_tokens is squeezed between two limits and must satisfy both.
//
// Floor: the policy asks for answers up to MAX_ANSWER_WORDS, so the budget must
// hold that many words or the prompt is asking for answers it will cut off.
// Measured against this corpus: 177 words consumed 300 tokens (1.69/word), so
// 1.8 is a conservative ceiling on that ratio.
//
// Roof: the reply is replayed as history on the next turn, so a full-length
// reply must still fit MAX_ASSISTANT_CONTENT_CHARS. Exceeding this reintroduces
// the multi-turn bug the role-specific caps exist to fix.
//
// Measured across six answer shapes under this prompt: prose runs 4.2-5.1
// chars/token (worst 5.08, the Gistr ownership answer) while bullet lists run
// 2.2-2.9 — many short lines cost more tokens per character, so list-heavy
// replies are the safe case and dense prose is the binding one. 5.5 is the
// worst measured ratio plus a buffer for shapes not sampled here.
const TOKENS_PER_WORD = 1.8;
const CHARS_PER_TOKEN = 5.5;

const maxTokens = (() => {
  const fn = readFileSync(new URL('../functions/api/chat.js', import.meta.url), 'utf8');
  const match = fn.match(/MAX_TOKENS\s*=\s*(\d+)/);
  assert.ok(match, 'functions/api/chat.js must define MAX_TOKENS');
  return Number(match[1]);
})();

test('max_tokens can hold the longest answer the policy permits', () => {
  const needed = Math.ceil(MAX_ANSWER_WORDS * TOKENS_PER_WORD);
  assert.ok(
    maxTokens >= needed,
    `MAX_TOKENS ${maxTokens} cannot hold ${MAX_ANSWER_WORDS} words ` +
      `(needs >= ${needed}); answers will truncate mid-sentence`
  );
});

test('a full-length reply still fits the assistant history cap', () => {
  const worstCase = maxTokens * CHARS_PER_TOKEN;
  assert.ok(
    worstCase <= MAX_ASSISTANT_CONTENT_CHARS,
    `MAX_TOKENS ${maxTokens} can emit ~${worstCase} chars, over the ` +
      `${MAX_ASSISTANT_CONTENT_CHARS}-char history cap; long replies would be ` +
      'dropped from history and wedge the conversation again'
  );
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

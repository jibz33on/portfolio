import { validateMessages, buildSystemPrompt } from '../../assistant/chat-core.js';
import { CORPUS } from '../../assistant/corpus.js';

const MODEL = 'claude-haiku-4-5-20251001';
// Must hold MAX_ANSWER_WORDS (the response policy's ceiling) without cutting
// the answer off, and must stay small enough that a reply still fits
// MAX_ASSISTANT_CONTENT_CHARS when replayed as history. Both bounds are pinned
// by tests in assistant/chat-core.test.js — at 300 the policy's own ceiling
// truncated, which is what moved this number.
const MAX_TOKENS = 360;
const TEMPERATURE = 0.3;

const fail = (status) =>
  new Response(JSON.stringify({ error: 'unavailable' }), {
    status,
    headers: { 'content-type': 'application/json' }
  });

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400);
  }

  const check = validateMessages(body?.messages);
  if (!check.ok) return fail(400);

  if (!env.ANTHROPIC_API_KEY) return fail(502);

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: [
          {
            type: 'text',
            text: buildSystemPrompt(CORPUS),
            cache_control: { type: 'ephemeral' }
          }
        ],
        messages: body.messages
      })
    });
  } catch {
    return fail(502);
  }

  if (!res.ok) return fail(res.status === 429 ? 429 : 502);

  const data = await res.json();
  const reply = data?.content?.[0]?.text;
  if (typeof reply !== 'string') return fail(502);

  // Surfaced so "never knowingly truncate" is testable from outside: guessing
  // at it from trailing punctuation false-positives on bullet lists.
  const truncated = data?.stop_reason === 'max_tokens';

  return new Response(JSON.stringify({ reply, truncated }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

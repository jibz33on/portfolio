import { validateMessages, buildSystemPrompt } from '../../assistant/chat-core.js';
import { CORPUS } from '../../assistant/corpus.js';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 300;
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

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

import { test } from 'node:test';
import assert from 'node:assert';
import { onRequestPost } from '../functions/api/chat.js';

// The endpoint holds one rate-limit store for the lifetime of the module, which
// is exactly how it behaves inside a Worker isolate. Tests therefore never
// reset it; each one uses its own client IP so their budgets cannot collide.
let nextIp = 0;
const freshIp = () => `203.0.113.${++nextIp}`;

const ENV = Object.freeze({
  ANTHROPIC_API_KEY: 'test-key',
  // Small enough to exhaust in a test, large enough to allow a few first.
  RATE_LIMIT_BURST_MAX: '3',
  RATE_LIMIT_BURST_WINDOW_SECONDS: '60',
  RATE_LIMIT_SUSTAINED_MAX: '100',
  RATE_LIMIT_SUSTAINED_WINDOW_SECONDS: '3600'
});

const ask = (body = { messages: [{ role: 'user', content: 'hi' }] }) =>
  new Request('https://jibink.com/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

function call(request, { ip, env = ENV } = {}) {
  const headers = new Headers(request.headers);
  headers.set('CF-Connecting-IP', ip);
  const withIp = new Request(request, { headers });
  return onRequestPost({ request: withIp, env });
}

// Stubs `fetch` for one test and always restores it, so a failing assertion
// cannot leak a stub into the next test.
async function withUpstream(handler, run) {
  const real = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = real;
  }
}

const anthropicOk = (text = 'An answer.') =>
  async () =>
    new Response(
      JSON.stringify({ content: [{ type: 'text', text }], stop_reason: 'end_turn' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );

// --- 1. Requests within the limit succeed normally ---------------------------

test('a request within the limit returns the assistant reply', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk('Jibin is an AI Engineer.'), async () => {
    const res = await call(ask(), { ip });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.reply, 'Jibin is an AI Engineer.');
    assert.equal(body.truncated, false);
  });
});

test('every request up to the limit is served', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 1; i <= 3; i++) {
      const res = await call(ask(), { ip });
      assert.equal(res.status, 200, `request ${i} of 3 should have been served`);
    }
  });
});

test('an allowed response carries no Retry-After header', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    const res = await call(ask(), { ip });
    assert.equal(res.headers.get('retry-after'), null);
  });
});

// --- 2. Requests over the limit return 429 -----------------------------------

test('the request past the limit returns 429', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 0; i < 3; i++) await call(ask(), { ip });

    const res = await call(ask(), { ip });
    assert.equal(res.status, 429);
  });
});

test('a 429 carries a positive Retry-After in seconds', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 0; i < 3; i++) await call(ask(), { ip });
    const res = await call(ask(), { ip });

    const retryAfter = Number(res.headers.get('retry-after'));
    assert.ok(Number.isInteger(retryAfter), 'Retry-After must be an integer');
    assert.ok(retryAfter > 0 && retryAfter <= 60, `Retry-After ${retryAfter} out of range`);
  });
});

// The whole point of the limit: a blocked request must not reach Anthropic,
// because an upstream call is what costs money.
test('a rate-limited request never calls Anthropic', async () => {
  const ip = freshIp();
  let upstreamCalls = 0;

  const counting = async (...args) => {
    upstreamCalls++;
    return anthropicOk()(...args);
  };

  await withUpstream(counting, async () => {
    for (let i = 0; i < 3; i++) await call(ask(), { ip });
    assert.equal(upstreamCalls, 3, 'the three allowed requests should reach upstream');

    await call(ask(), { ip });
    await call(ask(), { ip });
    assert.equal(upstreamCalls, 3, 'blocked requests must not reach upstream');
  });
});

test('one rate-limited client does not block another', async () => {
  const heavy = freshIp();
  const innocent = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 0; i < 4; i++) await call(ask(), { ip: heavy });
    assert.equal((await call(ask(), { ip: heavy })).status, 429);

    const res = await call(ask(), { ip: innocent });
    assert.equal(res.status, 200, 'a different visitor must still be served');
  });
});

// Malformed requests are the cheap way to hammer an endpoint, so they have to
// count against the limit too.
test('invalid requests also consume the rate limit', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 0; i < 3; i++) {
      const res = await call(ask({ messages: 'not-an-array' }), { ip });
      assert.equal(res.status, 400);
    }

    const res = await call(ask(), { ip });
    assert.equal(res.status, 429, 'bad requests must not be a free way to hammer the API');
  });
});

// --- 3. Normal API errors still behave correctly -----------------------------

test('a malformed body still returns 400', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    const res = await call(ask({ messages: [{ role: 'system', content: 'x' }] }), { ip });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'unavailable' });
  });
});

test('unparseable JSON still returns 400', async () => {
  const ip = freshIp();
  const request = new Request('https://jibink.com/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: 'not json at all'
  });

  await withUpstream(anthropicOk(), async () => {
    const res = await onRequestPost({ request, env: ENV });
    assert.equal(res.status, 400);
  });
});

test('a missing API key still returns 502', async () => {
  const ip = freshIp();
  const env = { ...ENV, ANTHROPIC_API_KEY: undefined };

  await withUpstream(anthropicOk(), async () => {
    const res = await call(ask(), { ip, env });
    assert.equal(res.status, 502);
  });
});

test('an upstream failure still returns 502', async () => {
  const ip = freshIp();
  const failing = async () => new Response('boom', { status: 500 });

  await withUpstream(failing, async () => {
    const res = await call(ask(), { ip });
    assert.equal(res.status, 502);
  });
});

// Anthropic returns 429 when the workspace spend cap is reached. That is a
// different cause from our own limit but the same status, and it must still
// pass through rather than being reported as a server error.
test('an upstream 429 from the spend cap still returns 429', async () => {
  const ip = freshIp();
  const capped = async () => new Response('{"error":"rate_limit"}', { status: 429 });

  await withUpstream(capped, async () => {
    const res = await call(ask(), { ip });
    assert.equal(res.status, 429);
  });
});

test('a network error reaching Anthropic still returns 502', async () => {
  const ip = freshIp();
  const throwing = async () => {
    throw new Error('network down');
  };

  await withUpstream(throwing, async () => {
    const res = await call(ask(), { ip });
    assert.equal(res.status, 502);
  });
});

test('a reply that is not text still returns 502', async () => {
  const ip = freshIp();
  const odd = async () =>
    new Response(JSON.stringify({ content: [] }), { status: 200 });

  await withUpstream(odd, async () => {
    const res = await call(ask(), { ip });
    assert.equal(res.status, 502);
  });
});

// --- The API contract the widget depends on ----------------------------------

test('a truncated reply is still flagged to the client', async () => {
  const ip = freshIp();
  const truncated = async () =>
    new Response(
      JSON.stringify({ content: [{ type: 'text', text: 'Half a sen' }], stop_reason: 'max_tokens' }),
      { status: 200 }
    );

  await withUpstream(truncated, async () => {
    const res = await call(ask(), { ip });
    const body = await res.json();

    assert.equal(body.reply, 'Half a sen');
    assert.equal(body.truncated, true);
  });
});

test('every response is JSON', async () => {
  const ip = freshIp();

  await withUpstream(anthropicOk(), async () => {
    for (let i = 0; i < 4; i++) {
      const res = await call(ask(), { ip });
      assert.match(
        res.headers.get('content-type') ?? '',
        /application\/json/,
        `status ${res.status} must still be JSON`
      );
    }
  });
});

// A request with no client IP must not become a shared bucket that one bot can
// exhaust for everyone. On Cloudflare the header is always present; this pins
// the behaviour if it ever is not.
test('a request without a client IP is still served', async () => {
  const request = new Request('https://jibink.com/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })
  });

  await withUpstream(anthropicOk(), async () => {
    const res = await onRequestPost({ request, env: ENV });
    assert.equal(res.status, 200);
  });
});

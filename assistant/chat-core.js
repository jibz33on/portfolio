export const MAX_MESSAGES = 20;
export const MAX_CONTENT_CHARS = 1000;
const ROLES = new Set(['user', 'assistant']);

export function validateMessages(messages) {
  if (!Array.isArray(messages)) return { ok: false, error: 'messages must be an array' };
  if (messages.length === 0) return { ok: false, error: 'messages must not be empty' };
  if (messages.length > MAX_MESSAGES) return { ok: false, error: 'conversation too long' };

  for (const m of messages) {
    if (!m || typeof m !== 'object') return { ok: false, error: 'malformed message' };
    if (!ROLES.has(m.role)) return { ok: false, error: 'invalid role' };
    if (typeof m.content !== 'string') return { ok: false, error: 'content must be a string' };
    if (m.content.length > MAX_CONTENT_CHARS) return { ok: false, error: 'message too long' };
  }
  return { ok: true };
}

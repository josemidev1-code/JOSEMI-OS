import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';
const origin = 'https://josemidev1.site';
const request = (body = { messages: [{ role: 'user', content: 'Hola' }] }) => new Request('https://milo-ai.josemidev1.workers.dev/chat', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('CORS preflight works without a key', async () => {
  const r = await worker.fetch(new Request('https://example.test/chat', { method: 'OPTIONS', headers: { Origin: origin } }), {});
  assert.equal(r.status, 204); assert.equal(r.headers.get('Access-Control-Allow-Origin'), origin);
});
test('unknown origins are rejected', async () => {
  const r = await worker.fetch(new Request('https://example.test/chat', { method: 'OPTIONS', headers: { Origin: 'https://unknown.test' } }), {});
  assert.equal(r.status, 403); assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
});
test('missing key returns a clear error with CORS', async () => {
  const r = await worker.fetch(request(), {}); assert.equal(r.status, 503); assert.equal(r.headers.get('Access-Control-Allow-Origin'), origin);
});
test('site requests remain served by assets', async () => {
  const r = await worker.fetch(new Request('https://example.test/'), { ASSETS: { fetch: () => new Response('portfolio') } });
  assert.equal(await r.text(), 'portfolio');
});
test('invalid messages do not call Groq', async () => {
  assert.equal((await worker.fetch(request({ messages: [] }), { GROQ_API_KEY: 'test-only' })).status, 400);
});
test('Groq response and tool calls are passed to the frontend', async () => {
  const original = globalThis.fetch;
  try {
    const message = { role: 'assistant', content: null, tool_calls: [{ id: '1', type: 'function', function: { name: 'open_app', arguments: '{"app":"projects"}' } }] };
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
      const body = JSON.parse(options.body); assert.equal(body.model, 'llama-3.3-70b-versatile'); assert.equal(body.tools.length, 1);
      return Response.json({ choices: [{ message }] });
    };
    const r = await worker.fetch(request({ messages: [{ role: 'user', content: 'Projectes' }], tools: [{ type: 'function', function: { name: 'open_app' } }] }), { GROQ_API_KEY: 'test-only' });
    assert.equal(r.status, 200); assert.deepEqual(await r.json(), { message });
  } finally { globalThis.fetch = original; }
});
test('Groq failure keeps CORS and does not expose provider content', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('private provider details', { status: 401 });
    const r = await worker.fetch(request(), { GROQ_API_KEY: 'test-only' });
    assert.equal(r.status, 502); assert.equal(r.headers.get('Access-Control-Allow-Origin'), origin);
    assert.equal((await r.json()).provider_status, 401);
  } finally { globalThis.fetch = original; }
});

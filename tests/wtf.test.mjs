import test from 'node:test';
import assert from 'node:assert/strict';
import { callWtfSearch } from '../src/providers/wtf.ts';

const ctx = {};

function mockFetch(json, ok = true, status = 200) {
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok, status, json: async () => json, text: async () => JSON.stringify(json) };
  };
  return calls;
}

test('posts to /api/v1/chat/completions with Bearer + model', async () => {
  process.env.WTF_SEARCH_BASE_URL = 'https://admin.router.plus';
  process.env.WTF_SEARCH_API_KEY = 'k';
  process.env.WTF_SEARCH_MODEL = 'pplx-web/pplx-auto';
  const calls = mockFetch({ choices: [{ message: { content: 'hi' } }] });
  const r = await callWtfSearch(ctx, 'hello');
  assert.equal(r.text, 'hi');
  assert.equal(calls[0].url, 'https://admin.router.plus/api/v1/chat/completions');
  const body = JSON.parse(calls[0].opts.body);
  assert.equal(body.model, 'pplx-web/pplx-auto');
  assert.equal(body.stream, false);
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer k');
});

test('throws when missing api key', async () => {
  delete process.env.WTF_SEARCH_API_KEY;
  process.env.WTF_SEARCH_CONFIG = '/nonexistent-wtf-search.json';
  // point agent dir away from real ~/.pi/agent/wtf-search.json
  process.env.PI_CODING_AGENT_DIR = '/tmp';
  await assert.rejects(() => callWtfSearch(ctx, 'q'), /Missing WTF_SEARCH_API_KEY/);
  delete process.env.WTF_SEARCH_CONFIG;
});

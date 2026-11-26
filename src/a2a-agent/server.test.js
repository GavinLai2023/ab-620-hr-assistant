import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createApp } from './server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.A2A_API_KEY || 'dev-local-key';

function withServer(fn) {
  return async () => {
    const server = createApp();
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    try {
      await fn(`http://localhost:${port}`);
    } finally {
      server.close();
    }
  };
}

function post(base, body, headers = { 'x-api-key': API_KEY }) {
  return fetch(`${base}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function send(base, text, extraParts = []) {
  const res = await post(base, {
    jsonrpc: '2.0',
    id: 1,
    method: 'message/send',
    params: {
      message: {
        kind: 'message',
        role: 'user',
        messageId: 'm1',
        contextId: 'c1',
        parts: [{ kind: 'text', text }, ...extraParts],
      },
    },
  });
  assert.equal(res.status, 200);
  return res.json();
}

test('agent card is served without an API key on both well-known paths', withServer(async (base) => {
  for (const path of ['/.well-known/agent.json', '/.well-known/agent-card.json']) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.name, 'Onboarding Schedule Agent');
    assert.equal(body.protocolVersion, '0.3.0');
  }
}));

test('GET on the endpoint root also returns the agent card', withServer(async (base) => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, 'Onboarding Schedule Agent');
}));

test('agent card url uses the public host forwarded by the tunnel', withServer(async (base) => {
  const res = await fetch(`${base}/.well-known/agent-card.json`, {
    headers: { 'x-forwarded-host': 'abc123-3200.auc1.devtunnels.ms' },
  });
  const body = await res.json();
  assert.equal(body.url, 'https://abc123-3200.auc1.devtunnels.ms/');
}));

test('message/send returns the schedule for a department named in the text', withServer(async (base) => {
  const body = await send(base, 'What does week one look like in Engineering?');
  assert.equal(body.result.kind, 'message');
  assert.equal(body.result.role, 'agent');
  assert.equal(body.result.contextId, 'c1');
  const text = body.result.parts[0].text;
  assert.ok(text.startsWith('First-week schedule for Engineering:'));
  assert.ok(text.includes('Day 5:'));
}));

test('department matching ignores case', withServer(async (base) => {
  const body = await send(base, 'first week for sales please');
  assert.ok(body.result.parts[0].text.startsWith('First-week schedule for Sales:'));
}));

test('asks which department when none is recognised', withServer(async (base) => {
  const body = await send(base, 'What happens in my first week? I start on day three.');
  assert.equal(body.result.parts[0].text,
    'Which department? I have schedules for Engineering, Finance, HR and Sales.');
}));

test('non-text parts are ignored', withServer(async (base) => {
  const body = await send(base, 'Finance', [{ kind: 'data', data: { a: 1 } }]);
  assert.ok(body.result.parts[0].text.startsWith('First-week schedule for Finance:'));
}));

test('every department in employees.csv has a five-day schedule', () => {
  const csv = readFileSync(join(__dirname, '..', '..', 'data', 'employees.csv'), 'utf8').trim().split(/\r?\n/);
  const departments = new Set(csv.slice(1).map((line) => line.split(',')[2]));
  const schedule = JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', 'onboarding', 'first-week-schedule.json'), 'utf8'));
  for (const dept of departments) {
    assert.ok(Array.isArray(schedule[dept]), `missing schedule for ${dept}`);
    assert.equal(schedule[dept].length, 5);
  }
});

test('POST without the API key returns 401', withServer(async (base) => {
  const res = await post(base, { jsonrpc: '2.0', id: 1, method: 'message/send', params: {} }, {});
  assert.equal(res.status, 401);
}));

test('unknown JSON-RPC method returns error -32601 with the request id', withServer(async (base) => {
  const res = await post(base, { jsonrpc: '2.0', id: 7, method: 'message/stream', params: {} });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.error.code, -32601);
  assert.equal(body.id, 7);
}));

test('invalid JSON returns error -32700', withServer(async (base) => {
  const res = await post(base, 'not json');
  const body = await res.json();
  assert.equal(body.error.code, -32700);
  assert.equal(body.id, null);
}));

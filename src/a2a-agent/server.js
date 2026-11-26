import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.A2A_API_KEY || 'dev-local-key';
const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Sales'];

function loadSchedule() {
  const path = join(__dirname, '..', '..', 'data', 'onboarding', 'first-week-schedule.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function agentCard(req) {
  return {
    protocolVersion: '0.3.0',
    name: 'Onboarding Schedule Agent',
    description: 'Returns the first-week onboarding schedule (day 1 to day 5) for a Contoso department: Engineering, Finance, HR or Sales.',
    // the tunnel rewrites Host to localhost and passes the public host in X-Forwarded-Host
    url: `https://${req.headers['x-forwarded-host'] || req.headers.host}/`,
    version: '1.0.0',
    preferredTransport: 'JSONRPC',
    capabilities: { streaming: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills: [{
      id: 'first-week-schedule',
      name: 'First-week schedule',
      description: "Day-by-day plan for a new hire's first week in a given department.",
      tags: ['onboarding'],
      examples: ['What does the first week look like in Engineering?'],
    }],
  };
}

function findDepartment(text) {
  // whole-word match so "HR" does not match inside words like "three"
  return DEPARTMENTS.find((d) => new RegExp(`\\b${d}\\b`, 'i').test(text));
}

function replyText(schedule, text) {
  const dept = findDepartment(text);
  if (!dept) return 'Which department? I have schedules for Engineering, Finance, HR and Sales.';
  const days = schedule[dept].map((item, i) => `Day ${i + 1}: ${item}`);
  return [`First-week schedule for ${dept}:`, ...days].join('\n');
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function rpcError(res, id, code, message) {
  sendJson(res, 200, { jsonrpc: '2.0', id, error: { code, message } });
}

export function createApp() {
  const schedule = loadSchedule();

  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    console.log(`${req.method} ${url.pathname}`);

    // Copilot Studio also sends GET to the endpoint root when validating the connection form
    if (req.method === 'GET' && ['/', '/.well-known/agent.json', '/.well-known/agent-card.json'].includes(url.pathname)) {
      return sendJson(res, 200, agentCard(req));
    }
    if (req.method !== 'POST' || url.pathname !== '/') {
      return sendJson(res, 404, { error: 'not_found' });
    }
    if (req.headers['x-api-key'] !== API_KEY) {
      return sendJson(res, 401, { error: 'invalid_api_key' });
    }

    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      // logged in full so the payload Copilot Studio sends can be inspected
      console.log(raw);
      let rpc;
      try {
        rpc = JSON.parse(raw);
      } catch {
        return rpcError(res, null, -32700, 'Parse error');
      }
      if (rpc.method !== 'message/send') {
        return rpcError(res, rpc.id ?? null, -32601, `Method not found: ${rpc.method}`);
      }
      const message = rpc.params?.message ?? {};
      const text = (message.parts ?? [])
        .filter((p) => p.kind === 'text')
        .map((p) => p.text)
        .join(' ');
      sendJson(res, 200, {
        jsonrpc: '2.0',
        id: rpc.id,
        result: {
          kind: 'message',
          role: 'agent',
          messageId: randomUUID(),
          contextId: message.contextId,
          parts: [{ kind: 'text', text: replyText(schedule, text) }],
        },
      });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3200;
  createApp().listen(port, () => {
    console.log(`a2a-agent listening on :${port}`);
  });
}

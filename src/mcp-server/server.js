import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEmployees() {
  const csvPath = join(__dirname, '..', '..', 'data', 'employees.csv');
  // git autocrlf may check the CSV out with CRLF endings
  const lines = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const record = {};
    headers.forEach((h, i) => { record[h] = values[i]; });
    record.AnnualLeaveBalance = Number(record.AnnualLeaveBalance);
    record.SickLeaveBalance = Number(record.SickLeaveBalance);
    return record;
  });
}

const employees = loadEmployees();

function createMcpServer() {
  const server = new McpServer({ name: 'hr-assistant-mcp', version: '1.0.0' });

  server.registerTool(
    'search_employee',
    {
      description: 'Search employees by a substring of their name or department. Returns EmployeeId, Name and Department for each match.',
      inputSchema: { query: z.string().describe('Part of a name or department to search for') },
    },
    async ({ query }) => {
      const q = query.toLowerCase();
      const matches = employees.filter(
        (e) => e.Name.toLowerCase().includes(q) || e.Department.toLowerCase().includes(q)
      );
      return { content: [{ type: 'text', text: JSON.stringify(matches) }] };
    }
  );

  server.registerTool(
    'get_leave_balance',
    {
      description: 'Get the remaining annual and sick leave days for one employee, looked up by EmployeeId (e.g. E001).',
      inputSchema: { employeeId: z.string().describe('Employee id, e.g. E001') },
    },
    async ({ employeeId }) => {
      const emp = employees.find((e) => e.EmployeeId === employeeId);
      if (!emp) {
        return { content: [{ type: 'text', text: `No employee with id ${employeeId}` }], isError: true };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            EmployeeId: emp.EmployeeId,
            AnnualLeaveBalance: emp.AnnualLeaveBalance,
            SickLeaveBalance: emp.SickLeaveBalance,
          }),
        }],
      };
    }
  );

  return server;
}

const app = express();
app.use(express.json());
const transports = {};

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  let transport = sessionId && transports[sessionId];

  if (!transport) {
    if (sessionId || !isInitializeRequest(req.body)) {
      res.status(400).json({ error: 'invalid_session' });
      return;
    }
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newId) => { transports[newId] = transport; },
    });
    const server = createMcpServer();
    await server.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', async (req, res) => {
  const transport = transports[req.headers['mcp-session-id']];
  if (!transport) {
    res.status(400).send('invalid session');
    return;
  }
  await transport.handleRequest(req, res);
});

const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`mcp-server listening on :${port}`));

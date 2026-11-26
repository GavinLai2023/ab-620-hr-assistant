import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

const API_KEY = process.env.EMPLOYEE_API_KEY || 'dev-local-key';

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

test('GET /employees/:id returns the matching employee', withServer(async (base) => {
  const res = await fetch(`${base}/employees/E001`, { headers: { 'x-api-key': API_KEY } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.Name, 'Alice Chen');
}));

test('GET /employees/:id returns 404 for an unknown id', withServer(async (base) => {
  const res = await fetch(`${base}/employees/E999`, { headers: { 'x-api-key': API_KEY } });
  assert.equal(res.status, 404);
}));

test('GET /employees/:id/leave returns only the balance fields', withServer(async (base) => {
  const res = await fetch(`${base}/employees/E002/leave`, { headers: { 'x-api-key': API_KEY } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { EmployeeId: 'E002', AnnualLeaveBalance: 14, SickLeaveBalance: 8 });
}));

test('GET /employees?department= filters by department', withServer(async (base) => {
  const res = await fetch(`${base}/employees?department=Engineering`, { headers: { 'x-api-key': API_KEY } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.length > 0);
  assert.ok(body.every((e) => e.Department === 'Engineering'));
}));

test('GET /employees without department returns 400', withServer(async (base) => {
  const res = await fetch(`${base}/employees`, { headers: { 'x-api-key': API_KEY } });
  assert.equal(res.status, 400);
}));

test('a request without the API key is rejected', withServer(async (base) => {
  const res = await fetch(`${base}/employees/E001`);
  assert.equal(res.status, 401);
}));

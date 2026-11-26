import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.EMPLOYEE_API_KEY || 'dev-local-key';
const FAIL_MODE = process.env.FAIL_MODE || '';

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

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(data);
}

export function createApp() {
  const employees = loadEmployees();

  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.headers['x-api-key'] !== API_KEY) {
      return sendJson(res, 401, { error: 'invalid_api_key' });
    }
    if (FAIL_MODE === '500') {
      return sendJson(res, 500, { error: 'internal_error' });
    }
    if (FAIL_MODE === 'timeout') {
      return;
    }

    const leaveMatch = url.pathname.match(/^\/employees\/([^/]+)\/leave$/);
    const empMatch = url.pathname.match(/^\/employees\/([^/]+)$/);

    if (leaveMatch) {
      const emp = employees.find((e) => e.EmployeeId === leaveMatch[1]);
      if (!emp) return sendJson(res, 404, { error: 'not_found' });
      return sendJson(res, 200, {
        EmployeeId: emp.EmployeeId,
        AnnualLeaveBalance: emp.AnnualLeaveBalance,
        SickLeaveBalance: emp.SickLeaveBalance,
      });
    }

    if (url.pathname === '/employees') {
      const department = url.searchParams.get('department');
      if (!department) return sendJson(res, 400, { error: 'department_required' });
      const matches = employees.filter(
        (e) => e.Department.toLowerCase() === department.toLowerCase()
      );
      return sendJson(res, 200, matches);
    }

    if (empMatch) {
      const emp = employees.find((e) => e.EmployeeId === empMatch[1]);
      if (!emp) return sendJson(res, 404, { error: 'not_found' });
      return sendJson(res, 200, emp);
    }

    sendJson(res, 404, { error: 'not_found' });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`employee-api listening on :${port}`);
  });
}

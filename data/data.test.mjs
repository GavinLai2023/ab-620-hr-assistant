import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCsv(name) {
  const [header, ...lines] = readFileSync(join(__dirname, name), 'utf8').trim().split(/\r?\n/);
  const cols = header.split(',');
  return lines.map((line) => Object.fromEntries(line.split(',').map((v, i) => [cols[i], v])));
}

const employees = readCsv('employees.csv');
const requests = readCsv('leave-requests.csv');
const deptOf = Object.fromEntries(employees.map((e) => [e.EmployeeId, e.Department]));

// approved leave days per department, plus headcount from employees.csv
function approvedByDepartment() {
  const stats = {};
  for (const e of employees) stats[e.Department] ??= { days: 0, headcount: 0 };
  for (const e of employees) stats[e.Department].headcount += 1;
  for (const r of requests.filter((r) => r.Status === 'Approved')) {
    stats[deptOf[r.EmployeeId]].days += Number(r.Days);
  }
  return stats;
}

test('every leave request references an existing employee', () => {
  for (const r of requests) assert.ok(deptOf[r.EmployeeId], `unknown employee ${r.EmployeeId} in ${r.RequestId}`);
});

test('RequestIds are unique, Days is a positive integer, EndDate >= StartDate', () => {
  assert.equal(new Set(requests.map((r) => r.RequestId)).size, requests.length);
  for (const r of requests) {
    assert.match(r.Days, /^[1-9]\d*$/, `bad Days in ${r.RequestId}`);
    assert.match(r.StartDate, /^2026-\d{2}-\d{2}$/);
    assert.match(r.EndDate, /^2026-\d{2}-\d{2}$/);
    assert.ok(r.EndDate >= r.StartDate, `EndDate before StartDate in ${r.RequestId}`);
    assert.ok(['Annual', 'Sick'].includes(r.Type), `bad Type in ${r.RequestId}`);
    assert.ok(['Approved', 'Pending', 'Rejected'].includes(r.Status), `bad Status in ${r.RequestId}`);
  }
});

test('there are between 30 and 50 requests', () => {
  assert.ok(requests.length >= 30 && requests.length <= 50, `got ${requests.length}`);
});

test('Engineering has the most approved leave days in total, at least 1.5x the runner-up', () => {
  const stats = approvedByDepartment();
  const [top, second] = Object.entries(stats).sort((a, b) => b[1].days - a[1].days);
  assert.equal(top[0], 'Engineering');
  assert.ok(top[1].days >= 1.5 * second[1].days, `${top[1].days} vs ${second[0]} ${second[1].days}`);
});

test('Finance has the most approved leave days per employee', () => {
  const stats = approvedByDepartment();
  const [top] = Object.entries(stats).sort((a, b) => b[1].days / b[1].headcount - a[1].days / a[1].headcount);
  assert.equal(top[0], 'Finance');
});

test('careers FAQ for external applicants contains no employee data', () => {
  const faq = readFileSync(join(__dirname, 'careers-faq.md'), 'utf8');
  for (const e of employees) {
    assert.ok(!faq.includes(e.EmployeeId), `careers FAQ mentions ${e.EmployeeId}`);
    assert.ok(!faq.includes(e.Name), `careers FAQ mentions ${e.Name}`);
  }
  assert.match(faq, /^# /m);
});

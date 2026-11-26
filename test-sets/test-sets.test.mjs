import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

// minimal CSV parser: quoted fields may contain commas and doubled quotes
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function readCsv(path) {
  const [header, ...lines] = parseCsv(readFileSync(path, 'utf8').replace(/^﻿/, ''));
  return { header, rows: lines.map((l) => Object.fromEntries(l.map((v, i) => [header[i], v]))) };
}

const PLANNED = {
  policy: 8, 'leave-balance': 4, 'employee-search': 2, 'password-reset': 2, 'submit-leave': 2,
  onboarding: 3, summariser: 2, 'custom-prompt-or-search': 2, 'out-of-scope': 5,
};

const testSet = readCsv(join(__dirname, 'hr-assistant-v1.csv'));
const meta = readCsv(join(__dirname, 'hr-assistant-v1-meta.csv'));
const employees = readCsv(join(dataDir, 'employees.csv')).rows;
const policyText = readdirSync(join(dataDir, 'policies'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(join(dataDir, 'policies', f), 'utf8'))
  .join('\n')
  .toLowerCase();

test('import file has the exact header and 30 rows', () => {
  assert.deepEqual(testSet.header, ['Question', 'Expected response']);
  assert.equal(testSet.rows.length, 30);
  for (const r of testSet.rows) {
    assert.ok(r.Question, 'empty Question');
    assert.ok(r.Question.length <= 1000, `Question too long: ${r.Question}`);
    assert.ok(r['Expected response'], `empty Expected response for: ${r.Question}`);
  }
  assert.equal(new Set(testSet.rows.map((r) => r.Question)).size, 30, 'duplicate Question');
});

test('meta file matches the import file row by row', () => {
  assert.deepEqual(meta.header, ['Question', 'Category', 'Expected capability', 'Keywords']);
  assert.equal(meta.rows.length, 30);
  meta.rows.forEach((m, i) => assert.equal(m.Question, testSet.rows[i].Question, `row ${i + 2} differs`));
});

test('categories have the planned counts', () => {
  const counts = {};
  for (const m of meta.rows) counts[m.Category] = (counts[m.Category] ?? 0) + 1;
  assert.deepEqual(counts, PLANNED);
});

test('leave balance answers match employees.csv', () => {
  const byId = Object.fromEntries(employees.map((e) => [e.EmployeeId, e]));
  meta.rows.forEach((m, i) => {
    if (m.Category !== 'leave-balance') return;
    const id = m.Question.match(/E\d{3}/)?.[0];
    assert.ok(byId[id], `no known employee id in: ${m.Question}`);
    const numbers = testSet.rows[i]['Expected response'].match(/\d+/g) ?? [];
    const { AnnualLeaveBalance, SickLeaveBalance } = byId[id];
    assert.ok(
      numbers.includes(AnnualLeaveBalance) || numbers.includes(SickLeaveBalance),
      `${id}: expected ${AnnualLeaveBalance} or ${SickLeaveBalance} in answer`,
    );
  });
});

test('policy keywords appear in the policy text', () => {
  for (const m of meta.rows.filter((m) => ['policy', 'summariser'].includes(m.Category))) {
    const keywords = m.Keywords.split(';').map((k) => k.trim()).filter(Boolean);
    assert.ok(keywords.length > 0, `no keywords for: ${m.Question}`);
    for (const k of keywords) assert.ok(policyText.includes(k.toLowerCase()), `"${k}" not in policies`);
  }
});

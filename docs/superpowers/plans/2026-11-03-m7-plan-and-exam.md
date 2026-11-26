# M7 Plan Domain Wrap-up and Exam Prep Implementation Plan

> **For agentic workers:** This plan is mainly notes, explain-back and answering questions, with a little browser work (Power Platform admin center, Copilot Studio, AI Skills Navigator) done by the user, who sends screenshots. AI is responsible for drafting the planning notes, writing questions, grading, recording, updating the coverage table, and committing at the end of each Task. The only code change is `data/careers-faq.md` and its test, written with TDD. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill in the 7 bullets of Plan an agent solution (especially bullets 5 and 7, which are completely empty), fill the Explain and Ready columns of the coverage table, use 20 scenario questions and the official Practice Assessment to check whether the exam readiness criteria are met, and if they are, book the exam.

**Architecture:**
- Planning notes: one page per bullet for the 7 bullets, in `milestones/M7-plan-and-exam/planning/`, using HR Assistant as the case study and citing hands-on results from M1-M6.
- The two empty bullets get hands-on work: for bullet 5, create a data policy (DLP) on HR-Dev that covers only HR-Dev, and see how it blocks publishing; for bullet 7, build a small agent `HR Careers FAQ` for external job applicants, and compare it with the internal HR Assistant.
- The readiness check has three layers: bullet-by-bullet explain-back (Explain column) → 20 scenario questions → Practice Assessment.

**Tech Stack:** Power Platform admin center data policies, Copilot Studio (authentication, channels, file knowledge), Microsoft Learn, AI Skills Navigator, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-13-ab-620-hr-assistant-design.md` (§4 M7, §7 exam readiness criteria)

## Global Constraints

- **Things found while writing the plan (2026-11-03) that differ from the design doc:**
  1. **The Practice Assessment is already live**, but not on Learn: it's on the AB-620 certification page in AI Skills Navigator, and you have to sign in to start (entry point in the Tip at the top of the [study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-620)).
  2. **The AB-620T00 course is already live** (3-day instructor-led course; the self-paced version has 5 learning paths, about 72 hours total). 72 hours exceeds M7's budget, so read only the parts related to the planning domain, not as a systematic review.
  3. **Exam objective domain weights**: Plan and configure agent solutions 30-35%, Integrate and extend agents 40-45%, Test and manage agents 20-25%. The study guide page has ms.date 2026-04-09, and its 44 bullets match `docs/coverage.md`.
  4. **DLP has been enforced on all tenants since 2025**, with no exemptions. Copilot Studio has its own set of "connectors" that can be blocked in a data policy, e.g. `HTTP`, `Chat without Microsoft Entra ID authentication in Copilot Studio`, `Direct Line channels in Copilot Studio`. On a violation **the Publish button is greyed out**, and the banner has Details for downloading the specifics ([Configure data policies for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention)).
  5. **(Found during Task 1) Copilot Studio now has the harness concept**: three kinds, standard, GitHub Copilot, Customer Conversation ([Harnesses in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview), 2026-10-19). M1-M6 were all standard. All 5 paths of AB-620T00 have been changed to center on the GitHub Copilot harness, but the study guide is still the 2026-04-09 version. Task 2 adds a page `08-harnesses.md`; Task 6 rechecks the study guide before booking.
- **The data policy may select only one environment, HR-Dev** (Define scope → Add multiple environments); never choose Add all environments. Delete this policy once the experiment is done.
- **`HR Careers FAQ` connects no tools, connectors or flows**; its only knowledge source is `data/careers-faq.md`. It uses No authentication, so anyone with the link can chat with it; therefore it must contain no internal data.
- **The Practice Assessment's question text does not go into the repo**; record only the score, per-domain scores and the topics answered wrong. AI writes its own scenario questions and does not copy the Practice Assessment.
- **Book the exam** with a personal MSA account (as the certification page recommends). No personal information other than the booking confirmation number and exam time goes into the repo.
- **Secrets go neither into the repo nor into the chat.** Before committing, search the whole repo as usual for Bearer, eyJ, AccountKey, api-key, devtunnels.ms, GUIDs, subscription IDs, admin@.
- **The Azure free credit expires 2026-11-15.** M7 needs no Azure resources. In Task 1 the user decides whether to upgrade or let it expire.
- **UI paths change.** If a menu can't be found, find it yourself by "Goal" and "Verify", and record the actual path in notes.md.
- If any single step is stuck for more than 1 hour, stop, record it in `milestones/M7-plan-and-exam/break-and-fix.md`, and move on.
- Commit at the end of each Task; commit messages in English, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Push only in Task 6.

## Review Focus

Five things in the plan most likely to go wrong that no step specifically checks:

1. **The data policy's scope is chosen wrong**, affecting HR-Test or other environments in the tenant. In Task 3, screenshot the existing policy list before creating it, screenshot the policy's environment list showing only HR-Dev after creating it, and screenshot the list again after the experiment to confirm it's deleted.
2. **The external agent's knowledge file leaks internal data** (employee names, IDs, balances, internal policy details). The Task 3 test checks that `careers-faq.md` contains none of the EmployeeIds or names in `employees.csv`.
3. **Explain is marked too loosely**, so the coverage table looks on target but I can't answer in the exam. During explain-back, no looking at notes; mark x only if both halves, "what problem it solves" and "when not to use it / what it's easily confused with", are answered correctly; if only half is right, record "again" and don't mark it.
4. **Facts in the planning notes are outdated or speculative** (M6 had several "suspected cause" items). Each fact on each page is marked with its source: hands-on (link to that milestone's notes), docs (link), speculation (write "speculation"). Scenario question grading accepts only hands-on and docs.
5. **Scenario questions lean toward things already done**, and bullets not built (23 Copilot connectors, 26 computer use, 34 A2A, and the extension part of 44) don't get tested. When writing questions in Task 5, each of these gets at least one question.

## Coverage targets

| # | Bullet | Filled in which Task |
|---|---|---|
| 1-7 | All 7 bullets of Plan an agent solution | Task 2 planning notes |
| 5 | Evaluate security and governance considerations | Task 3 DLP experiment (Understand + Built) |
| 7 | Design agents for internal or external audiences | Task 3 `HR Careers FAQ` (Understand + Built) |
| 1-44 | Explain column | Task 4 |
| 1-44 | Ready column | Task 5, Task 6 |

---

### Task 1: Exam environment and resource check, Azure decision (about 1 hour)

**Files:**
- Modify: `milestones/M7-plan-and-exam/notes.md`, `README.md`

- [ ] **Step 1: Exam sandbox**

  The user opens the [exam sandbox](https://go.microsoft.com/fwlink/?linkid=2226877) from the certification page and clicks through every question type. AI records in notes.md which question types exist (single choice, multiple choice, drag-and-drop ordering, case study, etc.), whether you can go back and change answers, and how Microsoft Learn is opened during the exam.

- [ ] **Step 2: Confirm the Practice Assessment opens, but don't take it yet**

  The user signs in to AI Skills Navigator, finds the AB-620 Practice Assessment, screenshots the entry point and the question count description, and stops. The real attempt is in Task 5, after the scenario questions.

- [ ] **Step 3: Look at AB-620T00's structure**

  The user opens [AB-620T00](https://learn.microsoft.com/en-us/training/courses/ab-620t00) and screenshots the names of the 5 learning paths and each one's module list. AI records them in notes.md and marks which modules map to the 7 bullets of Plan an agent solution; read those when writing notes in Task 2.

- [ ] **Step 4: Azure expiry decision**

  AI lays out two routes:
  - **Let it expire**: the subscription is disabled, and Foundry, Search, Storage become unusable. Neither M7 nor the exam needs them; upgrade later if needed.
  - **Upgrade to pay-as-you-go**: resources keep working, charged by usage. Monthly spend is near 0 right now, but a credit card has to be attached.

  AI recommends letting it expire, because M4 and M5 were already tested hands-on and the notes are written. The user decides. The README's Azure row records the decision and date.

- [ ] **Step 5: Write three predictions**

  Add "Task 1: Exam environment and predictions" to notes.md. Guess first, compare after doing it, don't edit the original text:
  1. Of the 44, how many will pass Explain on the first try?
  2. After creating a data policy that blocks only `HTTP`, will HR Assistant Classic error right in the test pane, or only be blocked at Publish?
  3. In the 20 scenario questions, which domain will have the most wrong answers?

- [ ] **Step 6: Commit**

```bash
git add milestones/M7-plan-and-exam/notes.md README.md
git commit -m "M7: record exam sandbox, prep resources and Azure decision"
```

---

### Task 2: 7 pages of planning notes (about 2.5 hours)

**Files:**
- Create: `milestones/M7-plan-and-exam/planning/01-integration.md`, `02-identity.md`, `03-channels.md`, `04-responsible-ai.md`, `05-security-governance.md`, `06-reusable-components.md`, `07-audiences.md`

- [ ] **Step 1: AI drafts the 7 pages**

  Each page has a fixed set of 5 sections:
  1. **What this bullet tests**: one or two sentences.
  2. **How it was done in HR Assistant**: cite hands-on results from M1-M6, linking to the relevant notes.
  3. **Option comparison table**: one option per row, listing what it solves and when not to use it.
  4. **Easily confused points in the exam**: two or three.
  5. **Sources**: doc links; mark speculation as "speculation".

  Options each page must cover:
  - 01 Enterprise system integration: Power Platform connector, custom connector, REST API tool, Send HTTP request, MCP, agent flow, connected agent, Copilot connector.
  - 02 identity: user identity (end-user credentials), maker identity (maker-provided credentials), service identity; Authenticate with Microsoft, Authenticate manually, No authentication; Entra ID, SSO. Use the M6 observation "tools with end-user credentials need reconnecting" as an example.
  - 03 Channels: Teams + M365 Copilot, SharePoint, demo website / Direct Line, custom website; which channels require authentication.
  - 04 responsible AI: content moderation levels, boundaries in the instructions, transparency (telling the user it's AI, citing sources), human-in-the-loop (M2's approval), evaluation (M6).
  - 05 security and governance: DLP data policy and the Copilot Studio connectors, Managed Environment, environment policies, sharing permissions, endpoint filtering, Copilot Studio auditing and monitoring.
  - 06 Reusable components: solution, component collection, connected agent, custom connector, environment variables (M6 notes already wrote a version; add the comparison table here).
  - 07 Internal and external audiences: authentication, channels, knowledge sources, content moderation, billing and licensing. Write the docs part first, add the hands-on part after Task 3.
  - 08 harness (no separate bullet, related to bullets 3 and 7): what each of the three harnesses suits, how it's billed, why our project is standard.

- [ ] **Step 2: The user reads through and marks anything unclear**

  The user reads each page once and raises unclear sentences in the chat. AI rewrites them without adding new content.

- [ ] **Step 3: Commit**

```bash
git add milestones/M7-plan-and-exam/planning/
git commit -m "M7: write planning notes for the seven plan-an-agent bullets"
```

---

### Task 3: Fill in bullets 5 and 7 (about 1.5 hours)

**Files:**
- Create: `data/careers-faq.md`
- Modify: `data/data.test.mjs`, `milestones/M7-plan-and-exam/notes.md`, `milestones/M7-plan-and-exam/break-and-fix.md`, `milestones/M7-plan-and-exam/planning/05-security-governance.md`, `milestones/M7-plan-and-exam/planning/07-audiences.md`

**Interfaces:**
- Produces: `data/careers-faq.md`, the only knowledge source for `HR Careers FAQ`.

- [ ] **Step 1: Write the failing test**

  Add at the end of `data/data.test.mjs`:

```js
test('careers FAQ for external applicants contains no employee data', () => {
  const faq = readFileSync(join(__dirname, 'careers-faq.md'), 'utf8');
  for (const e of employees) {
    assert.ok(!faq.includes(e.EmployeeId), `careers FAQ mentions ${e.EmployeeId}`);
    assert.ok(!faq.includes(e.Name), `careers FAQ mentions ${e.Name}`);
  }
  assert.match(faq, /^# /m);
});
```

- [ ] **Step 2: Run the test, confirm it fails**

  Run: `node --test data/data.test.mjs` (Node 24 doesn't accept a directory)
  Expected: FAIL, `ENOENT ... careers-faq.md`

- [ ] **Step 3: Write `data/careers-faq.md`**

  In English, for job applicants: company overview, hiring process, interview scheduling, benefits overview (no specific balances), how to apply, contact details (use `careers@contoso.example`). Company name Contoso.

- [ ] **Step 4: Run the test, confirm it passes**

  Run: `node --test data/data.test.mjs` (Node 24 doesn't accept a directory)
  Expected: all PASS

- [ ] **Step 5: Build `HR Careers FAQ` (user)**

  - Create agent `HR Careers FAQ` in HR-Dev, using the standard harness (same as HR Assistant, for comparison; if creation defaults to another harness, screenshot and record it); the instructions state it only answers job-applicant questions, not internal employee questions.
  - Knowledge: upload only `careers-faq.md`. No tools.
  - Settings → Security → Authentication: choose **No authentication**.
  - Publish, open the demo website in Channels, and in an incognito window ask "How do I apply?" and "How many annual leave days does Ben have?", screenshot.

  AI records an internal vs external comparison table in notes.md: the differences between HR Assistant Classic and HR Careers FAQ in authentication, channels, knowledge sources, tools and who can access them, and adds it to `07-audiences.md`.

- [ ] **Step 6: DLP experiment (deliberate breakage)**

  Write the prediction first (already written as Task 1 item 2). User steps:
  1. Power Platform admin center → Security → Data and privacy → Data policy, screenshot the existing list.
  2. New Policy, name `M7-DLP-Test`, select only HR-Dev as the environment.
  3. Set `HTTP` and `Chat without Microsoft Entra ID authentication in Copilot Studio` to Blocked, leave everything else, create.
  4. Wait a few minutes, open HR Assistant Classic in Copilot Studio: first ask "Find employees in Engineering" in the test pane, then look at the Publish button. Screenshot the banner, click Details to download the specifics.
  5. Open HR Careers FAQ, see whether No authentication can still be selected on the Authentication page, and whether Publish can be clicked.
  6. Delete `M7-DLP-Test`, screenshot the policy list again; after it takes effect confirm both agents can Publish.

  AI records one row in break-and-fix.md: what was changed, symptom, cause, conclusion; the conclusion is added to `05-security-governance.md`.

- [ ] **Step 7: Commit**

```bash
git add data/careers-faq.md data/data.test.mjs milestones/M7-plan-and-exam/
git commit -m "M7: build external careers agent and record DLP experiment"
```

---

### Task 4: Bullet-by-bullet explain-back, fill the Explain column (about 2 hours, in 4 sessions)

**Files:**
- Create: `milestones/M7-plan-and-exam/explain-log.md`
- Modify: `docs/coverage.md`

- [ ] **Step 1: Explain-back in four rounds**

  | Round | bullet | 
  |---|---|
  | A | 1-7 |
  | B | 8-22 |
  | C | 23-37 |
  | D | 38-44, plus the 6 questions from readiness criterion 3 |

  For each bullet AI asks two questions: **What problem does it solve? When should it not be used (or what is it easily confused with)?** The user answers in the chat without looking at notes, ideally with an HR Assistant example. AI grades on the spot: both halves right is "pass", only half right is recorded as "again" with a one-sentence explanation added, all wrong is recorded as "don't know".

  The 6 questions from readiness criterion 3: how to choose between knowledge, topic and tool; the differences and use cases of REST tool, custom connector and MCP; the difference between MCP and A2A; the relationship between Copilot Studio agents and Foundry agents; whose identity an agent uses to access systems; what problem each of solution, environment variable and pipeline solves.

- [ ] **Step 2: Record**

  `explain-log.md` has one table per round: `# | bullet | Result (pass / again / don't know) | Points missed`. "Again" and "don't know" items are asked once more at the end of the same round; if passed, change to "pass (second try)".

- [ ] **Step 3: Update coverage.md**

  Items with "pass" get Explain x. The summary row records the current count met and percentage, plus how many per domain.

- [ ] **Step 4: Commit (once per round)**

```bash
git add milestones/M7-plan-and-exam/explain-log.md docs/coverage.md
git commit -m "M7: record explain round A"
```

---

### Task 5: 20 scenario questions and the Practice Assessment (about 2 hours)

**Files:**
- Create: `milestones/M7-plan-and-exam/scenario-questions.md`
- Modify: `docs/coverage.md`, `milestones/M7-plan-and-exam/notes.md`

- [ ] **Step 1: Scenario questions (AI writes, user answers)**

  - Split by domain weight: Plan and configure 7, Integrate and extend 9, Test and manage 4.
  - Question types imitate the sandbox: mostly pick 1 of 4, a few pick-two or ordering. Each question has a company scenario and doesn't mention HR Assistant.
  - Bullets 23, 26, 34 and the extension part of 44 get at least one question each.
  - AI gives one question at a time in the chat; after the user answers without looking anything up, AI gives the explanation.
  - When all are answered, AI writes them into `scenario-questions.md`: question, options, user's answer, correct answer, explanation, matching bullet number. Wrong answers are marked 🔴, with which notes page to review.

- [ ] **Step 2: Practice Assessment (user)**

  The user does it in one sitting and screenshots the total score and per-domain scores. AI records the score and the topics the user says they got wrong in notes.md, not the question text.

- [ ] **Step 3: Fill the Ready column**

  Condition for Ready x: Explain is already x, and this bullet wasn't answered wrong in the scenario questions or the Practice Assessment. Items answered wrong stay empty and go into Task 6's remediation list.

- [ ] **Step 4: Commit**

```bash
git add milestones/M7-plan-and-exam/scenario-questions.md milestones/M7-plan-and-exam/notes.md docs/coverage.md
git commit -m "M7: record scenario questions and practice assessment results"
```

---

### Task 6: Remediation, readiness check, wrap-up (about 1 hour)

**Files:**
- Modify: `milestones/M7-plan-and-exam/notes.md`, `milestones/M7-plan-and-exam/checklist.md`, `docs/coverage.md`, `README.md`

- [ ] **Step 1: Remediate the 🔴 items**

  For each: the user rereads the matching notes or docs, and AI writes another question with a different scenario. If answered correctly, add Ready x, and write "remediated" after that question in `scenario-questions.md`.

- [ ] **Step 2: Final coverage table audit**

  AI checks coverage.md line by line: whether Built has a matching hands-on record, whether Explain has a "pass" in explain-log, whether Ready meets Task 5's condition. Fix any mismatches, and write in notes.md which lines were changed.

- [ ] **Step 3: Check against the readiness criteria**

  AI writes a table filling in the actual number and "met / not met" for each of the three criteria:
  1. Explain ≥ 36/44, and no domain is completely empty.
  2. Scenario questions ≥ 16/20 (first attempt counts; remediation doesn't).
  3. All 6 questions "pass".

  Also record the Practice Assessment score as a reference. If all are met, recommend booking; if not, list what's missing and plan another remediation round.

- [ ] **Step 4: Book the exam (user decides)**

  First reopen the study guide and check whether ms.date and skills measured have changed (especially whether harness-related content was added); if changed, fill that in first, then book. When ready, the user books through Pearson VUE with a personal MSA account. The README records only the exam date.

- [ ] **Step 5: Write notes.md and checklist.md**

  notes.md: a paragraph for "What problem this milestone solves"; prediction comparison; "Concepts learned" with two items, DLP and internal/external audiences (what they solve, when not to use them); "Not understood yet, left for later".

  checklist.md:

```markdown
# M7 checklist

- [ ] Exam sandbox walked through once
- [ ] 7 pages of planning notes written, read through by the user
- [ ] DLP experiment done, policy deleted
- [ ] HR Careers FAQ built and published, internal/external comparison table written
- [ ] All 44 explained back, Explain count met tallied
- [ ] 20 scenario questions answered, missed questions remediated
- [ ] Practice Assessment taken once
- [ ] Readiness check written; booked if ready
```

  Tick according to what actually happened; state the reason for anything not done.

- [ ] **Step 6: Cleanup, README, commit and push**

  - Local services: the user decides whether to stop 3000 and 3100, and whether to delete the 3001 tunnel port.
  - README: change "Current milestone" to exam prep status (if booked, write the date; if not, write what's missing); change the M7 row to `Done YYYY-MM-DD` and fill in this file's path; update the Azure row per the Task 1 decision.
  - Whole-repo secret search.

```bash
git add -A
git commit -m "Close out M7: planning notes, readiness check and coverage audit"
git push origin master
```

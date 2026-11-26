# M1 HR policy Q&A Agent Implementation Plan

> **For agentic workers:** Almost every step in this plan is done by the user in the Copilot Studio browser UI; AI is responsible for updating the notes and coverage table and committing at the end of each Task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty agent HR Assistant built in M0 into an agent that can answer HR policy questions from enterprise content, and along the way get a solid grip on the exam objective bullets about Configure topics and knowledge sources.

**Architecture:** One agent, three kinds of topic hitting three different targets — policy Q&A goes through generative answers (open-ended), password reset goes through a fixed node graph (deterministic), leave balance goes through the Dataverse connector (live data). These three map exactly onto the dividing line in the M0 notes: knowledge answers "what is it", topics manage "which way to go", tools do "what is it right now". Finally, four sets of "break it on purpose" experiments feel out the boundaries of responsible AI and grounding.

**Tech Stack:** Copilot Studio (generative orchestration), SharePoint Online, Dataverse, Microsoft Dataverse connector, Power Fx.

**Spec:** `docs/superpowers/specs/2026-09-13-ab-620-hr-assistant-design.md` (§4 M1)

## Global Constraints

- No Azure and no spending in M1. The Copilot Studio trial expires 2026-10-16, so M1 must be finished before then.
- A trial license **can't publish agents**; M1 is verified entirely in the Test pane, with no channel published.
- If any single step is stuck for more than 1 hour, stop, record it in `milestones/M1-knowledge-agent/break-and-fix.md`, and move on to the next step.
- Agent name fixed as `HR Assistant`, environment fixed as `HR-Dev`, SharePoint site fixed as `HR Policies`.
- **UI paths change.** The menu paths below are where things are expected to be, not a guarantee. If you can't find something, use the "Goal" and "Verify" lines to find it yourself, then write the actual path into notes.md — that in itself is exam review.
- Commit at the end of every Task; commit messages in English.

## Coverage goals

At the end of M1, the Understand and Built columns of the following bullets should be tickable:

| # | Bullet | Built in which Task |
|---|---|---|
| 4 | Plan responsible AI strategy | Task 2, Task 7 |
| 15 | Configure agent response formatting | Task 4 |
| 18 | Configure advanced agent responses with custom knowledge sources | Task 3 |
| 20 | Configure generative answers node | Task 4 |
| 22 | Manage variables | Task 5 |
| 24 | Connect to Microsoft Power Platform connectors | Task 6 |

The Explain column may only be ticked once Task 8's notes are written and I can explain it back with the notes closed.

---

### Task 1: Learn reading and preview (about 2 hours)

**Goal:** Before getting hands-on, go over topic node types and how knowledge works, to avoid clicking around blindly in the UI.

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Read the learning path**

  "Design agent conversations and responses using topics in Microsoft Copilot Studio" (2 hours 17 minutes, duration already recorded in M0). No need to do every exercise; focus on these four areas:
  - Topic triggers and node types (Message, Question, Condition, Set variable, Redirect)
  - The Question node's identity/entity (how it parses the user's answer into a variable)
  - Data source configuration of the Generative answers node
  - The three variable scopes

- [ ] **Step 2: Read two extra sets of docs**

  Generative AI settings (content moderation, knowledge usage scope, instructions):

  - [Orchestrate agent behavior with generative AI](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions) — the Generative AI settings page itself, the orchestration toggle, and *Allow ungrounded responses* in the Knowledge section
  - [Configure high-quality instructions for generative orchestration](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-mode-guidance) — Task 2's six elements follow this page directly
  - [FAQ for generative answers](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-generative-answers) — content moderation's five levels from Lowest to Highest, default High, checked once on input and once on output

  Responsible AI (the original source of exam objective bullet 4, "Plan responsible AI strategy"):

  - [Responsible AI FAQs for Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/responsible-ai-overview) — the official FAQ; that exam bullet maps to this page
  - [Apply responsible AI principles](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/responsible-ai) — the hands-on version

- [ ] **Step 3: Write three predictions in notes.md**

  Under "Not yet understood, left for later", write down your guesses first; come back and check them after the Task 7 experiments:
  1. If all knowledge sources are deleted, what happens to policy Q&A? Will it say it doesn't know, or make things up?
  2. If the instructions don't include scope, what happens when you ask it "write me a poem"?
  3. If content moderation goes from High to Low, which kinds of answers change?

- [ ] **Step 4: Commit**

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: record pre-lab predictions"
```

---

### Task 2: The six elements of agent instructions (about 1.5 hours)

**Goal:** Instructions are the steering wheel of generative orchestration, and also the first layer where responsible AI becomes concrete. After this step, the agent will refuse what it should refuse.

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Confirm the orchestration mode**

  Path: agent → **Settings → Generative AI**. Confirm Orchestration is **Generative** (the default for new agents). On the same page, note the current content moderation level; Task 7 changes it.

  Verify: the Settings page shows the two Orchestration options, with Generative currently selected.

- [ ] **Step 2: Write the instructions by the six elements**

  Path: the agent's **Overview → Instructions** (or the large text box in the Details panel). One to three sentences per element, keeping the whole thing under 200 characters — the longer it is, the more likely the model skips parts.

  1. **Scope (what it covers)**: You are Contoso's HR assistant and only answer questions within the employee handbook: annual leave, sick leave, remote work, expenses.
  2. **Authority (what it can decide)**: You don't approve any requests and don't promise exceptions. For anything involving approval, tell the user to go through the formal process.
  3. **Grounding (what it answers from)**: All policy answers must be based on the knowledge sources. When there's no supporting source, say clearly that you can't find one; don't guess from general knowledge.
  4. **Privacy (what it doesn't touch)**: Don't ask for or repeat ID numbers, home addresses or salary amounts. Only discuss the user's own leave balance within what the user has mentioned.
  5. **Fallback (what to do when it can't answer)**: For out-of-scope questions, say in one sentence that you only handle HR policy, and suggest contacting hr@contoso.com.
  6. **Output requirements (how to answer)**: Answer in Chinese, give the conclusion first and then the basis; when specific days or amounts are involved, always give the number, and attach citations.

- [ ] **Step 3: Test three prompts right away**

  Ask in the Test pane:
  - `How many days of annual leave do I get?` — with no knowledge attached yet, it should fail to answer or say it can't find a source. **This is exactly what to watch**: whether the grounding element takes effect.
  - `Write me a poem about autumn` — should be blocked by scope.
  - `What is my boss's salary?` — should be blocked by privacy + scope.

  Verify: none of the three gives a made-up HR number. If the first one invents something like "usually 15 days", copy the exact reply into notes.md and compare again after Task 3 attaches knowledge.

- [ ] **Step 4: Write the instructions text and the three test results into notes.md, commit**

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: write agent instructions with six elements"
```

---

### Task 3: Three knowledge sources (about 2 hours)

**Goal:** Give the agent's answers a source. The three source types differ, and so do their configuration and limits — this is the whole of bullet 18.

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Add the SharePoint site**

  Path: agent → **Knowledge → Add knowledge → SharePoint**, enter `https://contoso.sharepoint.com/sites/HRPolicies`.

  Note what it asks: whether authentication settings are needed, and whether it prompts for "access as the user" or "access as the agent". **This distinction is an exam point** (delegated vs application permission; it comes up again in M3 when planning the identity strategy).

- [ ] **Step 2: Add a public website**

  Path: **Add knowledge → Public website**, enter a stable public page (for example `https://learn.microsoft.com/en-us/microsoft-copilot-studio/`).

  The point of this step isn't business value, it's comparison: a public website needs no authentication and isn't bound by tenant permissions, whereas SharePoint is. Note the differences in the configuration UI.

- [ ] **Step 3: Add the Dataverse Employee table**

  Path: **Add knowledge → Dataverse**, choose `Employee` (logical name `crc6c_employee`).

  After adding it, ask `What is E001's annual leave balance?`. **It will most likely answer inaccurately or not at all** — copy the actual result into the notes. This isn't a failure; it's the reason Task 6 exists: structured transactional lookups should go through a connector, not knowledge.

- [ ] **Step 4: Verify grounding works**

  Ask four questions in the Test pane; each must come with a citation:
  - `How many days of annual leave can I carry over?` → should hit 5 days, 31 March
  - `Can sick leave be used to care for family?` → should hit 3 days
  - `What's the maximum number of remote work days per week?` → should hit 3 days
  - `Above what amount does an expense need pre-approval?` → should hit US$500

  Verify: all four get the numbers right, and a citation link to the corresponding .docx appears below the answer.

  If SharePoint content can't be found: first search for `carry-over` in the SharePoint site's search box to confirm the index has been built; if the index isn't ready you can only wait, so skip ahead to Task 5 and come back to verify.

- [ ] **Step 5: Record and commit**

  In notes.md, spell out the differences between the three knowledge source types: authentication requirements, content type, refresh/indexing delay, and what each is suited for.

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: connect SharePoint, public website and Dataverse knowledge"
```

---

### Task 4: Policy Q&A topic and response formatting (about 2 hours)

**Goal:** Bullets 20 and 15. Build a topic by hand with a generative answers node, and see how it differs from Task 3's "use knowledge automatically".

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Create topic `Policy QA`**

  Path: **Topics → Add a topic → From blank**.
  - Trigger: leave a few trigger phrases (`policy`, `handbook`, `company rules`)
  - **Leave the Description empty for now** — this is the open question left in the M0 notes, used in Task 7

- [ ] **Step 2: Add a Generative answers node**

  Under the trigger, add the node: **Advanced → Generative answers**.
  - Input: `Activity.Text` (or whichever entry in the variable picker represents the user's exact words; the name depends on the UI)
  - Expand **Data sources**: tick only SharePoint, untick the other two
  - Expand **Content moderation** / **Advanced**: note the current level and the available options

  **Key observation:** what is the relationship between the data source scope configured by hand here and the three sources attached in the agent-level Knowledge? Does it override or add to them? Write the conclusion in the notes.

- [ ] **Step 3: Configure response formatting (bullet 15)**

  Find these three settings in the same node or in the agent-level settings, and try each one:
  - **Response type / format**: plain text vs Markdown vs Adaptive card (Adaptive cards are covered in detail in M2; here just check the option exists)
  - **Include citations**: ask once with it on and once with it off, and compare the end of the answer
  - **Response length**: if there's a length or detail option, change it once and see the difference

  Verify: for the same question, `What's the maximum number of remote work days per week?`, copy both outputs, with citations on and off, into the notes.

- [ ] **Step 4: Compare "with topic" and "without topic"**

  Ask once starting with the trigger phrase `policy` (goes through the Policy QA topic), then ask directly with different wording (most likely goes through agent-level knowledge). Record the difference between the two answers and between their citations.

- [ ] **Step 5: Commit**

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: add Policy QA topic with generative answers and response formatting"
```

---

### Task 5: Password reset topic and variables (about 2 hours)

**Goal:** Bullet 22. A fully deterministic topic, as a contrast to the uncertainty of generative answers, and a chance to work through the three variable scopes and Power Fx.

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Create topic `Password Reset`**

  Node graph (build it in this order):
  1. **Question**: `Which system do you need to reset the password for?` → Multiple choice: `Email`, `VPN`, `Attendance system` → saved to topic variable `SystemName`
  2. **Condition**: branch on `SystemName`, with a different **Message** for each of the three branches
  3. Include the user's name in each Message (done in the next step)

- [ ] **Step 2: Use each of the three variable scopes once**

  - **Topic variable**: `SystemName` from the previous step, valid only in this topic
  - **Global variable**: create `Global.EmployeeId`, ask for the employee ID once in a Question node and save it there. Test two rounds of conversation to verify it's still there across topics
  - **System variable**: insert the one that represents the current user's display name into a Message (find it under the System category in the variable picker; the name depends on the UI, so note the actual name)

  Verify: the three variables fall under different categories in the variables panel, and all three appear in the Message output.

- [ ] **Step 3: Write two Power Fx expressions**

  In a Message or Set variable node, use **formula** (the `fx` entry point):
  - `Text()`: format the employee ID or a number into a sentence
  - `If()`: return different prompt text depending on the value of `SystemName`

  **Note Power Fx's syntax differences here**: referencing a variable means writing `Topic.SystemName`, `Global.EmployeeId`, not the bare name. Write down any gotchas you hit.

- [ ] **Step 4: Verify and commit**

  Run the whole flow end to end in the Test pane three times, once for each branch.

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: add Password Reset topic with variables and Power Fx"
```

---

### Task 6: Leave balance topic via the Dataverse connector (about 1.5 hours)

**Goal:** Bullet 24. Use a Power Platform connector to fetch live data, and verify hands-on the dividing line from the M0 notes — "how many days do I have left" must go through a tool.

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Create topic `Leave Balance`**

  1. **Question**: `Please enter your employee ID (for example E001)` → topic variable `EmpId`
  2. Add an action in the next step

- [ ] **Step 2: Add a Dataverse connector action**

  Path: node **+ → Add a tool** (or **Call an action**) → find the **Microsoft Dataverse** connector → choose **List rows** (if Get a row by ID exists and Employee's primary key works with it, that's fine too).

  - Table name: `Employee` (`crc6c_employee`)
  - Filter / Row ID: match `crc6c_employeeid1` with `Topic.EmpId`
  - First use asks you to create a **connection**; note whose identity it connects with (this sets up M3's identity strategy)

- [ ] **Step 3: Get the return values out**

  Map the action's output to variables, then output it with a Message node: `Your annual leave balance is X days, sick leave Y days`.

  **This is where it's easiest to get stuck**: List rows returns an array, and taking the first item needs Power Fx (something like `First(...)` then picking the field). If stuck for more than 1 hour, record it in break-and-fix.md; as a fallback, printing the raw response directly also counts as met.

- [ ] **Step 4: Verify**

  Ask `E001`; the answer must match the E001 row in `data/employees.csv`. Then ask `E999` (an employee ID that doesn't exist) and see how it handles it — error handling is formally M2's content, so here just record the behavior.

- [ ] **Step 5: Compare with Task 3 Step 3**

  Same question: the knowledge approach answers inaccurately, the connector approach answers accurately. Write this comparison up as a paragraph of conclusions in the notes — **this is the most valuable takeaway of M1**.

```bash
git add milestones/M1-knowledge-agent/notes.md
git commit -m "M1: add Leave Balance topic using Dataverse connector"
```

---

### Task 7: Four break-it-on-purpose experiments (about 2 hours)

**Goal:** Bullet 4. Everything so far was "make it work"; this set is "watch how it breaks". **Revert immediately** after each experiment.

**Files:**
- Modify: `milestones/M1-knowledge-agent/break-and-fix.md`
- Modify: `milestones/M1-knowledge-agent/notes.md`

- [ ] **Step 1: Remove knowledge**

  Disable or delete all three knowledge sources, then ask `How many days of annual leave can I carry over?`.
  - Does it say it doesn't know, or make up a number?
  - Did the grounding element in the instructions stop it?
  - Revert, and check against prediction 1 from Task 1

- [ ] **Step 2: Remove scope from the instructions**

  Delete only the scope and fallback sentences, keep the rest. Ask `Write me a poem about autumn`, `Recommend a few stocks`.
  - Revert, and check against prediction 2

- [ ] **Step 3: Adjust content moderation**

  In **Settings → Generative AI**, change the level from its current value to the lowest, then to the highest, and ask the same set of borderline questions each time (for example, something involving interpersonal conflict like `A coworker is always late, how do I report him?`).
  - Which kinds of answers changed? Answer length, tendency to refuse, strictness of citations?
  - Change it back to the original value, and check against prediction 3

- [ ] **Step 4: Verify the two questions left over from M0**

  These are the ones hanging under "Not yet understood" in M0's notes.md:
  1. **Do trigger phrases still work in generative mode?** The `Policy QA` topic built in Task 4 has an empty description. Now give it one clear description sentence, and compare before and after: does the same natural question hit this topic?
  2. **Can you see the model's orchestration process?** In the Test pane, find the activity map / debug view and see which components it chose this turn. If you find it, record the screenshot path in the notes; if not, record "not found" as well.

- [ ] **Step 5: Write the four experiments into break-and-fix.md, back-fill M0's questions**

  Fill each break-and-fix.md row by the table header: date / what I changed / symptom / cause / fix or conclusion.
  At the same time, go back to "Not yet understood, left for later" in `milestones/M0-environment/notes.md` and add the answers to those two items.

```bash
git add milestones/M1-knowledge-agent/ milestones/M0-environment/notes.md
git commit -m "M1: record four break-and-fix experiments, answer M0 open questions"
```

---

### Task 8: Notes, coverage table and milestone wrap-up (about 1 hour)

**Files:**
- Modify: `milestones/M1-knowledge-agent/notes.md`
- Modify: `milestones/M1-knowledge-agent/checklist.md`
- Modify: `docs/coverage.md`
- Modify: `README.md`

- [ ] **Step 1: Complete "Concepts learned" in notes.md**

  Each item must answer "what problem it solves, and when not to use it":
  - Trade-offs between the three knowledge source types
  - Generative answers node vs agent-level knowledge
  - The three variable scopes
  - The boundary between connector actions and knowledge
  - Of the six instruction elements, which ones actually changed behavior and which were as good as not written

- [ ] **Step 2: Fill in checklist.md**

  Write in these 6 items and tick the ones done:
  - [ ] Agent instructions have all six elements; scope and privacy verified hands-on to block out-of-bounds questions
  - [ ] All three knowledge sources attached; all four policy numbers answered correctly with citations
  - [ ] The Policy QA topic's generative answers node can specify its own data sources
  - [ ] Password Reset topic's three branches run end to end; each of the three variable scopes used once
  - [ ] Leave Balance topic can fetch E001's real balance from Dataverse
  - [ ] All four break-it-on-purpose experiments done and reverted

- [ ] **Step 3: Fill in coverage.md**

  Mark `x` in **Understand** and **Built** for bullets 4, 15, 18, 20, 22, 24.
  **Rule for the Explain column: tick it only if, with the notes closed, I can explain "what problem it solves, and when not to use it".** Leave the ones I can't explain smoothly blank for now, and come back to them during M7 review.

- [ ] **Step 4: Update the README and commit**

  Change the current milestone to M2; in the milestones table, set M1 to `Done YYYY-MM-DD`, and fill this file's path into the plan column.

```bash
git add -A
git commit -m "Close out M1: knowledge agent complete, update coverage"
git push origin master
```

---

## Acceptance criteria

M1 is done only when all of these are met:

1. Ask the four policy questions in the Test pane: all numbers correct, with citations.
2. Ask `E001's annual leave balance`: the answer matches the CSV.
3. Ask a question outside HR scope: blocked by the instructions.
4. The Built column of the 6 bullets in coverage.md is ticked.
5. The two open questions in M0's notes.md have answers.

## Time budget

About 13 hours, slightly more than the design doc's 10–12 hours, the extra going to Task 6's connector. If it really runs over, cut the comparison experiment in Task 4 Step 4; that one is a nice-to-have.

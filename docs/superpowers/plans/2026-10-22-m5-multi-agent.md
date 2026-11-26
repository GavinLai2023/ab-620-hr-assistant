# M5 Multi-agent Implementation Plan

> **For agentic workers:** Half of this plan is browser work (Copilot Studio, Foundry, Fabric, Azure portal), done by the user, who sends screenshots; the other half is small pieces of code (A2A service, Foundry protocol-enable script, mock data), which AI writes with TDD and runs tests for. AI also looks up docs, explains, troubleshoots, takes notes, updates the coverage table, and commits at the end of each Task. Steps are tracked with checkboxes (`- [ ]`).

**Goal:** Connect four kinds of "other agents" to `HR Assistant Classic`: a Copilot Studio agent (connected agent), a Foundry agent, a self-written A2A agent, and a Fabric data agent. Work out, for each approach, who does the routing, what context is passed, whose identity is used for access, and what happens on errors, covering all 5 bullets of the Configure multi-agent collaboration group of exam objectives.

**Architecture:** `HR Assistant Classic` is the main agent, with generative orchestration on, deciding who to hand off to based on each sub-agent's description. The four sub-agents are:
- `Onboarding Agent`: a Copilot Studio agent in the same HR-Dev environment, whose knowledge is an onboarding checklist.
- `hr-policy-summarizer`: a Foundry prompt agent using `gpt-4.1-mini`.
- `src/a2a-agent`: a local Node service that returns the first-week onboarding schedule by department, exposed through a third Dev Tunnel.
- Fabric data agent: reads the employee table and leave table in a lakehouse.

**Tech Stack:** Copilot Studio multi-agent (Add an agent), Foundry Agent Service (new Foundry portal + REST `api-version=v1`), A2A protocol v0.3 JSON-RPC (Node built-in `http`, `node:test`), Python `azure-identity`, Microsoft Fabric (lakehouse, data agent), Microsoft Dev Tunnels.

**Spec:** `docs/superpowers/specs/2026-09-13-ab-620-hr-assistant-design.md` (§4 M5)

## Global Constraints

- Notes body in Chinese; English terms are left untranslated on first appearance.
- The main agent is always `HR Assistant Classic`, environment `HR-Dev`.
- **Three things found while writing the plan (2026-10-22) that differ from the design doc:**
  1. **The Fabric trial doesn't support data agents.** [Features by SKU](https://learn.microsoft.com/en-us/fabric/enterprise/fabric-features) says: "Unless otherwise noted, a trial capacity doesn't support any of these features", and Fabric data agent is in the list with no footnote. Data agents need a paid F2 or higher capacity. So the design doc's "start a Fabric trial" route doesn't work, and in Task 1 the user picks one of two routes (see Task 1 Step 3).
  2. **A Foundry agent must have the Activity protocol turned on before Copilot Studio can call it.** A newly created Foundry agent only has Responses and A2A on by default. Without Activity, the runtime returns 400 "endpoint does not support activity". It can only be turned on via REST or SDK; the portal has no entry point, and after turning it on the portal doesn't show it either ([docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-foundry-agent)). Task 3 uses a small script to turn it on.
  3. **The Foundry agent must be created in the new Foundry portal.** An agent created in the old portal returns `404 - Version not found` when connecting.
- **A Copilot Studio agent can't expose an A2A endpoint.** So the A2A approach is: write a minimal A2A service myself and connect it to HR Assistant. This is what the design doc means by "or connect an external A2A endpoint".
- **An agent can't be both a main agent and a connected agent.** `Onboarding Agent` can't have other agents attached to it.
- **The Fabric data agent is only tested in the test pane.** Once the main agent is published to Microsoft Copilot, the Fabric data agent doesn't work ([known limitations](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents#known-limitations)). It also only understands English questions, so all tests are asked in English.
- **No secrets in the repo, or in the chat.** The Azure access token only lives in memory while the script runs; it is not printed or written to a file. Notes only record resource names, agent names, regions. Mask the subscription ID in screenshots.
- **The A2A service uses API key `dev-local-key`** (a mock value, same as the employee API). The tunnel is anonymous, which is only acceptable because the data is fake.
- **Cost:** The Azure free credit **expires on 2026-11-15**; M5 must be done before then. The Foundry agent only costs tokens. If Fabric goes with F2, it's billed by the hour, must be **Paused** after every use, and is deleted in Task 8.
- **UI paths change.** If you can't find a menu, go by the "Goal" and "Verify" and find your own way, and record the actual path in notes.md.
- If any single step is stuck for more than 1 hour, stop, log it in `milestones/M5-multi-agent/break-and-fix.md`, mark Understand in the coverage table, and move on to the next step.
- Commit at the end of each Task; commit messages in English, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

Five things in this plan most likely to go wrong that no step specifically checks:

1. **The A2A requests Copilot Studio sends differ from what we implemented** (for example using `message/stream`, v1.0's `SendMessage`, or POSTing to a different path). The A2A service prints each request's method, path and body to the console, and returns JSON-RPC `-32601` for requests it doesn't recognise, without crashing. Task 5 looks at the logs and changes the code to match the actual requests, timeboxed to 1 hour. Task 4 has a matching test.
2. **The user's message has no department name, or the department name is in a different case** ("what does week one look like for engineering?"). The A2A service accepts any case. When no department is recognised, it replies with one sentence listing the available departments, without an error. Task 4 has a matching test.
3. **The message parts Copilot Studio sends contain non-text content** (`data`, `file`). The A2A service only reads `kind: "text"` and ignores the rest without crashing. Task 4 has a matching test.
4. **Turning on the Activity protocol wipes existing configuration.** PATCH replaces `protocol_configuration` and `authorization_schemes` wholesale. The script does a GET first, then merges and PATCHes, keeping the original protocols and authentication methods. Task 3 has a matching test.
5. **Forgetting to Pause the Fabric capacity, so it keeps charging.** The last step of every Fabric operation says Pause, and Task 8 checks the cost again and deletes the capacity.

## Coverage targets

| # | Bullet | Built in which Task |
|---|---|---|
| 30 | Design multi-agent solutions in Copilot Studio | Task 7 (design notes + break experiments) |
| 31 | Integrate a Foundry agent | Task 3 |
| 32 | Integrate an existing agent in Copilot Studio | Task 2 |
| 33 | Integrate a Fabric data agent | Task 6 (Understand only if the Understand route is chosen) |
| 34 | Create a multi-agent solution by using A2A protocol | Task 4, 5 |

The Explain column is ticked by the user once the explain-back goes smoothly.

## Ports and tunnels

| Service | Local port | tunnel |
|---|---|---|
| employee API | 3000 | `hr-employee-api` (existing) |
| MCP server | 3100 | `hr-mcp-server` (existing) |
| A2A agent | 3200 | `hr-a2a-agent` (new in Task 4) |

---

### Task 1: Preview, predictions, choose the Fabric route (about 1.5 hours)

**Files:**
- Modify: `milestones/M5-multi-agent/notes.md`

- [ ] **Step 1: Read the learning path and docs**

  - Learning path: "Design and build multi-agent solutions in Microsoft Copilot Studio". Confirm the exact name and duration on the AB-620 certification page and record them in notes.
  - [Add other agents overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents): focus on when to use a child agent vs a connected agent, and the 30–40 options rule of thumb.
  - [Connect to an existing Copilot Studio agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-copilot-studio-agent): the four prerequisites, and the "Pass conversation history" switch.
  - [Connect over A2A](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent): the difference between the endpoint URL and the agent card, and the three authentication methods.
  - [Multi-agent patterns](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/multi-agent-patterns): read through.

- [ ] **Step 2: Write three predictions**

  Add "Task 1: Preview and predictions" to notes.md. Guess first, compare after doing the work, don't edit the original text:
  1. When the user asks "What does a new employee need to do on day one?", will the main agent hand off to the Onboarding Agent, or answer itself from the policy knowledge base?
  2. After turning off "Pass conversation history", can the sub-agent still know who "I" am (the employee ID mentioned earlier)?
  3. Of the four kinds of sub-agents, which is slowest? Why?

- [ ] **Step 3: Choose the Fabric route (user decides)**

  AI first explains the finding in Global Constraints item 1 to the user, then the user picks one of two routes:
  - **A (recommended) F2 billed by the hour:** In `rg-hr-assistant` in the Azure portal, create a Microsoft Fabric capacity, SKU F2, region Australia East, charged against the free credit, about US$0.4/hour (go by what the portal shows). **Pause** it immediately after creating, Resume it when Task 6 needs it, and Pause again afterwards. The whole of M5 is estimated at 3–4 hours running, under US$2. If the free account doesn't allow creating it, fall back to B.
  - **B learn without building:** Read the docs, draw the architecture diagram, mark bullet 33 Understand only. Design doc §8 allows this.

  Record the choice and the reason in notes.md. If A is chosen, also write F2, the creation date and "Pause after use, delete at M5 close-out" on the Fabric row of the README "Services opened and expiry dates" table.

- [ ] **Step 4: Check the main agent's orchestration**

  `HR Assistant Classic` → Settings → Generative AI, confirm it uses **generative orchestration**. Multi-agent routing depends on it. If it doesn't, turn it on first, then ask "Can annual leave be carried over?" in the test pane to confirm the existing features still work.

- [ ] **Step 5: Commit**

```bash
git add milestones/M5-multi-agent/notes.md README.md
git commit -m "M5: record learning review, predictions and Fabric route decision"
```

---

### Task 2: Onboarding Agent as a connected agent (about 1.5 hours)

**Goal:** Build a second Copilot Studio agent in the same environment, publish it, connect it to HR Assistant, and have it routed to automatically.

**Files:**
- Create: `data/onboarding/onboarding-checklist.md` (written by AI)
- Modify: `milestones/M5-multi-agent/notes.md`

**Interfaces:**
- Produces: the published Copilot Studio agent `Onboarding Agent` in HR-Dev, whose description in HR Assistant is "Answers questions about the new-hire onboarding checklist: documents to bring, accounts to set up, mandatory trainings and who to contact in the first 30 days." (the Task 7 break experiment changes this sentence).

- [ ] **Step 1: AI writes the onboarding checklist**

  `data/onboarding/onboarding-checklist.md`, in English, same style as `data/policies/*.md`, about 300–400 words. Four sections:
  - Before day 1: ID documents to bring.
  - Day 1: accounts, building access, laptop, contact IT.
  - First week: three mandatory trainings, each with its duration.
  - First 30 days: probation review, contact your direct manager.

  Contacts are always written as roles (HR Officer, IT Helpdesk), never personal names.

- [ ] **Step 2: Build the agent (user)**

  Copilot Studio → HR-Dev → Create → New agent → skip the conversation, go straight to Configure:
  - Name: `Onboarding Agent`
  - Description: the sentence from Interfaces above.
  - Instructions: "You help new employees at Contoso with their onboarding checklist. Answer only from the onboarding checklist knowledge. If the question is about leave, expenses or other HR policies, say it is outside your scope."
  - Knowledge: upload `onboarding-checklist.md`. Use a file upload, not SharePoint, so it differs from the main agent's knowledge source.
  - Settings → Generative AI → turn off general knowledge.

  In its own test pane ask "What do I need to bring on my first day?" and confirm the answer comes from the checklist.

- [ ] **Step 3: Allow others to connect and publish (user)**

  In Settings turn on **Let other agents connect to and use this one**, then **Publish**.

  **Verify:** Publishing succeeds and the page shows the publish time.

- [ ] **Step 4: Connect to HR Assistant (user)**

  `HR Assistant Classic` → Agents → Add an agent → Copilot Studio → select `Onboarding Agent`. Change the Description to the sentence in Interfaces. Keep **Pass conversation history to this agent** checked. Save.

- [ ] **Step 5: Test three questions (user screenshots)**

  In HR Assistant's test pane, with a new conversation for each:
  1. "I'm starting next Monday, what do I need to bring?": should hand off to Onboarding Agent. It must be visible in the activity map.
  2. "Can I carry over annual leave?": should not hand off to it.
  3. "I'm E002 and I just joined. What trainings do I have to finish?": hands off to it. Then **uncheck** Pass conversation history, ask again, and compare what the sub-agent sees (prediction 2). Re-check it after testing.

- [ ] **Step 6: Record and commit**

  Add "Task 2" to notes.md, recording:
  - How each of the four prerequisites was met.
  - The routing results for the three questions.
  - The difference between Pass conversation history checked and unchecked.
  - After changing the sub-agent you have to Publish again before the main agent picks up the new version.
  - The sub-agent's description in the main agent is a local copy and doesn't sync automatically.

```bash
git add data/onboarding/onboarding-checklist.md milestones/M5-multi-agent/notes.md
git commit -m "M5: add Onboarding Agent as a connected Copilot Studio agent"
```

---

### Task 3: Foundry agent "HR Policy Summarizer" (about 2 hours)

**Goal:** Create a prompt agent in Foundry, turn on the Activity protocol, and connect it to HR Assistant.

**Files:**
- Create: `src/foundry/enable_activity_protocol.py`
- Create: `src/foundry/test_enable_activity_protocol.py`
- Create: `src/foundry/requirements.txt` (one line: `azure-identity`)
- Modify: `milestones/M5-multi-agent/notes.md`

**Interfaces:**
- Consumes: the Foundry resource `hr-assistant-demo` kept from M4 and its project, the `gpt-4.1-mini` deployment.
- Produces: Foundry agent `hr-policy-summarizer` (with Activity protocol on), and its description in HR Assistant: "Summarizes a named Contoso HR policy (annual leave, sick leave, remote work, expenses) into three short bullet points. Use only when the user explicitly asks for a summary or TL;DR of a policy."

- [ ] **Step 1: Create the agent in the new Foundry portal (user)**

  ai.azure.com, confirm the top right shows **new Foundry** (New Foundry toggle on) → project → Agents → Create:
  - Name: `hr-policy-summarizer`
  - Model: `gpt-4.1-mini`
  - Instructions: "Summarize the requested Contoso HR policy in exactly three bullet points of at most 20 words each. Use only the attached policy files. If the policy isn't in the files, say so."
  - Tools: File search, upload the 4 `.md` files under `data/policies/`.

  In the Foundry playground ask "Summarize the sick leave policy" and confirm the output is three bullets. Record the **project endpoint** (shaped like `https://<account>.services.ai.azure.com/api/projects/<project>`) and the **agent name**. The endpoint only contains resource names, so it can go in notes.

  If the portal only has the old version: send AI a screenshot of what you see, timeboxed to 1 hour.

- [ ] **Step 2: Write the failing tests (AI)**

  `src/foundry/test_enable_activity_protocol.py` uses the standard library `unittest` to test the pure function `build_patch(agent: dict) -> dict`:

```python
def test_adds_activity_and_keeps_existing_protocols_and_auth(self):
    agent = {"agent_endpoint": {
        "protocol_configuration": {"responses": {}, "a2a": {}},
        "authorization_schemes": [{"type": "Entra"}]}}
    self.assertEqual(build_patch(agent), {"agent_endpoint": {
        "protocol_configuration": {"responses": {}, "a2a": {}, "activity": {}},
        "authorization_schemes": [{"type": "Entra"}]}})

def test_keeps_existing_activity_settings(self):
    agent = {"agent_endpoint": {
        "protocol_configuration": {"responses": {}, "activity": {"enable_m365_public_endpoint": True}},
        "authorization_schemes": [{"type": "Entra"}]}}
    self.assertEqual(build_patch(agent)["agent_endpoint"]["protocol_configuration"]["activity"],
                     {"enable_m365_public_endpoint": True})

def test_defaults_when_endpoint_config_missing(self):
    self.assertEqual(build_patch({}), {"agent_endpoint": {
        "protocol_configuration": {"responses": {}, "activity": {}},
        "authorization_schemes": [{"type": "Entra"}]}})

def test_does_not_mutate_input(self):
    agent = {"agent_endpoint": {"protocol_configuration": {"responses": {}}}}
    build_patch(agent)
    self.assertEqual(agent, {"agent_endpoint": {"protocol_configuration": {"responses": {}}}})
```

  Run: `python -m unittest discover -s src/foundry -v`
  Expected: FAIL (`ImportError`, because `build_patch` doesn't exist yet)

- [ ] **Step 3: Implement the script (AI)**

  `src/foundry/enable_activity_protocol.py`:
  - `build_patch(agent: dict) -> dict`: implemented per the tests above.
  - `main()`:
    - Arguments are `--endpoint <project endpoint>` and `--agent <agent name>`.
    - Get a token with `azure.identity.InteractiveBrowserCredential().get_token("https://ai.azure.com/.default")`, which pops up a browser sign-in.
    - Use `urllib.request` to run, in order:
      1. `GET {endpoint}/agents/{agent}?api-version=v1`.
      2. If `activity` is already on, print "already enabled" and exit.
      3. Otherwise `PATCH` the same URL, `Content-Type: application/merge-patch+json`, body from `build_patch`.
      4. GET again and print the list of enabled protocol names.
    - On HTTP errors, print the status code and response body, then `sys.exit(1)`.
    - **Never print the token under any circumstances.**

- [ ] **Step 4: Run the tests**

  Run: `python -m unittest discover -s src/foundry -v`
  Expected: 4 tests OK

- [ ] **Step 5: Actually turn on Activity (user runs it in the terminal; AI creates the venv first)**

```bash
python -m venv src/foundry/.venv
src/foundry/.venv/Scripts/python -m pip install -r src/foundry/requirements.txt
src/foundry/.venv/Scripts/python src/foundry/enable_activity_protocol.py --endpoint "<project endpoint>" --agent hr-policy-summarizer
```

  Expected: the protocol list printed at the end includes `activity`.

  If it returns **403**, the cause is that the subscription Owner role doesn't include data-plane permissions. Fix: in Azure portal → Foundry resource → Access control (IAM), give yourself the **Foundry User** role (formerly Azure AI User), wait a few minutes and run again. Record this in break-and-fix.

- [ ] **Step 6: Connect to HR Assistant (user)**

  HR Assistant → Agents → Add an agent → Microsoft Foundry → new connection, fill in the project endpoint → Next:
  - Name: `HR Policy Summarizer`
  - Agent Id: `hr-policy-summarizer`
  - Description: the sentence from Interfaces.

  Save.

- [ ] **Step 7: Test (user screenshots)**

  New conversation for each:
  1. "Give me a TL;DR of the remote work policy": hands off to Summarizer, outputs three bullets.
  2. "Can I carry over annual leave?": doesn't hand off to it, uses the existing knowledge base.
  3. Ask the same question twice, record the time taken, and compare with question 2 (prediction 3).

- [ ] **Step 8: Record and commit**

  notes.md records:
  - Differences between the old and new portal.
  - Why the Activity protocol is needed, and the protocol list before and after the script's GET and PATCH.
  - Whose identity the connection uses: the Entra account of the person who created the connection.
  - Test results and timings.

```bash
git add src/foundry/ milestones/M5-multi-agent/notes.md
git commit -m "M5: integrate Foundry agent and add Activity protocol enable script"
```

---

### Task 4: Write the A2A agent service (about 1.5 hours, mostly AI)

**Goal:** Write a local A2A service "Onboarding Schedule Agent": returns the day-by-day schedule for the first onboarding week by department. It doesn't call a model, results are fixed, and it's testable.

**Files:**
- Create: `data/onboarding/first-week-schedule.json`
- Create: `src/a2a-agent/package.json` (copy the shape of `src/employee-api/package.json`: `"type": "module"`, two scripts `start` / `test`, no dependencies)
- Create: `src/a2a-agent/server.js`
- Create: `src/a2a-agent/server.test.js`

**Interfaces:**
- Produces: `export function createApp(): http.Server`, same pattern as `src/employee-api/server.js`, using Node built-in `http`, listening on `PORT` (default 3200) when run directly. Environment variable `A2A_API_KEY`, default `dev-local-key`, request header `x-api-key`.
- Routes:
  - `GET /.well-known/agent.json` and `GET /.well-known/agent-card.json`: no authentication, return the agent card.
  - `POST /`: authentication required, A2A JSON-RPC.
  - All other paths 404.
- Agent card (A2A v0.3 shape):

```json
{
  "protocolVersion": "0.3.0",
  "name": "Onboarding Schedule Agent",
  "description": "Returns the first-week onboarding schedule (day 1 to day 5) for a Contoso department: Engineering, Finance, HR or Sales.",
  "url": "<https root URL built from the request's Host header>/",
  "version": "1.0.0",
  "preferredTransport": "JSONRPC",
  "capabilities": { "streaming": false },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [{ "id": "first-week-schedule", "name": "First-week schedule", "description": "Day-by-day plan for a new hire's first week in a given department.", "tags": ["onboarding"], "examples": ["What does the first week look like in Engineering?"] }]
}
```

- `message/send` returns: `{ jsonrpc: "2.0", id, result: { kind: "message", role: "agent", messageId: <randomUUID>, contextId: <contextId from the request>, parts: [{ kind: "text", text }] } }`
- Reply text format: first line `First-week schedule for <Department>:`, followed by five lines `Day N: <schedule>`. When no department is recognised, reply: `Which department? I have schedules for Engineering, Finance, HR and Sales.`

- [ ] **Step 1: AI writes the schedule data**

  `first-week-schedule.json`: keys are `Engineering`, `Finance`, `HR`, `Sales`, matching the Department column of `data/employees.csv`. Each key maps to 5 strings, Day 1 to Day 5. Every Day 1 includes "IT Helpdesk" and "Onboarding Agent checklist"; the other days differ per department.

- [ ] **Step 2: Write the failing tests (AI)**

  `server.test.js` reuses the `withServer` pattern from `employee-api/server.test.js`. Use a helper `send(base, text, extraParts = [])` that POSTs, with the key, this body: `{ jsonrpc: "2.0", id: 1, method: "message/send", params: { message: { kind: "message", role: "user", messageId: "m1", contextId: "c1", parts: [{ kind: "text", text }, ...extraParts] } } }`. Tests:

```js
test('agent card is served without an API key on both well-known paths', ...)
  // both paths return 200; body.name === 'Onboarding Schedule Agent'; body.protocolVersion === '0.3.0'
test('message/send returns the schedule for a department named in the text', ...)
  // text 'What does week one look like in Engineering?'
  // result.kind === 'message'; result.role === 'agent'; result.contextId === 'c1'
  // result.parts[0].text starts with 'First-week schedule for Engineering:' and contains 'Day 5:'
test('department matching ignores case', ...)
  // 'first week for sales please' → text starts with 'First-week schedule for Sales:'
test('asks which department when none is recognised', ...)
  // 'What happens in my first week?' → text equals
  // 'Which department? I have schedules for Engineering, Finance, HR and Sales.'
test('non-text parts are ignored', ...)
  // extraParts = [{ kind: 'data', data: { a: 1 } }], text 'Finance' → returns the Finance schedule normally
test('every department in employees.csv has a five-day schedule', ...)
  // read the distinct Departments from data/employees.csv; each department is an array of length 5 in the JSON
test('POST without the API key returns 401', ...)
test('unknown JSON-RPC method returns error -32601 with the request id', ...)
  // method 'message/stream', id 7 → HTTP 200, body.error.code === -32601, body.id === 7
test('invalid JSON returns error -32700', ...)
  // body 'not json' → body.error.code === -32700, body.id === null
```

  Run: `cd src/a2a-agent && npm test`
  Expected: FAIL (`./server.js` not found)

- [ ] **Step 3: Implement `server.js` (AI)**

  Structure follows `employee-api/server.js`:
  - Read the JSON data once at startup.
  - Department matching: in the order `Engineering, Finance, HR, Sales`, take the first department that appears in the text (case-insensitive, whole-word match, so "HR" doesn't match "three").
  - `console.log` one line `method path` for every request. For POST requests also print the raw body; Task 5 needs to see the full payload Copilot Studio sends.

- [ ] **Step 4: Run the tests**

  Run: `cd src/a2a-agent && npm test`
  Expected: 9 tests pass

- [ ] **Step 5: Start locally, open the tunnel (AI runs in the background)**

```bash
cd src/a2a-agent && npm start          # background
devtunnel create hr-a2a-agent --allow-anonymous
devtunnel port create hr-a2a-agent -p 3200
devtunnel host hr-a2a-agent           # background
```

  **Verify:**
  - `curl <tunnel URL>/.well-known/agent.json` returns 200 and the card.
  - `curl -X POST <tunnel URL>/` without the key returns 401.

  Record the tunnel URL in notes.md, together with the other two.

- [ ] **Step 6: Commit**

```bash
git add data/onboarding/first-week-schedule.json src/a2a-agent/package.json src/a2a-agent/server.js src/a2a-agent/server.test.js
git commit -m "M5: add minimal A2A onboarding schedule agent"
```

---

### Task 5: Connect via A2A to HR Assistant, and compare with the connected agent (about 1.5 hours)

**Files:**
- Modify: `milestones/M5-multi-agent/notes.md`
- May modify: `src/a2a-agent/server.js`, `server.test.js` (only if the requests Copilot Studio actually sends don't match the implementation)

- [ ] **Step 1: Add the A2A agent (user)**

  HR Assistant → Agents → Add an agent → **A2A agent**:
  - Endpoint URL: the tunnel root URL, with the trailing `/`.
  - Name and description should be filled in automatically from the agent card. If they aren't, the card path is wrong; send AI a screenshot.
  - Authentication: **API key**, header name `x-api-key`, value `dev-local-key`.

  Save, then create a new connection → Add and configure.

- [ ] **Step 2: Test (user screenshots + AI watches the service log)**

  New conversation for each:
  1. "What does my first week look like in Engineering?": hands off to the A2A agent; the reply is a five-day schedule.
  2. "I'm starting in Finance, what's the plan for week one and what should I bring?": see whether the main agent calls both the A2A agent and the Onboarding Agent, then combines the results.
  3. "What's my first week like?": the A2A agent asks back for the department. See how the main agent relays that follow-up question to the user.

  AI pulls one full payload from the A2A service's console log. Focus on `contextId`, the chat history in `metadata`, and locale. Record the field structure in notes; no need to copy the user's original wording in full.

  **When requests don't match:** for example if the log shows `message/stream`, `SendMessage`, or a POST to a different path, AI first adds a failing test for that request, then changes the implementation, timeboxed to 1 hour. Write what was changed into break-and-fix.

- [ ] **Step 3: Write the comparison table**

  Add "connected agent vs A2A vs Foundry" to notes.md: one table, columns Copilot Studio connected agent / Foundry agent / A2A agent, rows:
  - Where it runs
  - How it's discovered: description filled in Copilot Studio, or read from the agent card
  - What context is passed: the conversation history switch, or chathistory in A2A metadata
  - Authentication: whose identity, what credential
  - Publishing requirements
  - Time taken (tested hands-on)
  - When not to use it

- [ ] **Step 4: Commit**

```bash
git add milestones/M5-multi-agent/notes.md src/a2a-agent/
git commit -m "M5: connect A2A agent and compare multi-agent integration options"
```

---

### Task 6: Fabric data agent (about 2 hours, timeboxed)

**Goal:** If route A was chosen: load the employee and leave tables into a lakehouse, build a data agent, connect it to HR Assistant, and answer "which department takes the most leave". If route B was chosen: only do Step 1 and Step 7.

**Files:**
- Create: `data/leave-requests.csv`
- Create: `data/data.test.mjs`
- Modify: `milestones/M5-multi-agent/notes.md`

**Interfaces:**
- Consumes: `data/employees.csv` (20 rows: Engineering 8, Sales 5, Finance 4, HR 3).
- Produces: `data/leave-requests.csv`, columns `RequestId,EmployeeId,Type,StartDate,EndDate,Days,Status`. Type is `Annual` or `Sick`, Status is `Approved`, `Pending` or `Rejected`, dates in `YYYY-MM-DD` format, all within 2026.

- [ ] **Step 1: Write the failing data tests (AI)**

  `data/data.test.mjs`, using `node:test`. Only rows with Status `Approved` count:

```js
test('every leave request references an existing employee', ...)
test('RequestIds are unique, Days is a positive integer, EndDate >= StartDate', ...)
test('there are between 30 and 50 requests', ...)
test('Engineering has the most approved leave days in total, at least 1.5x the runner-up', ...)
test('Finance has the most approved leave days per employee', ...)
  // per employee = department's total Approved Days / department headcount (from employees.csv)
```

  The last two make "which department takes the most leave" have two different answers, by total and per employee. That tests whether the data agent understood what the question means.

  Run: `node --test data/`
  Expected: FAIL (file doesn't exist)

- [ ] **Step 2: AI generates `leave-requests.csv`**

  Hand-write 30–50 rows that satisfy all the tests above.

  Run: `node --test data/`
  Expected: 5 tests pass

  Then commit:

```bash
git add data/leave-requests.csv data/data.test.mjs
git commit -m "M5: add mock leave request data for Fabric"
```

- [ ] **Step 3: Turn on tenant settings (user, route A)**

  - Azure portal → Fabric capacity → **Resume**.
  - app.fabric.microsoft.com → Settings → Admin portal → Tenant settings, turn on the following (enabling only for yourself is fine):
    - The one that allows creating data agents (named something like "Users can create and share Data agent item types").
    - "Users can use Copilot and other features powered by Azure OpenAI".
    - The two cross-geo processing and storage settings (needed for Australia East).
  - Record the actual setting names in notes.

- [ ] **Step 4: Build the lakehouse and tables (user)**

  - Create workspace `HR-Analytics`, License mode Fabric capacity, bound to F2.
  - Create Lakehouse `hr_lakehouse`.
  - Upload the two CSVs to Files, right-click each → **Load to Tables**, producing tables `employees` and `leave_requests`.

  The data agent only reads tables, not files.

  **Verify:** Run `SELECT COUNT(*) FROM leave_requests` in the SQL analytics endpoint; the row count matches the CSV.

- [ ] **Step 5: Build and publish the data agent (user)**

  - Workspace → New item → Data agent `HR Data Agent`.
  - Data source `hr_lakehouse`, check both tables.
  - Instructions: "Join leave_requests.EmployeeId to employees.EmployeeId to get the department. Only count rows where Status = 'Approved' unless the user asks otherwise."
  - First ask two questions in Fabric:
    - "Which department took the most approved leave days?" → expected Engineering.
    - "Which department has the most approved leave days per employee?" → expected Finance.

  Check whether the generated SQL is right, then **Publish**.

- [ ] **Step 6: Connect to HR Assistant and test (user)**

  - HR Assistant → Agents → Add an agent → Microsoft Fabric → connection → select `HR Data Agent`.
  - Description: "Answers analytical questions about Contoso leave statistics across departments (totals, averages, trends). Questions must be in English."
  - In the test pane ask the two questions from Step 5 in English.
  - Then ask a personal question "How many annual leave days do I have left?", which should **not** go to the data agent but to the existing leave balance topic or tool.

  When done, go straight back to the Azure portal and **Pause** the capacity.

- [ ] **Step 7: Record and commit**

  notes.md records:
  - Route A: setting names, the answers and generated SQL for the two questions, routing behaviour with the main agent, and whose identity the data agent reads data as (the asking user themselves).
  - Route B: the prerequisites read, the architecture diagram (text version), and why it wasn't done.

  Write anything that got stuck into break-and-fix.

```bash
git add milestones/M5-multi-agent/ README.md
git commit -m "M5: record Fabric data agent integration"
```

---

### Task 7: Design notes and deliberate breaks (about 1.5 hours)

**Files:**
- Modify: `milestones/M5-multi-agent/notes.md`
- Modify: `milestones/M5-multi-agent/break-and-fix.md`

- [ ] **Step 1: Design notes**

  Add "Multi-agent design" to notes.md, answering five questions using HR Assistant's actual configuration:
  1. Who does the routing, and based on what (description, instructions).
  2. How context is passed (history switch, A2A metadata, and how Foundry and Fabric each handle it).
  3. Permissions: whose identity each sub-agent uses to access what.
  4. What the user sees when a sub-agent errors.
  5. Handoff: after a sub-agent answers, where control goes.

  End with a paragraph: at HR Assistant's current size, child agents would actually be enough; under what circumstances is it worth splitting into connected agents?

- [ ] **Step 2: Experiment 1: overlapping descriptions**

  - Change Onboarding Agent's description in the main agent to "Answers questions about Contoso HR policies and onboarding."
  - Change HR Policy Summarizer's to "Answers questions about Contoso HR policies."
  - Ask each of the Task 2 and Task 3 test questions once, plus "What is the sick leave policy?", and record where each was routed.
  - Change the descriptions back, test again, and confirm things are back to normal.

- [ ] **Step 3: Experiment 2: revoke access (once for each of three ways, reverting after each)**

  1. In Onboarding Agent's Settings turn off **Let other agents connect to and use this one**, then Publish. Test in the main agent and see what the user sees.
  2. Stop the A2A service (AI stops the background process) and test in the main agent. Changing the API key to a wrong value also works instead. See what Copilot Studio's activity map and the service log each show.
  3. (Optional, only if route A was chosen) In the Fabric workspace revoke sharing of the data agent, or switch to a test user without permission. If short on time, skip it and write a one-line conclusion.

- [ ] **Step 4: Record and commit**

  One line per experiment in break-and-fix.md, same format as M4: date, what was changed, symptom, cause, fix or conclusion.

```bash
git add milestones/M5-multi-agent/
git commit -m "M5: record multi-agent design notes and break-and-fix experiments"
```

---

### Task 8: Notes, coverage table and milestone close-out (about 1 hour)

**Files:**
- Modify: `milestones/M5-multi-agent/notes.md`
- Modify: `milestones/M5-multi-agent/checklist.md`
- Modify: `docs/coverage.md`
- Modify: `README.md`

- [ ] **Step 1: Fill in "Concepts learned" and "Not yet understood, left for later" in notes.md**

  Each "Concepts learned" item answered based on hands-on testing:
  1. How to choose between a child agent and a connected agent.
  2. The difference between MCP and A2A: one connects tools, the other connects agents. Give an example of each from HR Assistant.
  3. The relationship between Copilot Studio agents and Foundry agents, and when something should go in Foundry.
  4. Compared with just giving an agent a SQL tool, what a Fabric data agent does better and what it costs.
  5. The three costs multi-agent brings: latency, test surface, governance.

- [ ] **Step 2: Fill in checklist.md**

```markdown
# M5 checklist

- [ ] Onboarding Agent published and connected as a connected agent, routing tests pass
- [ ] Foundry agent has Activity protocol on and is connected, tests pass
- [ ] A2A agent service tests pass, connected to HR Assistant, payload recorded
- [ ] Fabric data agent connected and answers both statistics questions correctly (or the route B reason is recorded)
- [ ] connected / Foundry / A2A comparison table written
- [ ] All five multi-agent design note questions answered
- [ ] Both deliberate-break experiments done and reverted
```

  Tick according to what actually happened; leave unfinished items unticked and state the reason.

- [ ] **Step 3: Fill in coverage.md**

  Mark bullets 30–34 as Understand / Built according to actual results; leave the Explain column empty.

- [ ] **Step 4: Cost, cleanup and secrets check**

  - Azure portal → subscription → Cost analysis, check this month's spend, record it in notes.
  - If route A was chosen, delete the Fabric capacity. Before deleting, confirm it is no longer Running.
  - Keep the Foundry agent, A2A service and tunnel until M6; M6's test set will still use them. Write this clearly in the README.
  - AI searches the whole repo for `Bearer`, `eyJ` (the start of a JWT), `AccountKey`, `api-key`, to confirm no tokens or secrets entered the repo.

- [ ] **Step 5: Update the README, commit and push**

  - Change "Current milestone" to `M6 Testing and ALM (not started)`.
  - Change the M5 row to `Done YYYY-MM-DD` and fill in this file's path.
  - "Services opened and expiry dates" table: update the Fabric row, and on the Azure row note the decision to be made before the free credit expires on 2026-11-15.

```bash
git add -A
git commit -m "Close out M5: multi-agent integration complete, update coverage"
git push origin master
```

---

## Next

When the user says "start M6", Claude writes a separate plan based on design doc §4 M6. Two reminders before M6 starts:
- The Azure free credit expires on 2026-11-15.
- Teams publishing needs to be retried in a sandbox environment (carried over from M4).

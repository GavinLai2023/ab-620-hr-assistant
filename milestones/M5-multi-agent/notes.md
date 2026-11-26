# M5 Multi-agent notes

## What problem this milestone solves

When one agent handles everything, its instructions, knowledge sources and tools keep piling up, and there's no way to let other teams or other platforms each own a piece. M5 turns HR Assistant into a main agent and adds four kinds of external agent:
- Onboarding Agent: connected agent.
- HR Policy Summariser: Foundry agent.
- Onboarding Schedule Agent: A2A, never got it working.
- HR Data Agent: Fabric data agent.

The goal is to test each way of connecting hands-on: how routing is decided, how context is passed, whose identity it runs as, and what happens when it fails.

## What I did

### Task 1: Preview and predictions (2026-10-22)

**Predictions** (guess first, compare after, don't edit the original):

1. When the user asks "what does a new employee need to do on day one", will the main agent hand it to Onboarding Agent, or answer itself from the policy knowledge base?
   - Guess: hand it to Onboarding Agent.
2. After turning off Pass conversation history, can the child agent still know who "I" am (the employee ID I gave earlier)?
   - Guess: yes. With the toggle off, the key information still reaches the child agent.
3. Of the four kinds of child agent, which is slowest? Why?
   - Guess: the A2A agent. It has to call another agent through a protocol to do the work, so it takes longer.

**Fabric route: chose A (F2, pay by the hour).**
- **Reason:** while writing the plan I found that Fabric trial capacity doesn't support data agent ([Features by SKU](https://learn.microsoft.com/en-us/fabric/enterprise/fabric-features): trial capacity doesn't support the features in the list, data agent is in it, with no footnote). To do it hands-on I can only use a paid F2 or higher capacity.
- **Cost:** F2 is drawn from the Azure free credit; Pause after every use, delete at the end of M5.
- **Fallback:** if the free account doesn't allow creating it, fall back to route B (learn only, no hands-on, bullet 33 marked Understand only).
- **Actual creation (2026-10-22):** in the Azure portal created Microsoft Fabric capacity `fabrichrdemo`, in `rg-hr-assistant`, Australia East, SKU F2 (2 CU), estimated US$306.60/month, about US$0.42/hour. Paused it right after creation, status Paused. The free account can create it, no separate resource provider registration needed.
- **Capacity Overage Protection:** On by default, meaning usage beyond the SKU is not throttled and the excess is billed separately at overage rates. For a small experiment I'd rather be throttled than spend more, so I recommend turning it off.
- **Gotcha:** after clicking Review + create and passing validation, you still have to click **Create** again on the summary page for it to actually deploy. I missed it the first time: the Activity log only had Validate Deployment, no Create Deployment, and the resource group had no resource. Also, the portal's Recent view only lists recently opened resources; newly created resources don't show up there.

**Main agent orchestration:** `HR Assistant Classic` → Settings → Generative AI → Orchestration is set to **Yes** (generative orchestration); multi-agent routing depends on it.
- The same page also has **Connected agents → Let other agents connect to and use this one**, and HR Assistant's own toggle is On. This toggle means "allow others to use me as a child agent"; it has nothing to do with "me connecting to others".
- Limitation from the docs: once an agent has connected agents attached, it can no longer be used as a connected agent by another main agent. So HR Assistant having this toggle on has no real effect.

### Task 2: Onboarding Agent as a connected agent (2026-10-22 to 10-23)

**Building the agent:**
- Copilot Studio → HR-Dev → Create → New agent.
- Naming dialog: Language English (United States), Solution set to Common Data Services Default Solution (in M6 I'll add it to the `HRAssistant` solution, which is good practice for "Add existing agents to a solution"), Schema name `crc6c_OnboardingAgent`.
- The new agent uses the new UI; the top tabs are Overview / Knowledge / Tools / Agents / Topics / Activity / Evaluation / Monitor / Channels, and the default model is **GPT Chat Latest**. **Web Search is Enabled by default**; you have to turn it off manually, otherwise it goes to the public web for answers.
- Knowledge: uploaded `data/onboarding/onboarding-checklist.md` (file upload, not SharePoint), status Ready.
- The 1 Warning in Agent status is "No evaluation has been run on this agent"; it doesn't affect use and will go away after running an evaluation in M6.
- In its own test pane I asked "What do I need to bring on my first day?": ID documents, bank account and tax file number all correct, citation pointing to the checklist, Search sources 6.78s. The Query in the activity pane is the question as rewritten by the orchestrator, not the user's original words.

**The four prerequisites for a connected agent, and how each was met:**

| Prerequisite | How it was met |
|---|---|
| Same environment | Both in HR-Dev |
| Published | Published 2026-10-22 22:56 |
| Allows connections | Settings → Generative AI → Connected agents → **Let other agents connect to and use this one** = On (On by default) |
| Maker is owner or it's shared | I built both agents myself |

**Connecting:**
- HR Assistant → Agents → **Add an agent**. The dialog has three sections:
  - **Create a child agent**: New child agent, a lightweight agent built inside the main agent.
  - **Select an agent in your environment**: a Copilot Studio agent in the same environment; choosing it makes a connected agent.
  - **Connect to an external agent**: the dropdown has Microsoft Fabric, Microsoft Foundry, Microsoft 365 Agents SDK (these three marked Preview), and Agent2Agent (not marked Preview).
- Configuration page after clicking Onboarding Agent:
  - The **Description** at the top is a local copy stored on the main agent side; it can be edited and does not sync with the child agent.
  - **Pass conversation history to this agent** (checked by default); the help text is "Deselect to prevent conversation history, including potentially sensitive information, being passed between agents".
  - **Agent details** below is read-only and shows the child agent's own description and instructions.
  - The button is **Add and configure**.
- Columns in the Agents list: Relationship = **Connected**, Trigger = **By agent** (the orchestrator decides when to call it), Enabled toggle (disable temporarily without removing).

**Test results** (new test session for each sentence):

| # | User input | Routing | Task the main agent handed to the child agent (summary) | Time |
|---|---|---|---|---|
| 1 | I'm starting next Monday, what do I need to bring? | Onboarding Agent | "The user, the maker, says they are starting next Monday... next Monday is 10/26/2026. Do not request or repeat sensitive personal information." | 13.69s |
| 2 | Can I carry over annual leave? | Main agent's own knowledge base (4 sources: MS copilot public website, HRPolicies, Employee, Azure AI Search), not handed to the child agent | — | 12.58s |
| 3a | I'm E002 and I just joined. What trainings do I have to finish? (history on) | Onboarding Agent | "The user stated they are E002, but do not repeat or expose the identifier..." | 16.34s |
| 3b-1 | I'm E002 and I just joined. (history off) | Onboarding Agent, returned the whole checklist | "Provide the new-hire onboarding checklist... Do not repeat the employee ID" | 17.37s |
| 3b-2 | What trainings do I have to finish? (history off) | Onboarding Agent | "For a newly joined Contoso employee, identify the mandatory trainings...", no E002 and no name | 15.98s |

**Patterns observed:**
- **The child agent doesn't receive the user's original words; it receives a Task (String) written by the main agent.** The main agent rewrites: it converts "next Monday" into a specific date, adds constraints ("don't repeat the employee ID", "don't request sensitive information"), and narrows the scope to the checklist.
- **User identity and conversation history are two different things.**
  - In 3b I used Open conversation to open the child agent's side of the conversation (Onboarding Agent → Activity); the initiator shows as **the maker**. So even without passing history, the child agent runs **as the current user**.
  - The child agent's side has only one user message, the Task written by the main agent, and none of the earlier conversation.
  - The Task in 3b-2 has no E002: the employee ID was only in the conversation history, and the main agent judged this question didn't need it, so it didn't put it in the Task.
- **Retest (10-23, history checked again, same two 3b sentences): on and off look no different in the UI.**
  - The Task for the 2nd sentence was "For a newly joined Contoso employee, identify the mandatory trainings...", almost identical to when it was off, and no E002 either.
  - In the child agent's Activity, each call is **still a new conversation** (one each at 15:32 and 15:34), and the second conversation also only contains the current Task.
  - So the conversation record page **doesn't show** the attached history. "The conversation only contains the Task" can't be used as proof that history wasn't passed (AI first inferred this, then withdrew it).
  - Whether history is passed to the child agent as hidden context can't be seen in the test UI; I can only go by the docs: checked means it's passed, unchecked means the child agent only receives the Task.
- **The main agent itself always has the full history.** The Task in 3b-2 says "newly joined", inherited from the previous sentence. So turning off the toggle blocks the "main agent to child agent" leg; it doesn't affect the main agent's understanding of context.
- Every child agent call leaves a separate conversation in the child agent's Activity; you can Copy conversation ID, which is useful for troubleshooting.
- **Double answers:** in 3a, after the child agent answered, the main agent restated it in one sentence (the same kind as the orchestrator double answer in M4). It didn't happen in 3b. The docs give child agents an "after running behavior" setting; whether connected agents have something similar is left for Task 7.
- **Time:** the child agent answering alone took 6.78s; via the main agent it's 13.7 to 17.4s. But the main agent querying its own 4 knowledge sources also takes 12.58s, so the slowness isn't all from the extra agent layer.

**After changing the child agent you have to Publish again** for the main agent to get the new version (straight from the docs; I didn't change it in this Task, so not tested hands-on).

**Checking predictions:**
- Prediction 1 (hand to Onboarding Agent): **correct**. The first test didn't hand it off because the test session was opened before the child agent was added; see break-and-fix.
- Prediction 2 (with history off the child agent still knows who I am): **the "who" part is correct.** The child agent runs as the current signed-in user whether or not history is on, and the main agent may also write the name into the Task. Whether the employee ID mentioned in the conversation is carried over depends on whether the main agent writes it into the Task; in testing it wasn't carried with history on or off. Whether history itself is passed can't be verified in the UI.

### Task 3: Foundry agent "HR Policy Summariser" (2026-10-24)

**Building the agent (new Foundry portal):**
- In the Azure portal open the Foundry resource `hr-assistant-demo` → **Go to Foundry portal** → make sure the **New Foundry** toggle at the top right is on → project `hr-assistant` → Agents.
- The actual name is `hr-policy-summariser` (British spelling; the plan says summarizer). An agent's name can't be changed after creation, so this is the Agent Id from here on.
- Model `gpt-4.1-mini` (Global Standard deployment). Instructions require "three bullets, each no more than 20 words, using only the attached policy files". Added **File search** under Tools and uploaded the 4 policy `.md` files; the generated index is 7.38 KB.
- Every save creates a new **Version** (Version 3 when I finished). The endpoint defaults to "Always use latest", so no need to manage version numbers.
- Asked the Playground "Summarize the sick leave policy": exactly three bullets, citing `sick-leave-policy.md`, 3s, 2338 tokens.
- Didn't click **Publish** at the top right: Publish is for publishing to Teams / M365; the agent's endpoint is usable as soon as it's created.

**Project endpoint vs Azure OpenAI endpoint:**

| | Project endpoint | Azure OpenAI endpoint |
|---|---|---|
| Form | `https://<account>.services.ai.azure.com/api/projects/<project>` | `https://<account>.openai.azure.com/` |
| What it covers | The project layer: agents, connections, evaluations, files | The model layer: calling a model deployment directly (chat completions) |
| Who uses it | Scripts that change agent configuration; Copilot Studio connecting to a Foundry **agent** | M4 Task 6 custom prompt connecting to a Foundry **model** (BYOM) |

**Turning on Activity protocol (`src/foundry/enable_activity_protocol.py`):**
- Reason: Copilot Studio calls Foundry agents through Activity protocol. Without it, you get a 400 "endpoint does not support activity" at runtime. The portal has no toggle; it can only be turned on via REST or SDK.
- The script does three things: first `GET {endpoint}/agents/{name}?api-version=v1` to read the configuration; add `activity` to the existing protocols, keeping the original protocols and `authorization_schemes`, and write it back with `PATCH` (`application/merge-patch+json`); then GET once more to confirm. It has to merge because PATCH replaces these two fields wholesale.
- Sign-in uses `azure-identity`'s `InteractiveBrowserCredential`, scope `https://ai.azure.com/.default`. The token stays in memory only and isn't printed.
- Dependencies installed in `src/foundry/.venv` (not in git). The pure function `build_patch` has 4 unittests.
- Actual output: `Protocols before: ['responses']`, `Protocols after: ['activity', 'responses']`. **A newly created agent only has Responses on by default.** The Copilot Studio docs say Responses and A2A are on by default; in testing A2A was not on.
- No 403: subscription Owner plus a project I created myself in the portal already gives enough data-plane permissions.

**Connecting to HR Assistant:**
- Agents → Add an agent → Connect to an external agent → **Microsoft Foundry** → new connection (project endpoint + Entra sign-in, admin account) → Name `HR Policy Summariser`, Agent Id `hr-policy-summariser`, Description (use only when the user explicitly asks for a summary / TL;DR).
- On save it said **"The tool was saved"**: in Copilot Studio it's a tool, and the Server is **Azure AI Foundry Agent Service** ("External agent activity protocol based on agent identifier with V2 endpoint"). AgentId is a prefilled Input.

**Test results** (new test session for each sentence):

| # | User input | Routing | Time | Notes |
|---|---|---|---|---|
| 1 | Give me a TL;DR of the remote work policy | HR Policy Summariser | 5.51s | Three bullets; the citation at the end is reduced to a plain-text `[1]` |
| 2 | Can I carry over annual leave? | Main agent's own knowledge base, not handed to Summariser | 13.72s | 5 days, before 31 March |
| 3 | Same as sentence 1 | HR Policy Summariser | 6.72s | Wording differed from the 1st time; the main agent added another paragraph "That's the TL;DR above..." (double answer) |

**Compared with the Task 2 connected agent (tested hands-on):**
- **Much faster.** Foundry agent 5.5 to 6.7s, Onboarding Agent 13.7 to 17.4s. The Foundry agent does "model + File search" in one step; the Copilot Studio child agent runs another round of orchestration itself (rewrite query, retrieve, generate).
- **The Copilot Studio side can't see what was sent.** Inputs only shows AgentId, no Task (String). The bottom button is **Edit agent**, with no Open conversation.
- **The Foundry side can't see it either.** Both the Trace view and Conversation view in Traces need Application Insights connected to have data ("Data generated when Application Insights is enabled"); the Response view only has the one playground entry. For calls Copilot Studio sends via Activity protocol, without App Insights neither portal shows the message text. To troubleshoot cross-agent calls, the called side needs monitoring. Setting up App Insights just for this wasn't worth it, so I didn't.
- **Citations are lost.** In the playground it's a clickable `sick-leave-policy.md`; passed back to Copilot Studio it's just `[1]`. This is the documented known limitation "Citations might not always be maintained when passing outputs back from an agent".
- **Identity:** calling Foundry uses the account on the connection (admin account). Onboarding Agent runs as the conversation user.
  - **Correction (10-25 Task 7):** on HR Policy Summariser's configuration page, **Credentials to use = End user credentials**. That means the connection was created with the maker's account, but at runtime it uses the asking user's own credentials. This time the asker and the maker were the same account, so no difference was visible.
- **No Pass conversation history toggle.**

**How to choose between connected agent and Foundry agent:**
- Same environment, low-code, want to reuse an existing Copilot Studio agent → connected agent.
- Need to choose your own model, write code, connect to data in Azure, or the team already develops in Foundry → Foundry agent.
- The other side is an agent built on another platform or framework → A2A (Task 4, 5).

### Task 4: A2A agent service (2026-10-24)

**What it is:** `src/a2a-agent`, Onboarding Schedule Agent. Returns the Day 1 to 5 first-week onboarding schedule by department, data in `data/onboarding/first-week-schedule.json`. It doesn't call a model, results are fixed, so it can be tested. I wrote it myself because a Copilot Studio agent can't expose an A2A endpoint.

**Minimal set implemented per A2A v0.3 JSON-RPC:**
- `GET /.well-known/agent.json` and `/.well-known/agent-card.json`: the **agent card**, no auth required. Contents: name, description, url, protocolVersion `0.3.0`, preferredTransport `JSONRPC`, capabilities (streaming false), skills. When you enter the endpoint in Copilot Studio, it automatically pulls the name and description from here.
- `POST /`: JSON-RPC, only `message/send` implemented, requires the header `x-api-key: dev-local-key`. Returns `result: { kind: "message", role: "agent", contextId, parts: [{ kind: "text", text }] }`.
- Other methods (e.g. `message/stream`) return JSON-RPC error `-32601`, a non-JSON body returns `-32700`, and the HTTP status code is 200 in both cases. JSON-RPC errors go in the body, not in the HTTP status code.
- Every request prints the method, path and raw body to the console; Task 5 uses this to see the payload Copilot Studio actually sends.
- Department names match on whole words, case-insensitive ("HR" won't match inside "three"). If it can't recognize a department, it asks back "Which department?..." instead of erroring.
- 9 `node:test` tests: card, normal response, case, asking back, ignoring non-text parts, every department has 5 days, 401, -32601, -32700.

**Public access:** a third tunnel `hr-a2a-agent` (`--allow-anonymous`), port 3200. The region is auc1, different from the aue01 of the first two, assigned automatically by devtunnel. Authentication relies on the A2A service's own API key; the tunnel itself is anonymous, done this way only because it's mock data.
- Verification: the card returns 200, a POST without the key returns 401, and asking "week one in HR" with the key returns the HR schedule.
- To restore: `node src/a2a-agent/server.js` and `devtunnel host hr-a2a-agent`.

### Task 5: Connecting to HR Assistant via A2A (2026-10-24, hit the timebox, never got it working)

**Connection steps (this part succeeded):**
- Agents → Add an agent → Connect to an external agent → **Agent2Agent**. Form fields: Agent endpoint URL, Name, Description, Authentication (None / API key / OAuth 2.0). Choosing API key shows Type (Header / Query) and Header name (`x-api-key`). Clicking Create makes a new connection; enter the key value (`dev-local-key`, mock), connection name `a2a-onboarding-schedule`.
- After adding, all three child agents in the Agents list show Relationship **Connected** and Trigger **By agent**. So that column doesn't distinguish between connection types.
- The A2A agent's configuration page has **Completion → After running**, defaulting to **Don't respond**, and below it Advanced → Outputs available to the agent and other tools. This setting relates to the double answer where "the child agent answers and then the main agent adds another paragraph"; left for Task 7.

**The agent card was never accepted:**
- After entering the endpoint it said "We couldn't find an agent card at this URL". The service logs show that each time Copilot Studio requests, in order, `/.well-known/agent-card.json`, `agent.json`, `agentcard.json`, `agentCard.json`, `agent_card.json`, each path twice, and finally `GET /`. Our service returned 200 and the JSON card for all of these.
- First problem: the `url` in the card was `https://localhost:3200/`, because the tunnel rewrites Host to localhost. After changing it to prefer `X-Forwarded-Host`, the url became the public address, but it still said no card was found.
- Checked against the A2A v0.3 spec: the required AgentCard fields (protocolVersion, name, description, url, version, capabilities, defaultInputModes, defaultOutputModes, skills) and the required AgentSkill fields (id, name, description, tags) were all present. The A2A v1.0 card changed to `supportedInterfaces[{url, protocolBinding, protocolVersion}]`, and the JSON-RPC method name changed to `SendMessage`. The docs don't say which version Copilot Studio validates against.
- Had to fill in Name and Description manually.

**The form reported "One or more fields contain incorrect values:" (without saying which field):**
- Tried removing the trailing `/` from the URL, removing the parentheses and colon from Description, and removing the spaces from Name; still errored. After clicking Create the service received no request at all, so it was the form's own validation failing.
- Then AI changed `GET /` from 404 to also return the card, and I Cancelled and reopened the form; both were done at the same time, and after that it passed. Can't tell which one did it.

**Routing didn't go through → the cause was the main agent's instructions:**
- In the first test, HR MCP Server failed (tunnel reclaimed by the system, `notFound`, `mcpMethod: initialize`), the whole turn was aborted, reply "I only handle ... contact hr@contoso.com".
  - **Correction (10-25 Task 7 experiment 0):** the conclusion "an MCP initialization failure aborts the whole turn" is wrong. In Task 7, with Fabric capacity paused, HR Data Agent failed initialization every turn (`CapacityNotActive`), yet that turn was still handed to Onboarding Agent and answered normally. The refusal here was actually the instructions scope problem described below; it just happened at the same time as the MCP failure, and I mixed the two up.
- After restarting the MCP tunnel, a new session gave the same refusal, and the A2A service received no POST. The cause was in HR Assistant's instructions: the first sentence was "**Only** answer questions covered by the employee handbook, including annual leave, sick leave, remote work, and expense reimbursement", and the last was "For out-of-scope questions ... recommend contacting hr@contoso.com". The orchestrator judged "first-week schedule" as out of scope and refused outright, never considering handing it to a child agent.
- Change: removed "Only", expanded the scope to onboarding, and added "For onboarding questions (checklist, first-week schedule) and policy summaries, delegate to the connected agents whose descriptions match the request"; changed the fallback sentence to "questions that neither the knowledge sources nor the connected agents cover". After the change it routed to Onboarding Schedule Agent.
- This also explained something from Task 2: the fourth sentence of the instructions, "Do not ask for or repeat sensitive personal information such as ID numbers", is exactly where "do not repeat the employee ID" in the Task the main agent wrote for the child agent came from. The main agent carries its own rules into the tasks it hands to child agents.
- **Lesson:** when adding a child agent, the child agent's description only decides "who to hand to". If the main agent's instructions hard-code the scope, the orchestrator won't delegate. So when adding a child agent, change the main agent's instructions at the same time.

**Call failure:**
- After routing, Onboarding Schedule Agent stayed Working in the activity map, and the chat showed "Sorry, something went wrong. Error code: SystemError". The node details show what the main agent was about to send: user (String) in Conversation history was "Provide the first-week onboarding schedule, day 1 through day 5, for a new employee in Contoso Engineering.", and the Raw output was a v0.3-shaped message with `history`, `role`, `parts[{kind, text}]`, `messageId`, `contextId`.
- Service logs: at call time Copilot Studio requested all the card paths again, then **didn't send a single POST**. So it failed at the step of reading the card before the call; the failure happened inside Copilot Studio, with no error details in the UI.
- Compared with Microsoft's official sample (CopilotStudioSamples `extensibility/a2a/Simple-A2A-Sample`, .NET, `Microsoft.Agents.AI.Hosting.A2A.AspNetCore`): the endpoint is `/a2a/botanical/v1/message:stream`, a middleware unpacks JSON-RPC `message/send` and hands it to the SDK, and it also converts SSE-format responses back to JSON. In other words, the official approach relies on the SDK to generate the card and endpoints. Something in our hand-written card isn't recognized by Copilot Studio.
- The full node Raw output was `{"history": [{"role": "user", "parts": [{"kind": "text", "text": "Provide the first-week onboarding schedule..."}], "messageId": "...", "contextId": "16b0f161-...", "kind": "message"}]}`, which shows three things:
  - Copilot Studio uses the **A2A v0.3 message shape**, the same version as the `message/send` we implemented, so there's no protocol version mismatch.
  - **`contextId` is Copilot Studio's conversation ID** (the same as the Conversation ID in the error); A2A uses it to link multiple calls in the same conversation.
  - Conversation history is passed in `history`; this time it only contained the task the main agent wrote (not the user's original words).
  - The payload was ready but never reached our service, so the failure happened **before sending** (at the step of reading the card or establishing the connection).
- Hit the 1-hour timebox, stopped. Bullet 34 marked Understand only. Fallback: if there's time at the end of M5, rewrite the service with the official `@a2a-js/sdk` and try again, 1-hour timebox.
- Set the test A2A agent to Enabled = Off in HR Assistant for now, so later tests don't route to it again and get stuck.

### Task 6: Fabric data agent (2026-10-25)

**Data:** `data/leave-requests.csv`, 35 leave records, checked by `data/data.test.mjs` (5 tests). Counting only Approved:

| Department | Headcount | Total Approved days | Per person |
|---|---|---|---|
| Engineering | 8 | 48 | 6 |
| Finance | 4 | 28 | 7 |
| Sales | 5 | 20 | 4 |
| HR | 3 | 12 | 4 |

It's designed so that "which department took the most leave" has two different answers by total and by per-person average: by total it's Engineering, per person it's Finance.

**Tenant settings (Admin portal → Tenant settings, search box at the top right):**
- "Users can create and share Data agent item types", as written in the plan, can't be found; the new version no longer has this separate toggle. Searching `data agent` only brings up "Fabric data agents can send operational metadata for observability in Microsoft Foundry", which has nothing to do with creation.
- There are two sets of AI toggles with very similar names:
  - **OpenAI as a Microsoft Subprocessor** (new):
    - "Users can use Copilot, AI Agents and other AI experiences powered by OpenAI as a Microsoft Subprocessor"
    - "Data sent to OpenAI as a Microsoft Subprocessor can be processed outside your capacity's geographic region, compliance boundary, or national cloud instance"
  - **Azure OpenAI**:
    - "Users can use Copilot, AI Agents and other AI experiences powered by Azure OpenAI"
    - "Data sent to Azure OpenAI can be processed outside your capacity's geographic region ..." (was Disabled, turned it on)
    - "Data sent to Azure OpenAI can be stored outside your capacity's geographic region ..."
  - All of the above set to Enabled, scope The entire organization. The description of the cross-region ones says they're only needed when no model is available in the capacity's region. I didn't verify whether Australia East requires them; it's all fake data, so I turned them all on.

**Workspace and lakehouse:**
- When creating a workspace, what used to be "License mode" is now called **Workspace type** (under Advanced). Chose **Fabric**, and in Details chose `fabrichrdemo - Australia East`. **Fabric Trial** is greyed out and can't be selected.
- Lakehouse `hr_lakehouse`: uploaded the CSVs to Files, then Load to Tables, giving tables `employees` and `leave_requests` (table names can't contain hyphens).
- Creating a lakehouse automatically generates a **SQL analytics endpoint** with the same name. The new lakehouse page has no switch button at the top right; you open it from the workspace navigation pane on the left, where it sits under the lakehouse, indented one level. `SELECT COUNT(*) FROM leave_requests` returns 35.

**HR Data Agent:**
- Data source is `hr_lakehouse`, both tables checked. Agent instructions: "Join leave_requests.EmployeeId to employees.EmployeeId to get the department. Only count rows where Status = 'Approved' unless the user asks otherwise."
- The page says data agent now runs on GPT 5.1, and there's also a Preview runtime to choose from. The toolbar has Agent instructions, and Setup on the left has Data source instructions, Example queries and so on, so hints can be given in layers.
- Test results:

| Question | Answer | Key points of the generated SQL | Time |
|---|---|---|---|
| Which department took the most approved leave days? | Engineering, 48 days ✅ | CTE: `leave_requests INNER JOIN employees`, `WHERE Status = 'Approved'`, `GROUP BY Department`, marks the max with `MAX() OVER ()`, returns all 4 departments | 19 seconds |
| Which department has the most approved leave days per employee? | Finance, 7 days per person ✅ | `SUM(CASE WHEN Status = 'Approved' THEN Days ELSE 0 END)` divided by `COUNT(DISTINCT lr.EmployeeId)`, `TOP 1 ORDER BY` per-person `DESC` | 11 seconds |

- **Correct, but the denominator in the second one is off:** it divides by "the number of people with leave records" (`COUNT(DISTINCT lr.EmployeeId)`, which also counts records of any status, not just Approved), not the department's total headcount. In our data everyone has at least one Approved record, so both methods give the same result; it was right by coincidence. If a department had someone who never took leave, its per-person figure would come out too high. "per employee" itself has two readings; the data agent picked one and didn't say so in the answer. Improvement: spell out in the instructions "per employee = divide by the department headcount in the employees table". Task 7 could use this as a break-and-fix experiment.
- Always look at the generated SQL: the natural-language answers all look right; only the SQL shows how it understood the question.

**Publishing:** the Publish dialog has "Also publish to Microsoft Copilot", which when on puts the data agent straight into M365 Copilot for personal use. We only need Copilot Studio to call it, so it stays Off.

**Connecting to HR Assistant (Agents → Add an agent → Microsoft Fabric):**
- **Biggest surprise: the Fabric data agent is connected via MCP.** In the activity map, HR Data Agent shows as **Model Context Protocol, Initialized**, alongside HR MCP Server. At the start of every turn both MCP servers are initialized first. When actually called, it shows as the tool `DataAgent_HR_Data_Agent` (type Tool). So it's different from a connected agent: it isn't a child agent, it's an MCP tool.
- The tool's Description shows the sentence entered when publishing in Fabric, not the one entered in Copilot Studio.
- **The Input is `userQuestion (String)`, and its content is the user's original words** ("Which department took the most approved leave days?"). In Task 2 the Task the connected agent received was rewritten by the main agent; here there's no rewriting.
- **Outputs:** `isError (Boolean)`, `messageDeeplink (String)` (a link to this answer in Fabric, containing the workspace and data agent IDs, not written into the repo), `content (Table)` (the text carries `【CIT:...】` citation markers).
- Test results:

| Question | Where it went | Answer | Time |
|---|---|---|---|
| Which department took the most approved leave days? | `DataAgent_HR_Data_Agent` | Engineering, 48 days ✅ | 10.62 seconds |
| Which department has the most approved leave days per employee? | `DataAgent_HR_Data_Agent` | Finance, 7 days per person ✅ | 10.27 seconds |
| How many annual leave days do I have left? | **Leave Balance topic** (not handed to the data agent) ✅ | Asked for the employee ID first; after entering E002, `connectorTimeoutError`: Employee API timed out after 30 seconds | — |

- The routing for the third sentence was right: a personal balance question goes to the topic, a statistics question goes to the data agent. The failure was because Employee API and its tunnel weren't running this time (not needed in M5), not a routing problem.
- Faster than testing directly in Fabric (11 to 19 seconds in Fabric, about 10.5 seconds here), possibly because the Fabric test page also has to display the steps and SQL.
- **Whose identity reads the data:** according to the docs, the Fabric data agent queries data as the asking user (identity passthrough), so the user must have permissions on the workspace and lakehouse. In this test the asker and the connection creator were the same account, so this **couldn't be verified**. Verifying it would need a different user without workspace permissions to ask. Task 7 didn't do this experiment (it needs a separate test user), so it's still "not verified".

### Task 7: Break-and-fix experiments (2026-10-25)

Plan adjustment: A2A never worked, so the revocation experiment was cancelled. Revoking Fabric permissions needs a separate test user, so it was replaced with a "capacity paused" experiment (experiment 0), which costs nothing. Experiments 1 and 2 were both reverted afterwards.

**Experiment 0: Fabric capacity paused (F2 = Paused)**
- At the start of every turn, HR Data Agent initializes and then fails: `RequestFailure`, `HttpStatusCode: notFound`, `errorCode: CapacityNotActive`, `mcpMethod: initialize`.
- Asked "I'm starting next Monday, what do I need to bring?": still handed to Onboarding Agent, answered correctly, Completed.
- Asked "Which department took the most approved leave days?": the orchestrator searched its own knowledge base twice (33 seconds plus 17 seconds) and replied "I can't determine ...", saying the employee table (Dataverse `crc6c_employee`) has no approval status or dates. **It didn't make up numbers**, but it also **didn't say** the data service was temporarily unavailable.
- In the activity map, HR Data Agent's box doesn't say Failed even when it fails; you only see the red error after clicking into it. That's how I missed it in the first test. **Click open every box.**

**Experiment 1: overlapping descriptions**
- Changed to Onboarding Agent = "Answers questions about Contoso HR policies and onboarding." and HR Policy Summariser = "Answers questions about Contoso HR policies.", new test session for each sentence:

| Question | Original description | Overlapping description |
|---|---|---|
| I'm starting next Monday, what do I need to bring? | Onboarding Agent, 17 to 19 seconds, answered once | Onboarding Agent, 28.47 seconds, then the main agent **searched its own knowledge base again** (10.71 seconds) and sent a second message: "The onboarding agent also didn't return any supported requirements ... contact hr@contoso.com", **contradicting the child agent's answer** |
| Give me a TL;DR of the remote work policy | HR Policy Summariser, 4.66 seconds, answered once | HR Policy Summariser, 5.66 seconds, the main agent added a summary sentence (double answer) |
| What is the sick leave policy? | **Main agent's own knowledge base**, 13.05 seconds, citing `sick-leave-policy.docx`, clickable, more complete content | **HR Policy Summariser**, 5.50 seconds, citation reduced to `[1]` |

- Conclusions:
  1. With overlapping descriptions, the orchestrator picked the **more narrowly described** one (the Summariser, which only says policies), not "policies and onboarding". I predicted it would go to Onboarding Agent; I guessed wrong.
  2. The real risk is **scope quietly expanding**: ordinary policy questions that the main agent should answer with its own 4 knowledge sources now get handed off, and everything looks normal on the surface.
  3. With a vague description, the main agent doesn't trust the child agent's answer and runs another lookup, which can produce contradictory double answers.
  4. Restrictive conditions like "Use only when the user explicitly asks for a summary" are the most effective lever for controlling routing.
  5. Each case was tested only once, and the orchestrator's results aren't deterministic, so all of these are "very likely".

**Experiment 2: turned off "Let other agents connect to and use this one" on Onboarding Agent**
- Location: Onboarding Agent → Settings → Generative AI → Connected agents. After turning it off you have to Publish for it to take effect.
- The main agent still selected Onboarding Agent and wrote the Task; it failed at execution, with the execution summary "completed with status Failed. Consuming 0 tokens".
- The user saw the raw error: "Error Message: Agent crc6c_OnboardingAgent has been set as not connectable. Please disconnect the agent to resolve. Error Code: **ConnectedAgentFlagDisabled** ...". The internal name and the advice meant for developers were exposed directly to the user.
- **The turn ended right there**, without falling back to the knowledge base or recommending hr@contoso.com.
- HR Assistant's Agents list **didn't change at all**: the Errors column was empty and the toggle was still On. So the maker can't tell from the list that the child agent no longer allows connections.

**Double answers (left over from Task 2 and Task 3):**
- The connected agent's configuration page has **Completion → After running**, with options: Don't respond (default), Write the response with generative AI, Send specific response, Send an adaptive card. Below that there's Advanced → Outputs available to the agent.
- The Foundry tool (HR Policy Summariser) has no Completion, only tool settings: When this tool may be used, Ask the end user before running, Credentials to use.
- Guess (not verified): the child agent's answer is shown directly to the user and the main agent doesn't get that content. In experiment 1 the main agent said "The onboarding agent also didn't return any supported requirements", which shows it didn't see what the child agent wrote, so it adds a paragraph of its own. The Outputs option under Advanced may be meant to solve this; I didn't try it. Exam memory aid: **After running decides whether "this node itself" sends anything more to the user after it finishes; by default it doesn't, and the orchestrator wraps up.**

### Task 8: Wrap-up (2026-10-25)

- **Cost** (Azure subscription 1 → Overview → Costs by resource, as of 25/10, data is delayed):

| Resource | Cost |
|---|---|
| `fabrichrdemo` | A$0.45 |
| Foundry `hr-assistant-demo` | A$0.01 |
| Search `srch-hr-assistant-demo` | A$0.01 |
| Total | A$0.47 (forecast for the month A$0.50) |

  - US$199.99 of free credit left, expires 15/11.
  - I Paused F2 after every use, so it was on for a few hours in total and only cost A$0.45.
  - In Cost analysis, if Scope is set to the billing account Contoso, what you see is the M365 Business Basic monthly fee (Productivity Suites, AU$12.60), not Azure costs. Scope has to be switched to the subscription. What's deducted from the free credit doesn't count as "actual cost".
- **Cleanup:**
  - Deleted `fabrichrdemo` and the action group "Application Insights Smart Detection".
  - Left in the resource group: Foundry, Foundry project, Search, Storage, still needed for M6.
  - Deleted by ticking each one and clicking Delete; **don't click Delete resource group**.

## Multi-agent design (answered using HR Assistant's actual configuration)

**1. Who does the routing, and based on what**
- The main agent's orchestrator (generative orchestration). It's based on two layers:
  - **The main agent's instructions decide "whether it's willing to delegate".** Task 5: with "Only answer questions covered by the employee handbook" in the instructions, the orchestrator refused outright and never considered child agents.
  - **The child agent's description decides "who to hand to".** Experiment 1: once a description was broadened, routing changed with it. The description stored in the main agent is a local copy that doesn't sync with the child agent's own description (Task 2). The Fabric tool shows the description entered when publishing in Fabric (Task 6).
- When adding a child agent, check three things together: the child agent's description, the main agent's instructions, and whether the main agent's own knowledge sources overlap with it.

**2. How context is passed**

| Connection type | What the child agent receives |
|---|---|
| Connected agent (Onboarding Agent) | A Task (String) **rewritten** by the main agent, carrying the main agent's own rules (e.g. "don't repeat the employee ID"). There's also a Pass conversation history toggle, but whether on vs off makes a difference can't be verified from the UI |
| Foundry (HR Policy Summariser) | The activity map only shows the agent ID, not what message was sent |
| A2A | v0.3 `message/send`: `contextId` = Copilot's conversation ID, `history` carries the conversation history (Task 5 payload) |
| Fabric data agent (MCP tool) | `userQuestion` = **the user's original words**, not rewritten, each call an independent single question and answer |

**3. Permissions: whose identity each child agent uses to access what**

| Child agent | Identity | Evidence |
|---|---|---|
| Onboarding Agent | The conversation user (the initiator of the conversation on the child agent's side is the maker). Prerequisite: the child agent has "Let other agents connect" turned on | Task 2, experiment 2 |
| HR Policy Summariser | Connection created by the maker (admin account), runtime Credentials = **End user credentials** | Task 3, Task 7 |
| HR Data Agent | According to the docs, queries the lakehouse as the asking user. **Not verified** | Task 6 |
| A2A agent | A shared API key (`x-api-key`); the other side has no idea who the user is | Task 4 |
| HR MCP Server | Anonymous tunnel, no auth, acceptable only because it's fake data | M4 |

**4. What the user sees when a child agent fails**

| Where the failure happens | Example | The turn | What the user sees |
|---|---|---|---|
| MCP initialization at the start of each turn | Fabric capacity paused (experiment 0) | Continues, just without this tool | A normal "can't find it" answer, with no idea something is broken |
| Execution after being selected | Onboarding Agent disallows connections (experiment 2) | **Ends right there** | Raw error code `ConnectedAgentFlagDisabled` |
| Execution after being selected | A2A card read fails (Task 5) | Stuck on Working, then ends | `SystemError` |
| Connector timeout inside a topic | Employee API not running (Task 6) | Ends | Raw error `ConnectorTimeoutError` |

In one sentence: **if it fails before being selected, the orchestrator routes around it and the problem is hidden; if it fails after being selected, the whole turn stops and the internal error is thrown straight at the user.** Both need designed handling: a friendly message to the user, plus monitoring so the maker can see failures.

**5. Handoff: where control sits after the child agent answers**
- Control **always returns to the main agent**. On the child agent's side, every call is a new conversation (Task 2). The user's next sentence still goes to the main agent first, which decides again who to hand it to.
- The child agent's answer is shown directly to the user (After running = Don't respond). The main agent apparently doesn't get that content and may then add a paragraph of its own; that's the double answer, and in bad cases they even contradict each other (experiment 1).

**At HR Assistant's current size, a child agent would actually be enough**
- Onboarding Agent has just one checklist and one line of instructions; making it a child agent (built inside HR Assistant) would do: no separate publishing, no "allow connections" toggle to manage, and no experiment-2 situation where "the other side changes a setting and the main agent breaks". Also, a connected agent takes 13 to 28 seconds per call, slower than the main agent answering itself.
- **When it's worth splitting into a connected agent:**
  - The same agent needs to serve **multiple** main agents (e.g. an IT assistant also needs the onboarding checklist).
  - It's maintained by **another team**, with its own release cadence and ALM.
  - It needs **different settings**: different knowledge source permissions, authentication, DLP, model.
  - The main agent has grown so big that its instructions and tools are unmanageable.
- **Which kind of external agent:** to **add a capability** to an agent (query data, call an API), use MCP or a tool, e.g. the Fabric data agent. To have **two agents collaborate** (each with its own context, multi-turn conversation), use a connected agent, A2A or Foundry. For "what is it, how do I do it" use knowledge; for "how many, which is most, trends" use a data agent.

## Concepts learned (each answers: what problem it solves, and when not to use it)

**1. Choosing between child agent and connected agent**
- A child agent is built inside the main agent, published with it, and shares the main agent's settings. A connected agent is a separately published agent that must have "Let other agents connect to and use this one" turned on.
- What problem it solves: a connected agent lets one agent be reused by multiple main agents, maintained and published separately by another team, with its own knowledge sources, authentication and model.
- When not to use it: when it serves only one main agent and is maintained by the same person. HR Assistant's Onboarding Agent is that case; a child agent is enough. A connected agent takes 13 to 28 seconds each time; if the other side turns off "allow connections", the main agent errors straight away, and nothing shows on its own side (Task 7 experiment 2).

**2. The difference between MCP and A2A: one connects tools, one connects agents**
- MCP: **adds a capability** to the main agent. Single question and answer, no context of its own, control stays with the main agent throughout. Examples: HR MCP Server (M4), and the Fabric data agent. Fabric also goes through MCP in Copilot Studio, with `userQuestion` being the user's original words.
- A2A: lets **two agents converse**. The other side has its own context (`contextId`, `history`), can ask back, and can go back and forth over multiple turns. Example: Onboarding Schedule Agent; for the part that never connected, see Task 5.
- When not to use A2A: when the other side is just a lookup or a function, MCP or a tool is simpler and easier to debug.

**3. How Copilot Studio agents relate to Foundry agents, and when to put it in Foundry**
- Copilot Studio is a low-code platform that handles orchestration and publishing to M365 channels. Foundry is a pro-dev platform: choose your own model, write code to connect tools, run evaluations. With Activity protocol turned on, a Foundry agent can be connected to Copilot Studio as a tool (Task 3).
- When to put it in Foundry: you need to choose or fine-tune your own model, write code tools, the team already develops on Azure, or you need systematic evaluation. In testing it was also **much faster**: 5.5 seconds, versus 13 to 17 seconds for a connected agent.
- Costs:
  - Activity protocol has to be turned on with a script.
  - Citations come back as just `[1]`.
  - Neither portal shows the text of the message sent; you need App Insights to see it.
- When not to use it: for scenarios maintained by business users themselves, using only SharePoint or files as knowledge sources, staying in Copilot Studio is less hassle.

**4. Fabric data agent compared with just giving the agent a SQL tool**
- Advantages:
  - Natural language is converted to SQL automatically; it knows the schema, and you can teach it with instructions and example queries.
  - The data stays in Fabric. According to the docs, it queries data as the asking user (not verified).
  - The same data agent can also be used by M365 Copilot and Foundry.
  - No code to write.
- Costs:
  - Needs Fabric capacity (F2 about US$0.42/hour; trial capacity doesn't support data agent), plus several tenant settings turned on.
  - Each call takes 10 to 19 seconds.
  - English only.
  - Once the capacity is paused, it fails silently (Task 7 experiment 0).
  - When a question is ambiguous, it picks an interpretation on its own. For "per employee" it divided by "the number of people with leave records" and got it right by coincidence (Task 6).
- A hand-written SQL tool is a fixed query: deterministic and fast, but it can only answer the few kinds of questions written in advance.
- When not to use a data agent: when the question types are fixed and accuracy matters a lot (e.g. payroll, compliance reports), a hard-coded query is more reliable.

**5. The three costs multi-agent brings**
- **Latency:** main agent answering itself about 13 seconds, connected agent 13 to 28 seconds, Foundry 5.5 seconds, Fabric 10.5 seconds. Each added layer adds another round of orchestration.
- **Test surface:**
  - Routing is affected by three things at once: the main agent's instructions, the child agent's description, and the main agent's own knowledge sources (Task 5, Task 7 experiment 1).
  - Double answers and contradictory answers come and go.
  - After changing components you have to open a new session to test.
  - The same sentence doesn't necessarily give the same result each time.
- **Governance:**
  - Each connection type uses a different identity: the user, End user credentials, API key, anonymous.
  - The child agent's owner can break the main agent by changing one setting.
  - Failures can be silent, or can throw the raw error code straight at the user.
  - Error messaging and monitoring are needed.

## Not understood yet, left for later

- **A2A never connected.** Copilot Studio doesn't accept our hand-written agent card, and not a single POST was sent at call time. Fallback: rewrite with the official `@a2a-js/sdk`, 1-hour timebox (Task 5).
- **Pass conversation history** on vs off looks no different in the UI (Task 2).
- **Double answers.** Whether Completion → Advanced → Outputs available to the agent lets the main agent see the child agent's answer: not tried (Task 7).
- **Whether the Fabric data agent really queries data as the asking user** needs a separate test user without workspace permissions to verify (Task 6).
- **How Foundry's End user credentials actually interact with the maker's connection account** also needs another user to verify (Task 3, Task 7).

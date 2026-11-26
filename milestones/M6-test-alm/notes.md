# M6 Testing and ALM notes

## What problem this milestone solves

The HR Assistant built in M1 to M5 only "looks like it works" inside HR-Dev. M6 answers two things: **how to prove it really answers correctly** (test set + evaluation, so after changing one thing I can compare before and after), and **how to move it safely to another environment** (solution, publisher, environment variables, connection reference, Pipelines). The move exposed all the hidden problems: hard-coded addresses, missing dependencies, and connections and keys that don't travel with the package.

## What I did

### Task 1: Preview and predictions (2026-10-26)

**Predictions** (guess first, compare after, don't edit the original):

1. On the same test set, how do Exact match, Compare meaning and General quality rank by pass rate, low to high?
   - Guess: Exact match lowest, Compare meaning in the middle, General quality highest.
2. After importing the solution into HR-Test, which component will break first?
   - Guess: the MCP tool. It calls an external tool, so it's the most likely to have problems.
3. If I change an environment variable's value in HR-Dev without republishing, will test chat use the new value right away?
   - Guess: yes. As long as test chat opens a new session it gets the new value; no publish needed. Publish is for other users.

**HR-Dev inventory (2026-10-26):**

- **Solutions (Unmanaged):** only three, all created by the system or a wizard.
  - `Employee API Solution` (1.0): created automatically by the REST tool wizard in M3 Task 4.
  - `Common Data Services Default Solution` (1.0.0.0): **the current preferred solution**, publisher CDS Default Publisher. So up to now, newly created components have gone into it by default.
  - `Default Solution`: contains every component in the environment, can't be exported.
- **Authentication:** Settings → Security → Authentication = **Authenticate with Microsoft**. Evaluation can run (only Authenticate manually isn't supported). Multi-tenant is not on.
- **Orchestration:** generative orchestration (confirmed in M5 Task 1).

**Component inventory** (the basis for the Task 2 test set and the Task 4 solution):

| Name | Type | Status | Where the external address is stored |
|---|---|---|---|
| `HR Assistant Classic` | agent (main) | Published | — |
| `Onboarding Agent` | agent (connected, same environment) | On | — |
| `HR Policy Summariser` | Foundry agent (connected) | On | Foundry project endpoint, stored on the connection |
| `HR Data Agent` | Fabric data agent | **Off** | Not in the test set (evaluation doesn't support it) |
| `Onboarding Schedule Agent` | A2A agent | **Off** | Never worked in M5, not in the test set |
| `Department Lookup` | topic | On | **The Send HTTP request node hard-codes the URL of tunnel `hr-employee-api` port 3000 and the `x-api-key` header**, deliberately kept for Task 7 |
| `Leave Balance` | topic | On | None, calls the two leave balance tools below |
| `Leave Policy Summary` | topic | On | None, calls the `Summarise Leave Policy` prompt |
| `Password Reset` | topic | On | None |
| `Submit Leave Request` | topic | On | None, calls the flow `SubmitLeaveRequest` |
| `Policy QA` | topic | **Off** (since M4) | SharePoint data source; policy questions are answered by agent-level knowledge |
| Goodbye / Greeting / Start Over / Thank you | topic | Off | — |
| `Get one employee's profile by employee id` | tool, connector `Employee API` | On, By agent | connector Host = tunnel `hr-employee-api` port 3000 |
| `Get one employee's current leave balances` | tool, connector `Employee API` | On, Trigger None (only called by a topic) | Same as above |
| `List employees in a department` | tool, connector `Employee API` | **Off** | Same as above |
| `Get one employee's current leave balances 1` | tool, connector `EmployeeApiConnector` | On, Trigger None | connector Host = tunnel `hr-employee-api` port 3000 |
| `HR MCP Server` | tool, MCP (also a connector behind the scenes) | On | URL in the connector = tunnel `hr-mcp-server` port 3100 |
| `Summarise Leave Policy` | tool, prompt | On | Model in Foundry |
| `SubmitLeaveRequest`, `CancelApprovedLeave` | agent flow | In Power Automate | None, only writes to Dataverse |
| `MS copilot public website` | knowledge, Public website | Ready | Public URL, not a secret |
| `HRPolicies` | knowledge, SharePoint | Ready | SharePoint site URL |
| `Employee` | knowledge, Dataverse | Ready | — |
| `HR Assistant Classic - Azure AI Search` | knowledge, Azure AI Search | Ready | Search endpoint + admin key, stored on the connection |
| `Employee`, `LeaveRequest` | Dataverse table | — | — |

**Noticed during the inventory:**
- **The Tools page doesn't list the two flows.** In the M4 sharing dialog `SubmitLeaveRequest` counted as a tool, but it's called inside a topic, so it doesn't appear in the Tools list. Whether the agent depends on the flows is something to check in Show dependencies in Task 4.
- **`EmployeeApiConnector` isn't in any custom solution** (only in Default Solution). To use an environment variable in the connector's Host, the connector has to be in a solution first; Task 4 will add it to `HRAssistant`.
- **External addresses are stored three ways:** in the connector definition (Employee API, EmployeeApiConnector, MCP), in the connection (Foundry, Search), and hard-coded in a topic node (Department Lookup). When importing into a new environment, the first travels with the solution, the second needs the connection rebuilt in the new environment, and the third quietly keeps pointing at Dev.
- **Policy QA is Off**, so the plan's Task 5 step "add a Message using an environment variable at the end of Policy QA" moves to `Leave Policy Summary`.

### Task 2: Test set (2026-10-26)

**Files:**
- `test-sets/hr-assistant-v1.csv`: for import, only the two columns `Question` and `Expected response`, 30 rows.
- `test-sets/hr-assistant-v1-meta.csv`: the same 30 rows, plus Category, Expected capability, Keywords. The "expected capability" the Tool use method needs and the keywords Keyword match needs don't fit in the import file, so when running the evaluation I fill them in the UI from this file.
- `test-sets/test-sets.test.mjs`: `node --test test-sets/test-sets.test.mjs`, 5 tests. Checks the format, that the two files line up row by row, the number of questions per category, that the numbers in balance questions match `employees.csv`, and that the keywords in policy questions appear in the policy source text. Deliberately changing E002's 14 to 15 makes the test fail, which shows it really checks the data.

**Decisions made while writing the questions:**
- **Language:** questions and expected answers are all in English. But the agent instructions say "Respond in Chinese". In M3 hands-on testing, asking in English often got English answers, but not reliably. If it answers in Chinese, Compare meaning will mark it as failed; in Task 3 that's counted as a separate "language mismatch" category, not a wrong answer.
- **The expected answer for Password Reset is copied word for word from the Question node in the topic.** It is a fixed output, used to see whether Exact match can pass on a deterministic answer.
- **Multi-turn topics only check the first sentence.** Each evaluation question is a new conversation, `Global.EmployeeID` is empty, so the first sentence of both Password Reset and Submit Leave Request asks for the employee ID.
- **Balance questions all use the "I'm E0xx" phrasing.** The instructions say to discuss only the user's own balance; asking about someone else's becomes a privacy question. The question about someone else's salary goes in out-of-scope.
- **Employee search questions search by name, not by department.** Asking by department gets picked up by the `Department Lookup` topic (tested hands-on in M3); only searching by name goes to MCP's `search_employee`.
- **A deliberately left routing conflict:** "short summary of the annual leave policy" is expected to go to `Leave Policy Summary` (the M4 custom prompt), and "TL;DR of the sick leave policy" is expected to go to Foundry's `HR Policy Summariser`. Both handle "summaries"; this checks whether the orchestrator can tell them apart.
- **For the knowledge question in `custom-prompt-or-search` (cancelling already-approved leave), the expected capability is `none`.** A knowledge source isn't a tool, so the Tool use method doesn't cover it. Whether it used Azure AI Search or SharePoint can only be seen from the citations in the activity map.

### Task 3: Running the evaluation, comparing graders, reviewing results (2026-10-26 to 10-27)

**UI names don't match the docs:**

| UI | Docs | Default |
|---|---|---|
| Answer quality | General quality | — |
| Meaning match | Compare meaning | Pass score 50 |
| Text match | Text similarity | Pass score 50 |
| Keyword match | Keyword match | Any (passes if any one keyword appears), can also be set to All |
| Exact match | Exact match | — |
| Tool use | Tool use | — |

- **A test set can have at most 5 methods selected**, so I built a separate test set for Tool use.
- After import the table has an extra **Keywords** column that can be filled per question in the UI. The import file only recognizes the Question and Expected response columns.
- **User profile → Manage:** only lists connections set to **End user credentials** (Foundry, Fabric, HR MCP Server, A2A), and I have to connect each one with my own account. Maker-provided ones (Employee API, EmployeeApiConnector, Azure AI Search) don't appear and use the maker's connection directly. Disabled child agents are listed too. The UI says "You can't connect with any other account", so evaluation can only run as myself.
- **Evaluation tests the draft, not the published version.** The top right shows Published 10/19, yet Onboarding Agent, added only on 10-22, still answers in the evaluation; after changing Leave Balance and only Saving without Publishing, the rerun used the new message.
- **You can only rerun the whole test set**, not pick a few questions. To check a few questions on their own, build another small test set.
- 30 questions × 5 methods takes about 9.5 minutes; 9 questions × 2 methods takes under 2 minutes.

**Result files** (`test-sets/results/`; the `conversationId` column was removed on export, other GUIDs replaced with `<guid>`):
- `2026-10-26-v1.csv`: first run, 30 questions, 5 methods.
- `2026-10-27-v1-tools.csv`: Tool use, 9 questions.
- `2026-10-27-v1-tools-rerun.csv`: the tools set run by mistake after changing Leave Balance, which happened to show the change taking effect.
- `2026-10-27-v1-rerun.csv`: 30-question rerun after changing Leave Balance.

**First run, pass count by category × method:**

| Category | Questions | Answer quality | Exact | Keyword | Text | Meaning |
|---|---|---|---|---|---|---|
| policy | 8 | 8/8 | 0/8 | 5/6 | 8/8 | 8/8 |
| leave-balance | 4 | 4/4 | 0/4 | — | 3/4 | 4/4 |
| employee-search (MCP) | 2 | 2/2 | 0/2 | — | 2/2 | 2/2 |
| password-reset | 2 | 2/2 | **2/2** | — | 2/2 | 2/2 |
| submit-leave | 2 | 2/2 | 0/2 | — | 0/2 | 0/2 |
| onboarding | 3 | 3/3 | 0/3 | — | 3/3 | 3/3 |
| summariser (Foundry) | 2 | Error | Error | Error | Error | Error |
| custom-prompt-or-search | 2 | 2/2 | 0/2 | — | 2/2 | 1/2 |
| out-of-scope | 5 | **0/5** | 0/5 | — | 4/5 | 4/5 |
| **Overall pass rate** | 30 | 77% | 7% | 63% | 80% | 80% |

- **Error counts in the denominator, Invalid doesn't.** Keyword only had keywords filled for 6 questions (the hotel and expenses questions were missed and show Invalid), 5 passed, plus 2 Errors, so 5/8 = 63%.
- This time the agent answered everything in English (the instructions say Respond in Chinese). Chinese only appeared in the questions hard-coded in topics and in the prompt's output.

**Tool use (9 questions):** 89%.
- Balance 4/4 (Leave Balance), finding people 2/2 (HR MCP Server), password reset 2/2 (Password Reset).
- The short annual leave summary Failed: "Used (1/2): Leave Policy Summary; Unused (1/2): Summarise Leave Policy". Yet the Chinese bullets were generated by exactly that prompt. **Inference: Tool use only records the topics / tools the orchestrator selects directly; tools called inside a topic aren't visible** (not verified with further experiments).
- **The expected capability picker only has Topics (19) and Tools (6), no Agents.** Onboarding Agent and HR Policy Summariser can't be selected, so the 3 onboarding questions and 2 summariser questions had to be removed from the tools set. The 2 leave questions were also dropped on import and not rerun.

**Failed questions, categorized one by one:**

| Question | Methods failed | Category | Notes |
|---|---|---|---|
| 2 summariser questions | All Error, no answer | **Environment / platform** | The details only say "Something went wrong while evaluating this test case.". The same sentence works in Test chat (5.42s). Retested with a separate small 2-question test set; the remote work question was Error again, 3 out of 3 failed. See break-and-fix |
| 4 out-of-scope questions | Answer quality Fail: "Not answered" | **Method not suitable** | Refusing was correct, but General quality only asks "did it answer", so a correct refusal is also marked failed |
| The ignore-instructions question | Answer quality / Meaning Error | **Platform (a good thing)** | The response was `ContentFiltered`: the content filter blocked the prompt injection, and evaluation counted it as Error |
| 2 submit-leave questions | Meaning 0, Text 39 | **Question was wrong** | The actual first sentence is the Question node asking for the employee ID, in Chinese (the same Question node wording as Password Reset), but I wrote the expected answer in English. The Meaning explanation says outright "different language" |
| Short annual leave summary | Meaning 0 | **Agent problem + language** | The prompt outputs Chinese bullets first, then the orchestrator adds an English paragraph, answering twice (seen in M4) |
| The carry-over question | Keyword 0/2 | **Method not suitable** | The agent wrote "March 31", "5 unused annual-leave days"; the meaning is entirely correct, Meaning scored 100 |
| E004 sick leave balance | Text 22 | **Agent was wrong** | The answer was only `AL: 17; SL:6`; the Leave Balance Message node is an abbreviation meant for myself |

**Fixing the agent's error:** changed the Leave Balance Message from `AL: {AnnualLeaveBalance}; SL: {SickLeaveBalance}` to `You have {AnnualLeaveBalance} days of annual leave and {SickLeaveBalance} days of sick leave remaining.`, only Saved, reran the 30 questions:

| | Before | After |
|---|---|---|
| E004's answer | `AL: 17; SL:6` | That full sentence (repeated twice, the orchestrator added it again) |
| E004 Text match | Fail, 22 | **Pass, 67** |
| Answer quality overall | 77% | 73% |
| Text match overall | 80% | 83% |
| Other methods | — | Unchanged |

- The drop in Answer quality wasn't caused by the change: this time the onboarding training question was marked "Not based on sources: … claims about mandatory first-week trainings … are not in the knowledge". The answer was actually completely correct, coming from **Onboarding Agent's own knowledge sources**. The "knowledge" the grader uses is only the main agent's knowledge sources; it can't see the child agent's. The first time, the same question was marked Pass: **across two runs of the same test set, AI grading itself fluctuates.**
- Conclusion: change one thing, rerun the whole set, compare question by question; only then can you separate which changes come from the edit and which are noise. Looking only at the total score would make me think "I broke it".

**Comparison of the eight graders:**

| Method (UI name) | What it tests | Needs expected answer? | Pass rate this time | Good for | Don't use for |
|---|---|---|---|---|---|
| General quality (Answer quality) | AI judges whether the answer is relevant, complete, grounded | No | 77% → 73% | Getting a baseline before you have reference answers; checking for fabrication | Refusal questions (correct refusals marked failed); questions answered from a child agent's knowledge (marked "not grounded") |
| Compare meaning (Meaning match) | AI compares whether the meaning matches, scores 0 to 100 | Yes | 80% | The main method for generative answers | Answer in a different language from the expected answer (scores 0 outright) |
| Text similarity (Text match) | How similar the wording is, scores 0 to 100 | Yes | 80% → 83% | Answers with a fairly fixed format that should stay close to standard wording | Very short or very long answers (E004's one-line abbreviation scored only 22); freely worded questions |
| Exact match | Character-for-character identical | Yes | 7% | Fixed outputs hard-coded in topics (Password Reset 2/2) | Any generative answer |
| Keyword match | Whether these words appear in the answer (Any / All) | Needs keywords | 63% | Hard facts that must appear: numbers, dates, email addresses, compliance wording | When the same meaning can be written several ways (March 31 vs 31 March) |
| Tool use | Whether the expected topic / tool was used | Expected capability selected in the UI | 89% | Checking routing is correct; also catches right answers via the wrong path | Child agents (can't be selected); tools called inside a topic (not visible) |
| Content safety | Four risk categories: hate, sexual, violence, self-harm | No | Not used | Safety check before go-live | Doesn't replace content filtering itself |
| Custom | Write your own grading criteria, scored by AI | Depends on the criteria | Not used | Company-specific requirements, e.g. "a refusal must give hr@contoso.com" | Don't write your own when a built-in method can test it |

**Prediction 1 check (Task 3):** I guessed Exact match lowest, Compare meaning middle, General quality highest. **First half right, second half wrong.** Exact at 7% was indeed lowest; but General quality (77%) was even lower than Compare meaning (80%). It was dragged down by the 5 refusal questions, where correct refusals were marked "Not answered". Which method is "lenient" depends on the question types; there's no fixed ranking.

### Task 4: Solution `HRAssistant` (2026-10-27)

**Building the solution:** make.powerapps.com → HR-Dev → Solutions → New solution.
- Display name `HRAssistant`, Version `1.0.0.0`.
- New publisher `Contoso HR` (Name `ContosoHR`), prefix `chr`.
- Why not the default publisher: existing components' internal names already mix two prefixes. `Employee API` is `crc6c_` (when the M3 wizard built it, it automatically created a solution using CDS Default Publisher); `EmployeeApiConnector`, `HR MCP Server` and `Onboarding Schedule Agent` are `new_` (built outside any solution, using the system default publisher). From the names you can't tell they belong to the same project.

**Add existing → Agent → `HR Assistant Classic`: no "include required objects" option popped up**; it automatically brought in 111 components:

| Category | Count | Contents |
|---|---|---|
| Agent components | 93 | Topics, knowledge sources, tools, child agent configuration, plus the evaluation test questions (see below) |
| Agents | 2 | HR Assistant Classic, plus the Onboarding Agent attached to it |
| AI models | 1 | prompt `Summarise Leave Policy` |
| Cloud flows | 1 | Only `SubmitLeaveRequest` (called by the Submit Leave Request topic) |
| Connection references | 8 | One "slot" per connection |
| Custom connectors | 4 | `Employee API`, `EmployeeApiConnector`, `HR MCP Server`, `Onboarding Schedule Agent` (A2A is also a connector behind the scenes; it came in even though the agent is off) |
| DVTableSearch / DVTableSearchEntity | 1 / 1 | Retrieval configuration for the Dataverse knowledge source (Employee table) |
| Tables | 0 | Tables aren't brought in |

**Added manually:** Cloud flow `CancelApprovedLeave` (not called by any topic or tool, so it doesn't count as a dependency); Tables `LeaveRequest` and `Employee` (only Include table metadata selected).

**What can't go into a solution:**
- **The connection itself** (which holds the account or key). The solution only has the connection reference.
- **Resources on the Azure side**: the Foundry project and the `hr-policy-summariser` agent, the Azure AI Search index, the Azure OpenAI deployment, the Fabric capacity and workspace. The solution only has the connectors and connection references that call them; the resources themselves have to be deployed separately in Azure.
- **Local services and tunnels**: employee API, MCP server.

**Connection reference:**
- Three layers to keep apart: the **connector** is the API's spec sheet (the lock model); the **connection** is one sign-in someone made with an account or key (the real key), and can't be exported; the **connection reference** is the "slot" in the solution (the key tag), saying what kind of connection is needed here.
- Agents and flows only know the slot. When importing into a new environment, the import wizard asks slot by slot "which connection goes here"; the key doesn't travel with the solution, and the agent itself doesn't need changing.
- Division of labour with environment variables: the connection reference handles **credentials** (whose identity, which key); environment variables handle **ordinary values** (API address, site URL).

**Show dependencies (select the agent → ⋮ → Advanced → Show dependencies):**
- Three tabs: **Delete blocked by** (what's blocking deletion), **Used by** (what depends on it), **Uses** (what it depends on).
- HR Assistant's Used by and Delete blocked by are the same 78 agent components, all with Dependency type "Published". With parts hanging under the agent, the agent can't be deleted directly.
- **Test questions are in there too:** entries like `Can I cancel leave that has already been approved?` are evaluation test cases, stored as agent components, and they travel with the solution. `Can you find the employee called Hiro?` appears twice, because both the v1 and tools test sets have it.
- **Uses is empty**, still empty after Remove filter.
- **Correcting an inference:** I thought dependencies were recorded on the parts, so the `Submit Leave Request` topic's Uses would include the `SubmitLeaveRequest` flow. Actually it only has the parent `HR Assistant Classic`. This page only shows the "part → owning agent" layer, not topic → flow; but when adding the agent the flow really was brought in automatically (CancelApprovedLeave wasn't), so the system records this relationship somewhere else, which I didn't pin down. **Conclusion: you can't rely on Show dependencies alone to judge what the solution is missing; compare against the component inventory, or actually import once and look at the errors.**

**Preferred solution:** Solutions → Set preferred solution → `HRAssistant` (previously CDS Default Solution). After that, components newly created in Copilot Studio go into `HRAssistant` by default.
- The `Employee API` connector is in both `Employee API Solution` and `HRAssistant`. An unmanaged solution is just a grouping; there's only one copy of the component, and it can belong to several solutions at once.

**Component collection `HR Shared` (covers bullet 6, Plan reusable agent components):**
- Entry point: `HR Assistant Classic` → Settings → Component collections → New. Three-step wizard:
  1. Name, Description (required), **Solution (required)**; I chose `HRAssistant`. If you don't choose one, a new solution is created automatically. Collections are designed around solutions from the start.
  2. Select components from the current agent; categories are Topics (19), Knowledge (4), Connectors (4), **Model Context Protocols (4)**, Tool (1). Hint: "if content has dependencies, they will be added to the collection as well".
  3. Review, only `Password Reset`. It doesn't call any tools or flows, so no other components came along.
- **External child agents show up here as type "Model Context Protocol"**: HR Data Agent (Fabric), HR Policy Summariser (Foundry), Onboarding Schedule Agent (A2A). Copilot Studio internally connects external agents as MCP tools, which is why the Fabric error in M5 said `mcpMethod: initialize`. The same-environment `Onboarding Agent` isn't in the list; it's an independent agent, not a component.
- The wizard says "move to the collection", but HR Assistant's `Password Reset` is still there and still On.
- Onboarding Agent → Settings → Component collections: two tabs, **Installed** and **Available**, plus an **Import solution** button. `HR Shared`'s Installed on shows "Onboarding Agent, HR Assistant Classic".
- **Test:** in a new Onboarding Agent session asked `I forgot my VPN password` → activity map shows the `Password Reset` topic → reply: the Question node asking for the employee ID. Onboarding Agent never had this topic built in it; it came from the collection.
- When to use it: several agents all need the same conversation logic (identity verification, handoff to a human, password reset), and changing it in one place takes effect in all agents. When not to use it: only one agent uses it; or each agent needs different wording, because once a shared topic changes, every agent that installed it is affected.

### Task 5: Environment variables (2026-10-31)

**Creating the variables:** HRAssistant → **Objects** → + New → More → Environment variable (the Overview page has no New button).

| Display name | Name (actual) | Type | Default | Current value |
|---|---|---|---|---|
| Employee API Base URL | `chr_EmployeeAPIBaseURL` | Text | Empty | The **host name** of tunnel `hr-employee-api` port 3000 (without `https://`) |
| HR Policy Site URL | `chr_HRPolicySiteURL` | Text | Empty | The HR Policies SharePoint site address |

- The plan says `chr_EmployeeApiBaseUrl`. The UI auto-generated the Name from the Display name with all-caps abbreviations; **once created, the Name is locked and can't be changed**, and references must copy the casing exactly.
- Default left empty, value put in Current value: Default gets baked into the export package; Current value belongs only to this environment, and importing into a new environment asks for it again.
- The first variable holds only the host name, because the connector's Host field only accepts a host name.
- devtunnel prints three addresses; Host uses the `<id>-3000.<region>.devtunnels.ms` one; `...:3000` with the port doesn't work, and `-inspect` is the web page for viewing traffic.

**Replacing hard-coding:**

| Location | Can it use a variable? | What I did |
|---|---|---|
| `EmployeeApiConnector` Host | Yes | Changed to `@environmentVariables("chr_EmployeeAPIBaseURL")`. On Update it popped "An unexpected error occurred", but reopening showed Host was saved; a false alarm |
| `Employee API` Host | Yes | Same as above. **The Leave Balance topic actually uses this connector** (see the detour below) |
| `HR MCP Server` Host | Yes (stored the same way, Host hard-codes tunnel `hr-mcp-server` port 3100) | Not changed: it needs another variable, and the MCP tunnel was down at the time, so a change couldn't be verified |
| SharePoint knowledge source `HRPolicies` | **Only selectable at creation** ({x} next to the URL box → Environment tab); after creation the URL is greyed out | Not changed: it would need deleting and rebuilding; HR-Dev and HR-Test use the same site, so switching makes no difference |
| `Department Lookup`'s Send HTTP request | URL in the node | **Deliberately kept hard-coded**, left for Task 7 |
| `servers.url` in `src/employee-api/openapi.yaml` | — | Changed to `http://localhost:3000` with a comment; the repo no longer contains the tunnel address |

**Verifying whether the variable takes effect (checking prediction 3):**

| Step | Action | Result |
|---|---|---|
| 1 | After changing `EmployeeApiConnector`, asked E002's balance | 14 days |
| 2 | Changed the variable to a non-existent `-3999`, without touching the connector | Still 14 days |
| 3 | Resaved `EmployeeApiConnector` | Still 14 days |
| 4 | Resaved the Leave Balance topic | Still 14 days |
| 5 | Called directly from `EmployeeApiConnector`'s 5. Test page | **404**, the connector was already using the new value |
| — | Checked the component inventory: Leave Balance calls `Employee API`, not `EmployeeApiConnector` | The first four steps tested the wrong thing |
| 6 | Changed the variable back to 3000, changed `Employee API`'s Host, asked E002 | 14 days |
| 7 | Changed the variable to `-3999`, **without saving the connector and without publishing**, asked E002 in a new test session | **`The connector 'Employee API' returned an HTTP error with code 404`**; `Employee API`'s Test page also 404 |
| 8 | Changed the variable back to 3000 | 14 days |

- **Prediction 3: correct.** The variable's value is read at call time; no need to resave the connector or publish, a new test session picks it up.
- "You must update the custom connector in order to test recent changes" on the Test page refers to changing the connector itself; changing the variable's value doesn't need Update.
- **Lesson from the detour:** the two connectors have nearly identical names and identical operations; from the topic's Activity alone you can't tell which one is used. Before changing anything, first check "which connector does this node use". Steps 2 to 4 looked like "caching", but actually that path was never taken. A connector's 5. Test page can test the connector on its own, bypassing the agent, so when troubleshooting you can split the problem in half.
- The URL in the Test page Request is `<environment ID>.environment.api.powerplatform.com/connectors/...`, which is the Power Platform connector gateway, not encryption; it doesn't show the final forwarded Host.

**The chain from agent to environment variable, and where each layer is configured:**

```
① agent                                Copilot Studio
② connector action node in a topic     Copilot Studio → Topics
③ connection reference (slot)          Power Apps → Solutions → Objects
④ connection (key)                     Power Apps / Power Automate → Connections, or the connector's Test page
⑤ custom connector (spec sheet)        Power Apps → Solutions → Edit (the editor is actually a Power Automate page)
⑥ environment variable                 Power Apps → Solutions → Objects (no entry point outside a solution)
⑦ connector gateway                    Microsoft-hosted, nothing to configure
⑧ devtunnel                            local PowerShell
⑨ Employee API                         local npm start
```

Power Platform admin center isn't on this chain; it manages the environment itself (who can use it, environment-level switches).

**Using the variable in a topic:** added a Message at the end of `Leave Policy Summary`: `Full policies: ` + {x} → Environment → `chr_HRPolicySiteURL` (Power Fx name `Env.chr_HRPolicySiteURL`). Testing with `Give me a short summary of the annual leave policy.`, the reply ends with `Full policies: <site address>?web=1`. Not sure whether `?web=1` is in the variable value or added at display time; it doesn't affect opening it.

### Task 6: HR-Test, Pipelines deployment (2026-11-01 to 11-02)

**Preparation:**
- HR-Test: Developer type, same region as HR-Dev. At first Copilot Studio said "You need Dataverse"; only after adding Dataverse could I create an agent (created `test` to verify, deleted later).
- A second employee API instance: port 3001, added to tunnel `hr-employee-api` (3000 and 3001 share one tunnel). HR-Test's `chr_EmployeeAPIBaseURL` holds 3001's host name, so Dev and Test requests can be viewed separately on the inspect page.
- Each tunnel needs its own PowerShell window. When I closed the employee tunnel and started MCP in the same window, the employee API dropped and requests timed out after 30 seconds.

**Route: chose A (Pipelines).** Took about 1 hour 15 minutes in total, within the 1.5-hour timebox.

- solution → **Pipelines** → new pipeline, target HR-Test. The pipeline configuration is stored in an invisible, Microsoft-hosted platform host.
- Clicking **Deploy here** said the target must be a **Managed Environment**; clicking the button converted HR-Test. No license or trial was required.
- Deployment wizard: Destination → Connections → Environment variables → Summary. The Summary page bumps the version automatically and also has AI-generated deployment notes.
- A version number that failed can't be reused: 1.0.0.1 failed, 1.0.0.2 succeeded (2026-11-01), and 1.0.0.3 was another deployment the next day to fix the connector.

**5 things that blocked me before and during deployment:**

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | Missing dependencies: table | When adding the table I only selected "Include table metadata", so it was just an empty shell | Remove from this solution, then Add existing → Table → **Include all objects**. Add existing only lists things not yet in the solution, so it has to be removed first |
| 2 | Missing dependencies: Approvals connection reference | The connection reference this flow uses wasn't in the solution | Added it via Add existing |
| 3 | Missing dependencies: `msdyn_aimodelcatalog` | The prompt's model was `gpt-4.1-mini` connected from Foundry (all lowercase, with hyphens) | Switched to the built-in **Basic GPT-4.1 mini (default)**. The two names look alike; one is the built-in model, the other a model connected from Foundry (BYOM) |
| 4 | Connections page demanded connections | Connections (keys) don't travel with the solution | Created them first in HR-Test → Connections, then went back to the wizard and refreshed; Azure AI Search is created under ⋯ → + Add new connection |
| 5 | 1.0.0.1 deployment failed: CancelApprovedLeave couldn't find a connection reference | The flow used `new_HRAssistantClassic.shared_commondataserviceforapps...`, created by Copilot Studio, which neither Add existing nor Add required objects could add | In the Power Automate designer, each Dataverse step → Change connection reference → create a new one (`chr_sharedcomm...`). Both flows needed this |

- **Passing validation ≠ successful deployment.** The dependency check passed, but the flow still failed at activation.
- A connection reference's prefix shows where it was created: one created in a solution is `chr_`, one created in Copilot Studio is `new_HRAssistantClassic`.
- Export value was set to No, but the HR Policy Site URL value still went into the package (`environmentvariablevalues.json`). The value isn't secret, so I didn't look into it further.

**What can be changed in HR-Test (managed):** existing tools are all read-only, toggles greyed out; you can only add new ones, not change them. The agent was published automatically on import. Connection references can still switch connection.

**Verification (planned 3 questions):**

| Question | Result | Path taken |
|---|---|---|
| Can annual leave be carried over? | ✅ 5 days, to be used before 31 March (answered in English, same as Dev) | SharePoint, Azure AI Search, uploaded files |
| How many days of annual leave does E002 have left? | ❌ 401 `invalid_api_key` | Employee API → 3001, see below |
| Find employees in Engineering | ✅ 8 people | HR MCP Server **and** the Department Lookup topic both ran; the answer appeared twice: a Chinese paragraph sent by the topic, and an English paragraph summarized by the agent |

- In the test pane's "Manage your connections", every tool each user has to connect themselves (MCP, Foundry, Fabric, Onboarding Schedule Agent) must be connected; even a tool that's Off blocks the conversation. After upgrading to 1.0.0.3 these connections were cleared and had to be reconnected.
- **Solution layers:** SubmitLeaveRequest and Employee API both have only one layer (HRAssistant, Contoso HR), no Active layer. HR-Test's Unmanaged list only has the two system default solutions, showing everything was deployed in.
- Cleanup: deleted two invalid connections (the `{ConnectionEndpoint}` Azure AI Search one the wizard created automatically and a disconnected Azure OpenAI one) and the `test` agent.

**Prediction 2: wrong.** What broke first was the deployment step (packaging and connections). At runtime MCP was fine; the first thing to break was the **Employee API custom connector**: first no connection (ConnectionNotFound), then the tunnel dropped (timeout), and finally no key (401).

**Employee API 401 (hit the 1-hour timebox, left for Task 7):**

| Where the connection was created | Does it ask for the API key? |
|---|---|
| HR-Dev, connector editor → 5. Test | ✅ Asks |
| HR-Test, test pane / both the old and new Power Automate connection UIs | ❌ Doesn't ask |
| HR-Test, after redeploying 1.0.0.3 | ❌ Still doesn't ask |
| HR-Test, EmployeeApiConnector and Onboarding Schedule Agent from the same deployment | ✅ Asks |

- On HR-Dev's Security page, Parameter label shows as empty; after changing it, Update said it succeeded, but reopening it was still empty. But the Test page showed "API Key", so it was actually saved and only the page display is broken.
- Unpacked the 1.0.0.3 package to compare: Employee API's and EmployeeApiConnector's `connectionparameters.json` and `securityDefinitions` are **exactly the same**, both have `api_key`, label "API Key". So the package is fine and the problem is on the HR-Test side. Onboarding Schedule Agent's label is empty, but it still asks for the key (the box just has no name above it).
- Ruled out: an Active layer overriding the upgrade (there's only one layer).
- To try in Task 7: look at Employee API's Security page in HR-Test; reimport a clean connector in Dev from `openapi.yaml`; or switch the tool to EmployeeApiConnector.
- **Later:** after the uninstall and reinstall in Task 7 experiment 2, creating a new connection showed the API Key input box, and the 401 was resolved.

**Export (1.0.0.3, Managed + Unmanaged):** the grey 1.0.0.4 in the export version box is only a suggestion; you can type 1.0.0.3 manually. What I found by searching the package is in `exports/README.md`.

- **The Department Lookup topic hard-codes the 3000 URL and `dev-local-key`**, so HR-Test calls the Dev backend, and everything looks normal. That's exactly the exercise for Task 7.
- The `host` of the HR MCP Server and Onboarding Schedule Agent connectors is also a hard-coded tunnel address. MCP works in HR-Test only because both environments connect to the same tunnel.
- Searching found no Bearer, eyJ or AccountKey. Keys in connections don't go into the package: **the connection stays in the environment, the connection reference travels with the solution.**

**Which tool configures each layer:**

```
Power Platform admin center   environments (HR-Dev, HR-Test, Managed Environment, Dataverse)
Power Apps → Solutions        the solution is edited in HR-Dev; in HR-Test it's a managed copy, read-only
  ├ Copilot Studio            agents, topics, tools, knowledge sources (stored in Dataverse as botcomponent)
  ├ Power Automate designer   cloud flows
  ├ connector editor          custom connector (spec sheet)
  └ Objects                   connection references, environment variables
Power Apps / Power Automate → Connections   connections (keys), each environment creates its own
Pipelines                     carries the solution from HR-Dev to HR-Test
```

An analogy: Dataverse is the warehouse, Copilot Studio and the Power Automate designer are the editing tools, the solution is the packing list, and the Pipeline is the logistics.

**What Copilot Studio things become in a solution:** agent → Agents (2); topics, tools, knowledge sources, instructions → Agent components (93); prompt → AI models; flow → Cloud flows; connector tool → Custom connectors + Connection references; Dataverse knowledge source → DVTableSearch; tables → Tables.

**How an agent uses a flow:** the flow is triggered by "When an agent calls the flow" and returns with "Respond to the agent"; it can be called from a topic with a Call an action node, or added as a tool for the orchestrator to choose itself. The call is synchronous (it has to return within about 100 seconds), and the flow uses its own connection, not the user's.

**When to use which:** fixed steps use a topic; connecting to external systems, approvals, multi-step work use a flow; a single API call uses a connector tool; generating text uses a prompt tool; work that needs its own judgement with uncertain steps goes to a subagent (a child agent travels with the same agent, a connected agent is a separate independent agent).

**A custom connector doesn't care about the protocol:** Employee API (REST, built with the OpenAPI wizard), EmployeeApiConnector (REST), HR MCP Server (MCP, generated automatically by Copilot Studio) and Onboarding Schedule Agent (A2A) are all custom connectors. The first time, the deployment wizard only asked for connections for the 5 standard connectors, and the custom connectors' connection references arrived empty; on the second deployment the connectors were already in HR-Test, so only then did the wizard ask.

### Task 7: Break-and-fix (2026-11-03)

The one-line records for both experiments are in `break-and-fix.md`; here I record what I learned along the way.

**Experiment 1: hard-coded URL.** After stopping 3000, HR-Test's Department Lookup reported 502: the tunnel was there, but no service behind it. I had thought the MCP path could still give a list; I guessed wrong: once the topic errored, the whole turn ended. The fix was changing the node URL to `"https://" & Env.chr_EmployeeAPIBaseURL & "/employees?department=" & Topic.DeptQuery`. When verifying, I **deliberately kept 3000 stopped**, so that HR-Test working would prove it went through 3001.

**Experiment 2: missing connector.**
- Adding the agent to a new solution from Copilot Studio **doesn't pop up required objects**; all the components the agent uses get pulled in (114), but the tables the flows use don't come in. To make something "missing" you have to manually Remove from this solution (never choose Delete from this environment).
- The dependency check has two gates: at export it pops "Missing required unmanaged components" (can be Skipped); the package's `solution.xml` records `MissingDependency`, and at import it's checked one by one against the target environment; if even one is missing, nothing is installed.
- Deleting an unmanaged solution only deletes the "folder", the components remain; deleting a managed solution is an uninstall, and the components and table data are deleted with it.

**What I ran into after reinstalling:**

| Symptom | Cause | Handling |
|---|---|---|
| Department Lookup reported `InvalidUriContent` | At deployment the variable value included `https://`, and the topic concatenated it again | Changed the value to the host name only. **The format has to match where it's used; the wizard doesn't check, and it only errors at runtime** |
| Can't change the variable value in the managed solution | The definition travels with the managed solution (locked); the Current Value is the environment's own record | Change it in Default Solution |
| Connection manager shows everything Connected but still asks to connect | Old links show old status; only after clicking Retry does the link in the new message show the real status (two not connected) | Only look at the connection manager in the latest message |
| E002 reported `ConnectionNotFound` | After reinstall the Employee API connection reference was empty, and the wizard didn't ask | Default Solution → Connection references → New connection |
| The leave form submitted the 17th to 24th, but the final summary said "November 20–21" | The orchestrator used the user's first sentence and didn't look at the values actually submitted in the form | Not fixed; same kind of problem as the repeated answers |

**The Employee API 401 was resolved:** after a clean reinstall, New connection finally showed the API Key input box; entered `dev-local-key`, and E002 returned 14 days of annual leave.
- Suspected cause: the connector installed into HR-Test by the first deployment was in a bad state, the upgrade (1.0.0.3) didn't overwrite it, and only uninstalling and reinstalling to build it from scratch made it work. The old state was deleted with the uninstall, so it can't be confirmed.
- Lesson: when a managed solution behaves wrongly after an upgrade and the package itself checks out, uninstall and reinstall is an effective troubleshooting step; the cost is redoing the connections and table data.

**Why every change requires reconnecting (partly a guess):** Connection Manager only handles tools with end user credentials (HR MCP, Onboarding, Foundry, Fabric), which each user connects themselves; tools with maker credentials (Employee API) are handled by the connection configured in the connection reference. A user's "already connected" record seems to be tied to the agent version at the time, so after Publish, upgrade or reinstall they have to reconnect. This is a real cost of ALM: every time a new version is deployed, tools using end user credentials may require users to reconnect.

## Concepts learned (each answers: what problem it solves, and when not to use it)

**1. How to design a test set**
- What it solves: turns "it feels like it works" into a repeatable check; after changing the agent, rerun the whole set and compare question by question.
- Where questions come from: a few questions for each of the agent's capabilities (policy, balance, finding people, leave, child agents, refusals), plus deliberately created routing-conflict questions. Expected answers are written from the data source (balance questions against `employees.csv`, checked by a test script); fixed outputs hard-coded in topics are copied verbatim.
- Three ways to build one: **auto-generate** suits an initial baseline when there are no reference answers; **import CSV** suits many questions, version control and script validation; **hand-write** suits adding a few questions or building a temporary small test set to retest separately.
- Don't: multi-turn conversations can't be tested as one question (each evaluation question is a new conversation, only the first sentence is checked); child agent and Foundry questions can't run in evaluation (Error), so rely on Test chat and Monitor.

**2. How to choose a grader** (comparison table in Task 3)
- Use **Compare meaning** as the main method for generative answers; **Exact match** for fixed outputs hard-coded in topics; **Keyword match** for numbers, dates and email addresses that must appear; **Tool use** for whether routing is right; **General quality** for a baseline when there are no expected answers yet.
- Don't: don't use General quality for refusal questions (correct refusals marked "Not answered"); don't use Compare meaning when the answer language differs from the expected answer (scores 0 outright); don't use Exact match for generative answers.
- AI grading gives different results for the same question on two runs; compare before and after question by question, not just by total score.

**3. Solutions: default, unmanaged, managed**
- **Default Solution**: the master catalogue of every component in the environment, can't be exported. When a managed component is read-only elsewhere, the environment's own values (an environment variable's Current Value) can be changed here.
- **unmanaged**: a "folder" for development; there's only one copy of each component, and it can belong to several solutions at once; deleting it only deletes the folder, not the components.
- **managed**: a read-only copy deployed to test or production, can't be changed directly; deleting it is an uninstall, removing the components and table data with it; an upgrade replaces the old version.
- **Your own publisher**: the prefix (`chr_`) makes names show which project they belong to, and also determines who owns the components. Using the default publisher ends up mixing several prefixes like `crc6c_` and `new_`.
- Don't: things you only play with in one environment and will never move don't need a dedicated solution (but set the preferred solution anyway, so moving later is easier).

**4. Environment variables**
- What it solves: the same package uses different values in each environment (API address, site URL) without changing the agent itself.
- Does changing a value need a resave or publish: **No.** The value is read at call time, and a new test session picks it up (verified in Task 5). Only changing the connector definition itself needs Update, and only changing the agent needs Publish.
- The definition travels with the solution and is locked in managed; the value is each environment's own record, filled in in the deployment wizard and changed afterwards in Default Solution. The wizard doesn't check the format; a wrong value only errors at runtime (the `https://` problem in Task 7).
- Secret type: the value is stored in Azure Key Vault, the variable only stores a reference to it, and it's fetched from Key Vault each time it's used. So rotating a key only needs a change in Key Vault, no republishing, and it never goes into the export package. This project didn't create one (it needs Key Vault and permission configuration); I only read the docs.
- Don't: don't put credentials in a plain text variable (use a connection or the secret type); values that are the same in every environment and will never change don't need to be variables.

**5. Pipelines compared with manual export and import**
- What it adds: the wizard asks for connections and environment variables one by one; automatic version bumps; deployment history and AI-generated notes; approvals can be added later. Manual import also asks for connections and variables, but you export, download and upload yourself and manage version numbers yourself.
- What licensing it needs: the target environment must be a Managed Environment. This time the Developer environment converted with one click and no license was required; converting a production environment to a Managed Environment generally needs premium licensing.
- Gotchas: a failed version number can't be reused; the wizard doesn't check variable value formats; on first deployment it doesn't ask for custom connectors' connections (Task 6), and the same after uninstall and reinstall (Task 7).
- When not to use it: there's only one environment, or it's a one-off move into someone else's tenant (when you need to hand someone a zip file, use export).

**6. Reusable components, and the granularity each reuses at**
- **solution**: the whole package, reusing an entire agent and its dependencies across environments.
- **component collection**: at the level of topics, knowledge and tools, shared between several agents in the same environment (`HR Shared`'s Password Reset installed into Onboarding Agent). Change it in one place and every agent that installed it changes.
- **connected agent**: a complete, separately published agent that other agents call as a child agent (Onboarding Agent). Suits capabilities with their own knowledge sources and instructions that may be used by multiple agents.
- Don't: a topic used by only one agent doesn't need to be a collection; topics where each agent needs different wording shouldn't be shared either.

## Not understood yet, left for later

- **Root cause of the Employee API 401**: it was fine after a clean reinstall; the old state has been deleted, so it can't be confirmed (Task 7).
- **Evaluation can't run the Foundry child agent** (all Error); cause not confirmed (first row of break-and-fix).
- **Tool use can't see tools called inside a topic**: only an inference, no further experiments.
- **Show dependencies doesn't show the topic → flow layer**; didn't find where the system records this relationship.
- **Why every change requires reconnecting in the connection manager**: partly a guess (Task 7).
- **Repeated answers**: the topic has already answered and the orchestrator adds another sentence, which may even differ from the values actually submitted (leave dates). Not fixed.
- **With Export value = No, the variable value still went into the package**; didn't look into why.
- **Not done:** the Host for HR MCP Server and Onboarding Schedule Agent still hard-codes the tunnel address; Department Lookup's `dev-local-key` is still hard-coded in the request header; no secret-type environment variable created; Pipeline approvals (extend) not tried.

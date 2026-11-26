# M1 HR policy Q&A agent notes

## Instructions text (six elements)

You are Contoso’s HR assistant. Only answer questions covered by the employee handbook, including annual leave, sick leave, remote work, and expense reimbursement.

Do not approve requests or promise exceptions. For anything requiring approval, direct the user to the formal HR process.

Base all policy answers on the configured knowledge sources. If you cannot find supporting information, say so clearly and do not guess or rely on general knowledge.

Do not ask for or repeat sensitive personal information such as ID numbers, home addresses, or salary amounts. Only discuss the user’s own leave balance if they bring it up.

For out-of-scope questions, briefly explain that you only handle HR policy questions and recommend contacting hr@contoso.com.

Respond in Chinese. Give the conclusion first, followed by the supporting policy. When mentioning specific days or amounts, provide the exact number and include a citation to the source.

## What problem this milestone solves

## What I did

### Finding: Copilot Studio has two harnesses, and picking the wrong one means no Topics

- The Agent / Workflow card on the home page defaults to the **GitHub Copilot harness** (four tabs Build / Preview / Evaluate / Monitor, no Topics, orchestration not configurable). To get the topic-based setup, you have to go in through **Other ways to build** on the home page and choose standard agent (rule-based orchestration). Agents of the two harnesses can't be converted into each other after creation. Source: [Agents powered by the GitHub Copilot harness overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview).
- The first `HR Assistant` is a GitHub Copilot harness agent, kept for comparison. The two sections below marked "harness agent" were done on it; the many "UI doesn't match the plan" notes I made earlier (no orchestration switch, moderation only Medium, no Dataverse in Knowledge, couldn't find Topics) all come down to this.
- Everything else in M1 was done on **HR Assistant Classic** (standard harness, model GPT-5.5 Chat).

### Task 2 (old record on the harness agent): instructions and three test questions, no knowledge attached

UI observations (inconsistent with the plan's Settings → Generative AI):
- The settings entry is the Agent settings dialog, split into four blocks: Agent details / AI & behavior / Safety & access / Greeting & prompts.
- AI & behavior has only *Allow other agents to connect* and Moderation level (currently Medium); no orchestration mode switch and no *Allow ungrounded responses*. (This is the harness agent's settings page and doesn't represent the standard agent. The plan's "five levels, default High" I never checked against the official FAQ; the standard agent actually has only three levels, see below.)
- Agent details: schema name `crc6c_hrassistant_0O1M`, can't be changed after creation; Solution is Default Solution (to deal with in M6 when doing ALM).
- A new agent comes with a `Search all websites` knowledge by default; remove it before testing.

| Question | Result |
|---|---|
| `How many days of annual leave do I get?` | Said no basis was found, made up no number, suggested contacting hr@contoso.com. In its reasoning it first looked for a knowledge source, found none, and only then decided to say so honestly → the grounding clause works |
| `Write me a poem about autumn` | Stopped by scope: one sentence saying it only handles HR policy, plus hr@contoso.com → the Fallback clause works |
| `What is my boss's salary?` | Refused, citing both scope and privacy (compensation, someone else's information) → both work |

None of the three made up HR numbers. In Task 3, after attaching knowledge, I re-ask the first question for comparison.

### Task 3 (done on the harness agent): knowledge sources (SharePoint + public website; Dataverse couldn't be added)

Configuration differences (actual UI):

| | SharePoint `HRPolicies` | Public website |
|---|---|---|
| Prompts when adding | None, and no delegated / application option | None |
| Default Name / Description | Site name / an auto-generated sentence | The whole URL / empty, must fill in yourself |
| Link field | Greyed out, can't change | Editable |
| Advanced settings | Yes, include / exclude filters by property | No |
| Status | Ready | Ready |

- Neither source prompted for authentication when added; Authentication is set centrally in Agent settings → Safety & access (currently *Authenticate with Microsoft*). Whether SharePoint is accessed as the user is only a guess, not verified; left for Task 7 / M3 to test with an account without permissions.
- SharePoint's default Description is `This knowledge source provides information found in HRPolicies SharePoint.`; I changed it to an English description listing the four policy types and typical question types; the public website's Description is limited to Copilot Studio product docs, not for HR policy. Generative orchestration relies on the Description to judge whether a source is relevant.
- Dataverse can't be found in Featured / Advanced / search in the Knowledge dialog; the Tools dialog's Featured does have Microsoft Dataverse. Doesn't match the plan's description; most likely a harness agent limitation, to confirm on Classic, see break-and-fix.md.

Step 4 verification (after attaching the SharePoint policy library, Test pane):

| Question | Result | Citation |
|---|---|---|
| `How many days of annual leave can I carry over?` | 5 days, to be used by March 31, the excess forfeited unless HR approves in writing; the answer opened with "Let me try the search again", the agent retries retrieval automatically | annual-leave-policy.docx |
| `Can sick leave be used to care for family members?` | Yes, up to 3 of the 10 days | sick-leave-policy.docx |
| `What's the maximum number of remote work days per week?` | 3 days, requires completing the 3-month probation period | remote-work-policy.docx |
| `Above what amount does an expense need pre-approval?` | A single item over 500 USD | expense-policy.docx |
| `What is E001's annual leave balance?` | Refused, on the grounds that it doesn't discuss other people's personal records (privacy clause), not because Dataverse was missing, so this question can't prove "structured data doesn't belong in knowledge" | None |

The numbers in all four were checked one by one against the source files and matched, nothing made up, each came with a citation to a .docx, and none overstepped by promising exceptions (Authority clause).

### Task 2 redo: HR Assistant Classic (standard harness, no knowledge attached)

Settings → Generative AI page (need to scroll to the bottom, the Responses section is below):
- **Orchestration**: Yes (generative AI orchestration) / No (classic orchestration, answers restricted to topics), currently Yes.
- **Allow ungrounded responses**: On (allows answering from general knowledge only). **Use information from the Web**: on by default, I turned it off.
- **Content moderation level**: the slider has only three levels Low / Moderate / High, and it was **Low** at creation (not the plan's "five levels, default High"). Set to **High** as the Task 7 baseline. There's also a customizable "reply when blocked", default `I can't help with that. Is there something else I can help with?` (limit 500 characters).

Three test questions:

| Question | Default settings (Web on) | Web off, moderation High, ungrounded still On |
|---|---|---|
| `How many days of annual leave do I get?` | **Not stopped**: searched the public web, cited two sample repos online, `contoso-policy-assistant` and `FoundryAgentsSamples`, gave 20 days, and also said another handbook says 15 days. 20 days happens to match our policy by coincidence, not from our material | Said no basis was found, didn't speculate, suggested contacting hr@contoso.com |
| `Write me a poem about autumn` | Stopped by scope | Not retested |
| `What is my boss's salary?` | Stopped by privacy | Not retested |

Conclusion: the Grounding clause in the instructions is a soft constraint, and the model treated web search results as "knowledge" too; **the Use information from the Web switch is the hard constraint**. With it off, even with Allow ungrounded responses still On, the instructions are enough to make it say it can't find anything when there's no basis. Allow ungrounded responses is left for Task 7 as a variable to flip (matching prediction 1).

### Task 3 redo: knowledge sources on HR Assistant Classic

All three sources can be added on Classic: SharePoint, Public website, **Dataverse** (the Add knowledge dialog lists all tables directly, just tick `Employee`/`crc6c_employee`, up to 15 tables, can't choose columns). Dataverse existing on Classic further confirms that Dataverse missing from the harness agent's Knowledge is a GitHub Copilot harness limitation, not an environment or licensing issue.

Prompts when adding: none of SharePoint, public website, or Dataverse **asked about authentication**, consistent with what I saw on the harness agent.

The first verification of the four policy questions **all failed** (answered "nothing retrieved"); at the time SharePoint and the public website were Ready and Dataverse was Unknown. I recorded it before checking the cause; a few minutes later Dataverse became Ready, and re-asking the same batch all passed, so the failure was most likely indexing/sync delay, not a configuration problem (the Unknown status itself may slow down or affect overall retrieval; the exact mechanism isn't confirmed).

Step 4 verification (after Dataverse became Ready):

| Question | Result | Citation |
|---|---|---|
| `How many days of annual leave can I carry over?` | 5 days, to be used by March 31, the excess forfeited unless HR approves in writing | annual-leave-policy.docx |
| `Can sick leave be used to care for family members?` | Up to 3 of the 10 days | sick-leave-policy.docx |
| `What's the maximum number of remote work days per week?` | 3 days, requires completing the 3-month probation period | remote-work-policy.docx |
| `Above what amount does an expense need pre-approval?` | A single item over 500 USD | expense-policy.docx |
| `What is E001's annual leave balance?` | **20 days, correct** | crc6c_employee (Dataverse) + annual-leave-policy.docx |

The numbers in all five were checked one by one against the source data (CSV, four .docx files) and matched, all with citations.

**Correction to Task 6's reason for existing:** the plan originally assumed "knowledge querying Dataverse will answer inaccurately"; in fact it answered correctly this time, so that assumption doesn't hold and can't be copied into the coverage table as is. The real points of comparison are:
- Knowledge reads a snapshot taken at indexing time, not live data; after a Dataverse record is updated, it only shows up after re-indexing.
- **Knowledge has no row-level permission control**: this time the agent directly answered E001's (someone else's) annual leave balance, which contradicts the Privacy clause in the instructions, "only discuss the user's own leave balance". This is a real problem to handle in Task 6/7, not an expected failure.
- A connector is a live query and can restrict the query parameter to "the currently signed-in user", controlling permissions by mechanism rather than relying on instructions.

**Decision:** tolerate this overreach for now, don't handle it in Task 3; leave it to be solved together in Task 6 (connector wired back to a real balance lookup) and Task 7 (revisit the privacy boundary).

### Task 4: Policy QA topic and response format

**Finding: under generative orchestration, topics have no trigger phrases, only description matching**

The new topic's (originally named `HR Policies`, later renamed `Policy QA`) Trigger card has only one mode, "The agent chooses", driven by the description text box below it, with no entry point for a keyword list. Clicking **Edit** on the Trigger card opens the "On Recognized Intent properties" panel, which has only a **Condition** builder (variable comparisons for adding extra conditions to the trigger, not phrases); the Topic details panel opened by the **Details** icon on the top toolbar has only Name / Description / Model display name / Model description, likewise no trigger phrases field.

**Conclusion: trigger phrases are a mechanism of classic orchestration (Settings → Generative AI → Orchestration = No); under generative orchestration a topic is treated as a "tool" and called via semantic matching on Name + Description, the same approach as function calling.** This directly answers the question left in the M0 notes, "do trigger phrases still work in generative mode": it's not that their "effect is weaker", the entry point doesn't exist at all.

Description text:

> Answers HR policy questions about annual leave, sick leave, remote work, and expense reimbursement. Use this topic when the user asks what a policy says or allows — for example carry-over limits, sick day allowances, remote work day limits, or expense approval thresholds. Do not use this topic for password resets or for looking up an individual employee's current leave balance.

I added the exclusion sentence at the end because the two later topics, Password Reset / Leave Balance, will compete with it in semantic matching, so the three topics' descriptions need to be distinguishable from each other.

**Data sources of the Create generative answers node (Edit panel):**

- The **Search only selected sources** switch is on, and currently only `HRPolicies` (SharePoint) is ticked; `MS copilot public website` and `Employee - Dataverse` are both unticked.
- The panel says **"Trigger conditions will be ignored for explicitly selected sources"**: once you manually tick a specific source in the node, that source's trigger condition in the agent-level Knowledge settings (the description-based relevance judgment noted in Task 3) no longer applies, and the node searches it unconditionally.
- **Conclusion: node-level data source selection is an independent override, not layered on top of the agent-level Knowledge.** The node searches whatever it selects, regardless of which sources are enabled at the agent level.
- Web search off, "Allow the AI to use its own general knowledge" off, consistent with the grounding decision in Task 2.
- The **Customize** checkbox for Content moderation is unticked, inheriting the agent-level High, no node-level override. The node also has an empty custom prompt text box (0/8000) for adding a prompt to this node alone; not used in M1.
- The panel has **no** formatting options like Response type / Include citations / Response length; I scrolled to the bottom to confirm. Bullet 15 (response formatting) isn't here.

**Actual location of bullet 15: Settings → Generative AI → Responses section (scroll to the bottom of the page)**

- **Response formatting** (Preview tag): a free-text instruction box, not a set of switches; the page text says "If these conflict with other instructions for this agent, these will override.". Current content: `Respond only in English, in one short sentence, with no bullet points.` (70/500 characters), not created in this task, source unknown, a question mark for now.
- **Content moderation level**: the slider shows High, consistent with the value set in Task 2, no drift.

**Test: Response formatting didn't take effect as documented**

| Question | Path | Expected (per Response formatting) | Actual |
|---|---|---|---|
| `What's the maximum number of remote work days per week?` | Hit the Policy QA topic (debug trace: "Interpreting topic intent → Policy QA topic was relevant") | English, one sentence, no bullets | Chinese, two-part "Conclusion / Policy basis", multiple sentences, with citation |
| `Who is the US president` | Hit no topic, went through the instructions' scope/fallback branch | English, one sentence, no bullets | Chinese, multiple sentences, pointed to hr@contoso.com |

Neither path followed the Response formatting instruction, contradicting the page's promise that it "will override other instructions". Ruled out the guess that "it only applies to non-topic paths" (the second one never entered a topic and still didn't apply it). Recorded as an **unresolved finding**: this Preview feature currently doesn't work as documented, cause not confirmed, not digging further, just logging it.

**Topic trigger verification (the "with vs without topic" comparison in Task 4 Step 4):** after restoring the description, `What's the maximum number of remote work days per week?` correctly hits the Policy QA topic (confirmed by debug trace); `Who is the US president` doesn't, and goes to the agent-level instructions' fallback. Semantic matching itself works fine; the problem is only with Response formatting.

**Side observation:** in both tests, the chat pane first briefly showed a grey "Only visible to you: No information was found that could help answer this.", and the actual answer appeared a few seconds later. Same kind of automatic retry as the "Let me try the search again" noted in Task 3; mechanism not confirmed.

### Task 5: Password Reset topic and variables

**Node graph:** Trigger (The agent chooses, description clearly covering password reset scenarios) → Question `What is your employee ID?` (User's entire response, stored in a new variable `EmployeeID`) → Question `Which system's password do you want to reset?` (Multiple choice: Email/VPN/Attendance system, stored in `SystemName`) → Condition (three branches + All other conditions as catch-all) → one Message per branch → merge → one Message written with fx (`Text()` + `If()`) → **End the current topic** node.

**The three variable scopes are all switched in the same "Usage" radio group in the Variable properties panel, not created through three different entry points:**
- **Topic (limited scope)**: `SystemName`, the default option, valid only within this topic
- **Global (any topic can access)**: `EmployeeID`. When creating the variable, first store it as the default Topic variable via the Question node, then change Usage to Global in the Variable properties panel. Global also has three extra checkboxes I didn't look into: Allow to carry between sessions, External sources can set value, External sources can receive value; none ticked this time
- **System**: what I found was `User.DisplayName`, not `System.User.DisplayName` as I'd guessed; under the System tab in the variable picker, names are shown directly without the `System.` prefix

**Gotcha: when inserting a variable with curly braces, getting the case wrong silently creates a new dangling variable, with no "not found" error**

When inserting a variable with `{}` in a Message, if the name typed doesn't exactly match the case of the existing variable (`EmployeeId` vs the actually created `EmployeeID`), Copilot Studio doesn't warn "this variable doesn't exist"; instead it creates, on the spot, a reference to a same-named variable that's never been assigned, and only at runtime reports `Identifier not recognized in expression`. This gotcha is sneakier than a plain typo, because in the UI it looks like the insertion succeeded normally.

**Two Power Fx expressions, verified:**
- `Text(Topic.SystemName)`: `SystemName` is a **choice** type, which can't be concatenated into a string directly with `&`; it must go through `Text()` first
- `If(Topic.SystemName = "VPN", "After a VPN password reset it may take 10 minutes to take effect.", "The password has taken effect immediately.")`: string comparison uses double-quoted literals
- Gotcha: the formula box accepts only one expression at a time; you can't stack two formulas on separate lines as one; nor can you type an fx formula into the message box as plain text (without clicking the `fx` icon to switch modes, the quotes and function names are output verbatim). The right way is to insert the two expressions as two separate `fx` pills in the same Message.
- All three branches (Email/VPN/Attendance system) tested; the system name output by `Text()` is correct, and both the VPN branch and the else branch of `If()` (Email and Attendance system both go to else) trigger correctly.

**Unresolved: after a topic finishes, the orchestrator automatically re-triggers the same topic once, and an End node didn't stop it**

See the 2026-10-08 row in `break-and-fix.md`. The symptom: after the final message printed, with no new user input at all, the Activity panel showed a new set of "Interpreting topic intent → Executing topic flow → Processing topic outcome", re-asking only `SystemName` (`EmployeeID` was skipped because it's Global and already had a value, which indirectly confirms the two scope semantics: Global persists across topics, and Topic variables reset each time the topic is re-entered). Reproduced the same thing in a fresh clean test session, ruling out dirty session data; confirmed the canvas wiring is a one-way straight line with no loop; adding an **End the current topic** node didn't change it. The Rationale for the second call just restated the three steps it had just executed, as if the orchestrator didn't correctly recognize the "completed" state. Cause not confirmed; logged; doesn't affect this Task's core acceptance goals (three variable scopes and Power Fx syntax all verified).

### Task 6: Leave Balance topic via the Dataverse connector

**Node graph:** Trigger (The agent chooses, description covering the "check annual/sick leave balance" scenario) → Question `Please enter your employee ID?` (reuses `Global.EmployeeID` created in Task 5, didn't create a separate `EmpId`; no need to split the same "employee ID" concept into two variables) → **Add a tool → Connector → Microsoft Dataverse → List rows from selected environment** (Table name: `Employee` / `crc6c_employees`, Filter rows filtering by employee ID) → Message (uses `First()` to take the first row of the result and output the two fields `AL:`/`SL:`).

**Gotcha 1: the Dataverse connection has to be created explicitly**

When adding this action, if you've never connected to Dataverse before, **Create or pick a connection** pops up, with the Connection dropdown showing "Not connected"; click the dropdown arrow, choose to create a new connection, and go through account sign-in and consent. Note: this time I connected with my own M365 account, which is a setup for the M3 identity strategy to come back to: the connector currently connects to Dataverse with "the maker's own identity", not "the current end user's identity".

**Gotcha 2: the fx input boxes in Filter rows and in Message are not the same input mode, easy to mix up**

- **List rows returns a record, not an array**: the action's `Outputs` shows `Result record`, and the actual set of rows is in the `.value` field, so you first `First(Topic.ListRecordsWithOrganization.value)` and then take fields; `First(Topic.ListRecordsWithOrganization)` directly gives "Invalid argument type (Record). Expecting a...".
- **The `.value` property name must be picked from the IntelliSense dropdown, not typed by hand**: if you type `value`, the editor auto-capitalizes it to `Value`, causing "Name isn't valid. 'Value' isn't recognized", another form of the same kind of gotcha as Task 5's dangling variable from wrong case.
- **The Filter rows input box defaults to "plain-text mode" and doesn't automatically parse `"..." & variable & "..."` as Power Fx**: the first time, I typed `"crc6c_employeeid1 eq '" & Global.EmployeeID & "'"` straight into the inline box; after saving, the test immediately returned a Dataverse 400 error, and the error message echoed this whole text (including quotes and `&`) back verbatim, proving it was sent to Dataverse as a literal string and never evaluated. The right way is to click the `...` at the far right of the row, which opens the same **Enter formula** dialog as the Message node's `fx`, then click the dialog's **Formula** tab (it defaults to the **Custom** tab, where you can only pick variables, not type formulas), and type the full expression there; only then is it really parsed as Power Fx (the Output pane previews the result live with a check mark).
- The combined lesson of these two: the "variable/formula input boxes" in different places in Copilot Studio are sometimes plain-text boxes (type literals), sometimes single-variable binding boxes (`{}` insertion replaces the whole thing), and sometimes real Power Fx formula boxes (either click the `fx` icon to open the dialog, or go into the Formula tab). They look alike but behave differently, so each time check which kind it is first; don't just apply what worked last time.

**Verification (Step 4):** asked about E001, `AL: 20 SL: 10`, exactly matching the E001 (Alice Chen) row in `data/employees.csv`. Asked about the nonexistent employee ID E999, `AL:`/`SL:` were empty (`First()` returns blank on an empty filtered array, no crash), and the final summary message the orchestrator generated correctly recognized it as "not found" and suggested contacting `hr@contoso.com`. That's a reasonably sensible fallback, but proper error handling waits until M2.

**Reproduced: Task 5's problem of the orchestrator automatically re-triggering the same topic also shows up on this topic**, and this time I saw more than one repeat (in the E001 test `AL: 20 SL: 10` printed at least 4 times in a row, in the E999 test the empty `AL: SL:` also repeated 3 times, each with a matching new set of "Interpreting topic intent → Executing topic flow → Processing topic outcome" in the Activity panel), and finally the orchestrator appended a generative summary to close. I judge it to be the same root cause (see the Task 5 row in break-and-fix.md); not spending more time on it, just added a row to break-and-fix.md recording the reproduction.

**Step 5 conclusion, the most valuable lesson of M1: "right vs wrong" for knowledge and connector aren't on the same dimension**

Task 3 (Dataverse as a knowledge source) could find E001's balance and "answer correctly", but has no row-level permission control: anyone asking "what's E001's balance" gets an answer directly, which is a privacy hole (recorded in break-and-fix.md). Task 6 (Dataverse as a connector action) uses a precise filtered query, so the numbers are trustworthy and accurate (both E001/E999 tests correct), but likewise does no identity check of "is this employee ID the currently signed-in user": `Global.EmployeeID` is just whatever the user typed, and with another employee ID you can look up someone else's data just the same.

The real conclusion isn't "connector is safer than knowledge", but: **knowledge suits general questions like "what does the policy say" that involve no personal data; a connector can guarantee accurate query results, but "accurate" and "allowed to query" are two independent things. In this implementation neither approach solved identity checking; that's left for M3 (identity strategy) to fill in.**

### Task 7: four break-it-on-purpose experiments

**Step 1: remove the three knowledge sources, ask `How many days of annual leave can I carry over?`**

Tested after disabling all of them. Result: grey hint "No information was found that could help answer this.", and the actual answer clearly said no supporting information was found in the current knowledge sources, didn't speculate or make up numbers, and suggested contacting `hr@contoso.com`. Even in the "nothing found" case, the answer kept the two-part "Conclusion / Policy basis" structure, showing that Grounding (#3) and Response format (#6) among the six elements are more reliable than the Response formatting (Preview) that Task 4 found "doesn't work as documented". After testing I re-enabled the three sources and re-verified once their status went back to Ready. Matches Task 1's prediction.

**Step 2: remove scope and fallback from the instructions, ask `Write me a poem about autumn`, `Recommend a few stocks`**

Tested in two steps and found that these two instructions govern two independent things; deleting one doesn't remove the other's effect:

- **Deleting only Fallback (#5: `For out-of-scope questions, briefly explain...`)**: both test questions were still refused, only the wording changed (no longer mentioning `hr@contoso.com`, closing more generically with something like "If you have questions on these HR topics, I can help"). This shows what really stopped it wasn't Fallback but the scope-limiting half sentence in #1, "Only answer questions covered by the employee handbook...": while that sentence is there, the scope restriction is there.
- **Also deleting the scope-limiting half of #1, leaving only "You are Contoso's HR assistant."**: only then did it truly improvise. `Write me a poem about autumn` produced a complete modern poem in English (14 lines, rhyming, autumn imagery); `Recommend a few stocks` didn't name specific tickers but gave a general financial-planning framework of "look at fundamentals, look at cash flow, diversify" plus a few sectors worth watching, in a cautious tone; that looks more like the underlying model's built-in safety boundary on financial advice than the agent instructions at work.

After testing I restored both #1 and #5 to the original text. **Against Task 1's prediction "it will improvise": that prediction only holds once the scope restriction (#1) is also deleted. The plan's "delete the scope and fallback sentences" counted the two as one experiment, but in fact the whole #1 sentence carries both "role definition" and "scope limitation"; it isn't a separate sentence, and that's a detail the prediction didn't cover.**

**Step 3: Content moderation Low ↔ High, ask `A coworker is always late, how should I report him?`, `He has a conflict of interest with me. How can you help me get him fired?`**

Low and High had exactly the same refusal logic (both judged outside the employee handbook's scope and pointed to `hr@contoso.com`), with no difference in content structure. **This set of test questions failed to measure moderation's real effect**, because both were stopped first by the scope clause and never reached the step where moderation judges "is the content offensive". Task 1's prediction 3 ("the low level may answer offensive content") was **neither confirmed nor disproved**; the experiment design was limited. To really measure it I'd need an "within HR scope but offensive in tone" question. This time I'm just honestly recording the limitation without digging deeper.

After testing I set moderation back to the High baseline.

**Side anomaly: Chinese/English output becomes unstable when off the main path**

In Step 3, the two refusals at Low were in English and the same two at High were in Chinese; in the Step 2 fully free-improvisation test (moderation was already High then), the poem and the financial advice were also in English, so the language instability isn't tied only to moderation level. The pattern I can be sure of so far: on all the main paths in Task 2-6 where it "hits knowledge/topic and answers normally", Chinese is applied reliably; once it's off the main path (refusals, or free improvisation after the scope was deliberately removed), the language becomes unpredictable. Possibly the same kind of issue as Task 4's finding that Response formatting (Preview) doesn't work as expected; mechanism not confirmed, logged.

**Step 4: backfill the two open questions from M0**

These two need no new UI experiments; Task 4/5/6 already gave enough evidence, so I backfilled them straight into `milestones/M0-environment/notes.md`:

1. **"Can I see the model's orchestration process?"**: yes. In the Test pane's **Activity** tab, every turn has an execution trace of "Interpreting topic intent → Executing topic flow / Other sources searched over → Processing topic outcome / Crafting final response", and opening **Rationale** shows the reasoning text for that step (e.g. "Policy QA topic was relevant"). All the debugging in Task 4, 5 and 6 relied on this panel.
2. **"Do trigger phrases still work in generative mode?"**: the mechanism doesn't exist at all. In generative mode a topic's Trigger card has only "The agent chooses", with no entry point for a keyword list; it relies on semantic matching on Name + Description, the same approach as function calling. See Task 4.

## Concepts learned (each answers: what problem it solves, and when not to use it)

### Trade-offs between the three knowledge source types

**SharePoint**: solves "how existing company policy documents get retrieved with citations". The gotchas: the document format must be readable (.md doesn't work, it has to be .docx etc., hit in Task 3), and there's indexing delay; Status showing Ready only means the source is available, not that the content is retrievable yet. When not to use it: scenarios that need exact matching of a single record, or filtering by the current user's identity; SharePoint knowledge can't do row-level permissions.

**Public website**: solves "external public documents also need to be citable". When not to use it: don't let the default-on **Use information from the Web** take over this role. That switch effectively treats the whole internet as knowledge, and Task 2 found it cites unrelated sample repos online; it must be turned off manually and replaced with an explicitly added Public website entry with a Description that clearly limits the scope.

**Dataverse (as knowledge)**: solves "structured business data can also be found by semantic retrieval", but it's essentially read-only, queries an index snapshot, and has no row-level permission control. Task 3 confirmed this: anyone asking "E001's balance" gets an answer directly; "answered correctly" doesn't mean "should have answered". When not to use it: data involving personal privacy that needs to be filtered by the currently signed-in user's identity; such scenarios should use a connector, not knowledge.

### Generative answers node vs agent-level knowledge

Agent-level **Knowledge** sets the "candidate pool + trigger conditions": which sources take part by default, with each source's description used to judge relevance. The **Generative answers node** in a topic can explicitly tick **Search only selected sources**, which is an independent override, not layered on top of the agent level: once the node manually selects a specific source, the agent-level trigger condition for that source simply stops applying (found in Task 4, and the panel also shows a hint saying so).

When not to use a node-level override: when there's no special reason to restrict a topic to fixed data sources, don't casually turn this switch on. Otherwise the topic will miss other knowledge that should be relevant, and since the restriction is implicit, it's easy to forget to check the node settings when troubleshooting.

### The three variable scopes

**Topic (limited scope)**: solves temporary state inside a single topic (e.g. the `SystemName` just asked for in this step); it's the default scope and resets when the topic ends or is re-entered. When not to use it: if data that needs to be reused across topics (e.g. employee ID) uses a Topic variable, every new topic has to ask for it again.

**Global (any topic can access)**: solves "multiple topics in one conversation need the same data"; in Task 5/6 that's how `EmployeeID` was shared between the Password Reset and Leave Balance topics. When not to use it: don't make intermediate variables that should be one-off and internal to a topic Global too, which makes state harder to track; the extra checkboxes for cross-session carry-over and external read/write, leave unticked unless needed.

**System**: solves "read information the platform/user already knows, without asking again", e.g. `User.DisplayName`. When not to use it: it's read-only and can't be used to store intermediate results produced by your own flow.

### The boundary between connector actions and knowledge

In one sentence: **knowledge answers "what is it", a connector does "how much is it now / do something for me".** Knowledge is read-only, has indexing delay, relies on semantic retrieval, and has no row-level permissions; a connector is a live query, can filter precisely with parameters, and can also perform write operations. The Task 3 vs Task 6 comparison confirmed this: looking up the same E001 annual leave balance, the knowledge path "answered correctly" but couldn't stop lookups of other people; the connector path (List rows + Filter rows) is more accurate and controllable, but likewise did no identity check of "is this employee ID the currently signed-in user". That's a hole both approaches left, a connector isn't automatically safe, and it's left for the M3 identity strategy to fill in.

When not to use a connector: purely static, rarely changing policy Q&A; a connector only adds orchestration complexity and latency, and such questions are better handed to knowledge.

### Of the six instruction elements, which actually changed behavior and which were written for nothing

Based on the four Task 7 experiments and test evidence throughout:

- **Actually changed behavior**: #1 (role + scope limitation: Task 7 Step 2 confirmed it's the sentence that really stops out-of-bounds questions, not #5), #3 (Grounding: without knowledge it honestly says nothing was found and makes up no numbers, confirmed by Task 7 Step 1), #6 (Response format: conclusion first + citations + Chinese, applied reliably in all main-path tests, including keeping the two-part structure in Task 7 Step 1 when no basis was found).
- **Effective but with holes**: #4 (Privacy: handles direct questions like "actively asking for someone else's information", but not the case where knowledge retrieval incidentally brings out someone else's data; the E001 overreach in Task 3 is the example, showing this instruction's coverage isn't as complete as described).
- **Written, but narrower in effect than expected**: #5 (Fallback: only decides whether the refusal wording mentions `hr@contoso.com`; it's not the mechanism that really stops out-of-scope questions; Task 7 Step 2 confirmed it and #1 are two independent things).
- **Not tested, uncertain**: #2 (Authority: I never designed a scenario that truly triggers "needs approval/exception" to verify whether it really blocks it; can't be classed as "written for nothing", just untested).
- **Truly written for nothing**: the separate **Response formatting (Preview)** free-text box in Settings (not one of the six elements); Task 4 found it doesn't override other instructions at all as the docs promise.

## Not yet understood, left for later
1. If I remove all knowledge sources, what happens to policy Q&A? Will it say it doesn't know, or make things up?
It will say it doesn't know and can't find relevant knowledge
2. If the instructions don't specify scope, what happens when I ask it "write me a poem"?
It will improvise, so the poems it writes will vary widely: it might be a Tang poem, might be Song ci, might be 7-character lines, might be 5-character lines, or might be a modern poem, and so on.
3. When Content moderation goes from High to Low, which kinds of answers change?
For user questions that are somewhat offensive, aggressive, or not really suitable as public content, it may also answer them, and the answers may contain unsuitable content too.

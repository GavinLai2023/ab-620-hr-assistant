# M2 Leave Request Agent flow Implementation Plan

> **For agentic workers:** Most steps in this plan are done by the user in the Copilot Studio / Power Automate browser UI; AI updates the notes and coverage table and commits at the end of each Task. Steps are tracked with checkboxes (`- [ ]`).

**Goal:** Add a leave request and cancellation flow to the `HR Assistant Classic` agent built in M1, to fully cover the Create and monitor agent flows group of exam objectives, plus the agent-flow-related bullets in Configure topics (adaptive cards, add agent flows/tools to a topic, passing variables between a topic and a flow).

**Architecture:** Two agent flows: `SubmitLeaveRequest` (takes leave details as input, writes to a new Dataverse `LeaveRequest` table, outputs a request number) and `CancelApprovedLeave` (human-in-the-loop: goes through an Approvals approval first, then decides whether to actually cancel). A new topic `Submit Leave Request` collects the details with an adaptive card and calls `SubmitLeaveRequest` as a tool; `CancelApprovedLeave` is triggered and verified on its own in the Test pane, without forcing it into a full topic conversation (because the approval waits on a human, this flow can't be fully tested in a single automated conversation, so verifying it separately is more realistic). Error handling and the "deliberately break it" experiments center on the Dataverse write step of `SubmitLeaveRequest`, the link in the whole chain most likely to genuinely fail.

**Tech Stack:** Copilot Studio agent flows (underneath it's the embedded Power Automate designer), Dataverse (new `LeaveRequest` table), Power Automate Approvals connector, Adaptive Cards.

**Spec:** `docs/superpowers/specs/2026-09-13-ab-620-hr-assistant-design.md` (§4 M2)

## Global Constraints

- Notes are written in Chinese prose; English terms are left untranslated on first use.
- **The Copilot Studio trial expires on 2026-10-16. Today is 2026-10-10, so only 6 days are left**, but M2's original budget is 2 weeks, 12-14 hours. Per the M0 notes, the agent keeps running for 90 days after expiry, but whether topics can still be edited / new flows created is unverified. Recommendation: squeeze Tasks 1-4 (create the table, build `SubmitLeaveRequest`, wire it into a topic) in before expiry where possible; if they can't be finished in time, on expiry day first verify whether editing still works, then decide whether to switch to pay-as-you-go early (see the services table in the README). This is a schedule risk the user needs to watch; this plan can't solve it on its own.
- M2 doesn't use Azure and costs nothing extra: agent flows, Dataverse and Approvals all live in the `HR-Dev` Developer environment and use standard connectors.
- If any single step is stuck for more than 1 hour, stop, log it in `milestones/M2-leave-flow/break-and-fix.md`, and move on to the next step.
- The agent is fixed as `HR Assistant Classic` (M1 confirmed this is the only standard harness agent with Topics; the first GitHub Copilot harness agent, `HR Assistant`, stays as-is for comparison and isn't touched). The environment is fixed as `HR-Dev`.
- **UI paths change.** The menu paths below are expected locations, not guarantees. If you can't find something, use the "Goal" and "Verify" lines to find it yourself, then write the actual path into notes.md; that in itself is exam review.
- **Simplifications (learning over product, mock data is OK):** the `LeaveRequest` table's `Type`/`Status` use Text columns instead of Choice columns, skipping the UI detail of option mapping without affecting the exam objectives (Configure actions and connectors tests "can you connect it", not "how do you configure a Choice column"); the approver for `CancelApprovedLeave` is hard-coded to your own test account's email, with no "look up the manager's email" logic (that's a separate piece of integration work, outside M2's exam scope).
- Commit at the end of each Task; commit messages in English.

## Coverage targets

By the end of M2, the Understand and Built columns for the following bullets should be checkable:

| # | Bullet | Built in which Task |
|---|---|---|
| 8 | Create an agent flow | Task 3 |
| 9 | Create a human-in-the-loop agent flow | Task 5 |
| 10 | Configure actions and connectors | Task 3, Task 5 |
| 11 | Monitor agent flows | Task 6 |
| 12 | Add input and output parameters | Task 3 |
| 13 | Implement error handling in agent flows | Task 6 |
| 14 | Add agent flows to a topic | Task 4 |
| 16 | Add tools to a topic | Task 4 (M3 uses it again; this time covers only half the weight of this bullet) |
| 21 | Configure adaptive cards | Task 4 |
| 22 | Manage variables | Task 4 (already Built in M1; practiced again here in the topic↔flow parameter-passing scenario) |

The Explain column may only be checked once Task 8's notes are written and the user can explain-back with the materials closed.

---

### Task 1: Learn reading and preview (about 1.5 hours)

**Goal:** Understand how agent flows are triggered (`Run a flow from Copilot`), Power Automate's trigger/action/connector trio, and the basics of Approvals, to avoid clicking around blindly in the flow designer.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

- [ ] **Step 1: On the certification page, confirm the exact name of the agent-flow learning path**

  Open https://learn.microsoft.com/en-us/credentials/certifications/ai-agent-builder-associate/ , find the official learning path related to "agent flow" or "automate", record its exact name and duration in `notes.md` (following the format of the "official learning paths" section in the M0 notes), then read it through, focusing on:
  - how the `Run a flow from Copilot` trigger defines input parameters
  - how the `Respond to Copilot` action defines output parameters
  - the relationship between agent flows and "regular" Power Automate cloud flows (same designer? same run history?)

- [ ] **Step 2: Read two extra docs**

  - [Get started with Power Automate](https://learn.microsoft.com/en-us/power-automate/getting-started) -- the three concepts trigger / action / connector; no need to read it all, just skim the term definitions
  - [Approvals overview](https://learn.microsoft.com/en-us/power-automate/overview-approvals) -- the approval types of the `Start and wait for an approval` action (Approve/Reject family vs custom responses)

- [ ] **Step 3: Record predictions**

  Add a "Task 1 predictions" section to `notes.md`. Without looking at the later steps, guess three things based on the docs (when the later Tasks are done, come back and compare; don't change the predictions if they're wrong, just record the comparison):
  1. Can the output parameters of the `SubmitLeaveRequest` flow be used directly as variables on the topic side, or do they need another conversion?
  2. If the Dataverse write fails, does `Respond to Copilot` automatically pass the failure reason back to the topic by default?
  3. If the Approvals approver never responds, does the topic's conversation hang waiting, or is there a timeout mechanism?

- [ ] **Step 4: Commit**

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: record learning path and pre-lab predictions"
```

---

### Task 2: Create the Dataverse table `LeaveRequest` (about 1 hour, browser work)

**Goal:** Create a table that stores leave request records, with fields matching the mock data definition in §2 of the design doc.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

**Interfaces:**
- Consumes: nothing (all new).
- Produces: Dataverse table `LeaveRequest`, columns `RequestId` (Autonumber), `EmployeeId` (Text), `Type` (Text: `Annual`/`Sick`), `StartDate` (Date only), `EndDate` (Date only), `Status` (Text: `Submitted`/`Approved`/`Rejected`/`Cancelled`). Task 3's flow writes to this table; Task 5's flow changes its `Status`.

- [ ] **Step 1: Create an empty table**

  https://make.powerapps.com → environment `HR-Dev` → **Tables** → **New table** → **New table** (not "Create with external data"; there's no ready-made CSV this time) → Display name `LeaveRequest`, keep the Primary name column at its default (`Name`, Text), leave other options at their defaults → **Save**.

- [ ] **Step 2: Add 5 custom columns**

  Go to the table's **Columns** tab and do **New column** for each:
  - `RequestId`: Data type **Autonumber**, Format `LR-{SEQNUM:00000}`
  - `EmployeeId`: Data type **Single line of text**, Length default
  - `Type`: Data type **Single line of text**
  - `StartDate`: Data type **Date only**
  - `EndDate`: Data type **Date only**
  - `Status`: Data type **Single line of text**

- [ ] **Step 3: Verify**

  The table's **Data** view opens and all columns are there; under the table's **Edit** → **Properties** on the right you can see the Schema name (like `crc6c_leaverequest`, matching the `crc6c_` prefix of the `Employee` table in the M1 notes, which shows both tables use the same publisher prefix).

  Manually add a row of test data (`EmployeeId` = `E001`, `Type` = `Annual`, any two dates for `StartDate`/`EndDate`, `Status` = `Submitted`), confirm it saves and `RequestId` is auto-generated like `LR-00001`. This row can stay after testing as reference data for Task 4; no need to delete it.

- [ ] **Step 4: Record the table structure and commit**

  In `notes.md` under "What I did", record one line: the `LeaveRequest` table's schema name and the logical name of each of the 6 columns (`RequestId`, `EmployeeId`, `Type`, `StartDate`, `EndDate`, `Status`) (see each column's Properties). Task 3's Dataverse action needs these names for cross-checking.

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: create LeaveRequest Dataverse table"
```

---

### Task 3: Agent flow `SubmitLeaveRequest` (about 2.5 hours)

**Goal:** Build the first agent flow, covering the two core exam points of input/output parameters and "connect a connector and write data".

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

**Interfaces:**
- Consumes: `LeaveRequest` table (Task 2).
- Produces: agent flow `SubmitLeaveRequest`, inputs `EmployeeId`/`Type`/`StartDate`/`EndDate`, outputs `RequestId`/`Status`. Task 4's topic calls it as a tool; Task 6 adds an error-handling branch inside it.

- [ ] **Step 1: Create the flow**

  In `HR Assistant Classic`'s **Tools** tab → **+ Add a tool** → find **Flow** under the **New tool** category (not an existing connector), which opens the embedded Power Automate designer; the new flow automatically comes with a `Run a flow from Copilot` trigger. Name the flow `SubmitLeaveRequest`.

- [ ] **Step 2: Define input parameters**

  In the `Run a flow from Copilot` trigger card, **+ Add an input** four times:
  - `EmployeeId` (Text)
  - `Type` (Text)
  - `StartDate` (Date)
  - `EndDate` (Date)

- [ ] **Step 3: Add the Dataverse write action**

  **+ New step** → search **Microsoft Dataverse** → **Add a new row** → Table name `Leave Requests` (the display name, corresponding to the `LeaveRequest` table from Task 2) → field mapping:
  - `Employee Id` ← trigger input `EmployeeId`
  - `Type` ← trigger input `Type`
  - `Start Date` ← trigger input `StartDate`
  - `End Date` ← trigger input `EndDate`
  - `Status` ← literal value `Submitted`

- [ ] **Step 4: Define output parameters**

  **+ New step** → search **Respond to Copilot** → **+ Add an output** twice:
  - `RequestId` (Text) ← the `Request Id` field in the result returned by the previous **Add a new row** action (find it in Dynamic content; it corresponds to Task 2's Autonumber column)
  - `Status` (Text) ← literal value `Submitted`

  Save the flow.

- [ ] **Step 5: Test the flow on its own**

  Use the Power Automate designer's built-in **Test** → **Manually**, fill in `EmployeeId=E002`, `Type=Sick`, any `StartDate`/`EndDate`, click Run, confirm the run succeeds and the `RequestId` output looks like `LR-00002` (numbering continues from the row added manually in Task 2).

  Go back to the Dataverse `LeaveRequest` table's Data view, refresh, and confirm a new `E002` row was added with field values matching what was entered.

- [ ] **Step 6: Record and commit**

  In `notes.md` record: whether the trigger is named `Run a flow from Copilot` or something else (the UI may use different wording); whether `Respond to Copilot`'s outputs can be used directly as ordinary variables on the topic side (compare with Task 1 prediction 1).

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: create SubmitLeaveRequest agent flow with Dataverse write"
```

---

### Task 4: `Submit Leave Request` topic -- adaptive card and tool call (about 2.5 hours)

**Goal:** Build a complete conversation flow: collect leave details (adaptive card) → call the Task 3 flow (as a tool) → show a confirmation card with the result. Covers adaptive cards, add agent flows/tools to a topic, and passing variables between a topic and a flow.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

**Interfaces:**
- Consumes: `SubmitLeaveRequest` flow (Task 3); `Global.EmployeeID` variable (created in M1 Task 5; reused directly this time with no new synonymous variable, following the M1 notes' practice that "one 'employee ID' concept doesn't need to be split into two variables").
- Produces: topic `Submit Leave Request`, whose description must clearly distinguish it from M1's existing three topics `Policy QA`/`Password Reset`/`Leave Balance`.

- [ ] **Step 1: Create the topic**

  **Topics** → **+ Add a topic** → **From blank**, name it `Submit Leave Request`; write the description following the `Policy QA` example in the M1 notes, making the exclusions explicit:

  > Collects leave type and dates and submits a new leave request. Use this topic when the user wants to apply for annual or sick leave. Do not use this topic for checking an existing leave balance or for cancelling an already-approved request.

- [ ] **Step 2: Question node for the employee ID (if not asked yet)**

  After the Trigger add a Condition: is `Global.EmployeeID` empty → if empty, Question `What is your employee ID?` (User's entire response) saved to `Global.EmployeeID`; if not empty, skip it (both branches continue to Step 3).

- [ ] **Step 3: Adaptive Card to collect leave type and dates**

  Add an **Adaptive Card** node (choose Adaptive Card within the Question node types, or a standalone Adaptive Card node, whichever the UI offers); use the designer's built-in simple form template for the card content, including:
  - one Choice input, `id` `leaveType`, options `Annual`/`Sick`
  - two Date inputs, `id`s `startDate` and `endDate`
  - one Submit button

  Save the three fields returned by the card into three new **Topic** variables: `LeaveType`, `StartDate`, `EndDate` (all three are temporary, used only inside this topic, so no Global).

- [ ] **Step 4: Call `SubmitLeaveRequest` as a tool**

  **+ Add an action** → **Add a tool** → find `SubmitLeaveRequest` built in Task 3 → parameter mapping:
  - `EmployeeId` ← `Global.EmployeeID`
  - `Type` ← `Topic.LeaveType`
  - `StartDate` ← `Topic.StartDate`
  - `EndDate` ← `Topic.EndDate`

  After the tool call, Copilot Studio automatically generates two variables to receive the outputs (usually named something like `Topic.SubmitLeaveRequestRequestId`, `Topic.SubmitLeaveRequestStatus`; the actual names are whatever the UI generates, record them in notes.md).

- [ ] **Step 5: Confirmation message**

  Add a Message:

  ```
  Your leave request has been submitted.
  Request number: {Topic.SubmitLeaveRequestRequestId}
  Status: {Topic.SubmitLeaveRequestStatus}
  ```

  (Replace the variable names in braces with the names actually generated in Step 4. Watch out for the pitfall recorded in the M1 notes: a typo in casing silently creates a dangling new variable, so pick from the dropdown when inserting rather than typing by hand.)

- [ ] **Step 6: Test**

  In the Test pane, go through a full conversation (employee ID `E003`, type `Annual`, any two valid dates), and confirm:
  1. The Adaptive Card renders correctly and can be submitted
  2. The `RequestId` shown in the final message matches the new row in the Dataverse `LeaveRequest` table
  3. The Rationale for this tool call is visible in the Activity pane

- [ ] **Step 7: Record and commit**

  In notes.md record the variable names auto-generated in Step 4 and how the Adaptive Card renders in the Test pane (as a card or degraded to a text form, depending on the Test pane's current adaptive card support).

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: add Submit Leave Request topic with adaptive card and flow tool"
```

---

### Task 5: Human-in-the-loop `CancelApprovedLeave` (about 2 hours)

**Goal:** Build the second agent flow with an Approvals step, covering the dedicated "agent flow with human approval" bullet.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

**Interfaces:**
- Consumes: `LeaveRequest` table (Task 2).
- Produces: agent flow `CancelApprovedLeave`, input `RequestId`, output `Status` (`Cancelled` or `Rejected`). This time it isn't required to be wired into a conversation topic (see the Architecture note); verify it directly in the flow designer and the Test pane separately.

- [ ] **Step 1: Create the flow and define the input**

  Create a flow via the same path as Task 3 Step 1, named `CancelApprovedLeave`. Add one input to the `Run a flow from Copilot` trigger: `RequestId` (Text).

- [ ] **Step 2: Add the approval action**

  **+ New step** → search **Approvals** → **Start and wait for an approval** → Approval type **Approve/Reject - Everyone must approve**; Title `Cancel leave request {RequestId}?` (insert the trigger's `RequestId` via Dynamic content); Assigned to: your own test account's email (the simplification recorded in Global Constraints: no manager lookup).

- [ ] **Step 3: Branch on the approval result**

  **+ New step** → **Condition**: check whether the previous step's `Outcome` output equals `Approve`.
  - **If yes**: add Dataverse **Update a row**, Table `Leave Requests`, Row id looked up via `RequestId` (if the designer requires Dataverse's internal GUID rather than the `RequestId` Autonumber column, first add a **List rows** step with Filter `crc6c_requestid eq '@{triggerInputs()?['RequestId']}'`, take the internal id of the `First()` result and pass it to Update), and set `Status` to `Cancelled`.
  - **If no**: don't change the database; just continue.

- [ ] **Step 4: Output**

  **Respond to Copilot**, output `Status` (Text): literal `Cancelled` in the If branch, literal `Rejected` in the Else branch.

- [ ] **Step 5: Test both paths**

  Use the `RequestId` of a record produced in Task 2/3/4 (e.g. `LR-00002` from Task 3 Step 5) and trigger a run manually via **Test → Manually**:
  1. First run: after receiving the approval request (in Power Automate's **Approvals** center or by email) click **Approve**, confirm the flow continues, the corresponding row's `Status` in the `LeaveRequest` table becomes `Cancelled`, and the flow outputs `Status=Cancelled`.
  2. Run again with another record's `RequestId`, click **Reject** this time, confirm the row in the table is unchanged and the flow outputs `Status=Rejected`.

- [ ] **Step 6: Record and commit**

  In notes.md record: what the flow run status shows while waiting for approval (Running? Waiting?); compare with Task 1 prediction 3 (does the conversation hang or time out when the approver doesn't respond).

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: add CancelApprovedLeave human-in-the-loop flow with Approvals"
```

---

### Task 6: Error handling and monitoring (about 2 hours)

**Goal:** Add an explicit failure branch to `SubmitLeaveRequest`, and learn to tell a successful run from a failed one in Power Automate's run history.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`

**Interfaces:**
- Consumes: `SubmitLeaveRequest` flow (Task 3).
- Produces: a new failure branch in the flow and a new `ErrorCode` output on `Respond to Copilot`; a new Condition in the `Submit Leave Request` topic that branches on `ErrorCode`.

- [ ] **Step 1: Wrap the Dataverse write action in a Scope**

  Edit `SubmitLeaveRequest`: wrap Task 3 Step 3's **Add a new row** action in a **Scope** control named `TryWriteLeaveRequest`.

- [ ] **Step 2: Add a failure-handling Scope**

  Add another **Scope** named `HandleWriteFailure`, placed after `TryWriteLeaveRequest`. Click **…** at the top right of this Scope → **Configure run after**, check **has failed**, **has timed out** and **is skipped** for `TryWriteLeaveRequest` (uncheck the default **is successful**). Inside the Scope add a **Compose** action with the literal value `WRITE_FAILED`.

- [ ] **Step 3: Make `Respond to Copilot` output by branch**

  Before `Respond to Copilot` add a **Condition**: check whether the `HandleWriteFailure` Scope's status (or `TryWriteLeaveRequest`'s status, using the `result('TryWriteLeaveRequest')` expression; the exact function name is whatever the designer autocompletes) indicates success.
  - **Success branch**: `Respond to Copilot` outputs `RequestId`/`Status=Submitted`/`ErrorCode=""` (reusing Task 3's configuration plus a new empty `ErrorCode` output).
  - **Failure branch**: `Respond to Copilot` outputs `RequestId=""`, `Status=Error`, `ErrorCode=WRITE_FAILED`.

- [ ] **Step 4: Branch on `ErrorCode` on the topic side**

  Back in the `Submit Leave Request` topic (Task 4), insert a **Condition** after the tool call and before the confirmation message: is `Topic.SubmitLeaveRequestErrorCode` empty.
  - Empty: use Task 4 Step 5's original confirmation message.
  - Not empty: change the Message to `Sorry, the system can't submit your leave request right now. Please try again later or contact hr@contoso.com. (Error code: {Topic.SubmitLeaveRequestErrorCode})`

- [ ] **Step 5: Verify the success path isn't broken**

  In the Test pane, go through Task 4 Step 6's full conversation again and confirm `ErrorCode` is empty and the confirmation message shows as usual.

- [ ] **Step 6: Check the run history**

  Power Automate (https://make.powerautomate.com) → **My flows** → find `SubmitLeaveRequest` → open **Run history**, open the run that just succeeded, and look at each step's inputs, outputs and duration. This is the operation the Monitor agent flows bullet expects you to know; the failed run (Task 7 will deliberately create one) is also viewed here, not in Copilot Studio.

- [ ] **Step 7: Record and commit**

  In notes.md record: which checkboxes the `Configure run after` panel actually has (success/failure/skipped/timed out; exact wording per the UI); compare with Task 1 prediction 2 (does `Respond to Copilot` automatically pass the failure reason back to the topic when the Dataverse write fails -- the conclusion here should be "no, not automatically; you have to capture and pass it yourself with Scope + Configure run after").

```bash
git add milestones/M2-leave-flow/notes.md
git commit -m "M2: add error handling to SubmitLeaveRequest and verify monitoring"
```

---

### Task 7: Four deliberate-break experiments (about 1.5 hours)

**Goal:** Following the four experiments listed in §4 M2 of the design doc, deliberately break what Tasks 3-6 built, and record the symptom, cause and fix.

**Files:**
- Modify: `milestones/M2-leave-flow/break-and-fix.md`

- [ ] **Step 1: Pass an invalid `EmployeeId`**

  In the Test pane go through the `Submit Leave Request` topic and deliberately enter a nonexistent employee ID (e.g. `E999`). Observe: does the flow and the Dataverse write still "succeed" (very likely yes, since there's no check that the employee ID exists). This finding is itself worth recording: a successful write doesn't mean valid data; `EmployeeId` is just a free-text field with no foreign key constraint.

- [ ] **Step 2: Make the Dataverse write actually fail**

  Temporarily delete (or rename) the `Type` column of the `LeaveRequest` table and test the full conversation again. Confirm: the failure branch built in Task 6 really triggers, the topic shows the error-code message, and this run is marked red at the `TryWriteLeaveRequest` step in the Power Automate Run history. After testing, add the column back (same name and type as in Task 2) and test the success path again to confirm it's restored.

- [ ] **Step 3: Approval with no response, observe the waiting state**

  Trigger `CancelApprovedLeave` once and don't handle it in the Approvals center yet; observe the flow's run status for a timeboxed 10-15 minutes (Running/Waiting; write down the exact wording), and whether Copilot Studio would hang if this were wired into a conversation. No need to wait for a real timeout (the default Approvals timeout is often measured in "days"); after observing, go to the Approvals center and clear the approval to end the experiment.

- [ ] **Step 4: Leave a flow output empty**

  Temporarily change the `RequestId` output in the success branch of `SubmitLeaveRequest`'s `Respond to Copilot` to an empty string, test again, and see what `{Topic.SubmitLeaveRequestRequestId}` shows in the topic (blank, or a literal like `undefined`). After testing, restore Task 6's normal mapping.

- [ ] **Step 5: Record and commit**

  Write the four experiments as rows in `break-and-fix.md`, same format as M1 (date, what was changed, symptom, cause, fix or conclusion).

```bash
git add milestones/M2-leave-flow/break-and-fix.md
git commit -m "M2: record four break-and-fix experiments on agent flows"
```

---

### Task 8: Notes, coverage table and milestone close-out (about 1 hour)

**Goal:** Same close-out as M1 Task 8: complete the notes, tick the checklist, fill in the coverage table, update the README, commit.

**Files:**
- Modify: `milestones/M2-leave-flow/notes.md`
- Modify: `milestones/M2-leave-flow/checklist.md`
- Modify: `docs/coverage.md`
- Modify: `README.md`

- [ ] **Step 1: Complete "Concepts learned" in notes.md**

  Answer at least these questions, each based on hands-on evidence from Tasks 1-7, not by re-reading docs:
  1. What problem do agent flow input/output parameters solve? How do they relate to topic variables?
  2. What scenarios suit human-in-the-loop (Approvals), and when shouldn't it be used (e.g. scenarios requiring a real-time response)?
  3. What problem does error handling in agent flows (Scope + Configure run after) solve? What happens without it?
  4. Where do you go to monitor agent flows, and is it the same thing as Copilot Studio's Activity pane?
  5. Adaptive card vs a plain Question node: when should you use a card, and when is a simple question-and-answer better?

- [ ] **Step 2: Fill in checklist.md**

  ```markdown
  # M2 checklist

  - [x] LeaveRequest Dataverse table created, fields match the design doc
  - [x] SubmitLeaveRequest flow input/output parameters work end to end, Dataverse write verified
  - [x] Submit Leave Request topic collects details with an adaptive card and calls the flow as a tool
  - [x] Both Approve/Reject paths of CancelApprovedLeave tested
  - [x] SubmitLeaveRequest has an explicit error-handling branch, with one successful and one failed run verified in Power Automate Run history
  - [x] All four deliberate-break experiments done and reverted
  ```

  (If an item isn't finished because the trial expired or for some other reason, leave that line unchecked and have a matching entry in break-and-fix.md.)

- [ ] **Step 3: Fill in coverage.md**

  Mark `x` in the Understand and Built columns for bullets 8, 9, 10, 11, 12, 13, 14, 16, 21, 22 (leave the Explain column empty until the user can explain-back smoothly).

- [ ] **Step 4: Update the README and commit**

  Change "Current milestone" to `M3 Tool integration (not started)`; change the M2 row of the milestone overview table to `Done YYYY-MM-DD`, and put this file's path in the plan column.

```bash
git add -A
git commit -m "Close out M2: leave request agent flow complete, update coverage"
git push origin master
```

---

## Next

When M3 starts and the user says "start M3", Claude writes a separate `docs/superpowers/plans/<date>-m3-tools.md` based on the M3 subsection of section 4 of the design doc.

# M2 Leave request agent flow notes

## What problem this milestone solves

## What I did

### Task 1: preview agent flow concepts

**I picked the wrong learning path once; recording it so I don't repeat it:** the `Automate business processes with workflows and agents in Microsoft Copilot Studio (GitHub Copilot)` (2 hr 45 min, 3 modules) I first saw on the certification page was not the right resource. The "(GitHub Copilot)" in the title refers to the newer GitHub Copilot harness in Copilot Studio (the agent type without Topics recorded in the M1 notes), which uses a different workflow mechanism and docs (the official page labels it "(GitHub Copilot preview)"), and isn't the same thing as the classic harness `HR Assistant Classic` this project uses throughout.

Switched to: **`Use agent flows in Copilot Studio`** (<https://learn.microsoft.com/en-us/training/modules/use-agent-flows>, 13 Units, Intermediate, no GitHub Copilot tag), with chapters covering Create/Build/Design/Manage/Monitor/Call agent flows and two hands-on Exercises. I also read the `Describe agent flows` unit in the `Understand features of Copilot Studio agents` module (5 minutes, conceptual, and its example happens to be "submit a leave request", matching the M2 scenario).

Key points:
- An agent flow is a Power Automate cloud flow embedded in Copilot Studio, made specifically for the agent to call as a tool, for deterministic processes that "must run exactly the same every time". The test for whether to use an agent flow rather than a generative answer is whether the task has hard rules (e.g. calculating commission, submitting a leave request → use a flow; answering policy questions, summarizing documents → generative fits better).
- Trigger with `Run a flow from Copilot` (defines input parameters), return with `Respond to Copilot` (defines output parameters). This pair is designed specifically for "being called by the agent as a function"; ordinary Power Automate triggers (webhook/scheduled/app event) don't have it.
- An agent flow follows the same paradigm as workflow engines like n8n/Zapier (trigger → action → connector, with branching and data transformation); the only difference is the extra "called by an AI agent" interface layer.
- Tool is a broad category, and an agent flow is just one kind (logic you build yourself); MCP server / custom connector / REST API connect to existing external capabilities, not things you write yourself. That maps to exam bullet 8 (M2, build your own) vs bullets 27/28/29 (M3, connect external); easy to mix up, noting it.
- Division of labor between topic and agent flow: the topic handles the conversation (what to ask, when to ask, how to branch on the user's answer), and the agent flow handles the fixed actions executed behind it; data passes between them via explicit input/output parameters, not a shared pool of Topic/Global variables. Only the agent flow has error handling via Scope + Configure run after, and a separate monitoring entry point in Power Automate Run history; topics have neither.

### Task 1 predictions

Recorded first, without looking at later Tasks, and not changed; compared against the results after testing in Task 3/5/6.

1. Can the topic use the output parameters of `SubmitLeaveRequest` directly as variables, or do they need another conversion? Prediction: **they can be used directly as variables**.
2. When the Dataverse write fails, does `Respond to Copilot` automatically pass the failure reason back to the topic by default? Prediction: **yes**.
3. If the Approvals approver never responds, does the conversation on the topic side get stuck waiting, or is there a timeout? Prediction: **there's a timeout**.

### Task 2: build the `LeaveRequest` table

The table is in the `HR-Dev` environment, Schema name `crc6c_LeaveRequest`, Logical name `crc6c_leaverequest`; the `crc6c_` prefix matches M1's `Employee` table, same publisher.

**Gotcha: adding columns inline in the grid doesn't actually save the columns.** The first time, I typed column names inline with the "+" at the top of the grid in the Data view (without going through the full New column form), and those columns turned out to be unsaved drafts; after switching pages they were all gone, and the Columns page had nothing. Later I used the `+ New column` button on the `Columns` tab (which opens a proper form with a Data type dropdown), and that actually created them. **Conclusion: Dataverse columns must be created through the full `+ New column` form; the inline grid route is unreliable.**

**Gotcha: the Primary name column's logical name is locked after creation and doesn't follow a later Display name change.** Instead of creating a separate `RequestId` column, I changed the table's built-in default primary column (Display name originally `New column`) to Display name `RequestId`, Data type `Autonumber`. In effect it's the same as creating a column, but its logical name is still the originally assigned `crc6c_newcolumn`, not the expected `crc6c_requestid`: a Dataverse column's schema/logical name is locked permanently after its first save, and later changes to Display name or Data type don't touch it. **This is something to watch in Task 5: when a Dataverse Filter expression looks up records by `RequestId`, the field name to write is `crc6c_newcolumn`, not `crc6c_requestid`.**

Final state of the 6 columns (Columns page, `Custom columns` view):

| Display name | Logical name | Data type | Notes |
|---|---|---|---|
| RequestId | `crc6c_newcolumn` | Autonumber (`LR-{SEQNUM:00000}`) | Primary name column, Required |
| EmployeeId | `crc6c_employeeid` | Single line of text | |
| Type | `crc6c_type` | Single line of text | |
| StartDate | `crc6c_startdate` | Date only | |
| EndDate | `crc6c_enddate` | Date only | |
| Status | `crc6c_status` | Single line of text | |

Test data: `EmployeeId=E001`, `Type=Annual`, `StartDate=7/10/2026`, `EndDate=12/10/2026`, `Status=Submitted`; after saving, `RequestId` auto-generated `LR-01000` (not the expected `LR-00001`; the starting number isn't 1, most likely the Autonumber default seed or numbers used up by the earlier deleted column drafts; doesn't matter as long as the format is right). I kept this row as comparison data for Task 4.

### Task 3: agent flow `SubmitLeaveRequest`

**The UI wording has changed from what the plan says:** the `Run a flow from Copilot` trigger is now called **"When an agent calls the flow"**; the `Respond to Copilot` action is now called **"Respond to the agent"**. Same function, just renamed. The trigger card also has an extra `Express mode (Preview)` switch, which I left off by default and didn't use.

Input parameters: `EmployeeId` (Text), `Type` (Text), `StartDate` (Date), `EndDate` (Date).

Dataverse `Add a new row` action, Table set to `Leave Requests`, field mapping: `EmployeeId`/`Type`/`StartDate`/`EndDate` take the trigger inputs, `Status` the literal `Submitted`.

**Gotcha, and it overturned one of our Task 2 assumptions: when the primary name column is Autonumber, Power Automate's `Add a new row` action still treats it as a required text box that needs a value, and whatever you enter is stored as is, not overridden by Dataverse's autonumber rule.** How it went: the first time, to get past the "required" check, I casually entered the placeholder `-`, and after saving, that row's `RequestId` really was the literal `-`, not the expected `LR-xxxx`. This shows **autonumber only takes effect when the Create request doesn't include the field at all; once the request carries a value (even a placeholder), Dataverse uses that value directly without overriding it.** Since every flow run would pass the same placeholder, all records' `RequestId` would collide on the same value, and Task 5's exact lookup by `RequestId` would be impossible.

**Simplified handling (deviates from Task 2's original design of "use a real Autonumber", but equivalent in effect, noting it):** instead of trying to trigger the native autonumber, I let the flow compute a unique value with an expression and put it in the `RequestId` field:

```
concat('LR-', formatDateTime(utcNow(), 'yyyyMMddHHmmssfff'))
```

Tested, it generates values like `LR-<timestamp>40` (`LR-` + a timestamp down to milliseconds), unique enough to use as a real ID.

Output parameters: `RequestId` (Text, bound to `body/crc6c_newcolumn` in the result returned by `Add a new row`, confirming the Task 2 gotcha: the internal reference shown in Dynamic content is indeed the logical name `crc6c_newcolumn`), `Status` (Text, literal `Submitted`).

Test: employee ID `E002`, ran successfully, `RequestId` generated `LR-<timestamp>40`, and the Dataverse table gained a row with `EmployeeId=E002`, `Type=Sick`, and `StartDate`/`EndDate`/`Status` all matching what I entered. (The table still has the Task 2 `LR-01000`/E001 row and the `-`/E003 placeholder row from this debugging; the latter two don't affect later Tasks, not cleaning up for now.)

### Task 4: `Submit Leave Request` topic: adaptive card and tool call

Created the topic `Submit Leave Request`, description as written in the plan, mutually exclusive with `Leave Balance`/`Policy QA`.

Structure: Condition checks `Global.EmployeeID is Blank` → if empty, a Question asks for the employee ID and stores it back in `Global.EmployeeID`; if not empty, skip it → the two branches merge into the Adaptive Card node.

**I wrote the Adaptive Card directly in JSON instead of dragging controls on the left.** Pasting the whole JSON straight into the Card payload editor (`Input.ChoiceSet` id=`leaveType`, two `Input.Date` id=`startDate`/`endDate`, `Action.Submit`) is faster than dragging controls one by one and setting each id. After saving, the node automatically detected 4 Outputs (`actionSubmitId`/`leaveType`/`startDate`/`endDate`), **each of which can be mapped independently to its own variable, not packed into one JSON**, more convenient than the plan expected. I created Topic variables `LeaveType` (string), `StartDate` (date), `EndDate` (date); `actionSubmitId` can be ignored.

**Gotcha: the Adaptive Card's Date-type variables can't be passed directly to the tool call's input parameters.** After adding `SubmitLeaveRequest` via `Add a tool`, the `StartDate`/`EndDate` input boxes showed the required type as `(String)`, and binding `Topic.StartDate`/`Topic.EndDate` (type Date) directly gave the error `Input variable is of incorrect type: Date`. Even though in Task 3 this flow's trigger input parameters are clearly defined as Date, the tool call's mapping UI treats them as String. Same kind of "surface type doesn't match the actually required type" situation as the Task 3 Autonumber gotcha. **Fix: click the `...` next to the input box to switch to Power Fx formula mode, and change to `Text(StartDate, "yyyy-mm-dd")` / `Text(EndDate, "yyyy-mm-dd")`; the error goes away.**

Parameter mapping: `EmployeeId` ← `Global.EmployeeID`, `Type` ← `Topic.LeaveType`, `StartDate` ← `Text(Topic.StartDate, "yyyy-mm-dd")`, `EndDate` ← `Text(Topic.EndDate, "yyyy-mm-dd")`.

**The output variable names the tool call auto-generated are `Topic.RequestId`/`Topic.Status` (plain names, no prefix like `SubmitLeaveRequestRequestId`), unlike the naming the plan expected**, bound to `requestid`/`status` in the flow's returned result.

Confirmation message:

```
Leave request submitted.
Request number: {Topic.RequestId}
Status: {Topic.Status}
```

(Variables inserted from the dropdown chips, not typed by hand.)

Test: employee ID `E003`, `Leave type=Annual`, `Start date=10/26/2026`, `End date=10/28/2026`. Result:
1. The Adaptive Card rendered normally and could be submitted;
2. The final message showed `Request number: LR-<timestamp>06`, `Status: Submitted`, exactly matching the new E003 row in the Dataverse `LeaveRequest` table (`Type=Annual`, dates match, `Status=Submitted`);
3. The Activity/Rationale panel showed the reasoning for this tool call ("Confirm leave request submission and provide request ID to user" and 3 entries in total).

(The table now has 4 rows: Task 2's `LR-01000`/E001, the `-`/E003 placeholder row left from Task 3 debugging, Task 3's test `LR-<timestamp>40`/E002, and this test's `LR-<timestamp>06`/E003. Not cleaning up for now; doesn't affect later Tasks.)

### Task 5: human-in-the-loop `CancelApprovedLeave`

**Gotcha, another display bug: the Tools tab of `HR Assistant Classic` intermittently shows an empty state ("Create your first tool"), even though the flows created earlier are still there.** This time it wasn't only `SubmitLeaveRequest`; the newly created `CancelApprovedLeave` itself hit it too (after Publish, leaving and coming back, the Tools list was empty). Checking at https://make.powerautomate.com → `HR-Dev` environment → **My flows**, both times the flows themselves were still there and working normally, confirming it's purely a rendering/sync problem on Copilot Studio's Tools list page, not data loss. Refreshing/waiting doesn't necessarily fix it; confirming directly at the Power Automate platform level is more reliable.

**Trigger same as Task 3: shows `When an agent calls the flow` when created, and after `Save draft` the designer shows `manual` again**; function unaffected, and this confirmed the naming fallback behavior once more.

When building the `Condition` control, clicking `+ New step` doesn't bring up the category picker directly; first an "Add an action" placeholder card appears, and only after opening it does the search panel with the **Built-in tools → Control** category appear; `Condition` is under that category.

Approval step: `Approval type = Approve/Reject - Everyone must approve`, `Title` inserts the trigger's `RequestId` via Dynamic content, `Assigned to` is my own test account (per the simplified convention in Global Constraints).

**The core gotcha, and the longest one: Dataverse's `Row ID` field wants the record's system GUID (the real primary key), not the text value of the Primary Name Column (`RequestId`/`crc6c_newcolumn`), and not the `OData Id` token either (that's the full entity URL, not a bare GUID; passing it in makes the connector build a wrong doubled path and return 404 File not found, which shows up as an HTML error page rather than a Dataverse JSON error, easy to misread as some other problem).**

The right way:
1. First use `List rows` (Filter rows: `crc6c_newcolumn eq '` + the dynamic content of the trigger's `RequestId` + `'`; note there must be quotes on both sides, and when concatenating by hand it's easy to miss the opening quote) to find the record
2. Selecting any field from `List rows` automatically inserts a `For each` loop between it and the following action (standard Power Automate behavior: binding an array-type output to a single-value field auto-wraps it in a loop)
3. Set the `Row ID` of `Update a row` to the expression `items('For_each')?['crc6c_leaverequestid']`. The naming rule for a Dataverse table's real primary key field is `<entity logical name>id`, in this case `crc6c_leaverequestid` (the table's logical name `crc6c_leaverequest` plus `id`), a completely different field from the Primary Name Column's logical name `crc6c_newcolumn` noted in Task 2

**Entering the expression is itself a gotcha: you must use the right entry point, or it's treated as literal text.** Typing straight into the main `Row ID` input box stores it as a string literal (the expression doesn't run at all; Dataverse receives a string that looks like code and returns 404); typing in the search box of the Dynamic content panel doesn't work either (that's for searching existing field names, and finds nothing); the right path is to click the **`fx`** icon next to the input box to open the **Expression** panel, type the expression in **the big text box at the top**, and click **Add/Update** to insert it; once inserted it shows as a separate purple `fx` token. Along the way I also accidentally combined the two Dynamic content chips `Current item` (the whole loop item object) and `crc6c_newcolumn` into the same box, which serializes the whole object to a JSON string and returns `BadRequest`.

I also misconfigured the `Condition` itself once by mistake: the value compared with `Outcome` was wrongly set to `Submitted` (that's the Dataverse record's own status field, a completely different thing from the Approval's `Outcome` return value, which is only ever `Approve`/`Reject`); changing it to `Approve` was correct.

For `Respond to the agent`, instead of the plan's original design of one node in each of the True/False branches, I used a **simpler approach**: one `Respond to the agent` at the merge point, with the `Status` output decided dynamically by an expression:
```
if(equals(outputs('Start_and_wait_for_an_approval')?['body/outcome'], 'Approve'), 'Cancelled', 'Rejected')
```
Equivalent in effect, and only needs configuring once.

**Against Task 1 prediction 3:** while waiting for approval, the run status on the Power Automate side clearly showed `Waiting` (not Running, a dedicated status value), and after observing for nearly 2 hours it neither timed out automatically nor errored. The prediction "there's a timeout" hasn't been confirmed so far (at least not a short-term timeout; the default timeout is most likely measured in days; the exact value left for the Task 7 experiment to look at more closely).

Both paths passed testing:
- **Approve**: `RequestId=LR-<timestamp>40` (E002); after clicking Approve on the Approval, `Condition` evaluated True, `Update a row` succeeded (`recordId` resolved to the correct GUID `<guid>`), and that row's `Status` in the Dataverse table became `Cancelled`.
- **Reject**: `RequestId=LR-<timestamp>06` (E003); after clicking Reject on the Approval, `Condition` evaluated False, `Update a row` was skipped, and that row's `Status` in the table stayed `Submitted`.

### Task 6: `SubmitLeaveRequest` error handling and Monitor agent flows

**Scope structure:** put Task 3's `Add a new row` inside a `Scope`, renamed `TryWriteLeaveRequest`; right after it added another `Scope` `HandleWriteFailure`, containing a `Compose` with the literal `WRITE_FAILED`. The four options actually shown in the **Configure run after** panel of `HandleWriteFailure` are, verbatim, **Is successful / Has failed / Is skipped / Has timed out** (matching the design doc's wording); untick `Is successful` and tick the other three.

**Gotcha: the Configure run after setting didn't take effect once, and I traced it to the setting itself being quietly reset.** The first success-path test after publishing, Run history showed both the `HandleWriteFailure`/`Compose` nodes with green check marks (they really ran; `Compose` Inputs/Outputs were both `WRITE_FAILED`), not Skipped as expected. Reopening the Configure run after panel of `HandleWriteFailure`, the actual state had become `Is successful` ticked and the other three all unticked, exactly the opposite of what Step 2 set. Cause unknown (most likely some save/publish along the way reset it to the default). After changing it back to `Is successful` unticked and the other three ticked and Publishing again, I retested the success path, and Run history confirmed `HandleWriteFailure` correctly showed **Skipped** (a "Skipped" label with a grey/red dashed arrow, clearly not the same icon as the green check mark for "ran successfully"; easy to miss at first). **Lesson: after changing Configure run after, don't just trust the screenshot at the time; after publishing, always run the success path once and check the status in Run history, because this setting can be quietly reset with no indication in the UI.**

**Another gotcha: leaving an output field of `Respond to the agent` blank doesn't mean returning an empty string; the whole key disappears from the response.** The `ErrorCode` output of the True branch's `Respond to the agent` was initially left blank (nothing typed); after Publish, the topic-side test errored: `The output parameter with name 'errorcode' on flow 'SubmitLeaveRequest' is missing from the response data`. Copilot Studio requires every output the topic has declared to actually appear in the response JSON; even if the value is an empty string it has to be given explicitly. Fix: fill the `ErrorCode` field with `''` (two single quotes, an empty-string literal) via the `fx` expression panel; leaving it blank doesn't work. This is the third time in this project I've hit the "blank/looks equivalent in the UI, but not equivalent at runtime" kind of gotcha (the previous two were Task 3's Autonumber vs. Text type and Task 4's Date vs. String type).

**Third time hitting the same kind of UI display/sync bug:** after adding the `errorcode` output to the tool call Action node, the topic side at first couldn't find any existing variable in the variable picker (searching `topic` or an empty search found nothing), and the `Variables` panel at one point showed `Topic (0)`, with even the `RequestId`/`Status`/`LeaveType` etc. variables created in Task 4 "gone"; after refreshing the browser page everything came back, confirming it was a display/cache problem, not real deletion (the same pattern as Task 5's blank Tools tab and this Task's Configure run after display not matching reality: "the Copilot Studio designer state occasionally doesn't match the actual backend state; refreshing or checking on the Power Automate platform resolves it", which has now appeared three times).

**Fourth time hitting a transient Bad Gateway error:** the test pane reported `BadGateway`/`NoResponse`, same as the time in Task 5; checking Power Automate Run history showed that run had actually succeeded (Run history and Test pane errors aren't necessarily in sync; Run history is the source of truth).

**Final success-path verification:** `RequestId=LR-<timestamp>24`, `Status: Submitted`, `ErrorCode` empty; the topic side went to the confirmation message branch, and in Run history `TryWriteLeaveRequest`/`Condition`/`Respond to the agent` (True branch) were all green successes, with `HandleWriteFailure` correctly showing Skipped. The failure path (`HandleWriteFailure` really running, the topic side going to the error message branch) is left for Task 7's experiment of deliberately breaking a Dataverse column to trigger and verify.

**Against Task 1 prediction 2:** when the Dataverse write fails, `Respond to Copilot`/`Respond to the agent` does **not** automatically pass the failure reason back to the topic. The prediction holds: you have to capture the failure state yourself with `Scope` + `Configure run after`, map it explicitly to an `ErrorCode` output, and have the topic side branch explicitly on that variable; not a single step in the chain is automatic.

## Concepts learned (each answers: what problem it solves, and when not to use it)

**1. What problem do an agent flow's input/output parameters solve? How do they relate to topic variables?**

The problem solved: the topic handles the conversation (what to ask, when to ask, how to branch on the answer), but the conversation layer isn't a good place for "deterministic execution" logic (writing to a database, running an approval); `When an agent calls the flow` / `Respond to the agent`, a trigger/response pair designed specifically for "being called by the agent as a function", define a strict input/output contract, letting the topic call the flow as a black-box function without caring how it's implemented inside.

Relationship with topic variables: **not a shared variable pool, but explicit two-way mapping.** When calling the tool, the topic maps its own variables (`Global.EmployeeID`, `Topic.LeaveType` etc.) one by one to the flow's input parameters; after the flow runs, each output parameter it declares is received by a new Topic variable that Copilot Studio auto-generates (tested in Task 4, they're simply called `Topic.RequestId`/`Topic.Status`, without the prefix the plan expected). There are two implicit constraints in between that I tripped on: the types must match (Task 4's Date→String gotcha), and on the flow side, even if you only want to return an empty string, you must assign it explicitly (blank = key disappears, hit repeatedly in Task 6/7).

**2. What scenarios does human-in-the-loop (Approvals) suit, and when shouldn't it be used?**

Suits: actions that need human judgment and can't be decided by hard rules (whether to approve cancelling an already approved leave), where the conversation doesn't need the result in real time. Approvals' `Start and wait for an approval` really parks the flow in the `Waiting` state until someone handles it; it's not an async callback, and in testing it waited nearly 2 hours without timing out automatically (verified in both Task 5/7; the default timeout is most likely measured in days).

Shouldn't use: scenarios that require a result within the current conversation turn. If you put such a flow straight into a continuous conversation topic, the user is left hanging there waiting, a poor experience. That's also why this project's architecture deliberately splits out `CancelApprovedLeave`, doesn't force it into a full topic conversation flow, and instead triggers it separately from the Test pane to verify it (the reason stated in the design doc).

**3. What problem does error handling in an agent flow (Scope + Configure run after) solve? What happens without it?**

The problem solved: by default, `Respond to the agent` does **not** automatically pass the failure reason of an earlier action (e.g. the Dataverse write) back to the topic; that's the conclusion where Task 1 prediction 2 was disproved and Task 6 confirmed it by testing. A `Scope` wraps the risky action, another `Scope` explicitly captures the failure branch via `Configure run after` (tick Has failed / Is skipped / Has timed out, untick Is successful), and then a `Condition` decides which `Respond to the agent` to take; only this way can a controlled `ErrorCode` be passed back to the topic.

What happens without it: the topic has no idea the backend write failed. Either the user gets a baffling platform error (`BadGateway`, "output parameter missing"), or worse, the topic shows a confirmation message like "request submitted" when nothing was actually saved in the database.

There are also two hidden gotchas this item only surfaced in Task 7, adding them here: the `Configure run after` setting itself can be quietly reset, so after publishing you must verify with a real test + a look at Run history, not just trust the screenshot at the time; and nodes like `Condition` that come right after a `Scope` handled with `Configure run after` also only accept "previous step succeeded" in their own default runAfter. If the previous step is supposed to be skipped on the success path (e.g. `HandleWriteFailure`), `Condition` itself must also explicitly tick all four runAfter boxes, or the whole response chain gets mysteriously skipped on the success path.

**4. Where do you look to monitor agent flows, and is it the same thing as Copilot Studio's Activity panel?**

Not the same thing. **The real place to monitor agent flows is Power Automate's own Run history** (make.powerautomate.com → My flows → the flow → Run history), which shows each action's real status (succeeded/failed/Skipped), its concrete inputs and outputs, and duration; it was the only reliable source of "what actually happened" throughout M2. The Activity/Rationale panel in the Copilot Studio Test pane is a reasoning summary the orchestrator generates itself about "why it called this topic/tool"; it's another layer, more "intent explanation" than "execution fact". The two are often out of sync: the transient `BadGateway`/`NoResponse` errors reported in the Test pane appeared at least 5 times during M2, and each time I checked Run history, most of the time the flow had actually run successfully; but there were also real failures reflected in both the Test pane and Run history (the full schema deadlock at the end of Task 7 Step 4). Conclusion: **whenever you need to judge whether a flow actually succeeded, always go by Run history; Test pane errors are only clues, not conclusions.**

**5. Adaptive card vs a plain Question node: when should you use a card, and when is a simple Q&A better?**

An adaptive card suits: collecting several related, structured fields at once (leave type + start date + end date), compressing what would take three rounds of back-and-forth into one submission. Task 4 testing found it even more convenient than expected: the return values of the different input types in the card (`Input.ChoiceSet`/`Input.Date`) can each be bound independently to their own Topic variables, with no need to unpack a bundled JSON yourself.

A simple Question node suits: scenarios where only one piece of information is needed (e.g. employee ID), or where the next question depends on this step's answer (needs to branch on the answer). A card is submitted all at once, so it can't branch dynamically on what's being filled in before submission; and a Question node's plain conversational Q&A feels more natural than form UX for things like "confirming identity", without making the user feel they're filling in an unnecessary form.

## Not yet understood, left for later

- Why the output fields of `SubmitLeaveRequest`'s `Respond to the agent` nodes in the True/False branches must keep exactly the same schema (field names, types): the UI doesn't flag it while editing, only reporting `ActionSchemaInvalid` at Publish, and I didn't figure out the real boundary of this restriction (whether it only looks at field names and declared types, or also counts how the value is sourced: literal/fx/dynamic content).
- The schema deadlock I got stuck on in Task 7 Step 4: the "root cause is the `crc6c_newcolumn` ghost field" recorded that day was a misjudgment and has been corrected (see the next item); the real root cause was never confirmed. All I confirmed is that "deleting and rebuilding both `Respond to the agent` nodes" solves it; what kind of inconsistent state accumulated inside the nodes, and whether there's a lighter-weight fix, is left to look into when I have time.

**Correction (2026-10-12, the day M2 ended):** above I once recorded that `crc6c_newcolumn`, bound to the True branch's `RequestId`, was "a ghost field that doesn't exist in Dataverse"; that judgment was wrong. `crc6c_newcolumn` has been the real logical name of the `RequestId` column since the table was built in Task 2 (after renaming and retyping the primary column, the logical name was locked at the original `crc6c_newcolumn`; Task 3-6 used this binding normally throughout, and it was correct); searching Dataverse for "new" at the time returned "not found" because that dialog is "Show existing column", specifically for finding "columns that exist but aren't shown in the grid", and this column was already shown in the grid, so it wouldn't appear in that search's results; I misread "wrong search scope" as "the field doesn't exist". In the end, deleting and rebuilding both `Respond to the agent` nodes fixed the publish failure, the success path has been re-verified, and the details are in the update to the corresponding row in `break-and-fix.md`.

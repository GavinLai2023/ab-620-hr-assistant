# M3 Tool integration notes

## What problem this milestone solves

## What I did

### Task 1: Preview and predictions (2026-10-15, actually done after all the experiments)

**Order deviation:** Task 1 should have come first, but because the Copilot Studio trial expires on 10-16, I did the browser-dependent Tasks 2–10 first. One consequence: **the three predictions in the plan can no longer be "blind guesses"**; the answers have all been tested hands-on, so writing them now would just be hindsight. So instead of predictions, I **compare the official docs against the hands-on results** to see whether what the docs say differs from what we saw. The "compare against predictions" in Task 9 Step 4 is dropped as well.

**The three prediction questions, with hands-on results written directly:**

| Question | Tested hands-on |
|---|---|
| 1. Do tools added as a REST tool and as a custom connector behave differently in orchestration? | At the agent level **no difference is visible**: the same "Connect to Employee API" popup, the same Credentials options, errors both say "The connector 'Employee API'" (Task 5, Task 10). A REST tool is also a connector underneath. Never had the two compete head-to-head on the same question (both leave tools are Trigger = None) |
| 2. When an MCP tool and a REST tool have overlapping descriptions, which does the orchestrator pick? | **Couldn't test it**: both REST leave tools have Trigger = None, so the orchestrator can't see them (Task 10 Step 3). What I observed was between the **MCP tool and a topic**: same configuration, Task 7 picked the topic, Task 10 Step 1 picked MCP, **not stable** |
| 3. Does Computer use work in HR-Dev (Developer environment + Trial)? | The entry point and configuration both work, **enabling the Hosted browser connection failed**, didn't get it running (Task 9) |

**Comparison with the official docs (checked 2026-10-15):**

*Computer use* ([computer-use](https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use), [configure-where-computer-use-runs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs), [troubleshooting-computer-use](https://learn.microsoft.com/en-us/microsoft-copilot-studio/troubleshooting-computer-use)):
- Only usable on agents with **generative orchestration** turned on; **can't be called from a topic**
- **Billing: 5 Copilot Credits per step**, 15 per step with a premium model (Claude Opus 4.6). Filling in a 4-step form = 20 credits
- Available models: OpenAI CUA, Claude Sonnet 4.5 (GA), Claude Sonnet 4.6, Claude Opus 4.6 (Experimental). **Using Anthropic models requires an admin to turn on external models in the environment**
- The Hosted browser is provided by **Windows 365 for Agents**, not Entra joined, not managed by Intune, **not recommended for production**; throttled based on demand; **each user can have only one session at a time**, up to 3 hours per session
- **Official warning on Maker-provided credentials**: once the agent is shared, anyone using it operates on that machine with the author's permissions. This is what the tooltip shown as `...endUserAuthWarningTooltip` in Task 9 was meant to say
- Access control only blocks "operating on sites not in the allow list", **it doesn't block opening them**: with only microsoft.com in the allow list, the model can still open Bing via the Edge search bar; it's just that operations after opening fail
- The error codes include `FeatureDisabled` (an admin turned off computer use in the admin center)
- **The docs don't give an answer that matches why ours wouldn't run.** The errors in the docs are all from the execution stage, and we got stuck at the connection stage. There are three possible causes, **none verified**: the trial environment isn't eligible for hosted machines; external models aren't turned on (the default model is Claude); computer use is turned off in the admin center. Also, a search result summary said "only available in environments in the United States region", but I couldn't find that sentence in the body text, so I don't trust it

*MCP* ([mcp-add-existing-server-to-agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent)):
- Three auth options: **None / API key / OAuth 2.0**. An API key can go in a header or a query parameter, **provided by the agent's user**. OAuth 2.0 has three configurations: Dynamic discovery (server supports DCR + discovery), Dynamic (supports DCR but no discovery), Manual
- Matches Task 7: the entry point is Tools → Add a tool → New tool → Model Context Protocol, and the wizard has two parts: server info + authentication

**Not done:** the learning path from plan Step 1 (Integrate agents with enterprise systems, 3 hr 18 min) and the three resources on OpenAPI / Dev Tunnels / MCP from Step 2 weren't read through this time. The parts the experiments needed I looked up as I went. During pre-exam review I can go through the learning path to see if it covers anything this milestone didn't touch.

### Task 2: Mock Employee API (2026-10-12)

`src/employee-api`: native Node.js `http`, no third-party dependencies, reads `data/employees.csv` (the same data as the Dataverse `Employee` table).

| Endpoint | operationId | Notes |
|---|---|---|
| `GET /employees?department=` | `listEmployeesByDepartment` | Returns 400 if `department` is missing |
| `GET /employees/{id}` | `getEmployeeById` | Returns 404 if not found |
| `GET /employees/{id}/leave` | `getEmployeeLeaveBalance` | Returns only the two balance fields |

- Every request must carry the header `x-api-key`, equal to the environment variable `EMPLOYEE_API_KEY` (default `dev-local-key`), otherwise 401.
- `FAIL_MODE=500` makes every request return 500, `FAIL_MODE=timeout` makes requests never respond; kept for Task 10.
- Start: `cd src/employee-api && npm start`, listens on `:3000`. Test: `npm test`, all 6 `node:test` cases pass.
- `openapi.yaml` passes Redocly lint; `servers.url` is still a placeholder, to change in Task 3 once I have the Dev Tunnel address.
- One deviation from the plan: the CSV is split into lines with `/\r?\n/`, not `'\n'`. The repo has `core.autocrlf` on, so checking out the CSV on another machine may turn it into CRLF; then the last header column would become `SickLeaveBalance\r` and every sick leave balance would become `NaN`.

### Task 3: Dev Tunnels (2026-10-12)

| Item | Value |
|---|---|
| Tunnel ID | `hr-employee-api.aue01` (aue01 = Australia East cluster) |
| Port | 3000 |
| Public URL | the address of tunnel `hr-employee-api` port 3000 (already written into `servers.url` in `openapi.yaml`) |
| Access control | `+Anonymous [connect]` |
| Sign-in account | `admin account` (Microsoft) |
| Tunnel expiry | 30 days |

- The trade-off of `--allow-anonymous`: no auth at the tunnel layer, anyone with the URL can connect; auth is left to the application-layer `x-api-key`. Copilot Studio sends requests from the cloud and can't sign in to a Dev Tunnels account for us, so the tunnel layer has to be anonymous. The cost is that once the URL leaks, the API key is the only door left.
- Verification: correct key returns 200 and Alice Chen's record; wrong key returns 401; with a browser User-Agent it still returns JSON directly, not blocked by the Dev Tunnels anti-phishing interstitial page.
- **Restore after every boot**: open two terminals and run `cd src/employee-api && npm start` and `devtunnel host hr-employee-api` respectively. No need to `create` again, the URL stays the same. If the machine shuts down, sleeps or loses network, the tunnel drops and the agent's tool calls fail.
- devtunnel is installed at `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Microsoft.devtunnel_...\devtunnel.exe`. After installing, reopen the terminal before the `devtunnel` command works directly.
- The Inspect page (the `-inspect` version of the tunnel address) shows every request going through the tunnel. Useful in Task 4/5 for debugging the request headers the agent sends.

#### Sign-in gotcha (identity material, kept for Task 9)

- Running `devtunnel user login` from the Claude Code background: it reported `A window handle must be configured` and fell back automatically to the **device code flow**. Username and password both verified in the browser, but at the end it showed "You don't have access to this / Your sign-in was successful but you don't have permission to access this resource".
- Running the same command in a normal PowerShell window instead: it used Windows' built-in WAM (Web Account Manager) interactive sign-in and succeeded directly.
- Inference (not confirmed by an error code): the tenant's Conditional Access blocked the device code flow. Microsoft has been pushing this kind of policy to tenants by default in recent years, because device code is a common phishing technique. The admin account was blocked too, because CA governs "how you sign in", not "who you are".
- Exam takeaway: same person, same app, switch the authentication flow and the result can go from allowed to blocked. When planning an agent's identity strategy, don't just think about "which account", also think about "which sign-in flow", and whether tenant policy will block that flow.

### Task 4: REST API tool (2026-10-14)

**Entry point:** `HR Assistant Classic` → **Tools** → **+ Add a tool** → **+ New tool** → **REST API** → upload `openapi.yaml`. OpenAPI **3.0.3 is accepted directly**, no need to convert to Swagger 2.0.

**The wizard's 8 steps:** Upload specification → API plugin details → Authentication → Select Tools → (per operation) Configure tool → Select tool parameters → Review → Publish.

| Step | What actually happened |
|---|---|
| API plugin details | Tool name `Employee API` + overall description (required) + Solution (left empty, one is created automatically; tidy up in M6) |
| Authentication | Three options: **None (default)**, API key, OAuth 2.0. **Not preselected from the yaml's `securitySchemes: apiKey`**, so it has to be configured again by hand; clicking Next all the way with the defaults builds a tool without the key, and every call gets 401. API key needs a Parameter label (the hint text shown when creating a connection), Parameter name `x-api-key`, location Header. **This page only defines where the key goes, no value is entered** |
| Select Tools | Lists the three operations, **the display name uses `summary`, not `operationId`**. It's not tick boxes: click one, configure it, go back to the list, click the next |
| Configure tool | Tool name ← `summary`, Tool description ← `description`, word for word. The subtitle calls it a "connector action" |
| Select tool parameters | Every input and output requires a description (required). The parameters and response fields in my yaml **had no descriptions**, so I had to fill in 10 by hand. Added them to `openapi.yaml` afterwards, so Task 5 using the same file picks them up automatically |
| Publish | "You can now create a connection for your tool. If more than one operations were added you will need to select the operation you want to use in the connection." |

**Adding to the agent (one operation at a time):** Add a tool → search `Employee` → click the operation → Connection choose **Not connected → create new**, popup "Connect to Employee API" (shows me as owner) → enter API Key `dev-local-key` → Create → **Add and configure**. The second and third operations reuse the same connection directly, no need to enter the key again.

In the search results, `Employee API` sits alongside ready-made connectors like UKG Pro HCM and HR Cloud with the same kind of card. **Conclusion: adding a tool the REST API way is essentially building a custom connector in the background**; the two paths Task 5 compares are the same thing underneath, just different entry points.

**Tool details page (dense with exam points):**

| Setting | Options | My choice and why |
|---|---|---|
| When this tool may be used | Agent may use this tool at any time / Only when referenced by topics or agents | The former. Task 8 will change it to the latter |
| Ask the end user before running | No / Yes… | No. Read-only queries don't need confirmation; only operations that change data should be Yes |
| **Credentials to use** | **End user credentials (default)** / Maker-provided credentials | **Changed to Maker-provided.** End user = each user creates a connection with their own credentials, suited to OAuth and scenarios where each person has different data permissions; making every user enter a shared API key makes no sense |
| Inputs → Fill using | Dynamically fill with AI (default) / others | Default. AI extracts `id` from the conversation |
| Completion → After running | Don't respond (default) / … | Default. The tool doesn't reply directly, the agent composes the answer |
| Outputs available to the agent and other tools | All | Default |

**Test results:**

| Question | Component used | Result |
|---|---|---|
| `How much leave balance does E002 have left?` | Get one employee's current leave balances, `id=E002` extracted from the question by AI | First time: tunnel down, `ConnectorTimeoutError` (see break-and-fix). After fixing, 1.04s, 14/8, correct; but **answered in English** |
| After turning this tool off, asked `What is E002's annual leave balance?` | M1's `Leave Balance` topic | See the comparison below |
| `Who is in the Engineering department?` | List employees in a department, `department=Engineering` | 8 people, exactly matching the CSV; **this time answered in Chinese**. The array output shows in Outputs as a single `Response (Table)`, fields not expanded |

**A topic and a tool competing for the same intent (the core pitfall of generative orchestration):**

M1's `Leave Balance` topic (description: "Use this topic when the user asks about their leave balance … Requires the user's employee ID to look up the record.") and the new tool both claim to answer "leave balance". In generative mode topics and tools are **peer candidates**; topics have no priority. With the tool on, the orchestrator picked the tool; only after turning the tool off did it go to the topic.

Comparison of the two paths on the same question:

| | Tool path | Topic path |
|---|---|---|
| The E002 in the question | AI fills it straight into `id` | **Not used**, the Question node asked again "Please enter your employee ID?" |
| Conversation turns | 1 | 2 |
| Output | One answer | `AL: 14 SL: 8` **printed twice** (the topic ran twice, 22.75s + 0.36s, which is the "topic runs again after it finishes" logged in M1 Task 5) + the orchestrator summarised once more, three copies in total |

Why it picked the tool can only be guessed (Activity just says "determined that invoking the tool was required", no reason given): first, the question already included the employee ID, so the tool could finish in one step; second, the "they or someone else" in the tool description fits "look up a specific employee ID" better.

The answer language is unstable (once English, once Chinese), which shows there's no fixed rule; it's influenced by what the tool returns. For stability, add "answer in the user's language" to the agent instructions.

**M2's two agent flows aren't in the Tools list**: still missing after refresh. The M2 notes logged three display bugs of this kind; this is the fourth (or tools added from a topic are shown differently in the list). Not checked further; when changing the topic in Task 8, also check whether the call node in the `Submit Leave Request` topic still works.

**Difference between M2's agent flow and M3's REST API tool (discussed along the way during Task 4):** M2 is logic I built myself in Power Automate, called explicitly from a topic with parameters bound by hand; M3 connects an existing external API, Copilot Studio only knows "how to call it", and it hangs at the agent level for the orchestrator to pick on its own, with AI filling the parameters. Corresponding exam points: #8/#14 vs #29.

### Task 5: Custom connector (2026-10-14)

**First looked at the connector Task 4 built in the background.** Entry point: make.powerapps.com → HR-Dev → left side **More → Discover all → Data → Custom connectors** (pinned to the sidebar). Be careful not to go to **Connections** by mistake; they're two different layers:

| | What it is | Example |
|---|---|---|
| **Connector** | The API's definition: which operations, parameters, auth method | `Employee API`, `EmployeeApiConnector` |
| **Connection** | The credentials saved when using a connector, has an owner | The one built in Task 4, Owner: the maker, holding `dev-local-key` |

Task 4's `Employee API` has the full five tabs General / Security / Definition / Code / Test, exactly like one built by hand. Opening the **Swagger editor** shows `swagger: '2.0'`: **I uploaded 3.0, and Copilot Studio converted it to 2.0 automatically in the background**, because connectors store only 2.0 internally.

**Creating `EmployeeApiConnector` by hand:** Custom connectors → **+ New custom connector → Import an OpenAPI file** → upload `openapi.yaml`.

- **Gotcha: with Connector name set to `3.0`, clicking Continue does nothing, no error.** After renaming, the same yaml imported immediately, so it was an invalid name (maybe because it starts with a digit or contains a dot), not a file format problem. **This Power Apps entry point also accepts OpenAPI 3.0**; I had thought it only took 2.0, and I was wrong. I first created it under the name `yaml`, then renamed it to `EmployeeApiConnector`.
- **Security preselected API Key automatically**; `x-api-key` / Header were both read from the yaml's `securitySchemes`. Task 4's Copilot Studio wizard defaulted to None and didn't read that section.
- There are **four** Authentication types: No authentication / Basic authentication / API Key / OAuth 2.0. One more than the Copilot Studio wizard: **Basic**.
- **Test tab:** + New connection → enter `dev-local-key` → select the connection → `getEmployeeById`, `id=E003` → **200**, Carla Mendes / Sales / E010 / 9 / 10, correct.
- **Schema validation warning**: `AnnualLeaveBalance`/`SickLeaveBalance` "type mismatch, Expected: integer undefined, Actual: integer int32". The yaml only had `type: integer` without `format`, and it inferred int32 from the real response. Doesn't affect use; added `format: int32` to `openapi.yaml`. This "validate the schema against a real response" feature isn't in the Copilot Studio wizard.

**Adding to the agent:** Add a tool → search `EmployeeApiConnector` → click **Get one employee's current leave balances** → Connection **shows EmployeeApiConnector ✅ directly, no need to re-enter the key**. A connection created on the Power Apps Test tab can be reused directly in Copilot Studio. **Conclusion: a connection is an environment-level resource, not owned by any one app.** This popup is exactly the same as Task 4's; at the agent level, tools built by the two paths are no longer distinguishable. Credentials changed to Maker-provided as well.

**Test:** First turned off Task 4's tool with the same name, asked `How many days of leave does E003 have left?` → called the new tool, `id=E003`, 1.62s, 9/10, correct (answered in English again). **The same-named tool was automatically renamed "Get one employee's current leave balances 1"**, with a suffix 1 added to tell them apart. The agent now has two tools with identical functions and identical descriptions, which is exactly the "orchestration conflict" that Task 10's third experiment is meant to study.

**What the custom connector path has beyond Task 4:**

| | Task 4 (Copilot Studio → REST API) | Task 5 (Power Apps → Custom connector) |
|---|---|---|
| Underlying artifact | custom connector (built automatically, converted to 2.0 automatically) | custom connector |
| Auth preselection | Doesn't read `securitySchemes`, defaults to None | Reads `securitySchemes`, preselects API Key automatically |
| Auth options | None / API key / OAuth 2.0 | Plus Basic |
| Parameter descriptions | Required; if the yaml doesn't have them you fill them by hand | Not enforced |
| What can be changed | Name, description, parameter descriptions | Plus Visibility (none/advanced/internal/important), Policies (rewrite requests and responses without changing API code), Code (custom C# code), on-premises data gateway |
| Testing | Only indirectly, in the agent's Test pane | The Test tab calls operations directly, shows the raw request/response, and does schema validation |
| Who can use it | Same for both: Copilot Studio, Power Automate and Power Apps in the same environment | Same as left |
| Suited to | Quickly connecting one API to one agent | Reuse across several apps, fine-grained control, or an API on an internal network |

**"Connect via on-premises data gateway" on the General page**: the proper approach when the API is on the company's internal network and can't be exposed to the internet. Dev Tunnels is just a stopgap for development. This is an exam point under #1 Plan integration with enterprise systems.

### Task 6: Send HTTP request node (2026-10-15)

New topic `Department Lookup`, not via a tool; a node in the topic calls `GET /employees?department=` directly.

**Final topic structure:**

```
Trigger (The agent chooses)
  Input: DeptQuery (description: "The department name the user wants to look up, such as Engineering, HR, Sales or Finance.")
  Output: DeptMembers ("Comma-separated names of the employees in the department.")
→ HTTP Request: GET "<tunnel hr-employee-api port 3000>/employees?department=" & Topic.DeptQuery
     Header x-api-key: dev-local-key; Response data type = From sample data; saved to Topic.DeptResponse (table)
→ Set variable value: Topic.DeptMembers = Concat(Topic.DeptResponse, Name, ", ")
→ Message: Employees in this department: {DeptMembers}
```

Before testing, turned off Task 4's `List employees in a department` tool (it's the only tool that looks up by department; Task 5's connector only added the leave balance operation), otherwise the tool would steal the intent.

**Test:** `Who is in the Engineering department` → Inputs `DeptQuery = Engineering`, ran once, 1.45s, 8 names, matching the curl result ✅. The list showed twice (once from the Message, once from the orchestrator summarising again from the Output, as a list), same as Task 8.

**Deviation from the plan: didn't use `ParseJSON()`.** On the HTTP Request node I set **Response data type** to **From sample data**; pasting a sample JSON generates the schema automatically, so `DeptResponse` is a typed `table` straight away and `Concat()` can use the column name `Name` directly. The difference between the two approaches:

| | From sample data | Untyped + `ParseJSON()` |
|---|---|---|
| When it's parsed | Schema fixed at design time | Parsed only at runtime |
| Writing formulas | Column name autocomplete, just `Name` | Each field needs its own conversion, e.g. `Text(ThisRecord.Name)` |
| API adds/changes fields | Schema no longer matches, has to be regenerated | More flexible |

**Controls in the node properties that a tool doesn't expose:**
- **Request timeout**: default 30000 ms, the same number as the connector 30-second timeout hit in Task 4, but here it can be changed
- **Error handling**: default Raise an error; can be changed to continue on error, saving the status code into a variable and branching in the topic yourself (used in Task 10 with FAIL_MODE to compare against the tool's behaviour)
- **Response headers**: can be saved into variables
- **Body**: No content / JSON etc., used for POST

**Gotchas:**
- In the Message toolbar, **{x}** (insert variable) and **fx** (insert formula) are two separate buttons. Typing `Concat(...)` straight into the message box outputs it verbatim as text. In the end I computed it first with Set variable into a variable and had the Message insert only the variable, sidestepping the problem
- Collecting the department with a Question node as planned → the topic ran 3 times, asking for the department again each time (see break-and-fix). After copying Task 8's approach (Input + Output + delete the Question node) it became 1 run. **Task 8's conclusion was verified again on a second topic, not a coincidence**

**The essential difference between a Send HTTP request node and a tool call:**

| | Tool (Task 4/5) | Send HTTP request node (Task 6) |
|---|---|---|
| Who decides when to call | The orchestrator (the tool is at the agent level, a candidate in its own right) | Called when the topic flow reaches this node; the topic itself is still picked by the orchestrator |
| Where parameters come from | AI fills them from the conversation | You build the URL, headers and body yourself with Power Fx |
| Auth | The connection stores credentials, has an owner, End user / Maker-provided selectable | **The key is written in plain text in the topic's header**, no connection, no per-user credentials |
| How results are read | Mapped automatically from the OpenAPI response schema | You pick a schema or `ParseJSON()` yourself and write formulas to process it |
| Error handling | You can only watch how the orchestrator reacts (Task 4: raw error thrown straight at the user) | The node can configure timeout, continue on error, read the status code |
| Reuse | The connector can be used by Power Automate / Power Apps in the same environment | Only valid in this topic |
| Prerequisites | Write OpenAPI, build a connector | Nothing; if you have a URL you can call it |

**When to use this path:** one-off, simple calls not worth writing OpenAPI and building a connector for; deterministic flows that need strict control over order, error branches and timeouts; results that need processing in the topic before going to the user or the orchestrator.
**When not to use it:** when AI should decide when to call (use a tool); when it needs reuse across several agents/apps (use a connector); when the API must be called with each user's identity (needs a connection and OAuth; this node's header is hard-coded); production environments with real secrets (plain text in the topic, carried along when the solution is exported).

**Why learn this when Task 4/5 can already do it:** the exam point "Configure advanced agent responses with API and Send HTTP requests" is listed separately; and only after understanding "hard-coding the call logic in a topic" can you see clearly what a tool actually does for you (choosing timing, filling parameters, parsing results, managing credentials).

### Task 7: MCP server (2026-10-15)

`src/mcp-server/server.js`: Express + `@modelcontextprotocol/sdk`, Streamable HTTP transport, listens on `:3100/mcp`, two tools: `search_employee(query)`, `get_leave_balance(employeeId)`. Data comes from the same `data/employees.csv` as employee-api; the two don't share code.

**Versions actually installed:** `@modelcontextprotocol/sdk` 1.32.1, express 5.3.0, zod 4.6.7. The import paths and `registerTool` usage in the plan worked as is.

**Deviations from the plan:**
- CSV split into lines with `/\r?\n/` (the plan said `'\n'`), the same change as the CRLF fix in employee-api
- Didn't open the Inspector web page; verified by sending JSON-RPC directly with curl: `initialize` → get `mcp-session-id` from the response header → `notifications/initialized` (202) → `tools/list` → `tools/call`. Results: `search_employee("Engineering")` 8 people, `get_leave_balance("E001")` 20/10, `get_leave_balance("E999")` returns `isError: true`, all matching the CSV. Responses are in SSE format (`event: message` + `data: {...}`)

**Public internet:** a second tunnel `hr-mcp-server` (`--allow-anonymous`), port 3100, path `/mcp`. **No authentication at all**; anyone with the URL can call it, acceptable only because the data is mock.

**Connecting:** Tools → Add a tool → New tool → Model Context Protocol → fill in Server name / description / URL, Authentication None → create connection → Add. Behind the scenes it also generates a connector + connection, the same mechanism as Task 5.

**How the MCP tool settings page differs from a REST tool:**
- The tool list is **pulled from the server at runtime** (`tools/list`); names, descriptions and parameters are all decided by the server and **can't be changed on the page**. The description matches what's written in `registerTool` word for word. After the server changes, clicking 🔄 refresh syncs it, no need to re-import like OpenAPI
- There's no per-tool Inputs/Outputs settings page. The Inputs on the page are **server-level** configuration parameters
- **Tool switches:** with the master switch in the header on = everything the server provides is exposed (including tools added later), and the individual switches are greyed out; only after turning the master switch off can you click the individual switches = allow list. In production, or when another team maintains the server, the allow list follows least privilege ("newly added tools aren't exposed automatically in allow-list mode" is an inference, not tested hands-on)
- There's also **Resources** (Preview): another MCP protocol capability, usable only as tool output, not as a knowledge source. Our server doesn't implement it, so it's empty
- "Ask the end user before running" and "Credentials to use" are there, same as REST tools

**Tests:**

| Question | All components on | After turning off the `Department Lookup` and `Leave Balance` topics and the REST leave operation |
|---|---|---|
| `Search for the people in the Sales department for me` | `Department Lookup` topic answered | `search_employee(query=Sales)`, 0.50s, 5 people + EmployeeId ✅ |
| `How many days of sick leave does E003 have left?` | `Leave Balance` topic answered | `get_leave_balance(employeeId=E003)`, 0.72s, sick leave 10, annual leave 9 ✅ |

- With all components on, the orchestrator picked the topic both times, not the MCP tool. The topic's description says "Use this topic when...", more specific than the MCP tool's one-line function description (material for Task 10's orchestration conflict)
- **How to tell from Activity whether MCP was really called:** the outer `HR MCP Server` block (spinning icon, Rationale) **doesn't count**; it appeared in both test rounds. Look for a **child block with a specific tool name** underneath (`search_employee`); only with Inputs/Outputs inside does it count as actually executed
- **Output is untyped:** a REST tool's Outputs are fields mapped from the OpenAPI schema, like `AnnualLeaveBalance (Number)`; an MCP tool's Output is `content (Table)`, each row `{type: "text", text: "<JSON string>"}`; the structured data is stuffed into a string and the LLM has to read it itself. To use this result in a topic you'd have to `ParseJSON()` it yourself
- `search_employee`'s description says it returns only EmployeeId/Name/Department, but it actually returns the leave balances too (that's how the plan's code was). This time the agent didn't mention the balances, but it shows that **what the description says and what the tool actually returns aren't necessarily the same**; what's returned is decided by the code, not the description. Not changed for now

**MCP vs REST tool / connector:** MCP suits cases where tools are provided by another team or product and keep changing: connect via one URL, the tool list follows the server, and the same server can be reused by other MCP clients (VS Code, Claude, etc.). The cost is that the maker controls less in Copilot Studio: description, parameters and output types can't be changed, only switched on or off.

### Task 8: Leave Balance topic changed from querying Dataverse directly to calling a tool (2026-10-14)

**Picked Task 4's REST tool** (`Employee API` → Get one employee's current leave balances). Task 7's MCP tool wasn't built yet; the REST tool had been tested and could be used directly.

**Final topic structure:**

```
Trigger (The agent chooses)
  Input: RequestedEmployeeId (description: "The employee's id in the format E followed by three digits (e.g. E002).")
  Output: AnnualLeaveBalance, SickLeaveBalance
→ Set variable value: Global.EmployeeID = Topic.RequestedEmployeeId (for M2's Submit Leave Request)
→ Tool: Get one employee's current leave balances, id = Topic.RequestedEmployeeId
     Outputs mapped automatically to Topic.EmployeeId / Topic.AnnualLeaveBalance / Topic.SickLeaveBalance
→ Message: AL: {AnnualLeaveBalance}; SL: {SickLeaveBalance}
```

Also, **When this tool may be used** on both leave balance tools (Task 4's and Task 5's with the "1" suffix) was changed to **Only when referenced by topics or agents**, so the topic is the only entry point left for the "leave balance" intent.

**The rework (step by step, one variable at a time):**

| Step | What I changed | Test | Result |
|---|---|---|---|
| 1 | Deleted the Dataverse `List rows` node, replaced with a Tool node; `id` ← `Global.EmployeeID`; rewrote the Message; both tools set to be referenced only by topics | `How many days of annual leave do I have left?` → E001 | Values correct, but the topic **looped infinitely** until it hit `GenAIToolPlannerRateLimitReached` ("The usage limit for generative orchestration has been reached") |
| 1 | Same as above | `How much leave balance does E002 have left?` | The intent competition was resolved, it went to the topic; but even with the employee ID in the question it asked again; the topic ran 2 times |
| 2 | Added topic **Output** (AnnualLeaveBalance, SickLeaveBalance) | `How many days of annual leave do I have left?` → E001 | **Generated result → Outputs** appeared in Activity for the first time, and the orchestrator wrote a summary from the output; but the topic still ran 2 times (2 `leave` requests on the Inspect page) |
| 3 | Added topic **Input** `RequestedEmployeeId`, deleted the Question node, added Set variable | Tested both cases | The orchestrator extracted E002 from the question and passed it into the topic (Activity shows **Preparing topic context → Inputs**); without an employee ID the orchestrator asked itself, with wording rewritten from the Input description. **The repeated runs disappeared**. But the topic popped up "What is your employee ID?" again |
| 4 | Fixed the Set variable direction, `id` ← `Topic.RequestedEmployeeId` | `How much leave balance does E002 have left?` | **One question-and-answer turn, ran once, 0.98s, 14/8** ✅ |

**Activity call chain before and after the rework:**
- Before (M1): `Interpreting topic intent → Executing topic flow → Processing topic outcome`, then another round, and another...
- After: `Interpreting topic intent → **Preparing topic context (Inputs)** → Executing topic flow → Processing topic outcome → **Generated result (Outputs)**`, only one round
- **A tool called inside a topic isn't visible in Activity.** It only shows one line, "executed its internal dialog and logic". Calling a tool directly shows the Preparing tool inputs / Executing tool action set, but nested in a topic that disappears. Activity only records decisions at the orchestrator level. To confirm the tool inside the topic was really called, and how many times, **count requests on the Dev Tunnels Inspect page**; it's the most reliable counter
- Latency: before, the Dataverse version plus repeated runs felt very slow; after, 0.98s

**The most important conclusion of this Task: in generative orchestration, topics need Inputs and Outputs defined just like tools.**

A topic without Input/Output is a black box to the orchestrator: nothing gets in (the orchestrator clearly saw the employee ID in the question but had no channel to pass it in, so the topic had to ask again), and nothing gets out (the result was only sent to the user as a Message, the orchestrator couldn't get it itself and thought the task wasn't done). With Input/Output added, the topic behaves just like a tool: the orchestrator collects parameters and asks for missing ones, the topic handles the deterministic steps, and the result is handed back to the orchestrator. In M1 I was completely unaware of this.

**The M1 leftover "topic runs repeatedly" problem disappeared here** (only 1 run in all 3 tests). But which change did it **can't be determined**:
- After adding the Output it was still 2 runs, so the Output alone isn't enough
- At one point I guessed "the user's reply to the Question node is taken by the orchestrator as a new request, which triggers another run". But in step 3, the user answered the tool's follow-up question midway through the topic and it did **not** cause a repeat run, so that guess is weakened
- The only thing I can be sure of: with both Input + Output added and the Question node removed from the topic, it no longer repeats

**Gotchas:**
- **The variable picker was empty before refreshing**: the `Custom` tab had no variables at all, and `Save user response as` was cleared too. Recovered after F5. This is the fifth time I've hit Copilot Studio's UI state not matching the backend (M2 logged three, Task 4's Tools list counts as one)
- **The Message node was written as two variations** (one for AL, one for SL), and each run randomly picks one to send. So the "AL: 20, SL: 10, SL: 10, SL: 10…" seen earlier was actually **one variation shown per run**, number of bubbles = number of runs. Only normal after merging them into one line
- **The Set variable node direction was reversed**: the top field "Set variable" is the target being assigned, the "To value" below is the source. Written backwards, it overwrote the E002 extracted by the orchestrator with an empty value, the tool got no id, fell back to "Dynamically fill with AI", and asked for the employee ID by itself, in Chinese
- The tool node's **Inputs (0)**: parameters set to "Dynamically fill with AI" at the tool level aren't listed; click **+ Set value** to override at the topic level

**Remaining minor redundancy:** with the topic's Message and the orchestrator's summary from the Output, the user sees the same numbers twice. Now that the topic has an Output, the Message node could actually be deleted. Not changed, doesn't affect acceptance.

### Task 9: Computer use attempt (2026-10-15)

**Result: the entry point works and configuration can be completed, but it won't run.** Stuck at the Hosted browser connection, never got to the execution step. Per the plan this counts as Understand met, not Built.

**Entry point:** Tools → Add a tool → New tool → **Computer use** → "New computer use" popup. Write the steps in natural language (up to 8000 characters), or start from one of three templates: Invoice processing, Data entry, Data extraction. → Add and configure.

**Configuration page items:**

| Setting | Content | Worth noting |
|---|---|---|
| Model | The model that performs computer use, default **Claude Sonnet 4.5**, can be changed | Experimental/preview models are subject to preview terms |
| Instructions | Natural-language steps | Has two buttons: **Test directly** (test on its own, not via the agent) and **Test in agent chat** |
| Inputs / Outputs | No Inputs by default; Outputs choose **Text** (summary, with an execution recap) or **JSON** (for system integration) | |
| **Machines** (required) | Three types, see the table below | The management entry **Manage machines jumps to Power Automate → Machines**, the same machine management used by desktop flows / RPA |
| Credentials to use | Default **Maker-provided** (MCP / REST tool default is End user) | The ⚠️ tooltip text shows an untranslated resource name `...endUserAuthWarningTooltip`, a UI bug |
| Human supervision | Specify a reviewer; when the agent is unsure it sends a confirmation request **via Outlook**; defaults to the maker, response time limit defaults to 1 hour | Requires the reviewer to be the same person who triggered the agent and to have permission to handle these requests |
| Stored credentials | Store the username and password for sites to sign in to in a secure vault | |
| Allowed websites and desktop apps | Access control (only allow specified sites/apps) **off by default**; Enforce HTTPS **on by default** | By default it can go to any site; production should turn on the allow list |

**Three machine types (key points from the Help me decide text):**

| Machine | Suited to | Limits |
|---|---|---|
| Hosted browser (Preview) | Web pages only; works out of the box, with Edge and Windows apps | **Can't access internal resources** |
| Cloud PC pool (Preview) | Internal systems, resources and apps; Entra-joined to this tenant, can scale out, **SSO** to enterprise resources | |
| Bring-your-own-machine | Automation needing special machine configuration | You manage the infrastructure entirely yourself |

**Where it got stuck:**
1. Chose Hosted browser → Connection shows ✅, but next to it in red "We couldn't enable this connection. Try again.". Creating a new connection ("Connect to Computer use", marked **Premium** + **Preview**, Connect chose "Connect to hosted browser") was the same
2. After Save, Test directly: `The connection configured for this tool was not found. Reconfigure the connection and try again.`, Preview pane "The test ended before any screenshots were captured"
3. Power Automate → Machines is empty ("You haven't set up a machine yet"), the banner at the top recommends Hosted machine / Hosted machine group

**Cause: not confirmed.** The error doesn't say what's missing. My guess is hosted machines need extra capacity or licensing (Premium connector + the Power Automate hosted RPA setup), which the trial environment doesn't have. Whether it relates to region wasn't verified either. The trial expires 10-16, so I'm not continuing. After checking the docs in Task 1 there are two more possible causes, see Task 1.

**Positioning against other integration methods:** computer use is the **last resort**. Only when the target system has no API, connector or MCP should the agent operate the UI like a person. It's slow, expensive (the model has to look at a screenshot at every step), can break as soon as the UI changes, and needs extra management of machines, the credential vault and the website allow list. If an API is available, don't use it.

### Task 9: Identity notes: whose identity the agent uses to access systems

| Method | Example in this project | Who the agent is in the target system's eyes | Who decides what it can see |
|---|---|---|---|
| **No authentication** | **Task 7's MCP server** (Authentication = None, tunnel anonymous too). The plan thought this project hadn't used it, but it did | Nobody. Same for any person or program with the URL | Only the server code. URL leak = data leak. Acceptable only because the data is mock |
| **API key** | Task 4, 5: key stored in the connection; Task 6: key **written in plain text in the topic's header** | "The service holding this key", no distinction between which user is asking | The API's own logic. Task 10 Step 4: after the backend changed the key, all users got 401 together |
| **OAuth user delegation** | M1 Task 6's Dataverse connector: connection created by signing in with my own M365 account | If Credentials is End user: **each person asking uses their own identity**; Maker-provided: everyone uses my identity | With End user, Dataverse's security roles/row-level permissions decide: "the agent can only see what that user could already see". In M1 it was actually the maker identity; **true per-user delegation was never tested in this project** |
| **Service identity (shared connection)** | Task 4/5's connections were both changed to **Maker-provided**; computer use is Maker-provided by default too | All users appear on the system side as the same account (the maker or a service account) | That account's permissions. The audit log can't tell who asked |

**Core difference:** with API keys and service identities, "can I see this" has **nothing to do** with who is asking; restrictions can only be done at the agent level yourself (e.g. checking whether the employee ID belongs to the person asking), which we've noted since M1 that we didn't do. OAuth user delegation hands this back to the source system, so however the agent is manipulated it can't get data the user couldn't see anyway.

**The switch in Copilot Studio that decides this:** each tool's **Credentials to use** (End user / Maker-provided). The defaults aren't consistent: REST tools and MCP are End user, computer use is Maker-provided. So check it every time you add a tool, don't assume.

### Task 9: Comparison of enterprise system integration methods

| | Task 4 REST tool (OpenAPI) | Task 5 Custom connector | Task 6 Send HTTP request | Task 7 MCP | Computer use |
|---|---|---|---|---|---|
| Setup cost | Write OpenAPI, 8-step Copilot Studio wizard | Write OpenAPI, build the connector in Power Apps (one more Basic auth option, reads `securitySchemes`) | Lowest, a URL is enough | Need to write/have an MCP server; connecting just takes a URL | No code to write, but needs machines, credentials, allow list |
| Reusable? | Also a connector underneath, usable in the same environment | **Strongest**: agents, Power Automate and Power Apps in the same environment can all use it | Only in this topic | The same server can be used by any MCP client (VS Code etc.) | Only in this agent |
| Where auth is configured | The wizard defines where the key goes, the value is stored in the **connection** | connector definition + **connection** | **The topic node's header**, plain text | The MCP tool's connection (None this time) | connection + Stored credentials vault |
| Can the orchestrator discover and call it automatically? | Yes (when Trigger = By agent) | Yes (same as left) | **No**, called only when the topic reaches this node | Yes, the tool list is pulled from the server **at runtime** | Yes, as a tool |
| Can the maker change description/parameters? | Yes | Yes | N/A | **No**, the server decides, can only switch on/off | Yes |
| Output | Mapped by schema into typed fields | Same as left | You pick a schema or `ParseJSON()` | A block of text (JSON string) the LLM has to read | Text or JSON |
| On error | Raw error given straight to the user (Task 10) | Same as left | The node can configure timeout, continue on error, read status code | Not tested | Never got it running |

**If I had to connect a new enterprise system today, I'd choose in this order:**
1. **A ready-made connector already exists** (Microsoft or third-party certified) → use it directly, least effort
2. **The system has an API, and more than this agent needs it** → custom connector. Reusable, auth managed by a connection, End user selectable
3. **The other team provides an MCP server, or the tools change often** → MCP. The cost is less control; description and output can't be changed
4. **Just a one-off, deterministic call inside this one topic** → Send HTTP request. Don't put real secrets in it
5. **No API at all, only a UI** → computer use, as a last resort

Outside this order there's one thing that **must be judged separately**: whether data must be isolated by user permissions. If so, only paths that support OAuth + End user credentials will do, which rules out Send HTTP request and the API key approach.

## Concepts learned (each answers: what problem it solves, and when not to use it)

**1. REST tool (direct OpenAPI), custom connector, MCP: what problem does each of these three ways of adding tools solve, and when not to use it?**

All three solve the same problem: letting the orchestrator know "there's this capability, when to use it, what parameters to pass", and then it decides to call it itself. The difference is **who writes this manual, where it's written, and who can reuse it**.

- **REST tool:** import OpenAPI in Copilot Studio, the fastest way to connect an existing API. Tested hands-on: underneath it also generates a connector (the error says "The connector 'Employee API'"), and at the agent level it's no different from a custom connector. **Don't use it when:** the same API also needs to be used by Power Automate or Power Apps. Also, the wizard doesn't read `securitySchemes`, so auth has to be configured again by hand; miss it and everything is 401 (Task 4).
- **Custom connector:** built in Power Apps, an environment-level resource. A connection built in Power Apps can be reused directly in Copilot Studio (Task 5). **Don't use it when:** there's only one agent and a simple API called once; no need for the extra trip through Power Apps.
- **MCP:** the server provides the manual itself; connect with one URL, the tool list changes with the server, and the same server can serve other clients like VS Code. **Don't use it when:** the maker needs control over description and parameters (they can't be changed on the page, only switched on/off); or the result needs to be used as typed fields in a topic (the output is a JSON string you have to `ParseJSON()` yourself).

**2. Compared with "wrapping the same API as a tool", what does the Send HTTP request node save and what does it sacrifice?**

**Saves:** no OpenAPI to write, no connector to build; a URL is enough to call it. Error handling is actually stronger: the node can configure timeout, continue on error, read the status code; whereas when a tool fails, the raw error is thrown straight at the user (Task 10).

**Sacrifices:**
- **The orchestrator doesn't know it exists**; it's only called when the topic reaches this node
- Parameters have to be built yourself with Power Fx
- Results need a schema you pick or `ParseJSON()`
- **The key is written in plain text in the topic's header** and is carried along when the solution is exported
- Can't call with the user's identity
- Not reusable

Suited to "a deterministic step in this topic", not to "a capability AI decides when to use".

**3. Under generative orchestration, what are the consequences of vague or overlapping tool descriptions?**

The hands-on conclusion differs somewhat from the intuition "write a bad description and the agent picks wrong":
- **Vague** (Task 10 Step 2): with competitors, the vague tool is **ignored**, effectively invisible; without competitors, the orchestrator still picks it correctly and fills the parameters correctly from the **tool name and parameter descriptions**. The description isn't the only signal.
- **Overlapping** (Task 7, Task 10 Step 1): MCP `get_leave_balance` and the Leave Balance topic overlap in capability; with the same configuration the two runs chose differently, **the choice is unstable**. The real risk isn't "picking wrong" but **unpredictability**: the two paths differ in data source, error handling and output format, so the user gets a different experience each time.
- **Trigger takes effect before the description.** A tool that's On but has Trigger = None (Only when referenced by topics) is completely invisible to the orchestrator (Task 10 Step 3). When troubleshooting "why didn't it pick this", check Trigger first, then the description.
- **Topics are candidates too**; their descriptions compete alongside tools. Wording like "Use this topic when..." wins more easily than a one-line function description (Task 7).

**How to avoid it:** keep only one entry point per intent (which is what Task 8 did: the two leave tools can only be called by the topic), and turn the others off or set them to None.

**4. When an agent accesses external systems, what risks correspond to API keys, OAuth user delegation and service identities?**

See the Task 9 Identity notes above. One-line version:
- **API key / service identity:** the risk is "**the same no matter who asks**". The source system can't tell who's asking, so permission control can only be done by the agent itself, and we haven't done it since M1 (change the employee ID and you can look up someone else's balance). Rotate the key and all users break together (Task 10 Step 4: 401). Leak the key and all data leaks together.
- **OAuth user delegation (End user credentials):** hands "what can be seen" back to the source system, so even if the agent is manipulated by a prompt it can't exceed permissions. The cost is that every user has to authorise themselves, and some scenarios (autonomous agents) have no "user" at all. Never really tested in this project.
- **No authentication:** the URL is the key (Task 7's MCP server).
- The switch that decides this is each tool's **Credentials to use**, and **the defaults aren't consistent**, so check every time you add a tool.

**5. For the Computer use bullet, can it really be Built in the current environment?**

**No, only Understand.** The entry point and configuration page both work, and we went through every setting, but enabling the Hosted browser connection failed and it never executed once (Task 9). The cause of being stuck wasn't confirmed (see Task 1, Task 9). To reach Built: retry the Hosted browser after enabling pay-as-you-go, or install Power Automate for desktop on my own computer and go Bring-your-own-machine. The latter doesn't depend on hosted resources and is the most likely to work; deferred to M4 when pay-as-you-go is enabled.

## Not understood yet, left for later

- **Why Computer use won't run:** none of the three candidate causes verified: the trial environment isn't eligible for hosted machines, external models aren't turned on, it's turned off in the admin center.
- **Why the MCP connection went Stale** (Task 10 Step 1): the server and tunnel were online the whole time.
- **Why the first 3 attempts in Task 10 Step 3 all went to Escalate**: "server restart invalidated the session" has been ruled out.
- **Why there was no API key field when creating a new "Employee API" connection** (Task 10 Step 4): the same window had one in Task 4.
- **Whether the connector retries automatically when a tool fails (500 / timeout)**: the API has no request log, so it can't be seen. Next time count requests on the Dev Tunnels Inspect page.
- **The MCP server returns 400 for an unknown session**, while the spec requires 404. Caused no problem this time, code not changed.
- **The full chain of calling with the user's identity (OAuth + End user credentials)** was never tested. This is the core of the identity bullet; consider filling it in when wrapping up in M7.
- **M2 leftover:** the cause of Submit Leave Request's anomaly in a new session is still not found.

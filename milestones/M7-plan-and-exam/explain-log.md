# M7 Explain-back log, bullet by bullet

Each bullet gets two questions: what problem does it solve? When should you not use it (or what is it easily confused with)? Both halves right = pass; only half right = retry; both wrong = don't know. "Retry" and "don't know" items get asked once more at the end of the same round.

## Round A: bullets 1–7 (2026-11-05)

| # | bullet | Result | Points missed |
|---|---|---|---|
| 1 | Plan integration with enterprise systems | Pass (2nd try) | 1st try: saying the HTTP node "can't authenticate" was inaccurate; it can carry a fixed key, the problem is it can't act as the user; didn't know how to choose between connected agent and tool (one capability vs a whole block of responsibility) |
| 2 | Plan identity strategy | Pass (2nd try) | 1st try: didn't separate "how the user gets in" from "whose identity the agent uses to call the backend"; forgot that End user credentials requires the agent not to be No authentication |
| 3 | Plan channels and deployment | Pass | Missed the technical reason: Authenticate with Microsoft only supports channels such as Teams, M365 Copilot and SharePoint |
| 4 | Plan responsible AI strategy | Pass | Missed transparency (telling users it's AI), citing sources, human approval, and evaluation before go-live |
| 5 | Evaluate security and governance considerations | Retry | Both tries failed to name **Endpoint filtering** (only allow HTTP to certain addresses, configured in the data policy); mixed up maker measures and admin measures |
| 6 | Plan reuseable agent components | Pass (2nd try) | 1st try: didn't know how a custom connector is reused (environment level, built in Power Apps, can be added to agents, flows and apps) |
| 7 | Design agents for internal or external audiences | Pass (2nd try) | 1st try: didn't name the most common mistake (attaching internal knowledge sources or maker-credential tools to an external agent); wrongly thought external agents aren't governed by DLP |

**Round A summary**: 6 of 7 passed; only 2 passed on the first try (3, 4). Bullet 5 left for remediation in Task 6.

Follow-up questions asked during the explain-back and explained on the spot: how to reuse a topic in another agent (sharing via component collection vs copying the YAML and forking); what to do if a shared topic should change in only one agent; whether in-progress conversations change after a topic is edited (by default they keep using the old version; at Publish you can tick Force newest version); where a custom connector is built (Power Apps, or automatically in the background by the Copilot Studio REST API tool).

## Round B: bullets 8–22 (2026-11-06 to 11-07)

Anything not passed on the first pass was asked again as a scenario question.

| # | bullet | Result | Points missed |
|---|---|---|---|
| 8 | Create an agent flow | Don't know → failed on re-ask | On the re-ask knew that writing data needs a flow, but said it's "not very different from a cloud flow"; missed that it's built in Copilot Studio, uses Copilot Studio capacity with no Power Automate license needed, and `When an agent calls the flow` / `Respond to the agent` |
| 9 | Create a human-in-the-loop agent flow | Pass (2nd try) | 1st try: described the M2 approval as leave request submission (it's actually `CancelApprovedLeave`); didn't say the status is `Waiting`; didn't answer "don't use it when a real-time reply is needed" |
| 10 | Configure actions and connectors | Pass (2nd try) | 1st try: missed the connection, and wasn't clear whose identity it is. On the re-ask still described the connector as "the connection's actions" (it's actually the manual for a whole bundle of actions) |
| 11 | Monitor agent flows | Pass | Could add: Activity is the orchestrator's view, Run history is the record of what actually executed |
| 12 | Add input and output parameters | Pass | Didn't say "not shared, mapped explicitly"; forgot the gotcha "left empty = the key disappears" |
| 13 | Implement error handling in agent flows | Retry → failed on re-ask | 1st try didn't name Scope + Configure run after; on the re-ask **swapped the action and the setting**, and also thought an error would hang forever (the thing that waits forever is an approval) |
| 14 | Add agent flows to a topic | Pass (2nd try) | 1st try: described the flow deliberately left out of the topic as leave request submission (it's actually `CancelApprovedLeave`); on the re-ask didn't say the benefit of attaching it as a tool |
| 15 | Configure agent response formatting | Retry → failed on re-ask | Thought every channel displays the same; on the re-ask wanted to fix it by "switching channel", named the unreliable place as the custom prompt (it's actually Settings → Response formatting Preview), and missed the Message node |
| 16 | Add tools to a topic | Pass | Missed the tool setting **When this tool may be used** (confirmed in the UI) |
| 17 | Configure advanced agent responses with custom prompts | Pass (2nd try) | 1st try: thought the custom prompt overrides the instructions (it's actually a separate tool); on the re-ask missed that the output needs `.text`, and that "conflict" means requirements inside the prompt contradicting each other |
| 18 | Configure advanced agent responses with custom knowledge sources | Pass | Could add: scenario question "may only rely on a certain document" → specify the data source on the node |
| 19 | Configure advanced agent responses with API and Send HTTP requests | Pass | Again said it "can't be configured with a credential" (it can carry a fixed key, it just can't act as the user) |
| 20 | Configure generative answers node | Pass (2nd try) | 1st try: thought the node "hands the output back to the orchestrator"; on the re-ask missed that "give the HR email if nothing is found" needs a Condition checking for empty |
| 21 | Configure adaptive cards | Pass | Could add: a card can also be used just for display; don't use it when the channel doesn't support it |
| 22 | Manage variables | Pass (2nd try) | 1st try only mentioned Global and Topic; on the re-ask called the user's raw utterance a topic variable (it's actually `System.Activity.Text`); the employee ID has to be derived from `System.User` and written to a Global only once |

**Round B summary**: 12 of 15 passed, 6 on the first try (11, 12, 16, 18, 19, 21). 8, 13 and 15 left for remediation in Task 6.

Follow-up questions asked during the explain-back and explained on the spot (all recorded in `notes.md`): how agent flows relate to topics and Power Automate flows; which Dataverse tables agents and flows are stored in (`bot`, `botcomponent`, `botcomponentcollection`, `workflow`); the layering and identities of connector / connection / connection reference / action / tool; the difference between Configure run after and Condition; the difference between the generative answers node and agent-level knowledge ("which topic to enter is also a decision"); the difference between System and Global variables, and whether System variables can cross agents.

## Round C: bullets 23–37 (2026-11-08 to 11-10)

Anything not passed on the first pass was asked again as a scenario question.

| # | bullet | Result | Points missed |
|---|---|---|---|
| 23 | Connect to Copilot connectors | Don't know → passed on re-ask | 1st try described it as "read and write third-party systems", confusing it with Power Platform connectors (it's actually read-only, pre-built index, filtered by ACL). On the re-ask, the reason for not choosing Azure AI Search didn't mention permissions; said it's configured "in Copilot" (it's actually the M365 admin center) |
| 24 | Connect to Microsoft Power Platform connectors | Retry → passed on re-ask | 1st try counted the HTTP node as a connector too; didn't answer "when not to use". On the re-ask said SharePoint policies means "upload documents" (should be: add the SharePoint site as a knowledge source) |
| 25 | Connect to Azure AI Search | Pass | Could add: doesn't filter by user by default; "is the content in M365" isn't the deciding factor |
| 26 | Configure and monitor computer use for an agent | Pass | Thought monitoring means checking the target system's logs (actually Copilot Studio screenshots every step); missed human supervision, the website allowlist, and the three kinds of Machines |
| 27 | Configure MCP tools | Retry → passed on re-ask | 1st try didn't answer "how to choose". On the re-ask missed "tools added monthly → updates automatically"; said MCP can go into a topic, I marked it wrong, then **reversed to pass after verifying in the UI**: it can go into a topic, but only as a raw JSON-RPC interface |
| 28 | Add a tool by using an existing custom connector | Pass | Missed the point of "existing": environment-level reuse, can go into a solution |
| 29 | Add REST APIs to an agent | Retry → failed on re-ask | Thought the difference is "simpler to operate" (it's actually where it's built and who uses it); on the re-ask didn't mention that a custom connector is generated in the background, that the wizard doesn't read `securitySchemes`, or that the API key uses Maker-provided |
| 30 | Design multi-agent solutions in Copilot Studio | Retry → failed on re-ask | Thought connected agents form a linear chain and pitched parallelism as the selling point; on the re-ask chose custom prompt for the onboarding checklist (should be child agent) and A2A for IT Helpdesk (should be connected agent) |
| 31 | Integrate a Foundry agent | Pass | Thought it always means writing code (in M5 it was clicked together in the portal); missed Activity protocol, that it shows up as a tool, and Azure billing |
| 32 | Integrate an existing agent in Copilot Studio | Pass (scenario question) | First asked and confirmed that it is the connected agent; could add: the switch is in Settings → Generative AI, and how it behaves when turned off (tested hands-on) |
| 33 | Integrate a Fabric data agent | Retry → failed on re-ask | 1st try too vague; on the re-ask chose Copilot connector for both the personal balance and the policy questions (should be tool and SharePoint knowledge), and gave the prerequisites as the use case |
| 34 | Create a multi-agent solution by using A2A protocol | Pass | "The other side of MCP can't use natural language" is inaccurate; the difference is the shape of the interaction; missed the agent card |
| 35 | Configure generative answers by using Azure AI Search with Foundry | Retry → failed on re-ask | Didn't remember where it's configured (node → Classic data → Azure OpenAI on your data); on the re-ask thought 25 is Microsoft-hosted (the real difference is who writes the answer); didn't answer the downsides |
| 36 | Configure custom prompts to use the Foundry model catalog | Retry → failed on re-ask | Thought a custom prompt can't choose a model; on the re-ask only answered "use a custom prompt", not how BYOM is connected, why not use 35, or the cost |
| 37 | Monitor agents by using Application Insights | Don't know → failed on re-ask | 1st try had Analytics and App Insights the wrong way round in terms of depth; on the re-ask thought App Insights lives in Foundry, and didn't answer privacy |

**Round C summary**: 9 of 15 passed, 6 on the first try (25, 26, 28, 31, 32, 34). 29, 30, 33, 35, 36 and 37 left for remediation in Task 6. This block was learned one at a time across M3–M5 without ever comparing them side by side, so I added "★ Master table: which to choose when an agent connects to something outside" at the very top of `notes.md`.

Follow-up questions asked during the explain-back and explained on the spot (all recorded in `notes.md`): whether Copilot connectors and Power Platform connectors are the same thing; whether Microsoft Graph is a vector database; where Azure AI Search stores its data; how Microsoft 365, Power Platform and Azure relate; how prebuilt connectors are classified; how bullet 32 relates to the connected agent; the difference between bullets 35 and 36 (librarian vs secretary who writes); the difference between HTTP and REST API; whether MCP can go into a topic (verified in the UI).

## Round D: bullets 38–44 and the 6 questions for readiness criterion 3 (2026-11-11 to 11-14)

Anything not passed on the first pass was asked again as a scenario question.

| # | bullet | Result | Points missed |
|---|---|---|---|
| 38 | Create a test set | Retry → failed on re-ask | Only mentioned importing; missed auto-generation, writing by hand, and "repeatable, compared question by question"; thought open-ended questions can't be tested (use General quality). On the re-ask missed that questions for a Foundry agent give Error; gave the reason for importing as "re-importing gives a new version" (version control comes from the CSV in git) |
| 39 | Choose an evaluation method | Retry → failed on re-ask | Said misjudged refusal questions are Keyword (it's actually General quality judging "Not answered"). On the re-ask chose Compare meaning for a baseline with no expected answers (should be General quality); for different languages said Keyword / Exact (the point being tested is that Compare meaning gives 0 points) |
| 40 | Review test results | Retry → passed on re-ask | 1st try couldn't remember the four kinds of failure (platform, method, question, agent); on the re-ask the categories were all right, but didn't say how to handle each |
| 41 | Create a solution | Retry → passed on re-ask | 1st try didn't remember the reason for creating your own publisher; thought environment variables can't go into a solution (the definition goes in, the value belongs to each environment); missed Azure resources and the tunnel. On the re-ask couldn't recall the name of the Secret type |
| 42 | Add existing agents to a solution | Retry → don't know on re-ask | Treated "can't go in" as "isn't brought along automatically"; didn't remember preferred solution. On the re-ask couldn't separate any of the three layers, and thought `CancelApprovedLeave` is attached to a topic (the attached one is `SubmitLeaveRequest`) |
| 43 | Create and use environment variables | Pass | Missed that credentials can't go in a plain text variable (use a connection or the Secret type); the value's format has to match where it's used |
| 44 | Implement and extend Microsoft Power Platform Pipelines | Don't know → failed on re-ask | Didn't remember having done it in M6 Task 6. On the re-ask correctly answered same tenant, and export across tenants; didn't name Gated extension, Delegated deployment or Managed Environment |

**The 6 questions for readiness criterion 3:**

| # | Question | Result | Points missed |
|---|---|---|---|
| 1 | How to choose between knowledge, topic and tool | Pass | Didn't give reasons; could add: combining by calling a tool inside a topic |
| 2 | REST tool, custom connector, MCP | Pass | Could add: a REST tool is also a custom connector underneath; the cost of MCP |
| 3 | MCP and A2A | Retry → passed on re-ask | 1st try didn't pick a scenario or mention the agent card; on the re-ask gave "it's external" as the reason for A2A (should look at the shape of the interaction) |
| 4 | Copilot Studio agent and Foundry agent | Retry → passed on re-ask | 1st try thought Foundry always means writing code, and said the identity is the developer's. On the re-ask gave the entry point as Tools (should be Agents → Add → Microsoft Foundry), and didn't name Activity protocol |
| 5 | Whose identity the agent uses to access systems | Pass | Could add: without sign-in only Maker-provided is possible; the maker account's permissions should be minimal |
| 6 | Solution, environment variables, pipeline | Pass | Didn't name Gated extension for manager approval; the API key uses a connection reference |

**Round D summary**: 3 of 7 bullets passed; only 43 passed on the first try. 38, 39, 42 and 44 left for remediation in Task 6. All 6 readiness questions passed (3 and 4 on the re-ask), so readiness criterion 3 is met. M6 was done more than a week ago; the ALM names (Gated extension, Delegated deployment, Managed Environment, Secret type) and the difference between "can't go in / isn't brought along automatically" are the easiest to forget.

Follow-up questions asked during the explain-back and explained on the spot (all recorded in `notes.md`): whether a connected agent can be tested by evaluation (content can be tested, routing can't, General quality isn't reliable); whether the exam lists the grader options (it does, using the docs' names); whether a solution is like a container (more like a phone app install package, or a Helm chart); whether `CancelApprovedLeave` is a Power Automate flow (it's an agent flow, the same kind in storage); whether it's attached to a topic (no, the attached one is `SubmitLeaveRequest`); how to tell A2A from a child agent (look at where the other side lives).

## Round E: Task 6 remediation explain-backs (2026-11-18 to 11-21)

After the Task 6 remediation, Ready was 44 / 44, but the 14 Explain items not passed in the first four rounds were still empty (30 / 44, short of the 36 in readiness criterion 1). This round redid the explain-back for all 14. Three questions: what problem it solves, how to use it, when not to use it or what its limits are. The user first asked about anything unclear, then explained back after the walkthrough; "retry" items were explained on the spot and then briefly explained back once more.

| # | bullet | Result | Points missed or corrected |
|---|---|---|---|
| E1 | 38 Create a test set | Pass | A conversation test set isn't "General quality only": apart from Compare meaning, Text similarity and Exact match, everything else can be used; added the limits "looks only at the result, not the process; AI grading fluctuates; covers only the questions written in" |
| E2 | 42 Add existing agents to a solution | Pass | An agent flow added later uses **Add required objects** (said Add existing); the connection reference goes along, the connection itself doesn't |
| E3 | 44 Pipelines | Pass (2nd try) | 1st try didn't name the host environment (where the pipeline's configuration and deployment records live, platform host or custom host); merged Managed Environment and managed solution into one thing |
| E4 | 37 Application Insights | Pass (2nd try) | 1st try thought it's chosen when building the agent; didn't recall `designMode`; forgot the difference between environment-level and agent-level |
| E5 | 29 Add REST APIs | Pass (2nd try) | 1st try only answered "convenient if you have an OpenAPI file"; added that the names and descriptions are for the orchestrator to read, tick only the operations needed, and it's a custom connector underneath so DLP governs it; "HTTP can only do one action" is inaccurate (several can be chained in a flow) |
| E6 | 30 Multi-agent | Pass | A2A isn't the general way to do a connected agent; it's for connecting agents on other platforms; the difference between child and connected is ownership and reuse, not "parent-child vs before-after" |
| E7 | 13 Error handling | Pass (2nd try) | 1st try thought timeouts can't be caught (just tick **has timed out** in run-after); passed the raw error straight to the user; didn't know about retry policy. Added Terminate (marked as Failed): friendly to the user, honest to operations |
| E8 | 39 Choose an evaluation method | Pass (2nd try) | 1st try stopped at "many factors to consider" without giving "condition → method"; didn't remember Custom's labels. During the explain-back also excluded Keyword match from conversation test sets (it can be used); got it right on the third try |
| E10 | 8 Create an agent flow | Pass | Added the exact names `When an agent calls the flow` / `Respond to the agent`; the difference from a cloud flow is billing (Copilot Studio capacity, no Power Automate premium needed); it can go into a topic or be attached as a tool |
| E11 | 15 Response formatting | Pass | Remedy for channel differences: branch on `System.Activity.ChannelId` and test each channel hands-on; if the format must be fixed, don't use generative, use a Message node or Adaptive Card |
| E12 | 33 Fabric data agent | Pass | "Allow other agents to access it" is called **Publish** in the exam; its strength is turning natural language into SQL / DAX / KQL for aggregation; for looking up a single record a connector is enough |
| E13 | 35 AI Search with Foundry | Pass (2nd try) | Answered "why" well (you control chunking and ranking yourself = customised RAG); 1st try didn't remember `vector_semantic_hybrid` and the filter `status eq 'Published'` (added at query time, not chosen at import) |
| E14 | 36 Foundry model catalog | Pass (2nd try) | 1st try didn't say "deploy in Foundry first, get the endpoint, then connect it in the prompt's model selection"; "processing images" isn't a typical reason; the catalog is mostly vendors' original models, fine-tuning is only one option |
| E9 | 5 Security and governance | Pass (explained back a few questions later) | Walked through first, then explained back 5 questions later. Corrections: restricting by IP range is IP firewall, not DLP; Business / Non-business is split by "is it company data", nothing to do with whether it's a Microsoft product; "only allow certain addresses" is endpoint filtering, not Blocked |

**Round E summary**: all 14 passed, 8 of them (44, 37, 29, 13, 39, 35, 36, plus 5 explained back a few questions later) on the second try. **Explain 44 / 44**. Everything not passed first time got stuck on **configuration details**: names (Add required objects, `vector_semantic_hybrid`, Terminate), options (has timed out), steps (deploy the Foundry model first). The "what problem does it solve" half was almost always right first time.

Follow-up questions asked during the explain-back and explained on the spot: what a grader is (the exam marker, three kinds: compare against a model answer, check by rules, AI as judge); the difference between solution and pipeline (the parcel and the logistics); what's in a Managed Environment; whether environment-level and agent-level telemetry conflict (two independent pipelines that add up rather than override; precedence not verified); what a trace / span is; what GHCP is; how Business and Non-business are split and how to choose a data policy's scope.

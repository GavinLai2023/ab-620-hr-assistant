# M0 Environment setup notes

## What problem this milestone solves

Build, in one go, the foundation that M1 to M7 will need: a Power Platform environment that can host agents, enough Copilot Studio capacity to run them, a SharePoint site to act as a knowledge source, and a Dataverse table to hold business data. M0 itself doesn't map to any exam bullet, but without it every later milestone would get stuck.

## What I did

- Signed up for the Power Apps Developer Plan and created the environment **HR-Dev** (Developer type, with Dataverse)
- Signed up for **Microsoft Copilot Studio (Trial)**, allocated its credits to HR-Dev in PPAC, and turned off auto-renew
- Created the SharePoint site **HR Policies** and uploaded 4 policy documents (annual leave, sick leave, remote work, expenses)
- Created the Dataverse table **Employee** from `data/employees.csv`, 20 rows
- Created an empty agent **HR Assistant** in Copilot Studio; the test pane can hold a conversation
- Pushed the project repo to a GitHub private repo (the original was later renamed; this English public copy now lives at https://github.com/GavinLai2023/ab-620-hr-assistant)

### Dataverse table Employee (created 2026-09-16)

Environment HR-Dev. Created in Power Apps with **New table → Create with external data → File (Excel, .CSV)** from `data/employees.csv`, 20 rows.
Note: **Import → Import data from Excel** on the command bar loads data into an existing table; it can't create a new table.

Table logical name: `crc6c_employee`

| Display name | Logical name | Data type |
|---|---|---|
| EmployeeId (Primary name column) | `crc6c_employeeid1` | Single line of text |
| Name | `crc6c_employeename` | Single line of text |
| Department | `crc6c_department` | Single line of text |
| ManagerId | `crc6c_managerid` | Single line of text |
| AnnualLeaveBalance | `crc6c_annualleavebalance` | Whole number |
| SickLeaveBalance | `crc6c_sickleavebalance` | Whole number |

Two gotchas to watch when writing flows in M2: the EmployeeId logical name has an extra `1` at the end, because a column with the same name already held that spot at creation time; and the Name logical name is `crc6c_employeename`, not `crc6c_name`.

## Concepts learned (each answers: what problem it solves, and when not to use it)

### Copilot Credits and capacity

Copilot Studio usage is metered in Copilot Credits; one interaction counts as one credit. Capacity has two layers, **purchased at the tenant level and allocated at the environment level**: prepaid capacity goes into the tenant pool first, then an admin allocates it to specific environments in PPAC. An environment that hasn't been allocated capacity may fail to run even if the tenant has some, with error code `EnforcementUsageCredits`.

Four ways to get capacity: Copilot Studio (Trial), free for one month with capacity; a paid Copilot Studio subscription that buys capacity per seat; a pay-as-you-go billing plan linked to an Azure subscription, billed at US$0.01 per credit; and draw from tenant, using the tenant's unallocated capacity.

Tell the two kinds of SKU apart: a **User License** grants access (who can get into Copilot Studio and build agents), while **Copilot Studio / Copilot Studio (Trial)** grants message capacity (whether the agent can run). The capacity wall blocks the latter.

When not to use prepaid: when usage is unpredictable or you're only learning and experimenting, prepaid gets wasted; pay-as-you-go fits better, with the downside that it needs an Azure subscription.

### How environment, Dataverse and solution relate

(What follows is a reference answer. It only really counts once I can close the notes and explain it in my own words.)

In one sentence: **the environment is the boundary, Dataverse is the database inside that boundary, and a solution is the box you pack with selected components to move them out of the boundary.**

An **environment** is a container under the tenant, and the boundary where three things apply at once: a security boundary (its own security roles; who can get in and what they can do is decided here), a data boundary (bound to one region, where the data stays) and a governance boundary (DLP policies apply per environment). ALM layering also relies on it: dev / test / prod are three environments, not three folders. Types are Default, Developer, Sandbox, Production, Trial and Teams. My HR-Dev is a Developer environment: free with the Developer Plan, single-user, not for production.

**Dataverse** is the data platform inside the environment: tables, columns, relationships, business rules, plus a row-level security model. The key point is that **Copilot Studio agents themselves are stored in Dataverse** (an agent is a Dataverse record), which is why an agent can be packed into a solution and moved. It is not a side-by-side "agent in Copilot Studio, data in Dataverse" relationship.

A **solution** is the ALM packaging unit. It isn't a folder; it holds **references to components in the environment**. It has a publisher and a prefix (the default publisher in my environment gives the prefix `crc6c_`, which is where every column name in the Employee table gets its prefix). There are two kinds: **unmanaged** is the development state and can be edited; **managed** is the deployment state and is locked against direct edits in the target environment. You move it by export / import, or with Power Platform Pipelines (to do in M6).

When not to use them:

- Don't build everything in the **Default environment**: it's open to everyone in the tenant, can't be deleted, and can't be layered for ALM. A Developer environment also shouldn't run production or be shared with others.
- If the authoritative data already lives in SharePoint / SQL / Fabric, don't copy it into **Dataverse** just for convenience; read it with a connector. Unstructured documents belong in **Dataverse** even less: that's the job of a knowledge source.
- Don't work in the **Default solution**: components scattered there can't be moved as a whole. And don't edit a managed solution as if it were an editable development artifact.

### What agent, topic, knowledge and tool each are

(Same as above: reference answer.)

The division of labor in one line: **the agent decides "which one", a topic defines "how to go step by step", knowledge answers "what is it", and a tool handles "do something / what is it right now".**

The **agent** is the whole. It carries natural-language instructions (who it is and how it should respond), with topics, knowledge and tools attached underneath. Keep the two orchestration modes apart: **classic orchestration** matches on topic trigger phrases; with **generative orchestration** the model reads the instructions and each component's description, decides on its own which topic / knowledge / tool to call, and can chain several of them. The latter is the focus of the exam objectives, and it also means that **how well each component's description is written directly decides how accurate orchestration is**.

A **topic** is a conversation flow: one trigger plus a graph of nodes (Message, Question, Condition, variables, calling a tool, and so on). It solves **deterministic** problems: scenarios with fixed, auditable steps that must collect information in order, such as a leave request that asks for the type, then the dates, then goes through approval. When not to use it: hand-writing topics for open-ended Q&A is never enough no matter how many you write; leave that to generative answers with knowledge.

**Knowledge** is a data source for grounding: SharePoint, Dataverse tables, public websites, uploaded files, Azure AI Search, Copilot connectors. It solves **making answers rest on company content rather than the model's memory**, with citations. When not to use it: when you need to perform an action or fetch live transactional data. Knowledge is read-only and has indexing lag (my SharePoint documents also took a while to become searchable after upload), so it can't answer "how many days of annual leave do I have left".

A **tool** is what lets the agent actually do things or fetch live data: agent flow, connector action, custom connector, REST API, MCP server, custom prompt. When not to use it: purely static policy Q&A doesn't need a tool; adding one only adds orchestration uncertainty and latency.

An easy dividing line to remember: **"How many days of annual leave does company policy give?" goes to knowledge; "How many days do I have left?" must go to a tool.**

### Classic vs generative orchestration

Where to set it: the agent's **Settings → Generative AI → Orchestration**, one or the other. New agents default to generative.

**Classic orchestration**: the user says something → that sentence is intent-matched against each topic's **trigger phrases** → whichever topic matches gets its node graph run; only one per turn. To chain topics, you put Redirect nodes into the graph yourself. A tool is only called where you manually placed it in some topic. Knowledge isn't used automatically either: it's only searched if you put a **Generative answers node** in a topic. If no topic matches, it falls through to the fallback topic.

**Put simply: the routing logic is hard-coded by you; the model only does one thing, "which topic does this sentence look like".**

**Generative orchestration**: the model reads the agent's **instructions** plus each topic / tool / knowledge source's **description**, plans on its own which ones to use this turn and in what order, and **can chain several in one turn**. It fills tool input parameters from the conversation context itself and asks follow-up questions when a required one is missing. Knowledge needs no node; it searches when it judges it should. Finally it combines the results of each step into one answer.

**Put simply: the description is the API documentation you give the model; write it badly and orchestration picks wrong.** In classic, trigger phrases are the star; in generative, the description is. This is the easiest trap after switching modes: switch an old agent over directly, with topics full of trigger phrases and empty descriptions, and the model has no idea when to use them.

Side by side:

| | Classic | Generative |
|---|---|---|
| How it chooses | Intent matching on trigger phrases | Instructions + each component's description |
| How much per turn | One topic | Several topics / tools / knowledge chained |
| Where tool inputs come from | You pass them explicitly in the graph | The model extracts them from context and asks if any are missing |
| How knowledge is used | Manually place a Generative answers node | Decides automatically whether to search |
| Predictability | High: the same sentence takes the same path | Low: the same sentence may take different paths |
| Where design effort goes | Drawing node graphs | Writing instructions and descriptions |

When not to use generative: when a process has compliance or audit requirements, must be identical every time, or needs word-for-word wording, such as offboarding settlement or complaint intake. Its other costs are higher latency, more credits consumed and harder testing (non-determinism means passing once doesn't mean passing every time, which is why M6 builds test sets).

When not to use classic: open-ended Q&A, or scenarios with many intent combinations that need several tools working together to answer. Trigger phrases keep piling up the more you maintain them, and users who phrase things differently slip through.

**Mixing them is the norm**: generative orchestration overall, with the few steps that must be deterministic written as separate topics. Topics can still be chosen in generative mode; the basis for choosing them just becomes their description.

### Learning Path
Design agent conversations and responses using topics in Microsoft Copilot Studio: 2 hr 17 min
Design and build multi-agent solutions in Microsoft Copilot Studio: 2 hr 54 min
Integrate agents with enterprise systems in Microsoft Copilot Studio: 3 hr 18 min

## Not yet understood, left for later

- How exactly to debug generative orchestration: can I see which components the model chose this turn, and why? Look at it hands-on in the test pane during M1.
  **Answer (M1 Task 4/7): Yes.** In the test pane's **Activity** tab, every turn has an execution trace like "Interpreting topic intent → Executing topic flow / Other sources searched over → Processing topic outcome / Crafting final response"; expanding **Rationale** shows the reasoning for why this step chose a particular topic/knowledge. Debugging in Tasks 4, 5 and 6 relied entirely on this pane.
- In generative mode, do a topic's trigger phrases still do anything, or are they completely replaced by the description? In M1, deliberately leave a topic with only trigger phrases and an empty description, and see whether it gets chosen.
  **Answer (M1 Task 4): The mechanism doesn't exist at all; it isn't just "weaker".** In generative mode a topic's Trigger card only offers "The agent chooses", with no keyword list; it relies on semantic matching of Name + Description, the same approach as function calling. Trigger phrases are a mechanism exclusive to classic orchestration.

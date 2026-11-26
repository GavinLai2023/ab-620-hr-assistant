# 1. Plan integration with enterprise systems

## What this bullet tests

Given a business need (look up data, perform an action, hand off to another agent), choose the right integration method and explain the cost clearly: who maintains the spec, whether it can be reused, whose identity it uses to access things, and what happens when it fails.

## How HR Assistant does it

| Need | What I used | Source |
|---|---|---|
| Answer policy questions | knowledge: SharePoint site, uploaded files, Azure AI Search | M1 Task 3, M4 Task 4 |
| Look up an employee's balance | REST API tool (OpenAPI) → later switched to a custom connector | M3 Task 4, 5 |
| Look up employees by department | Send HTTP request node in a topic | M3 Task 6, M6 Task 7 |
| Look up employees and balances (a second route) | MCP server | M3 Task 7 |
| Submit leave, approve cancellation | agent flow (Power Automate + Dataverse) | M2 |
| Onboarding checklist | connected agent (Onboarding Agent) | M5 Task 2 |
| Policy summary | Foundry agent | M5 Task 3 |
| HR data analysis | Fabric data agent | M5 Task 6 |
| Shift scheduling | A2A (didn't get it working) | M5 Task 5 |
| Third-party system as a knowledge source | Copilot connector (didn't get it connected) | M4 Task 8 |

## Comparing the options

| Method | What it solves | When not to use it |
|---|---|---|
| **Prebuilt Power Platform connector** | Common SaaS (Dataverse, SharePoint, ServiceNow…) works directly, with a connection handling auth | The system has no prebuilt connector |
| **Custom connector** | Wraps your own API as an environment-level resource that agents, Power Automate and Power Apps can all reuse; can choose End user credentials | A simple API called once by only one agent |
| **REST API tool** | Import OpenAPI in Copilot Studio, the fastest way to connect (a connector is generated underneath too) | The same API also needs to be used by Power Automate; the wizard doesn't read `securitySchemes`, so auth has to be configured by hand |
| **Send HTTP request node** | A fixed step in a topic, callable as long as you have the URL; timeout and continue-on-error can be configured | You want the orchestrator to decide when to call it; you need to hold a real secret (the header is plain text and goes into the solution package); you need to access things as the user |
| **MCP server** | The other side provides a set of tools, connected through one URL; the tool list changes with the server, and other MCP clients can use it too | The maker needs to control the tool descriptions and parameters; results need to be used as typed fields |
| **Agent flow** | Fixed, auditable multi-step actions that give the same result every time; can do human-in-the-loop approval; has run history | Things where how to do them must be decided by reasoning |
| **Connected agent / Foundry / A2A** | Hand a whole block of responsibility to another agent (with its own knowledge, instructions and release cadence) | You're only adding one capability (look up data, call an API) → use a tool or MCP |
| **Copilot connector (knowledge)** | Indexes a third-party system's content into Microsoft Graph and searches it as a knowledge source | You need real-time data or need to perform actions → use a Power Platform connector |
| **Computer use** | The system has no API at all, only a UI | Don't use it if there's an API; it's slow and fragile, and needs a machine and credentials |

**Order of choice (conclusion from M3 Task 9):** prebuilt connector → custom connector (when reuse is needed) → MCP (the other side provides a server, or the tools change often) → Send HTTP request (a one-off, fixed call) → computer use (last resort).

**One more thing to decide separately: whether data must be isolated by user permissions.** If so, only paths that support OAuth + End user credentials will do, which rules out Send HTTP request and a shared API key.

## What's the real difference between Send HTTP request and an API tool / connector

Underneath they're the same: all three end up sending an HTTP request to the same API (in M3 I called the same Employee API all three ways), and none needs code. The difference is in two places:

**1. Who decides to call it.** The HTTP node is **a step** in the topic's flow; it's called only when the topic reaches it, and the orchestrator can't see it. A tool / connector is **a capability** of the agent, and can be used either way:
- Trigger = By agent: the orchestrator sees the name and description and decides for itself when to use it.
- Trigger = None: the orchestrator can't see it; it can only be called from a Tool node inside a topic (the Leave Balance topic in M3 Task 8). Used this way it's much like the HTTP node.

**2. What surrounds the request.**

| | Send HTTP request | API tool / connector |
|---|---|---|
| Where the interface spec is written | URL written directly in the node | OpenAPI definition, stored as a connector |
| Where the key lives | In the topic's header, **in plain text**, travelling with the solution package (found `dev-local-key` by searching the M6 export package) | In the connection, not in the package |
| Whose identity | Only a fixed key | Can choose End user credentials |
| Returned result | Pick a schema yourself or use `ParseJSON()` | Turned into typed fields according to the schema |
| Reuse | Only in this topic | Usable by agents, flows and apps in the same environment |
| How DLP governs it | Blocks `HTTP` as a whole | Governed per connector |

**In one sentence:** the HTTP node is "a call hard-coded into a flow"; a tool / connector is "a reusable, authorizable capability given to the agent".

## Can each method access things as the user

"Maker-provided" = the credentials of whoever created the connection (in this project that happens to be the admin account; in a real company it's often a developer or a dedicated service account).

| Method | User identity | Fixed identity (maker / key) | Actual in this project | Basis |
|---|---|---|---|---|
| Power Platform connector (Dataverse etc.) | Yes | Yes | M1 Dataverse actually uses the maker identity | Tested hands-on + docs |
| Custom connector / REST tool | Yes, **provided the connector's auth is OAuth 2.0** | Yes | Maker-provided + API key | Tested hands-on |
| MCP server | Yes (End user by default) | Yes | Anonymous; in M4 the user had to confirm in the connection manager the first time | Tested hands-on |
| Foundry agent | Yes | — | End user credentials | Tested hands-on |
| Connected agent | Uses the conversation's user themself | — | Yes | Tested hands-on |
| Agent flow | Not verified whether it can be changed | The author's connection | Author identity, with a warning on the Channels page | Tested hands-on (only saw the author identity) |
| Send HTTP request | No switch; with Authenticate manually you can put `User.AccessToken` into the Authorization header by hand | Fixed key written in the header | Plain-text `dev-local-key` | Docs (the token part not tested) |
| A2A | Depends on what auth the other side supports | API key | API key | Tested hands-on |
| Computer use | — | Maker-provided by default, credentials stored in a vault | Didn't get it running | Tested hands-on |
| SharePoint knowledge source / Copilot connector | Filtered by user permissions (users can only find documents they're allowed to see) | — | SharePoint uses Microsoft authentication | Docs |

### How the two settings differ

| | User identity (End user credentials) | Fixed identity (Maker-provided) |
|---|---|---|
| **Agent authentication** | Must be able to identify the user: Authenticate with Microsoft or manual. **No authentication won't work** | Any authentication works, even No authentication |
| **Backend** | Must support delegated authorization (OAuth 2.0 / Entra ID); configure OAuth 2.0 in the connector's Security (needs an app registration) | API key, Basic or OAuth all work |
| **Tool setting** | Credentials to use = **End user credentials** | Credentials to use = **Maker-provided credentials** |
| **Who creates the connection** | Each user creates their own on first use (pops up "Let's get you connected" → connection manager) | The maker creates it once, shared by everyone |
| **At publish** | No warning | The Channels page warns "Your agent runs tools that use the author's credentials" |
| **What the backend sees** | Each real user, with permissions and auditing per person | Always the same account; can't tell who it is |
| **How it fails** | User not connected, token expired → needs reconnecting (after the M6 reinstall I had to reconnect) | Once the maker's password or key changes, it breaks for everyone at once (M3: all 401 after changing the key) |

**Setting an API key connector to End user makes no sense**: it just makes every user type in the same key themselves (which is why M3 Task 4 switched to Maker-provided).

## Easily confused points in the exam

- **A Copilot connector and a Power Platform connector are not the same thing.** The former is a knowledge source (content indexed into Graph first); the latter is a tool called in real time. Salesforce and ServiceNow on Copilot Studio's Knowledge page are actually Power Platform connectors querying in real time (M4 Task 8).
- **Send HTTP request is not a tool**: the orchestrator can't see it; it's only called when the topic reaches the node.
- **A tool being On doesn't mean the orchestrator can use it**: with Trigger = None it can only be called by a topic (M3 Task 10).
- **For "a capability" use a tool or MCP; for "a collaborator" use a connected agent, Foundry or A2A** (M5).

## Sources

- Tested hands-on: `milestones/M3-tools/notes.md` (Task 9 comparison table, concepts learned 1–3), `milestones/M4-azure/notes.md` Task 8, `milestones/M5-multi-agent/notes.md` "Multi-agent design"
- Docs: [Add tools to custom agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent), course module [Design integration strategies for agents](https://learn.microsoft.com/en-us/training/modules/design-integration-strategies-agents-github-copilot/)

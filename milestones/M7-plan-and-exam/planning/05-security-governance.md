# 5. Evaluate security and governance considerations

## What this bullet tests

What controls admins and makers each have to govern what an agent can connect to, where it's published, who can use it, and whether you can trace things when something goes wrong.

## How HR Assistant does it

- **Environment tiers**: develop in HR-Dev, test in HR-Test; the environment is the boundary for three lines: security, data and governance (M0).
- **Managed Environment**: HR-Test was converted to a Managed Environment during Pipeline deployment (M6 Task 6).
- **Warning before publishing**: the Channels page warns that tools use the author's credentials (M4 Task 9).
- **Checking the solution package**: the export package contains the tunnel address and `dev-local-key`, so the package doesn't go into Git (M6 Task 6).
- **DLP**: M7 Task 3 experiment, see "DLP tested hands-on" below.

## DLP tested hands-on (2026-11-05)

Policy `M7-DLP-Test` scoped to HR-Dev only, blocking `HTTP` and `Chat without Microsoft Entra ID authentication in Copilot Studio`, took effect within minutes.

| | HR Assistant Classic (HTTP blocked) | HR Careers FAQ (unauthenticated chat blocked) |
|---|---|---|
| When it blocks | At runtime, the moment the conversation reaches the HTTP node; the whole turn errors | Blocked as soon as the conversation starts |
| Test pane message | "This connector HTTP is blocked by your organization's data loss prevention policy…" | "This environment requires users to sign in… Go to Settings > Security > Authentication" |
| Publish | The dialog shows an error and blocks publishing | The button is simply greyed out |
| Already-published version | Also in violation | Demo website visitors only see "Sorry, something unexpected happened" |
| Details file (Download) | Topic = Department Lookup, type Http request | Topic = `-`, type Copilot authentication |
| Error code | `DataLossPreventionViolation` | Same as left |

- **Connectors that can't be Blocked** (Blockable = No): core connectors such as SharePoint, OneDrive for Business, Dataverse and Standard approvals can only be put in Business or Non-business.
- **Custom connector default rule**: a new policy comes with 1 pattern; unless changed, all custom connectors are in Non-business.
- **The details file has 4 sheets**: Violations overview, DLP violations (error type: Connector blocked or data group conflict), ACP violations, Blocked channels (empty for both agents this time).
- After deleting the policy both agents recovered (see break-and-fix).

## Comparing the options

| Control | Who configures it | What it solves | Limits |
|---|---|---|---|
| **Data policy (DLP)** | Admin, Power Platform admin center → Security → Data and privacy → Data policy | Sorts connectors into Business / Non-business / Blocked; connectors in different groups can't be used together. Copilot Studio's own "connectors" can block: unauthenticated chat, HTTP requests, individual channels, Bot Framework skills, event triggers, App Insights | On violation Publish is blocked, and runtime is blocked too (see hands-on test below); applies per environment or tenant |
| **Endpoint filtering** | Admin, in the data policy | Instead of blocking HTTP entirely, only allow or deny certain addresses (also used for SharePoint and public website knowledge sources) | The address list has to be maintained |
| **Environments and environment routing** | Admin | Steer makers to personal developer environments instead of building things all over the Default environment | |
| **Managed Environment** | Admin | More governance features (Pipelines targets, sharing limits, usage insights etc.) | Production environments usually need premium licensing |
| **Share** | Maker | Controls who can edit and who can chat | Who can chat can only be restricted with Microsoft authentication or manual Entra ID + Require sign-in |
| **Credentials to use** | Maker | Whether a tool uses the user's identity or the maker's | Defaults aren't consistent |
| **Audit logs (Purview, Sentinel)** | Admin | See what makers did and what agents did | Purview auditing has to be turned on |
| **Automatic security scan / runtime protection status** | Seen by the maker | Flags risky configuration before publishing | |
| **Sensitivity labels (SharePoint knowledge source)** | Determined by Purview labels | Answers show the highest label among the sources | |
| **Disable generative AI publishing, restrict cross-geo data movement** | Admin | Tenant-level switches | |
| **CMK (customer-managed keys)** | Admin | Encrypt with your own keys | |
| **Agent 365** | Admin | Agents get an identity in Entra, governed with Conditional Access and network controls, with a central inventory | Only read the docs |

## Easily confused points in the exam

- **Since 2025, DLP is enforced for all tenants**, with no exemption.
- **To forbid anonymous agents**, block `Chat without Microsoft Entra ID authentication in Copilot Studio`. **It also blocks Generic OAuth 2 under Authenticate manually** (tested hands-on: the Authentication page says "No authentication and service provider Generic OAuth 2 aren't available"), leaving only Authenticate with Microsoft and manual + Entra ID. So "require all agents to use Entra ID authentication" means blocking this one.
- **DLP doesn't only block Publish**: it blocks at runtime too, so already-published agents error immediately, with no warning for live users. Check the affected agents before changing a policy.
- The details file still calls it "Chat without **Azure AD** authentication", the old name for the same thing.
- **To forbid the HTTP node**, block `HTTP`; to allow only certain addresses, use endpoint filtering.
- **To forbid publishing to websites**, block `Direct Line channels in Copilot Studio` (including the demo website).
- **Blocking a Power Platform connector also blocks the MCP tools that depend on it.**
- Content moderation is a responsible AI measure; DLP governs **where data can flow**. Don't mix the two up.

## Sources

- Tested hands-on: `milestones/M0-environment/notes.md` (environments), `milestones/M4-azure/notes.md` Task 9, `milestones/M6-test-alm/notes.md` Task 6, `exports/README.md`; DLP experiment see Task 3
- Docs: [Configure data policies for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention), [Security and governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance), course module [Design a governance and security strategy](https://learn.microsoft.com/en-us/training/modules/design-governance-security-strategy-copilot-studio/)

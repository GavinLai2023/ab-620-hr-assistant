# 2. Plan identity strategy

## What this bullet tests

Two levels:
1. **How users get in**: the agent's authentication setting (who can chat with it, and whether it can get the user's token).
2. **Whose identity the agent uses to access the backend**: whose credentials each tool and connection uses.

## How HR Assistant does it

- User authentication: **Authenticate with Microsoft**. So at M4 publish time only the Teams + M365 and SharePoint channels were available (M4 Task 9).
- Backend identities all differ (M3 Task 9, point 3 of "Multi-agent design" in M5):

| Backend | Identity | Risk |
|---|---|---|
| Employee API (custom connector) | Maker-provided, shared API key | Same for whoever asks; change the employee ID and you can look up someone else's balance |
| Department Lookup (HTTP node) | Plain-text `dev-local-key` in the header | The key travels with the solution package |
| SubmitLeaveRequest flow | The author's connection | At publish the Channels page warns "Your agent runs tools that use the author's credentials" |
| HR MCP Server | Anonymous tunnel; in M365 Copilot the user had to confirm the connection in the connection manager the first time | The URL is the key |
| HR Policy Summariser (Foundry) | End user credentials | Users have to reconnect after publishing or reinstalling |
| Onboarding Agent (connected) | The conversation's user themself | If the other side turns off "Let other agents connect", the main agent breaks |

## Comparing the options

**User authentication (Settings → Security → Authentication):**

| Option | What it is | Channels available | When not to use it |
|---|---|---|---|
| **Authenticate with Microsoft** | Uses Entra ID automatically; the user is already signed in; no configuration | Teams, SharePoint, Power Apps, Microsoft Copilot | You need to publish to a website or other channels; you need `User.AccessToken` |
| **Authenticate manually** | Configure Entra ID yourself (v2, client secret / certificate / federated credentials) or Generic OAuth 2 | All channels; can turn on **Require users to sign in** | Only for internal employees in Teams and M365 (the Microsoft option is less hassle) |
| **No authentication** | No sign-in; anyone with the link can chat | All channels, including the demo website | Accessing any non-public data; DLP can forbid it |

- **SSO**: with Authenticate manually + Entra ID, fill in the Token exchange URL to avoid a second sign-in in channels like Teams.
- **Controlling who can chat**: only Authenticate with Microsoft, or manual with Entra ID + Require users to sign in, lets you restrict who in the organization can chat by "sharing the agent". Neither No authentication nor Generic OAuth 2 can control it.
- Authentication changes **only take effect after Publish**.

**Backend identity (each tool's Credentials to use):**

| Method | Who the backend sees | When to use it | When not to use it |
|---|---|---|---|
| **End user credentials** (user delegation) | The person asking | Each person can see different data; let the source system control permissions | Agents running autonomously with no user present; too many users, each having to authorize once |
| **Maker-provided credentials** | The maker themself or a service account | Shared read-only data; everyone has the same permissions | Data must be isolated per person; when the maker has broad permissions, anyone who can chat is using the maker's permissions |
| **API key** | "The service holding this key" | Simple internal services with no notion of users | Auditing down to the person is needed; once the key leaks everything leaks, and once it's rotated everyone gets 401 together |
| **No authentication** | Nobody | Public data | Every other case |

Defaults aren't consistent: REST tool and MCP default to End user, computer use defaults to Maker-provided. Check every time you add a tool.

## What `User.AccessToken` is, and why only manual has it

**access token**: the "electronic pass" Entra ID issues after the user signs in, stating who it is, which system it can access, what it can do and when it expires. The API validates it and knows who is accessing.

| | Authenticate with Microsoft | Authenticate manually |
|---|---|---|
| Who handles sign-in | Copilot Studio does it all | You register an app in Entra yourself (app registration), filling in Client ID, Scopes and so on |
| Who the pass is for | Microsoft's own services (Teams, SharePoint, Copilot) | **The API you specify** (decided by Scopes) |
| What a topic gets | `User.Id`, `User.DisplayName`: knows who it is, can't get the pass | Additionally **`User.AccessToken`** and `User.IsLoggedIn` |

**How to use it:** in Send HTTP request's header write `Authorization: "Bearer " & User.AccessToken`; your API validates it and returns data per person. Compare the current Department Lookup: the header is `dev-local-key`, so the API only knows "someone is holding the key", not who.

**Don't mix them up:** when a connector / tool uses End user credentials it **doesn't use** `User.AccessToken`, because the connection does its own OAuth and stores its own pass. `User.AccessToken` is mainly for scenarios like the HTTP node where you "build the request yourself".

## Easily confused points in the exam

- **"How the user signs in" and "whose identity the agent uses to call the backend" are two separate things.** Even if the user signed in with Microsoft, a tool can still use the maker's credentials.
- `User.AccessToken` **only exists with Authenticate manually**. To pass the user's token to your own API, you have to choose manual.
- Once a tool is set to End user credentials, you **can't turn off agent authentication**, or the tool won't work.
- Sign-in flows can be blocked too: in M3 the device code flow was blocked by Conditional Access, and switching to WAM interactive sign-in got through (presumably a CA policy; I didn't look at the error code).
- **New stuff (only read the docs)**: with Agent 365, a Copilot Studio agent can have its own identity in Entra and be governed by Conditional Access.

## Sources

- Tested hands-on: `milestones/M3-tools/notes.md` (sign-in gotcha, Task 9 Identity notes, concept learned 4), `milestones/M4-azure/notes.md` Task 9, `milestones/M5-multi-agent/notes.md` "Multi-agent design", `milestones/M6-test-alm/notes.md` Task 7 (reconnecting)
- Docs: [Configure user authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication), [Security and governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance)

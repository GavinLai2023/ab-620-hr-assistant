# 3. Plan channels and deployment

## What this bullet tests

Where users use the agent, and how that choice knocks on to authentication, distribution, licensing and monitoring.

## How HR Assistant does it (M4 Task 9)

- HR-Dev (Developer environment) published successfully straight away, without being blocked by licensing.
- It uses Authenticate with Microsoft, so the Channels page only offers **Teams + Microsoft 365** and **SharePoint**.
- **M365 Copilot worked**: the first time the user uses the MCP tool they have to confirm the connection in the connection manager; this step isn't visible in the test pane.
- **Teams didn't install**: `Invalid Bot`, cause not found.
- In App Insights, `channelId = m365copilot` and `DesignMode = False` are real users; the test pane is `pva-studio`, `True`.

## Comparing the options

| Channel | Who can use it | Authentication requirement | Distribution | When not to use it |
|---|---|---|---|---|
| **Teams + Microsoft 365 Copilot** | Inside the organization | Authenticate with Microsoft (manual needs Teams SSO and an app manifest configured separately) | Copy link, download .zip, "Show to my teammates" (no approval needed), "Show to everyone in my org" (needs admin approval) | External users |
| **SharePoint** | Users in the organization who can access the site | Microsoft | Placed on the site | Scenarios unrelated to the site |
| **Demo website** | Anyone with the link | No authentication or manual | A share link for testing | Going live for real |
| **Custom website / mobile app (Direct Line)** | Anyone (depends on the authentication setting) | No authentication or manual | Embed the Web Chat control or call the Direct Line API | Internal employees only |
| **WhatsApp, Facebook etc.** | External customers | No authentication or manual | Configured per platform | Internal scenarios |
| **Dynamics 365 Customer Service (Omnichannel)** | Customers, with handoff to a human | Can't use Authenticate with Microsoft | Integrated with the customer service system | No handoff to a human needed |

**Deployment level (M6):** develop in HR-Dev, deploy to HR-Test (Managed Environment) with a solution + Pipeline; the values of connections and environment variables are set separately in the target environment.

## Easily confused points in the exam

- **Channels are first limited by the authentication setting.** If a question says "publish to the company website" and also "use Authenticate with Microsoft", the two contradict each other.
- **"Show to everyone in my org" needs admin approval**; "Show to my teammates and shared users" doesn't.
- **DLP can block by channel**: for example `Direct Line channels in Copilot Studio`, `Microsoft Teams + Microsoft 365 Channel in Copilot Studio`. If every channel is blocked you can't publish.
- **The test pane hides the first-time connection confirmation step**; test once in a real channel before going live.
- **Customer Conversation harness** (new): built specifically for website chat and phone customer service, with handoff to a human (see `08-harnesses.md`).

## Sources

- Tested hands-on: `milestones/M4-azure/notes.md` Task 9 (channel comparison table), `milestones/M6-test-alm/notes.md` Task 6
- Docs: [Configure user authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication), [Configure data policies for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention)

# 7. Design agents for internal or external audiences

## What this bullet tests

The same capability, used by employees versus external customers, needs a different mindset for authentication, channels, knowledge, tools, moderation and billing.

## How HR Assistant does it

HR Assistant Classic is the internal agent. The external comparison is `HR Careers FAQ` (for job seekers), to be built in Task 3. Hands-on results to be added to the table below once done.

## Internal vs external comparison

| Aspect | Internal (employees) | External (customers, job seekers, the public) |
|---|---|---|
| **Authentication** | Authenticate with Microsoft; the user is already signed in | No authentication (public information), or manual + Generic OAuth 2 / Entra External ID (when customers need to be identified) |
| **Channels** | Teams, M365 Copilot, SharePoint | Website (Direct Line, Web Chat), mobile app, WhatsApp, Facebook, phone |
| **Knowledge sources** | SharePoint, internal files, Dataverse; filtered by user permissions | Public content only; **never include internal data**, because anyone can ask |
| **Tools** | Can access internal systems as the user | As few as possible; call only interfaces built specifically for external use; don't access internal systems with maker credentials |
| **Controlling who can use it** | Shared with specified users or groups | Anyone with the link can use it; can't be controlled |
| **Content moderation** | Normal | Stricter: expect malicious prompts, jailbreaks and harassment; turn moderation up |
| **Handoff to a human** | Usually not needed, or hand off to the HR email | Often needed (Omnichannel, Customer Conversation harness) |
| **Transparency** | Employees know it's an internal tool | Tell users clearly that they're talking to AI |
| **Billing** | When employees have M365 Copilot licenses, some usage is included in the license (my guess, to verify) | Consumes Copilot Studio capacity or Copilot Credits per message |
| **Governance** | DLP can require authentication | DLP must allow `Chat without Microsoft Entra ID authentication` and `Direct Line channels` |

## HR Careers FAQ tested hands-on (2026-11-05)

| | HR Assistant Classic | HR Careers FAQ |
|---|---|---|
| harness | standard | standard |
| Authentication | Authenticate with Microsoft | No authentication |
| Channel | M365 Copilot (Teams didn't install) | Demo website (incognito window, can chat without signing in) |
| Knowledge sources | SharePoint, files, Azure AI Search | Only `careers-faq.md` |
| Tools | connector, MCP, flow, sub-agent | None |
| Who can use it | People it's shared with | Anyone with the link |
| Asking "How many annual leave days does Ben have?" | Finds the balance | Refuses, points to `careers@contoso.example` |

The refusal comes from the instructions; but the real protection is that the knowledge sources and tools contain no internal data at all. Instructions can be bypassed by a jailbreak; "not attached" can't.

## Easily confused points in the exam

- **The most common mistake with external agents**: also attaching internal knowledge sources or tools that use maker credentials, so that anyone can look things up.
- **With No authentication you can't get the user's identity**, so you can't do per-person answers like "look up my own orders". To do that you need manual authentication.
- **For customer service scenarios that need a handoff to a human**, think Omnichannel or the Customer Conversation harness.

## Sources

- Tested hands-on: `milestones/M4-azure/notes.md` Task 9 (channel comparison), HR Careers FAQ in Task 3
- Docs: [Configure user authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication), [Harnesses in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)

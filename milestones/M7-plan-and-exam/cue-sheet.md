# One-page pre-exam sheet: discriminator cues (2026-11-25)

How to use: read it through once during the day of 11-26. The left column is the keyword to look for in the question stem; the right is the answer.

## 0. Three things to remember first

1. **Client = the application, not the user.** Client ID and client secret both live on the App registration.
2. **Copilot Studio telemetry in App Insights: always query customEvents.**
3. If the question asks for a **knowledge source**, don't pick a tool; if it asks about **one specific node**, look in that node's own properties.

## 1. Identity and authentication

| Cue in the stem | Answer |
|---|---|
| Signed-in user + a middle tier calling further downstream **as the user**; the incoming token's audience is the middle tier | **On-Behalf-Of (OBO)** |
| **No user**, scheduled job, background service, application permissions | **Client credentials** |
| User signs in personally on a sign-in page | Authorization code |
| Device without a keyboard | Device code |
| AI Search: **store no keys, no app registration**, use the creator's own identity | **Entra ID Integrated** (the maker's identity, not the end user's) |
| AI Search: **must keep working after the maker leaves**, no shared key | **Service principal** |
| AI Search: simplest, shared key | Access key |
| **Each user may only see content they have permission to** | Don't pick from the three AI Search auth types; look for a Copilot connector or user authentication |
| Custom website + OBO | Authenticate manually + require users to sign in |
| Least privilege to call a Foundry agent | Foundry **Agent Consumer** role, scoped to the agent |

## 2. Networking

| Cue in the stem | Answer |
|---|---|
| Azure resource with **public access disabled**, reachable through a **private endpoint**; the stem mentions a Managed Environment | **VNet support** (subnet delegation) |
| Data in an **on-premises data center** (on-premises SQL) | **On-premises data gateway** |

## 3. Knowledge

| Cue in the stem | Answer |
|---|---|
| **Semantic retrieval across article content** (ServiceNow knowledge articles), with user permissions checked at query time | **Unstructured data source** (ingested into Dataverse with a semantic index) |
| Query **structured records in tables**, **data stays in the source system**, changes often | **Real-time knowledge** (Power Platform connector, user token) |
| Must be **searchable in Microsoft Search**, security-trimmed by ACL | **Copilot connector** |
| Must **perform an action** (create / update) | **Connector action as a tool** |
| The knowledge source doesn't understand users' words or internal terms | **Synonyms + glossary** on the knowledge source |
| A tool isn't being called | Improve the tool's **name + description** |

## 4. Topics and generative answers

| Cue in the stem | Answer |
|---|---|
| Affects **only this one** generative answers node: format, audience, what to say when nothing is found | The node's **Data source configuration pane** → custom instructions |
| Affects the **whole agent's** tone | The agent's **Instructions** (Overview page) |
| A separate prompt feature | Custom prompt editor (distractor) |
| Different replies per channel | Condition on **ChannelId** |

## 5. Multi-agent

| Cue in the stem | Answer |
|---|---|
| A published Copilot Studio agent in the **same environment**, **reused in several places** | Add agent → **Copilot Studio** (connected agent) |
| Used only inside the parent agent, not reused | **Child agent** |
| An agent on a **non-Microsoft platform** | **A2A**: enter the `/a2a` **communication endpoint** (not the agent card); pick OAuth 2.0 to match the parameters the vendor gives |
| Data in Fabric, natural language to SQL/DAX/KQL | Fabric data agent (must be published in Fabric first) |

## 6. Testing and evaluation

| Cue in the stem | Answer |
|---|---|
| **Quick, small**, generated from description and instructions | **Quick question set** |
| **Specify the number of questions**, generated from knowledge or a file | **Full question set** |
| **Reuse the session from the test pane** | **Use your test chat conversation** |
| Single-turn reply, compare its meaning against the expected answer | **Compare meaning** |
| Overall score for a multi-turn (conversational) test | **General quality** (the compare graders can't be used; Keyword, Content safety and Custom can) |
| Failure class: **the expected answer itself is wrong** | Evaluation setup |
| Failure class: **the source was never added** | Knowledge configuration |
| Failure class: **the source is added, but the document is outdated or missing the content** | Knowledge content |
| Failure class: **the information is right, but the instructions don't describe this behavior** | Prompt / instruction gap |

For failure classification, ask four questions in order: is the exam paper right → was the book put on the shelf → is the book's content right → does the instruction manual say so.

## 7. Monitoring

| Cue in the stem | Answer |
|---|---|
| Query agent events | **customEvents** table (not traces) |
| Exclude test canvas events | `customDimensions['designMode'] == "False"` (a string) |
| Teams only | **channelId** |
| Computer use shows In progress, but that can't be trusted | Verify with **transcript mode** |

## 8. ALM and governance

| Cue in the stem | Answer |
|---|---|
| **Whose connection** (service account) differs per environment, without editing the flow | **Connection reference** |
| **A value** (URL) differs per environment | **Environment variable** |
| A sensitive value | **Secret** environment variable (stored in Key Vault) |
| A shared table **only gained one new column** | **Edit objects**, select only that column |
| Only the table's properties changed, no columns | **Include table metadata** |
| Bring the whole table | Include all objects |
| Put an agent into a solution and bring its dependencies | **Add required objects** (the connection itself is not carried over) |
| Pipeline **source** | The **reviewed, ready-for-release** environment; in-progress development environments stay out of the pipeline |
| Pipeline target environments | Managed Environment |
| **Everyone in the organization** can find it in Teams | Show to everyone in my org + **submit for admin approval** |
| Only **users it's already shared with**, no admin involved | Show to my teammates and shared users |
| DLP: connector groups | Business / Non-business / Blocked; new connectors default to Non-business; **scope it to a specific environment** |

## 9. Exam-room rules

- Flag questions you're unsure about and come back at the end; Microsoft Learn is available, but searching is slow, so use it only to confirm names.
- Yes/No series: judge each proposed solution against the **original goal in the stem**; once you finish one, you can't go back and change it.
- If you see new-version content such as skills, memory or Foundry IQ, don't panic if you get it wrong.

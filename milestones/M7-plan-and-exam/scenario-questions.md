# M7 Scenario questions (Task 5, 2026-11-14)

AI wrote the questions and the user answered without looking anything up, split by domain weight: 7 for Plan and configure, 9 for Integrate and extend, 4 for Test and manage. The questions are company scenarios the AI made up, not original Microsoft questions.

**First-attempt score: 18 / 20 (90%)**. Readiness criterion 2 (≥ 16/20) met.

| Domain | Score |
|---|---|
| Plan and configure (1–7) | 7 / 7 |
| Integrate and extend (8–16) | 8 / 9 |
| Test and manage (17–20) | 3 / 4 |

Missed: 🔴 Q8 (bullet 23), 🔴 Q19 (bullet 42). Both were answered correctly in the English questions re-set with new scenarios in Task 6, so they are remediated (2026-11-18).

---

## Plan and configure

### Q1 (bullet 5) ✅
In the production environment a maker uses the HTTP connector to call an external personal cloud drive. Requirements: SharePoint and Dataverse keep working as usual, HTTP must not be in the same agent as them, and other environments are unaffected.

- A. Assign the maker a stricter security role
- B. Create a data policy (DLP): SharePoint and Dataverse in Business, HTTP in Non-business, scope set to the production environment only
- C. Change authentication to "Authenticate manually"
- D. Add a sensitivity label to the agent

User: B · Correct: B
Explanation: restricting by connector combination, and only for one environment, is exactly what DLP does. A security role governs Dataverse permissions; authentication governs user sign-in; a sensitivity label classifies data.

### Q2 (bullet 13) ✅
The ERP API called by an agent flow occasionally times out. Requirements: it must not fail silently; it should notify IT in Teams, then return a friendly message to the agent.

- A. Set the retry policy to None
- B. Scope (Try) + Scope (Catch), set Catch's Configure run after to has failed / has timed out, send the Teams message in Catch, then return the message with Respond to the agent
- C. Add a Condition after the API to check whether the output is empty
- D. Turn on Asynchronous response

User: B · Correct: B
Explanation: Try/Catch is implemented with Configure run after. Once an earlier step fails, a later Condition is skipped by default, so C can't catch it; asynchronous response solves waiting too long, it doesn't handle failure.

### Q3 (bullet 15) ✅
Every generative reply must use bullet points, stay under 100 words, have a friendly tone and include source links, and you don't want to edit topics one by one.

- A. Write the format requirements in the agent Instructions
- B. Add a Message node at the end of every topic
- C. Set content moderation to High
- D. Turn off Use general knowledge

User: A · Correct: A
Explanation: "applies globally" goes in the agent-level Instructions. Only when you want to control one particular Generative answers node do you write it in that node's own prompt.

### Q4 (bullet 8) ✅
The agent collects a fault description, calls a flow to create a ticket in ServiceNow, and returns the ticket number to the agent.

- A. When a new item is created + Send an email
- B. When an agent calls the flow + Respond to the agent (output `ticketNumber`)
- C. Recurrence + Respond to the agent
- D. When an HTTP request is received + Response, with the agent calling it via Send HTTP request

User: B · Correct: B
Explanation: an agent flow always has a fixed pair: it starts with When an agent calls the flow (old name Run a flow from Copilot) and ends with Respond to the agent. D would be exposed as an HTTP endpoint, and you'd have to handle authentication yourself.

### Q5 (bullet 7) ✅
A website agent for ordinary customers: no sign-in, must never touch internal SharePoint, kept separate from internal agents.

- A. Authenticate with Microsoft, publish to Teams
- B. No authentication, publish to the web channel, knowledge sources contain only public content
- C. Authenticate manually (Entra ID), add internal SharePoint, control with permissions
- D. Publish to Microsoft 365 Copilot

User: B · Correct: B
Explanation: an external agent is isolated by "not attaching internal data in the first place". External customers have no tenant account, so A, C and D won't work.

### Q6 (bullet 2) ✅
An agent in Teams reads Outlook calendars. Requirements: each person can only see their own calendar, and the audit log shows who accessed it.

- A. Maker-provided credentials, shared by everyone
- B. End user credentials, each user authorizes with their own account
- C. A dedicated service account, shared by everyone
- D. No authentication + Maker-provided

User: B · Correct: B
Explanation: both permissions and auditing have to follow the user themself, so use End user credentials. A shared identity shows everyone the same calendar, and the audit log only has one account.

### Q7 (bullet 22) ✅
The Greeting topic asks for the department, which several topics need; when embedded in a website you also want to pass the department in directly.

- A. Topic variable
- B. Global variable + External sources can set values
- C. `System.Activity.Text`
- D. Power Platform environment variable

User: B · Correct: B
Explanation: use Global to cross topics, and tick External sources can set values for values passed in from outside. An environment variable is "one value per environment" configuration, not a conversation variable (the difference between bullets 43 and 22).

---

## Integrate and extend

### Q8 (bullet 23) 🔴 Remediated
The IT knowledge base is in ServiceNow Knowledge, and some articles are visible only to specific groups. Requirements: each person only gets answers from articles they're allowed to see, no API calls written, and the index can also be used by M365 Copilot.

- A. Add the ServiceNow Power Platform connector as a tool and call Get knowledge articles
- B. An admin configures the ServiceNow Knowledge Copilot connector in the M365 admin center, and the agent adds it as a knowledge source
- C. Export the articles to PDF and upload them
- D. Call the ServiceNow API with Send HTTP request in a topic

User: A · Correct: B
Explanation: a Copilot connector (formerly Graph connector) indexes the content together with each article's permissions (ACL) into Microsoft Graph, filters by user at query time (permission trimming), and is shared at tenant level. A Power Platform connector is a tool for "doing things", with no pre-built index and no semantic retrieval. Rule of thumb: **to "know", use a Copilot connector (knowledge); to "do", use a Power Platform connector (tool)**.
Review: the Copilot connector section in notes.md; readiness question R1.

### Q9 (bullet 26) ✅
An old supplier portal with no API, whose UI is redesigned often, so recorded RPA breaks. The agent should look at the screen and decide for itself, and admins need to see every step.

- A. custom connector
- B. computer use tool, restricted to specific websites, monitored with run history and screenshots
- C. MCP server
- D. Record the steps with a Power Automate desktop flow

User: B · Correct: B
Explanation: for a stable UI with fixed steps use a desktop flow (cheap, predictable); for a UI that changes often and needs judgement, use computer use. A and C both require an API.
**Correction (2026-11-16):** the official Practice Assessment explanation states "Desktop flows can't be called from agent flows", so option D, "call a desktop flow from an agent flow", doesn't hold in itself, not just "breaks as soon as the UI changes". The "stable UI → desktop flow" point above only holds in an ordinary Power Automate cloud flow.

### Q10 (bullet 34) ✅
Partner Litware's agent, built on another framework, is deployed in their own cloud and exposes an A2A endpoint and agent card. Contoso wants to hand a whole task over to it.

- A. Create a new child agent
- B. Add it as a connected agent
- C. Agents → Add → Agent2Agent (A2A), fill in the endpoint and authentication
- D. Add it as an MCP tool

User: C · Correct: C
Explanation: look at where the other side lives. Another company, another framework: go with A2A. A connected agent must be a Copilot Studio agent in the same environment; MCP is "fill in a form, get a result", A2A is "hand over a task, get a report".

### Q11 (bullet 29) ✅
An internal inventory API has an OpenAPI spec and uses API key authentication. Several topics need it, the orchestrator should be able to decide on its own when to call it, and you don't want to fill in the URL and JSON by hand each time.

- A. Add a tool → REST API, upload the OpenAPI, configure the API key, select operations
- B. Add Send HTTP request to each topic
- C. Create a prompt tool describing the API address
- D. Upload the OpenAPI file as a knowledge source

User: A · Correct: A
Explanation: a REST API tool lets the orchestrator read the operation descriptions and choose for itself, with authentication configured only once. Send HTTP request is a fixed step written into a particular topic, suited to one-off use.

### Q12 (bullet 30) ✅
One agent has grown to 60 topics and 30 tools. The content belongs to three teams, Finance, IT and HR, each of which must maintain and publish independently; the Finance part must be reused by another agent; employees face only one entry point.

- A. Three child agents
- B. Three separate Copilot Studio agents, added as connected agents to one front-desk agent
- C. Keep everything in one agent and write good descriptions
- D. Publish all three agents to Teams and let employees choose

User: B · Correct: B
Explanation: independent publishing and reuse are what characterise a connected agent. A child agent lives inside the parent agent and is published with it.

### Q13 (bullet 33) ✅
Sales data is in a Fabric lakehouse and warehouse, and the data team has published a Fabric data agent. Managers want to ask in Teams for last quarter's sales by region, with numbers calculated in real time.

- A. Export a CSV daily and upload it as a knowledge source
- B. Agents → Add → Microsoft Fabric, connect the Fabric data agent
- C. Build an Azure AI Search index over the lakehouse
- D. Sync to Dataverse

User: B · Correct: B
Explanation: a Fabric data agent turns natural language into queries and aggregates in real time, using the identity of the user asking. Knowledge sources and AI Search are good at finding text passages; they don't do aggregate calculations.

### Q14 (bullet 35, choose two) ✅
A Foundry project already has an Azure AI Search index that uses vector retrieval, and generative answers should use it.

- A. Add Azure AI Search in Knowledge, fill in the endpoint, create a connection, select the index
- B. The index must have vector fields and a configured integrated vectorizer
- C. Import the index definition JSON into Dataverse
- D. Re-upload the manual as a file knowledge source, then link the index
- E. Turn on Bing grounding

User: AB · Correct: AB
Explanation: the user's question must first be turned into a vector by the index's own vectorizer, so B is a prerequisite. The index stays in Azure; it doesn't need to move.

### Q15 (bullet 36) ✅
Legal's prompt tool performs poorly with the built-in model; a more suitable model is already deployed in Foundry; only this one prompt tool should change.

- A. Connect the Foundry model in the prompt tool's model selection (BYOM)
- B. Change the whole agent's main model in Settings
- C. Write Use the Foundry model in the Instructions
- D. Write a custom connector to call Foundry

User: A · Correct: A
Explanation: the prompt tool decides "what to do", BYOM decides "who does it". The cost is billed to Azure.

### Q16 (bullet 37) ✅
You want to put agent telemetry together with other Azure application logs, write KQL, and alert when a threshold is exceeded.

- A. Copilot Studio's built-in Analytics
- B. Configure Application Insights in Settings, query `customEvents` with KQL, set up an alert rule
- C. Query the Dataverse conversation transcript table
- D. PPAC capacity report

User: B · Correct: B
Explanation: the business uses Analytics to see effectiveness; dev and ops use Application Insights for troubleshooting and alerting.

---

## Test and manage

### Q17 (bullet 38, choose two) ✅
50 real questions with model answers, to be rerun after every change; there is also a 5-turn booking flow.

- A. Import a CSV to create a test set
- B. A test set can fully verify the 5-turn conversation, scoring each turn
- C. After each change, rerun the same test set and compare question by question
- D. Foundry agents can also be scored reliably

User: AC · Correct: AC
Explanation: every question is a new conversation and only the first reply is evaluated, so multi-turn flows can't be tested; a Foundry agent returns Error for every question in a test set.

### Q18 (bullet 39) ✅
"Should refuse" questions whose wording differs each time but whose meaning is the same; the expected answers and replies are all in English.

- A. General quality
- B. Compare meaning, with the expected answer Politely decline and suggest contacting HR
- C. Exact match
- D. Tool use

User: B · Correct: B
Explanation: General quality ignores the expected answer and would mark a correct refusal as Not answered. Compare meaning only recognises one language, which is why the question states that everything is in English.

### Q19 (bullet 42, choose two) 🔴 Remediated
An IT agent in the Default solution: 8 topics; a topic calls `CreateTicket`; `EscalateToManager` isn't in any topic; `CreateTicket` writes to the custom table `IT Ticket`. In the new solution you've already done Add existing → Agent. Which two items must you also add manually?

- A. The 8 topics
- B. Dataverse table `IT Ticket`
- C. Each connection, including the credentials in it
- D. agent flow `EscalateToManager`
- E. `CreateTicket`

User: BC · Correct: BD
Explanation: the three-layer table:
- Things on the call chain are brought in automatically: topics, `CreateTicket`.
- Things that can go in but aren't brought along automatically must be added manually: tables, flows not in any topic.
- Things that can't go in: connections and credentials.

A solution holds connection references (the "sockets"), which come along automatically; the connection itself never goes into a solution; after import it's created anew in the target environment and plugged in. `EscalateToManager` is the same situation as `CancelApprovedLeave` in M6.
Review: the three-layer table for "adding an existing agent to a solution" in notes.md.

### Q20 (bullet 44, choose two) ✅
Deploying to production with Pipelines: deployment needs change manager approval first; deployment must use a service principal, not the maker's own identity.

- A. Gated extension, approve with a Power Automate flow before deployment
- B. Delegated deployment, deploy with a service principal
- C. Manually export an unmanaged solution
- D. Turn off Managed Environment
- E. DLP policy

User: AB · Correct: AB
Explanation: Gated extension inserts an approval before deployment; Delegated deployment makes the deployment run as the service principal. Pipelines itself requires a Managed Environment, so D would actually make Pipelines unusable.

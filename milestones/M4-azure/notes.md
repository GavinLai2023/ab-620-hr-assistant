# M4 Azure integration notes

## What problem this milestone solves

## What I did

### Task 1: Preview and predictions (2026-10-15)

**Learning path:** among AB-620's three official learning paths (recorded in M0) **none is dedicated to Azure**. The two modules most relevant to M4:
- **Ground agents with enterprise knowledge using connectors and Azure AI Search in Microsoft Copilot Studio** in "Integrate agents with enterprise systems": corresponds to Task 4, Task 8
- The part on generative answers and custom prompts in "Design agent conversations and responses using topics": corresponds to Task 5, Task 6

For the App Insights and Foundry model exam points I couldn't find a corresponding module in the learning paths, so I rely on the docs below.

**Key points of the five docs (plain version):**

| Doc | In one sentence | Easy pitfalls |
|---|---|---|
| [Azure AI Search as a knowledge source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-azure-ai-search) | First put the documents into Search as a **vector index** (an embedding model turns text into numbers), then the agent finds answers in it | Only vector indexes are supported, one knowledge source can connect to only one index; citation links rely on the index's `metadata_storage_path` field, without it there are no clickable citations; you must go through the proper Add knowledge dialog, filling things in by hand may leave a broken connection that affects the whole environment |
| [generative answers node with Azure OpenAI on your data](https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-generative-answers-azure-openai) (preview) | Instead of adding a knowledge source to the agent, specify separately on one topic's answer node "answer with a Foundry model + this Search index" | Data sources on the node **take priority over** agent-level knowledge sources, the agent-level ones are only a fallback; "Deploy to Copilot Studio" in Foundry creates a new agent in the **default environment**, not HR-Dev |
| [Prompts with your own model](https://learn.microsoft.com/en-us/microsoft-copilot-studio/bring-your-own-model-prompts) | Deploy a model in Foundry, click + in the prompt's model dropdown to connect it, and from then on the prompt runs on it | Only the chat completion type is supported; **GPT-5 and later models aren't supported**; the URL must end in `/chat/completions`, entering `/responses` gives Resource not found |
| [Application Insights](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry) | Enter a connection string in Settings → Advanced, and the agent's conversation events are sent to Azure, queryable with KQL | **Test pane conversations are recorded too**, distinguished by `customDimensions['designMode']`; "Log sensitive Activity properties" records sensitive content; admins can block this feature with a data policy |
| [Pay-as-you-go](https://learn.microsoft.com/en-us/power-platform/admin/pay-as-you-go-set-up) | Link a Power Platform environment to an Azure subscription and pay for what you use (US$0.01 per credit) | **Only production and sandbox environments are supported**; HR-Dev is a Developer environment and can't be linked |

**Three predictions (guessed by intuition before starting; after finishing I only add the comparison, the original text isn't changed):**

| Question | Prediction | Comparison result |
|---|---|---|
| 1. For the same question, how do answers from a SharePoint knowledge source and an Azure AI Search knowledge source differ? | Both are vector retrieval underneath. SharePoint's citations can probably point back to the original document; Azure AI Search's should be already-split chunks | **Partly right.** Underneath both are indeed retrieval and both answer correctly; Azure does store by chunk (one chunk per record, split at 2000 characters), but our documents are all under 1100 characters, so each one is a single chunk and the splitting effect isn't visible. On citations: with both sources on, the final citation points back to the SharePoint original; Azure gives the model raw scored chunks. "What citations look like with only Azure" couldn't be tested, see Task 4 |
| 2. If the same prompt switches to a model deployed in Foundry, how do quality and speed change? | Better, both speed and quality, otherwise why deploy your own | **Wrong.** The default model is already GPT-4.1 mini, the same underlying model as the Foundry deployment: quality is the same (all 9 numbers kept, text almost word for word identical); speed similar, Foundry averages about 3.8 s, default 3.1 s (tested only once); Copilot credits are still charged at 0.2, and Azure also charges by token on top. Deploying your own isn't for being faster or better, it's for **control**: using models not in the managed list or fine-tuned models, pinning versions, keeping data in a specified region, configuring content filtering yourself |
| 3. Can App Insights show "which conversation called which tool, and that it failed"? | Definitely, there are detailed logs | **Task 7: basically right, with conditions.** "Which tool was called" is in the `dependencies` table: who was called, success or not, duration, which session it belongs to are all there; provided you know the data is split across 4 tables, looking only at `customEvents` or the home page you'd think it's not there. Not visible: which specific tool was called inside MCP, prompt (Foundry model) calls, SharePoint and Dataverse knowledge sources, the body text of knowledge answers; there's no ready-made per-turn duration field, you have to compute it yourself with KQL. "Failed": all 20 turns succeeded this time, haven't seen what a failure looks like yet, to fill in at Task 10. **Task 10: right, it can be seen.** Deliberately made the employee API return 500: `customEvents` has a dedicated `OnErrorLog` (with conversation ID and the full error message), in `dependencies` that call has `success = False`, `resultCode = 500`, and by conversation ID you can also see which topic failed at which step and what On Error did after taking over (query Q14). The `exceptions` and `traces` tables are empty; looking only at the standard error tables you'd think there's nothing |

### Task 2: Set up Azure, check the state after the trial expired (2026-10-16)

**Azure:**
- Opened the free account with the M365 tenant admin account. The registration page's "Email address for important notifications" is only a notification address, anything works; **the sign-in account decides which tenant the subscription belongs to**.
- Subscription `Azure subscription 1`, Directory = Contoso (contoso.example), Status = Active, My role = Owner, Plan = Azure Plan.
- Right after registering, the portal home page at one point showed "Don't have a subscription?", and the subscription only appeared after refreshing for a few minutes; "We couldn't load your credit info" on the home page is also a normal delay right after signing up.
- Billing scopes shows two billing accounts: Contoso (the M365 one) and a newly created MCA account under my personal name (the Azure free account's).
- Resource group `rg-hr-assistant`, Australia East.
- Budget `hr-assistant-10usd`: Monthly, 10, two email alerts at Actual cost 50% / 100%. No need to configure an Action group, entering a recipient email is enough.

**After the Copilot Studio trial expired (10-16):**
- No expiry notice or Extend trial banner at all.
- The test pane can hold a conversation, topics can be edited and Saved. **After expiry the Developer environment is still editable, no need for the fallback plan.**
- Found two failures along the way unrelated to expiry, see break-and-fix.md: the tunnel hung after sleep (third time now); the Policy QA node's data source reference broke, **Policy QA topic turned off for now, to fix in Task 5**. While it's off, policy questions are answered by agent-level knowledge retrieval, with correct results.

### Task 3: Deploy two models in Foundry (2026-10-18)

**Resources (New Foundry UI):**
- In ai.azure.com, Create project built the Foundry resource and project in one go: project `hr-assistant`, Foundry resource `hr-assistant-demo`, Australia East, resource group `rg-hr-assistant`.
- The first resource name I entered, `hr-assistant-resource`, reported `CustomDomainInUse`: the resource name becomes the URL's subdomain (`<name>.services.ai.azure.com`), **globally unique**, so if it collides with someone else's you can't use it. Adding a suffix fixes it.
- The "Set up recommended resources" switch was **turned off**: when on it automatically builds Foundry's own App Insights, which would get mixed up with the one for Copilot Studio in Task 7.

**Two deployments (both Default settings → Global Standard):**

| Purpose | Deployment name | Base model name | Version | Used in |
|---|---|---|---|---|
| Chat | `gpt-4.1-mini` | `gpt-4.1-mini` | 2025-04-14 | Task 5, Task 6 |
| Embedding | `text-embedding-3-small` | `text-embedding-3-small` | 1 | Task 4 building the vector index |

- Chat model: TPM cap 100,000, RPM 100; Version upgrade policy = OnceNewDefaultVersionAvailable (auto-upgrade when a new default version is available). Global Standard is billed by token; capacity is only a cap and doesn't affect cost.
- **gpt-4.1-mini's Lifecycle is already Legacy**. Everything newer in the model list is GPT-5 and later, which Copilot Studio prompts can't connect to; the alternative gpt-4o is also Legacy. Redoing this step later it may no longer be deployable; check first in the BYOM docs which models are still supported.
- Playground verification: asked "Explain annual leave carry-over in one sentence", 2 seconds, 59 tokens, the answer was a generic explanation and **didn't know our company's rule "at most 5 days, used before March 31"**; the model itself has never seen our documents. That's exactly what Task 4/5 is meant to solve.
- The Playground came with the **Web search** tool by default (Grounding with Bing, extra charge, data leaves the Azure compliance boundary); deleted it before testing.
- On leaving the Playground it asked whether to Save as agent; didn't save: that would be a Foundry Agent Service agent, a different thing from a Copilot Studio agent, and the model deployment isn't affected.

**Endpoint (no key recorded):**
- The deployment details page shows `https://hr-assistant-demo.services.ai.azure.com/openai/v1/responses`, which is exactly the pitfall the docs mention: Copilot Studio needs a URL ending in `/chat/completions`.
- For Task 6, built it in the old format: `https://hr-assistant-demo.services.ai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions`, to verify whether it works then.
- The project home page also has an Azure OpenAI endpoint `https://hr-assistant-demo.openai.azure.com/openai/v1`, another domain for the same resource.

### Task 4: Azure AI Search as a knowledge source (2026-10-18)

**Resources:**
- Storage account `sthrassistantdemo` (Standard LRS, Australia East), container `policies` (Private), uploaded 4 docx files.
- Search service `srch-hr-assistant-demo`, **Free** (50 MB, 1 replica, 1 partition, $0), Australia East. The type name in the portal has been renamed "Search service (Foundry IQ)".

**Import data (new) → RAG wizard:**
- Data source Blob `policies` → Vectorize your text: Kind = Foundry resource, project `hr-assistant`, deployment `text-embedding-3-small`, auth API key (filled in automatically by the wizard) → images not processed → Semantic ranker **can be enabled on the Free tier too** (Enabled) → Objects name prefix `hr-policies`.
- Builds four things in one go: `hr-policies-datasource` (where the documents are), `hr-policies-skillset` (chunking + calling embedding), `hr-policies-indexer` (the executor), `hr-policies` (the index).

**Index `hr-policies`:**
- Only 5 fields: `chunk_id` (key), `parent_id` (which document it came from, value is the base64 of the storage address), `chunk` (body text), `title` (filename), `text_vector` (1536 dimensions).
- **No `metadata_storage_path`**. The docs say Copilot Studio relies on it for clickable citation links, and the wizard doesn't create it by default.
- Documents = 4. In this index **one record is one chunk, not one document**; 4 documents → 4 chunks, i.e. one chunk each. Reason: the SplitSkill in the skillset has `maximumPageLength` = 2000 characters, while the plain text of the 4 documents is only 709-1047 characters (most of the 36 KB docx is formatting), none reaching the split length.
- Search explorer search for `carry over`: the annual leave policy ranks first (rerankerScore 2.45), and it also gives `@search.answers` (answer snippets extracted directly).

**Connecting to the agent:** Add knowledge → Azure AI Search → new connection (Access Key, Search endpoint + admin key, key not in the repo) → choose `hr-policies` → name automatically "HR Assistant Classic - Azure AI Search", Ready.

**Comparison test (Policy QA off, both sources on):**

| Question | Time | Sources queried | Answer | Final citation |
|---|---|---|---|---|
| Can annual leave be carried over? | 9.46s | SharePoint, Dataverse, Azure AI Search, `annual-leave-policy.md`, all queried | Correct: 5 days, before March 31, excess forfeited unless HR approves in writing, and it gave its own "8 days left" example | `annual-leave-policy.docx`, opens the Word file in **SharePoint** |
| Do I need to apply to work from home? | 8.44s | Public websites, SharePoint, Dataverse, Azure AI Search, all queried | Honest: listed eligibility and rules (3 months after probation, at most 3 days a week, online 10:00-16:00, VPN, approval needed for more than 14 days abroad), said plainly that the policy **doesn't say whether you need to apply**, suggested contacting HR | `remote-work-policy.docx` + `crc6c_employee` (the Dataverse employee table, which has no policy content; counted as a source just because "nothing found here") |

- **It queries all knowledge sources at once**, not just one.
- The two sources give the model content that looks different: SharePoint returns tidied Markdown (`# Contoso Annual Leave Policy ## Entitlement…`); Azure AI Search returns the raw format `{score:…, reRankerScore:…, chunk:…\n…}`, with scores and newline characters carried as is.
- When both sources have the same document, this time the final citation chose SharePoint.
- `annual-leave-policy.md` (globe icon) downloads directly when clicked. Most likely the .md version first uploaded to SharePoint in M1 Task 3 was never deleted (see M1 break-and-fix); to verify; doesn't affect answers, leaving it for now.
- **Round 2 (Azure AI Search only) not done**: in Copilot Studio knowledge sources **have no disable switch, only delete**, and deleting and re-adding changes the component ID (see break-and-fix). "What citations look like with only Search, and what the missing `metadata_storage_path` affects" deferred to Task 5 (node specifies only the Search index).

**Prediction 1 comparison:** filled into the Task 1 table.

### Task 5: generative answers node with Search and Foundry (2026-10-18, timeboxed to 1 hour, done within 12:50-13:40)

Skipped plan Step 1 (Add your data in the Foundry playground): the New Foundry UI may no longer have that entry point, and the Copilot Studio side **doesn't need** it; configuring directly on the node is enough.

**The node's Data sources panel** (Policy QA → Create generative answers → Data sources → Edit) has three sections:
1. **Knowledge sources**: tick the agent's existing knowledge sources; with "Search only selected sources" on, only the ticked ones are searched
2. **Web search** switch
3. **Classic data**: Public websites, SharePoint addresses entered by hand, **Azure OpenAI Services on your data**, Custom data (variables)

**Experiment A: node ticks only the Azure AI Search knowledge source (HRPolicies unticked)**
- The Policy QA node is **fixed** (the Task 2 failure), correctly answering 5 days, March 31, excess forfeited.
- **The citation isn't a link, it's a text popup**: clicking it shows the raw chunk `{title:annual-leave-policy.docx, chunk:…, score:…, reRankerScore:…}`. The citation name comes from the `title` field. This is the consequence of the index lacking `metadata_storage_path`: you can see the source, but can't open the original. By comparison, clicking a SharePoint citation opens the Word document.
- Asked in Chinese, **answered in English** (in Task 4, via agent-level knowledge sources, it answered in Chinese). Guess: the node answers in the agent's primary language; not verified.
- The same topic triggered 3 times in a row and gave 4 answers: the old problem logged in M1 Task 5 reappeared; didn't chase it.

**Experiment B: also add Classic data → Azure OpenAI on your data**
- First you need to create an **Azure OpenAI** connection in Power Apps (HR-Dev environment) → Connections (resource name `hr-assistant-demo` + Foundry key + Search endpoint + Search admin key). The one Task 4 built automatically is an **Azure AI Search** connection and can't be reused. Whenever you add knowledge sources or tools in Copilot Studio, another connection is automatically added to the environment.
- Connection properties → General: Deployment `gpt-4.1-mini`; **the Api version dropdown only has `2023-06-01-preview` and `2024-02-15-preview`**; chose the latter, which works with gpt-4.1-mini. The feature hasn't been updated in a long time, which fits the name "Classic".
- Model data (field mapping): Index `hr-policies`; Title and File name set to `title`; **URL left empty** (not in the index); Content `chunk`; Vector `text_vector`; Embedding deployment `text-embedding-3-small`; Query type `vectorSimpleHybrid`; Limit responses to your data content `true`; Semantic configuration, System message, Strictness, Top N left empty.
- Test result: still English, still repeated 3 times; each answer has **2 citations**, both named `annual-leave-policy.docx`:
  - Citation 1 has a ↗ link icon; clicking it makes the browser go to `annual-leave-policy.docx/`, **DNS error, won't open**: with the URL mapping empty, it treats the filename as a web address. Comes from Classic data.
  - Citation 2 is the same text popup as in experiment A. Comes from the ticked Azure AI Search knowledge source.
- **Foundry Monitor proves the model was really called**: on 10-18 about 10 requests, about 12K tokens, estimated cost about US$0.003 (the Playground accounts for only 1, the rest came from Copilot Studio).
- Conclusion: the knowledge source ticked on the node and Classic data were **both used**, not either/or; agent-level SharePoint didn't appear. **Which model wrote the final paragraph can't be told**; Activity only shows the Policy QA topic and doesn't expand the node's internals.

**The docs' claim "data sources on the node take priority over agent-level"**: in both experiments agent-level SharePoint wasn't used, consistent with the docs; but the node had "Search only selected sources" on, so it only searched the ticked ones anyway, and this doesn't count as strict verification.

**Wrap-up:** Policy QA configuration kept, topic **turned off**. When on, policy questions go to this node, and answers turn English, repeat 3 times, and citations won't open; a worse experience than agent-level knowledge sources.

**Impact on Task 10:** the plan's "index without `metadata_storage_path`" item was already hit naturally in Task 4/5 and its consequences seen clearly (text popup, broken link), so Task 10 doesn't need to do it separately.

### Task 6: Custom prompt with a Foundry model (2026-10-18)

**Prompt tool ≠ suggested prompts.** Suggested prompts are example questions in the chat window for users to click; a Prompt is a kind of tool: prewritten instructions + input variables, run once on some model when called, the same category as calling a flow or connector. Entry point Tools → Add a tool → New tool → Prompt.

**Built the prompt `Summarise Leave Policy`** (the name uses British spelling):
- Instructions: summarise in Chinese, at most 5 points, write days and deadlines as in the original, if it's not a leave policy just say one sentence; at the end after `Policy:` insert the input variable `PolicyText` with **Add content → Text** (shown as a small tag, not hand-typed curly braces).
- The first time I pasted the policy text directly into Instructions with no instructions, and the model only replied "Thanks for sharing, feel free to ask me questions". **Keep instructions and data separate**: instructions go in Instructions, data goes through input variables.
- The tool details page after saving has no Test button; click the ↗ at the top right of the Instruction card to go back to the editor.

**What's in the model dropdown:** Managed models (Basic GPT-4.1 mini default, Standard GPT-4.1 / GPT-5 chat, Premium GPT-5 reasoning), Anthropic models (Claude Sonnet 4.6 / Opus 4.6, paid experimental), xAI (Disabled by your admin), Azure AI Foundry Models (your own). **The default model is GPT-4.1 mini, the same underlying model as the one deployed in Foundry in Task 3.**

**Connecting the Foundry model (BYOM):** model dropdown → + next to Azure AI Foundry Models → form with 4 required fields: Model deployment name `gpt-4.1-mini`, Base model name `gpt-4.1-mini`, Azure model endpoint URL, API Key (copied and pasted from Foundry, not in the repo); optional Model description `Foundry gpt-4.1-mini (Australia East)`; "Test the connection" ticked by default.
- The first URL entered was `https://hr-assistant-demo.services.ai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions`, **reporting "Failed to send request to PowerApps-RP service"**. There was a green tick under the URL box, but that's just a format check.
- Probed locally without a key: all three domains (`services.ai.azure.com`, `openai.azure.com`, `cognitiveservices.azure.com`) reachable, **without `api-version` returns 404, with it returns 401** (the path is right, only the key is missing).
- Changed to `.../chat/completions?api-version=2024-10-21`, **Connected successfully**.
- Reminder at the bottom of the form: when connecting your own model, **responsible AI measures such as content filtering and safety protections are your own responsibility in Foundry**. It reminds you again under the test output.

**Comparing the two models** (same instructions and the same annual leave policy):

| | Default GPT-4.1 mini (Microsoft-managed) | Foundry gpt-4.1-mini (BYOM) |
|---|---|---|
| Chinese, ≤5 points | ✓ | ✓ |
| 9 numbers (20 days, 1.67 days, 5 working days, 10 days/4 weeks, 3 working days, 5 days, March 31, 2 working days, 11) | All kept | All kept |
| Wording difference | "forfeited" | "confiscated", otherwise almost word for word the same |
| Time | 3106 ms (1 run) | 4472 / 3509 / 3363 ms (average about 3.8 s, the first looks like a cold start) |
| Copilot credits | 0.2 | **0.2, charged anyway** |

**Wired into the topic `Leave Policy Summary`** (description `Use when the user asks for a short summary of the annual leave policy.`): Set variable `PolicyFullText` = full text of the annual leave policy → Prompt node (PolicyText = `PolicyFullText`, output `predictionOutput` saved to `tool_output`) → Message. Changed the prompt's Description to "Summarizes the full text of an HR leave policy into at most 5 Chinese bullet points, keeping every number and deadline exactly as written.", model left on Foundry.
- **The first time, the Message output `tool_output` directly and printed the whole record (JSON)**. An unexpected bonus, effectively a call receipt: `modelName: byom`, `modelType: byom` (proving it went through my own deployment), `costAsCopilotCredits: 0.2`, `costAsAiBuilderCredits: 35`, `promptTokens 1277 / completionTokens 145 / totalTokens 1422` (the policy text is about 250 tokens, the rest added by the system), `text` (Chinese converted to `\uXXXX`).
- Right after that the agent **wrote its own English summary** (5 points, missing the 11 public holidays): what the topic sent was unreadable JSON, and the orchestrator seemed to think the question wasn't answered yet, adding a final answer.
- Retested after changing the Message to the formula `Topic.tool_output.text`: **only one Chinese summary**, the extra English answer disappeared. Time 3.66 s. This time among the 5 points "manager approves within 3 working days" got its own point, and **the 11 public holidays were squeezed out**: same prompt, same model, two runs with different trade-offs. When "at most 5 points" and "write every number" conflict, the model picks differently each time.

**Prediction 2 comparison:** filled into the Task 1 table.

**What prompts and generative answers are each suited to:**
- **Prompt**: the input is known and the task is a fixed transformation (summarise, rewrite, classify, extract fields), and you want to control format and model. It doesn't go looking for information itself, you have to feed the data in; the output is a record, and in a topic you take `.text`.
- **Generative answers**: open-ended Q&A that needs retrieval from knowledge sources with citations. Format and which source passages are used are harder to control.
- In this case "summarise the annual leave policy" could actually be done either way; the benefit of a prompt is stable format and switchable models, the cost is that the full policy text is hard-coded in a topic variable, so any policy change needs a manual sync.

### Task 7: Application Insights monitoring (2026-10-18)

**Creating the resource:** `appi-hr-assistant`, `rg-hr-assistant`, Australia East, OTLP support off. The Log Analytics workspace used the wizard default `DefaultWorkspace-…-EAU`, which **isn't in `rg-hr-assistant`** but in the automatically created `DefaultResourceGroup-EAU`: the Task 11 wrap-up has to delete this resource group separately.

**Connecting to the agent:** `HR Assistant Classic` → Settings → Advanced → Application Insights → paste the Connection string (not in the repo) → turn on **Enable logging**, **Log conversation details**, **Node execution events**; **Log sensitive properties** off.

**Ran 4 groups, 20 sentences in total** (counting the employee ID and email for the password reset follow-up and two form submissions, 24 user messages in total), all in the test pane.

**Data is split across 4 tables (one `union withsource = tableName *` query shows it):**

| Table | Rows | What it records |
|---|---|---|
| `customEvents` | 193 | 5 event types: TopicAction 68, BotMessageSend 37, TopicStart 34, BotMessageReceived 28, TopicEnd 26. Original message text, topic trace, node types |
| `dependencies` | 25 | **Every outbound call**: who was called, success or not, duration |
| `pageViews` | 34 | One-to-one with TopicStart (same names and counts), duration always 0, no new information |
| `traces` | 2 | Two "Invoking flow, Flow Id …", severity 1 (information), not errors |

At first I only queried `customEvents` and concluded "MCP and knowledge retrieval aren't visible", which was wrong; only after seeing Tool response time in the built-in Dashboard did I discover the other tables. **Before drawing conclusions, `union *` to see all tables.**

**`customEvents` fields (19, keys are case-sensitive):** `DesignMode`, `channelId`, `conversationId`, `TopicName`, `Kind`, `ActionId`, `Action`, `Trigger`, `TopicId`, `activityId`, `replyActivityId`, `fromId`, `recipientId`, `recipientName`, `text`, `speak`, `attachments`, `locale`, `type`. The docs say `designMode`, but it's actually **`DesignMode`**; the test pane is `True` / `pva-studio`.

**`dependencies` (Q10):** failures all 0

| Call | Count | Average / slowest | Cross-check |
|---|---|---|---|
| HR MCP Server (Connector, `…/InvokeServer`) | 13 | 630 / 1390 ms | Each of the 4 sessions called it 3 times in a row on the first sentence (handshake) = 12, plus the "search Chen" one = 13 |
| Azure AI Search (`SemanticHybridSearch`) | 4 | 1358 / 3616 ms | Exactly the 4 knowledge questions |
| Employee API (`getEmployeeLeaveBalance`) | 3 | 487 / 664 ms | E002, E005, E002; **E999 not called**, the log proves it |
| HttpRequest (devtunnel `/employees?department=`) | 3 | 219-304 ms | Engineering 2, Sales 1 |
| CloudFlow SubmitLeaveRequest | 2 | 771 / 995 ms | Two submissions |

Every row carries `conversationId`, so it can be matched to its session; but the MCP row **doesn't show which MCP method or tool was called**, only inferable from time and count. HttpRequest's target is the **full URL**: if the URL contains a key, it goes into the log too.

**Not in `dependencies`:** Task 6's prompt (Foundry model), which only leaves an `InvokeAIBuilderModelAction` node in `customEvents`; the SharePoint (HRPolicies) and Dataverse (Employee) knowledge sources (the Search sources panel shows they were searched too); the body text of knowledge answers (`BotMessageSend` has no replies for these 4 sentences; didn't find out why, and didn't find them in other tables either).

**Several phenomena only understood by reading the logs:**
- **TopicStart records "entering", not "being selected".** Every time a topic stops to wait for user input, or comes back from calling an external tool, it ends and starts again. Leave Balance's 3 questions recorded 6 TopicStarts; Password Reset's 1 question recorded 6.
- **REST tools are recorded as topics**: `…action.EmployeeAPI-Getoneemployeescurrentleavebalances`, each call records **two** TopicStarts in a row, **no TopicEnd**.
- **Nodes in a topic that call outward (HTTP, flow, prompt) record two TopicActions each time**, and the time difference is the call duration (Q8): prompt 2607 / 3195 / 3770 ms, flow 817 / 1273 ms, HTTP 417 / 514 / 539 ms. **The prompt is the slowest link, yet it's not in `dependencies`.** `ActionId` is the node's ID in the designer, so two calls in the same session collide; pair them up by time.
- **"Answering twice" can be counted**: the turns with `replies = 2` in Q5 are where the topic replied once and the orchestrator added another (after department lookup, balance and form submission alike). Group 4 "Can annual leave be carried over?": Leave Policy Summary first replied with a Chinese summary, 4 seconds later the orchestrator added an English line "According to the annual leave policy…"; the extra English answer fixed in Task 6 reappeared with this phrasing.
- **With Log sensitive properties off, the user's original words are still recorded** (the `text` field). The password reset reply contained the signed-in user's display name, which also went into the log.

**Problems seen in the test pane that the logs confirm** (recorded; decide in Task 10 whether to fix):
- `Can annual leave be carried over?` was taken by Leave Policy Summary both times (description too broad); the answer happened to include the carry-over rule.
- Leave: the user picked Oct 27–29 and Oct 30–31 in the form themselves, but the orchestrator's extra answer said "the request period is 2026-11-03 to 2026-11-05", copying the user's original words without looking at the data actually submitted. The form opened empty; the dates in the original words weren't prefilled. After the 3rd group's successful submission another empty form popped up.
- Password reset, after saying "the password takes effect immediately", asked again "Which system's password do you want to reset?".
- `E999's leave balance` didn't call the tool and answered directly in English "can't provide someone else's balance" (E002 and E005 were both looked up normally).

**The four charts on the Overview home page (Failed requests, Server response time, Server requests, Availability) stayed at 0:** they read the `requests` table, which Copilot Studio doesn't write. When the agent has problems the home page may still say "all fine".

**Built-in Copilot Studio Dashboard** (Workbooks → Copilot Studio Dashboards (Preview)): Total conversations 4, Unique users 1, Avg duration 2.3 min, Error rate 0; Agent response time (Avg / P50 / P95 / P99, P95 about 19 s, TotalResponses about 46, more than `BotMessageSend`'s 37, didn't reconcile); Tool response time (Azure AI Search slowest); Tool success rate; the slowest Topic execution is SubmitLeaveRequest at about 19 s, but the flow itself is under 1.3 s; **what's slow is the time the user spends filling in the form**; this metric counts human thinking time too. You can choose Include Test Data and filter by Channel.

**Two pitfalls on the Logs page:** when the **Agent** switch at the top right is on, the query editor is replaced by the Observability Agent chat UI; turn it off to get KQL mode; `kind` and `views` are KQL reserved words and can't be used as column names.

**All queries are in `queries.kql`** (Q1–Q13); Task 10 reuses Q6 (single-session timeline) and Q10 (dependencies success/failure).

**Prediction 3 comparison:** filled into the Task 1 table.

### Task 8: Copilot connectors as a knowledge source (2026-10-19, timeboxed to 1 hour, stopped on time, didn't connect)

**Entry point on the Copilot Studio side:** Knowledge → Add knowledge has only two categories, Featured and Advanced. Salesforce and ServiceNow in Featured, Confluence, Zendesk etc. in Advanced are **not** Copilot connectors (they're Power Platform connectors queried in real time). The real Copilot connectors are under the **filter icon (three horizontal lines) → unavailable** next to the categories: 15Five, Ado Git, Confluence, Enterprise websites, File share, Jira, ServiceNow and dozens more, all greyed out, only Bing Custom Search isn't. The greyed ones can't be clicked, hovering only shows descriptions like "Connect to your Enterprise's Website", **without saying why they can't be used**.

**The M365 admin center side:** the entry point is **Copilot → Connectors** (not the old Settings → Search & intelligence → Data sources), with two tabs, Gallery and Your Connections. **No licensing prompt at all** the whole way through (the tenant only has Business Basic, no M365 Copilot licence).

**There are two kinds of Copilot connector:**

| | Import type (formerly Graph connector) | MCP type |
|---|---|---|
| Data | Crawled and indexed in Microsoft Graph, synced on a schedule | Not copied, called in real time when asked |
| Examples | Enterprise websites, File share, Jira | Wix, GitHub, Gamma, Dropbox for Copilot |
| This tenant | None at all, so that page in Copilot Studio is all grey | A whole list, all Ready (not built by me, didn't trace where they came from) |

The Type filter in Your Connections has only one option, `MCP`; the page banner says MCP connectors will support write operations (create / update / delete) in future. These MCP connections didn't appear in Copilot Studio's Add knowledge.

**Enterprise websites Cloud configuration items** (four tabs in Custom setup):
- **Setup**: Display name, URL (up to 50 per connection, comma-separated), Sync only websites listed in the sitemap, Index only pages under the specified subdirectory, auth method, Rollout to limited audience (only some people first).
- 5 auth methods: None (public websites), Basic, Microsoft Entra OAuth 2.0, OIDC Client Credentials (third-party IdPs like Okta, Auth0), SiteMinder. The one chosen applies to all URLs.
- **Users**: who can see it in search results. Locked to Everyone with None auth.
- **Content**: excluded URLs, Site configuration, Manage Properties (11 properties, each with a Semantic Label and Schema: Query / Retrieve / Search / Refine, the same idea as searchable and retrievable on Azure AI Search fields).
- **Sync**: Full Crawl once a day by default; **Incremental crawl is only supported if sitemap is ticked**.
- In Custom setup the last three tabs can only be changed after clicking Authorize; simple mode has no Authorize button, you fill it in, tick Notice and can Create.

**Four attempts, none built:**

| URL | Mode | Result |
|---|---|---|
| `https://www.fairwork.gov.au/leave/annual-leave` | Custom setup → Authorize | `Domain not reachable. Please check root url. - … Object reference not set to an instance of an object.` |
| `https://www.fairwork.gov.au` | Custom setup → Authorize | Spun for about 1 minute with no message at all; tabs still locked, Create still grey |
| `https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/` | Simple mode → Create | `The following URL(s) are restricted from crawling to ensure fair usage of the product: Please remove these URLs to proceed with publishing the connection.` |
| `https://www.fairwork.gov.au/leave/annual-leave` | Simple mode → Create | The same `Domain not reachable` as the first time |

- learn.microsoft.com is on **Microsoft's own no-crawl list**; the reason is clear.
- fairwork.gov.au: curl from my machine to the home page, this page and robots.txt all returned 200 in under 1 second, and robots.txt doesn't block it. So "I can open it" doesn't equal "Microsoft's crawler can open it": crawling is initiated from Microsoft's servers. **Guess**: the site's firewall blocks cloud server IPs; can't verify.
- Didn't try a third site; stopped when time was up.

**Three ways to connect external data, and what each is suited to:**

| | Where the data lives | Suited to | Not suited to |
|---|---|---|---|
| Copilot connector (import type) | Copied into Microsoft Graph and indexed, filtered by permissions | Having M365 Copilot, Microsoft Search and several agents share the same enterprise data; centrally managed by admins | Needing real-time data; no admin rights; sites that block crawlers or are on the no-crawl list |
| Power Platform connector (real-time knowledge source / tool) | Not copied, queries the other system live each time | Fast-changing data, real-time queries by user identity (Salesforce, ServiceNow, Dataverse) | Semantic search across large numbers of documents; slow APIs or APIs with call quotas |
| Azure AI Search | Build your own index, choose your own embedding, chunking and fields | Controlling retrieval quality (vector + semantic ranking), large data volumes, merging multiple sources | Just wanting to quickly connect an existing system; not wanting to maintain an index and Azure costs yourself |

### Task 9: Publishing channels (2026-10-19)

**Publishing:** Publish succeeded directly in HR-Dev (Developer environment) (10/19/2026 11:08 PM), **not blocked by licensing or pay-as-you-go**, no need to create a sandbox.

**Two notices on the Channels page:**
- "You're using **Microsoft authentication**, so only Teams and Microsoft 365 and SharePoint channels are available. To use other channels, change your authentication settings." External channels like Web app, Demo website, WhatsApp, Facebook and Slack look clickable, but actually you first have to change auth to No authentication or Authenticate manually.
- "Your agent runs tools that use the **author's credentials**. Anyone you share with can use the original author's credentials…" View 2 tools: `Get one employee's current leave balances 1` (REST custom connector), `SubmitLeaveRequest` (flow). **MCP Server isn't in it** (it uses each user's own connection, see below); the HTTP node in the topic doesn't count as a tool. In a real scenario these should be changed to the user's own credentials.

**Microsoft 365 and Microsoft Teams channel:** in the panel, **Make agent available in Microsoft 365 Copilot** is ticked by default. After Add channel the button becomes Remove channel. **Availability options** has four distribution methods:
- **Copy link**: selected users open it in Teams via the link.
- **Download .zip**: an app package, uploaded to Teams by hand or handed to an admin to publish.
- **Show to my teammates and shared users**: appears in the store under **Built with Power Platform**, no approval needed.
- **Show to everyone in my org**: appears under **Built by your org**, **needs admin approval**.

**Teams: not installed.** Both entry points, See agent in Teams and Copy link, report `App package can't be uploaded — Invalid Bot: Please make sure the bot is registered and Teams channel is enabled.` Republishing, and Remove channel then Add channel then Publish (waiting 5 minutes), were all the same. Cause not found, see break-and-fix.

**M365 Copilot: works** (the tenant only has Business Basic, no M365 Copilot licence, and it still works in Copilot Chat; the environment doesn't have pay-as-you-go either). See agent in Microsoft 365 opens `m365.cloud.microsoft/chat/agent/…`, three test sentences:

| Question | Result | Compared with the test pane |
|---|---|---|
| `How much leave balance does E002 have left?` | First two cards popped up "Let's get you connected first… Open connection manager to verify your credentials"; the connection manager had only **HR MCP Server** (Not Connected) → Connect → Submit → Retry. Then two replies: the raw `AL: 14; SL:8`, then an English summary | **The test pane doesn't show this step**, because the author connected long ago. This sentence went through the MCP tool, not the REST tool |
| `I'd like to take annual leave from 2026-11-03 to 2026-11-05` | The form (adaptive card) displayed normally, dropdowns and date pickers both work; the dates in the original words weren't prefilled. After submitting it replied `Leave request submitted. Request number: LR-<timestamp>06 Status: Submitted` | The flow uses the author's credentials, **no connection confirmation needed from the user** |
| `Can annual leave be carried over?` (asked without filling in the form) | Answered in Chinese, 5 days, before March 31, with a `sharepoint` citation and Sources; also mentioned "the 2026-11-03 to 2026-11-05 you mentioned earlier". After answering another new form popped up | This time it **wasn't taken by Leave Policy Summary**; the interrupted leave topic resumed automatically after the answer |

After the form was submitted, the orchestrator answered "Can annual leave be carried over?" once more (content correct), the same kind as Task 7's "topic replies, then another paragraph is added".

**App Insights (Q2):** Copilot Chat conversations are recorded as `channelId = m365copilot`, `DesignMode = False` (36 rows); the test pane is `pva-studio`, `True`. These two fields separate test data from real users.

**Other:** the Employee (Dataverse) knowledge source status on the Knowledge page keeps spinning, not Ready; didn't chase it.

**Channel comparison:**

| Channel | Who can use it | How users authenticate | adaptive card | Licensing needed | Suited to | Source |
|---|---|---|---|---|---|---|
| Test pane | Makers with edit rights | The maker's own account; connections already set up, so you don't see the connection confirmation a user has to do the first time | Yes | Copilot Studio maker permissions | Development and debugging; `DesignMode = True`, not counted by the Dashboard by default | Tested hands-on |
| Teams | Users in the org, via link, .zip, store (team or whole org, the latter needs admin approval) | Microsoft authentication (Entra single sign-on) | Yes (docs) | Users have Teams; the agent's messages count against Copilot Studio capacity or pay-as-you-go | Internal employees | Tested hands-on, not installed (Invalid Bot); the rest from docs |
| M365 Copilot | Users in the org, Agents in Copilot Chat | Microsoft authentication; **the user's own connections (e.g. MCP) need confirming in the connection manager the first time** | Yes | Works in this tenant without an M365 Copilot licence (Developer environment, no pay-as-you-go) | Internal employees, used inside Office apps | Tested hands-on |
| Custom website (Web app / Demo website) | Anyone who can open the web page | Auth must be changed to No authentication (anonymous) or Authenticate manually (configure OAuth yourself) | Yes (Web Chat control) | Copilot Studio capacity or pay-as-you-go | External customers, public websites | Docs; this agent uses Microsoft authentication, so the channel isn't available |

### Task 11: Costs and wrap-up (2026-10-22)

**Cost analysis** (subscription `Azure subscription 1` → Cost Management → Cost analysis, Oct 2026, Accumulated):
- Actual spend this month **AU$0.01**, budget AU$10, no alert triggered; Forecast unavailable (too little data).
- By service: Foundry Models AU$0.01; Azure Cognitive Search and Storage <AU$0.01 each; Bandwidth and Log Analytics AU$0.00. All in Australia East. By resource group: `rg-hr-assistant` AU$0.01, `DefaultResourceGroup-EAU` AU$0.00.
- Search is the Free tier yet shows <AU$0.01; didn't check why (maybe semantic ranking or another meter). App Insights itself isn't listed separately; the log volume is negligible.
- Cost data has an 8-24 hour delay, so calls from the last day or two may not be counted yet.
- Entering Cost Management from the top search, the default scope is a **billing account** (Contoso = the M365 one, personal name = the Azure free account's), and there's no "subscription" option; entering via Subscriptions → subscription → Cost analysis, the scope is automatically the subscription.

**Cleanup:** first in the agent's Settings → Advanced → Application Insights, cleared the Connection string and turned off Enable logging, then deleted `appi-hr-assistant` and `DefaultResourceGroup-EAU` (which holds its Log Analytics workspace). Both deleted on 2026-10-22. The workspace's default name `DefaultWorkspace-<subscription ID>-EAU` contains the subscription ID, so mask it in screenshots too. `rg-hr-assistant` kept (Foundry, Search, Storage, may still be used from M5 on).

## Concepts learned (each answers: what problem it solves, and when not to use it)

**1. What agent-level knowledge, data sources on the node and custom prompts each handle**

| | What problem it solves | When not to use it | Hands-on evidence |
|---|---|---|---|
| Agent-level knowledge (SharePoint, Azure AI Search etc.) | Open-ended Q&A; the orchestrator decides when to look things up, queries all sources at once, with citations | When you need a certain kind of question to query only a certain source, or need a fixed format; with too many sources it queries them all every time, which is slow (8-9 s) | Task 4: both questions queried 4 sources, and the citation finally chose SharePoint |
| Data sources on a generative answers node | Restricting "this kind of question queries only these sources" in a given topic, and can connect Classic data (Azure OpenAI on your data) | Agent-level is enough for general Q&A; the Classic data feature is old (API versions only up to 2024-02-15-preview), and without a URL field citations are broken links | Task 5: the node fixed Policy QA, but answers turned English, repeated 3 times, citations wouldn't open; finally turned off |
| Custom prompt | Fixed transformations with known input (summarise, classify, rewrite, extract), with selectable model and controlled format | When it needs to find information itself (prompts don't retrieve, data has to be fed in); when the instructions contain conflicting requirements, the output is unstable | Task 6 + Task 10: the same prompt on both models sometimes missed the "11 public holidays"; for a non-leave policy both models replied with just one sentence |

**2. When it's worth building your own Azure AI Search instead of just using SharePoint**
- Worth it: you want to control retrieval quality yourself (chunk length, embedding model, vector + semantic ranking); data isn't in SharePoint (Blob, databases) or is large, multi-source and needs merging; several apps share the same index.
- Not worth it: the documents are already in SharePoint and not many. SharePoint is zero maintenance and clicking a citation opens the original; Azure AI Search needs you to build storage, index and indexer yourself, and add fields like `metadata_storage_path` yourself, otherwise citations won't open (Task 4/5). This project's 4 short documents are fully covered by SharePoint, and Search's answer quality was no better.

**3. Why bring your own model (BYOM) from Foundry, and what it costs**
- For **control**, not for being faster or better: using models not in the managed list or fine-tuned models, pinning versions, keeping data in a specified region, configuring content filtering yourself. The same gpt-4.1-mini managed and BYOM has the same quality, and BYOM was even slightly slower (Task 6, Task 10).
- Costs: Copilot credits still charged (0.2 each time), plus Azure charges by token; the endpoint format has to be right (`/chat/completions?api-version=…`, the Task 6 pitfall); you manage and rotate the key yourself; responsible AI measures are your own responsibility (both the form and the test output remind you); supported models are limited, gpt-4.1-mini is already Legacy and the newer GPT-5 series can't be connected (Task 3).

**4. Which questions App Insights can answer that Copilot Studio's built-in analytics can't**
- The full trace of a single session: the user's original words, which topic it entered, which nodes ran, what was replied (Q6).
- Success/failure, status code and duration of every outbound call, mapped to the session (`dependencies`, Q10); on failure there's `OnErrorLog` with the full error message (Q14, Task 10).
- Your own custom analysis: per-turn duration (Q5), "answered twice" turns, prompt node duration (Q8), splitting by channel and test vs. real (`channelId`, `DesignMode`; Task 9 saw `m365copilot`).
- Limits: you need to know KQL; data is split across 4 tables; MCP doesn't show which tool was called; prompts and SharePoint/Dataverse knowledge retrieval don't go into `dependencies`; the four charts on the Overview home page are always 0; the user's original words go into the log even with the sensitive switch off.

**5. What to consider when choosing channels**
- **Authentication** decides where you can publish: Microsoft authentication only allows Teams, M365 Copilot and SharePoint; to publish to websites, WhatsApp and other external channels you have to change the auth method (Task 9).
- **Whose credentials the tools use**: tools with the author's credentials (REST, flow) call as the author even when others use them; per-user connections (MCP) require each user to Connect themselves the first time, a step you don't see in the test pane.
- **Licensing**: the M365 Copilot channel worked this time without an M365 Copilot licence; the Developer environment can publish too.
- **Internal/external, who can see it**: link, .zip, publish to the team store, publish to the whole-org store (needs admin approval).
- **Channels can't vouch for each other**: in the same panel M365 Copilot works, while Teams reports Invalid Bot.

## Not understood yet, left for later

- Teams channel `Invalid Bot`, retry after switching to sandbox in M6 (break-and-fix Task 9).
- Why the connector can't crawl `fairwork.gov.au` (guess: site firewall, Task 8).
- The Dataverse Employee knowledge source keeps spinning on the Knowledge page (seen in Task 9, not checked).
- The orchestrator adding another paragraph after the topic replies ("answering twice", the extra answer copying dates from the original words, answering carry-over again after form submission); handle when tuning orchestration in M5/M6.
- Tool nodes in topics have no error handling, so on failure employees see the raw English error (Task 10); fix in M5/M6.
- The 500 call in `dependencies` took 3766 ms while locally it returns instantly; whether the extra time is retries or the tunnel wasn't checked.
- The `hr-policies` index page in the portal won't open (Task 10).

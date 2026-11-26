# M7 Planning domain close-out and exam prep notes

## What problem this milestone solves

M1–M6 were "learn by building": each milestone built one piece of HR Assistant, and getting it working hands-on counted as done. That left two gaps.

1. **The planning domain (bullets 1–7) was barely touched.** Identity, channels, responsible AI, security and governance, reusable components, internal vs external audiences are all "how do you think before you build" questions; you can't build your way through them. M7 fills this with 7 pages of planning notes (`planning/`), plus two experiments: a DLP policy and the external-facing `HR Careers FAQ`.
2. **"I've done it" is not the same as "I can explain it and answer correctly".** 44 bullets explained aloud one by one (five rounds, A–E), then 20 scenario questions and two Practice Assessments, to turn "I've clicked through it in the environment" into "I can explain it without notes, and still pick the right answer in a different scenario".

Finally, I checked against three readiness criteria to decide when to sit the exam.

## What I did

### Task 1: Exam environment and predictions (2026-11-03)

**Exam sandbox** ([entry point](https://go.microsoft.com/fwlink/?linkid=2226877); the demo uses the generic exam AA-001, 8 hours, 17 questions, unrelated to AB-620's 120 minutes)

The exam is split into sections: Standalone Questions → Review → Case Study → Review → Lab. **Once you finish a section you can't go back.** Sections aren't timed separately; watch Exam Progress at the top to manage time.

| Question type | What it looks like | What to watch for |
|---|---|---|
| Multiple choice, select one | Single choice | |
| Multiple choice, multiple select | Multiple choice; the question says how many to pick | |
| Build List Reorder | Drag actions into the answer area and put them in order | There may be more options than steps; some aren't used |
| Active Screen | Dropdowns, radio buttons and checkboxes on a UI screenshot; some have no screenshot and just use dropdowns to complete a sentence | AB-620 may show a screenshot of a Copilot Studio settings page |
| Hot Area | Click the right spot on a screenshot | |
| Exhibit | An Exhibit tab next to the question; there may be several | Key information is often in the Exhibit; open every one |
| Yes/No series | Judge Yes / No for each of several statements | Each statement is independent |
| Problem Solution set | Several questions in a row on the same scenario, each with one solution; asks whether it meets the goal | **Can't go back after answering, not on the Review page, no Review later**; several solutions may all be right, or all wrong |
| Case Study | Question on the left, case on the right (with a table of contents: Overview, Existing Environment, Requirements) | Information given in one question doesn't apply to other questions; you can Review within the case, but once you leave you can't come back. Read Requirements first, then answer |
| Lab | Do tasks in a real environment | Only the result is checked, not the method; no copy-paste, no internet; can't come back after submitting. AB-620 says "may have interactive components" |

- Normal questions have a **Review later** checkbox; the Review page at the end of a section lets you go back and change answers.
- **I didn't see a Microsoft Learn entry point in the sandbox.** On 2026-09-13 I confirmed the real exam allows Learn; watch where the button is during the exam.

**Practice Assessment**: on the AB-620 page in AI Skills Navigator, the **Take the practice assessment** button only appears after signing in (signed out, there's only Open in Microsoft Learn). Confirmed on 2026-11-03 that it opens; saved for Task 5.

The 5 learning paths of **AB-620T00** (Course AB-620T00-A: Design and build integrated AI agent solutions in Copilot Studio, a 3-day instructor-led course), all labelled "(GitHub Copilot)":

| Learning path | Modules | Exam objectives |
|---|---|---|
| Design and configure agents in Microsoft Copilot Studio (GitHub Copilot) | Explore Copilot Studio and agent harnesses; Manage usage and cost; Create instruction-driven agents; Design reusable behavior with skills | 6 (reusable components) |
| Automate business processes with workflows and agents (GitHub Copilot) | Design integration strategies; Automate agent tasks with workflows; Add human-in-the-loop steps to workflows | 1, 8–13 |
| Integrate agents with enterprise systems (GitHub Copilot) | Design integration strategies; Ground agents in enterprise knowledge; Extend agents with tools; Connect agents to MCP servers; Connect agents to Microsoft IQ (Foundry IQ, Fabric IQ, Work IQ) | 1, 23–29 |
| Design and build connected agent solutions (GitHub Copilot) | Design multi-agent solutions; Build connected agent solutions | 30–34 |
| Evaluate, publish, and manage agents (GitHub Copilot) | **Design a governance and security strategy**; **Design a responsible AI strategy**; Evaluate agents; Monitor and improve agents; Implement ALM with Power Platform | 2, 4, 5, 38–44 |

When writing the planning notes in Task 2, read the two in bold, plus "Design integration strategies" and "Design multi-agent solutions".

**harness** ([Harnesses in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview), 2026-10-19). I ran into this right at the start of M1: the home page created a GitHub Copilot harness agent by default, which has no Topics, so I created HR Assistant Classic (standard) instead. What's new this time is **a third type, the Customer Conversation harness**, and the course as a whole now centres on the GitHub Copilot harness. A harness is the runtime between the agent and the model; it decides when to call the model and which tool to call.

| | standard | GitHub Copilot | Customer Conversation |
|---|---|---|---|
| Suited to | Clear rules, stable answers needed | Complex multi-step business processes | Customer-facing website chat, phone support |
| How it runs | Follows defined topics and rules | Breaks down the goal itself, reasons step by step, switches route on failure | Multiple sub-agents; can hand off to a human |
| Files, skills, memory | Not the focus | Yes | Has skills, memory |
| Billing | Standard harness licensing | Copilot Credits | Copilot Credits |

HR Assistant in M1–M6 is all standard. The study guide is still the 2026-04-09 version and doesn't mention harnesses; the course has already moved to centre on the GitHub Copilot harness. Check the study guide again before booking.

**Predictions** (guess first, compare after, don't edit the original):
1. How many of the 44 will pass Explain on the first try? → 15.
2. With a data policy that blocks only `HTTP`, will HR Assistant Classic error in the test pane, or only be blocked at Publish? → Only blocked at Publish.
3. Which domain will have the most misses in the 20 scenario questions? → Integrate and extend.

**Azure**: on 2026-11-03 I decided not to upgrade and to let the free credit expire on 2026-11-15.

### Task 3: External agent and DLP (2026-11-05)

**`HR Careers FAQ`** (HR-Dev, No authentication, the only knowledge source is `data/careers-faq.md`, no tools). Tested on the demo website in an incognito window:

| Question | Answer |
|---|---|
| How do I apply? | Lists the application steps from the FAQ, with 1 reference; opens by saying it is an AI assistant |
| How many annual leave days does Ben have? | Declines: "can only help with job applications", points to `careers@contoso.example` |

- Incognito, not signed in, and it still chats: under No authentication anyone with the link can use it.
- The refusal relies on the instructions. Even if the instructions didn't stop it, it couldn't answer, because the knowledge source has no employee data at all (tested by `data.test.mjs`). **The real protection for an external agent is "don't attach internal data", not instructions.**

**DLP experiment** (`M7-DLP-Test`, scoped to HR-Dev only, deleted afterwards): detailed behaviour in `break-and-fix.md`, conclusions written into `planning/05-security-governance.md`.

- **Prediction 2 was wrong**: it isn't only blocked at Publish; it's blocked at runtime in the test pane, and the already-published demo website errors immediately too.
- When blocking `Chat without Microsoft Entra ID authentication`, Generic OAuth 2 can't be used either.
- The violation details can be downloaded as Excel, pinpointing the exact topic and node.

### Task 5: Scenario questions and Practice Assessment (2026-11-14 to 11-18)

**Scenario questions 18 / 20** (details in `scenario-questions.md`): Plan 7/7, Integrate 8/9, Test 3/4. Missed question 8 (bullet 23) and question 19 (bullet 42). The questions were in Chinese, so I didn't practise reading English.

**Practice Assessment attempt 1 (2026-11-15, not signed in):**

| Item | Result |
|---|---|
| Total score | **78%** (target 80%) |
| Questions / time | 50 questions, about 120 minutes (about 2.4 minutes per question) |
| Plan and configure (30–35%) | About 80% (estimated from the bar chart) |
| Integrate and extend (40–45%) | About 72%, weakest, and also the heaviest weighting |
| Test and manage (20–25%) | About 80% |

- Did it in one go without clicking "Check your answer"; not signed in, so once the score page was closed I couldn't see the missed questions, and **I didn't get the topics I got wrong**.
- **Time is the second weak spot**: the real exam is 120 minutes for about 40–60 questions, so I need to get down to about 2 minutes per question, and leave a margin for the case study and looking things up on Learn. Decided to take the English version (a Chinese version exists, so I can't get the 30-minute extension).
- Next step: before Task 6, **sign in** and do it again in **study mode**: answer each question first, then click "Check your answer" to see the explanation, and note the topics I got wrong and why (didn't know / misread). No speed test this time. Fill in the Ready column after attempt 2's results.
- Before booking, find time for a **timed mock exam** (no looking at answers, target ≥ 80%, ≤ 100 minutes) to train speed specifically.

**Practice Assessment attempt 2 (2026-11-16 to 11-18, study mode):** after answering each question I clicked "Check your answer" and read the explanation whether right or wrong, noting the topic and reason per question (the question text doesn't go into the repo). Did 56 questions and ended it myself, so there was no score page.

| Item | Result |
|---|---|
| Fully right / partly right / wrong | **39 / 7 / 10** (56 questions) |
| Estimated score (partly right counted as 0.5) | About 76% (42.5 / 56) |
| Plan and configure (bullets 1–22) | 30 questions, about 87% |
| Integrate and extend (23–37) | 18 questions, about 67%, weakest |
| Test and manage (38–44) | 8 questions, about 56%, few questions but many misses |

**Topics wrong or partly right (by bullet):**

| Topic | bullet | Reason |
|---|---|---|
| **Identity and permissions** (the biggest pitfall) | 2 (OBO vs client credentials), 23 (Graph permission `ExternalItem.Read.All`), 25 (AI Search authentication Entra ID Integrated), 31 (Foundry Agent Consumer @ agent scope), 44 (delegated deployment + service principal) | Didn't know; didn't separate "a person or an app". The last two identity questions (56) I got right with the mnemonic |
| Networking | 25 (public access off + private endpoint → VNet support) | Didn't know at all; the project always went over the public internet |
| Application Insights | 37 (designMode filter; environment-level vs agent-level telemetry) | Wrote about designMode in M4 but didn't remember it; didn't know about environment-level |
| Testing and evaluation | 38 (how to create a test chat), 39 (Custom grader) | Didn't know |
| Solution | 42 (Add required objects) | Didn't know; together with scenario question 19, bullet 42 missed twice |
| Others, one each | 5 (business unit), 6 (component collection), 8 (misread: reliability = confidence), 9 (Request for information), 10 (Asynchronous response Off), 29 (path/query/header/body) | Mostly didn't know; 8 was a misread |

- **What I know well:** "fixed position vs dynamic" (Add a tool inside a topic, asked 3 times, all right), agent flow inputs/outputs and monitoring, MCP, multistage approval, multi-agent design (connected agent, A2A endpoint), computer use monitoring, AI Search index fields and Foundry query type.
- **New knowledge (never touched in the project):** conversational test set, Custom grader, Request for information, environment-level telemetry, VNet support, Foundry roles, WhatsApp card limits (≤ 3 buttons, ≤ 10 list items).
- **Conflicts with hands-on results; answer per the docs in the exam:** REST API tool only accepts OpenAPI v2 JSON (in M3 an uploaded 3.0.3 YAML was accepted); component collection primary agent (differs from my M6 experience).
- **GitHub Copilot harness** showed up in questions for the first time (two harness types coexisting in an environment; agent-level telemetry only supports the standard harness); reference link titles also carry "(GitHub Copilot)". Check the docs to fill this in before booking in Task 6.
- Study mode wasn't timed; speed is left for the timed mock exam.
- Filled the Ready column by "Explain has an x, and no miss in scenario questions or PA attempt 2": 23 / 44.

### Task 6: Remediation, readiness check, wrap-up (2026-11-18 to 11-21)

**Remediation (Step 1)**: for the 21 bullets with Ready still empty after Task 5 (2, 5, 6, 8, 9, 10, 13, 15, 23, 25, 29, 30, 31, 33, 35, 36, 37, 38, 39, 42, 44), AI wrote English questions in new scenarios, 26 questions over 8 rounds, all answered correctly, **Ready 44 / 44**.

- Bullet 25: missed the first question (took Entra ID Integrated as "doesn't depend on the maker"); the second question was flawed (the stem only banned the admin key, so a query key was also compliant) and didn't count; got the third right.
- Bullet 38: missed twice in a row, both times picking Compare meaning for a conversational test set. After it was explained as "a written exam (has a model answer) vs an interview (no line-by-line model answer)", I got the next two right. Mnemonic: **for a conversational test set, anything with "compare" in it is out** (Exact match, Text similarity, Compare meaning).
- Scenario questions 8 and 19 are marked "remediated" in `scenario-questions.md`.

**Round E explain-back**: remediation only proves I can answer questions; the 14 bullets that didn't pass Explain in the first four rounds were still empty (30 / 44), short of criterion 1. So I added one more explain-back round; all 14 passed, **Explain 44 / 44**. Recorded under round E in `explain-log.md`.

**Coverage table audit (Step 2)**, checking `docs/coverage.md` column by column:

| Column | How checked | Result |
|---|---|---|
| Built (41 / 44) | Each row checked against the hands-on records in each milestone's notes | The 3 empty ones are all correct: 23 Copilot connectors (no license, docs only), 26 computer use (not done), 34 A2A (didn't get it working in M5). No change |
| Explain (44 / 44) | Checked against the ones marked "pass" in `explain-log.md` | Rounds A–D have 30 "pass" in total (A 6, B 12, C 9, D 3), matching the table; the 14 added in round E (5, 8, 13, 15, 29, 30, 33, 35, 36, 37, 38, 39, 42, 44) changed to x |
| Ready (44 / 44) | Checked against the conditions | **Conflicting definitions**: when filling Ready in Task 5 the rule was "Explain has an x and no misses"; the plan's Task 6 Step 1 says "fill Ready once the remediation question is answered correctly". Filled per the header's definition (Ready = can answer scenario questions) and Step 1. After round E both definitions are met, so the conflict no longer affects the result |

**Readiness check (Step 3)**:

| Criterion | Requirement | Actual | Result |
|---|---|---|---|
| 1. Explain | ≥ 36 / 44, no domain completely empty | 44 / 44 (Plan 22/22, Integrate 15/15, Test 7/7) | Met |
| 2. Scenario questions | ≥ 16 / 20 (first attempt) | 18 / 20 | Met |
| 3. 6 readiness questions | All pass | 6 / 6 (3 and 4 were re-asked) | Met |
| Reference: Practice Assessment | — | Attempt 1 78% (about 120 minutes); attempt 2 about 76% (study mode, 56 questions) | Below 80%, and speed not trained |

All three are met, so per the plan I can book. **The PA hasn't reached 80% and I've never done it timed**, so before booking I add one timed mock exam: exam mode, within 100 minutes, no looking things up. Doing the PA inevitably brings up questions I've seen, which inflates the score, so I mark each question "seen / not seen" on scratch paper and score the two groups separately: total ≥ 85% and **unseen questions ≥ 75%**, then book.

**Study guide re-check (Step 4, 2026-11-21)**:

- The study guide's ms.date is 2026-10-10; the page was updated on 2026-11-19. It now **only lists "Skills measured as of December 18, 2026"**; the old objectives are no longer on the page, only the change log remains.
- The certification page says: "The English language version of this certification will be updated on December 18, 2026", and "This exam is in the process of being updated to the GHCP harness".
- **The new version from 12-18 changes a lot** (graded in the change log's own wording):
  - Weighting: Plan and configure rises to 50–55%, Integrate and extend drops to 20–25%, Test and manage rises to 25–30%.
  - Removed: Configure topics, Connect to enterprise knowledge sources, Integrate agents with Azure. The old objectives can no longer be seen on the page; inferring from the coverage grouping, our 31, 35, 36, 37 (Foundry agent, AI Search with Foundry, Foundry model catalog, App Insights) are in this block.
  - Added: Create and manage skills; Configure agent identity, instructions, and behavior (memory, model selection); Connect to Foundry IQ / Fabric IQ; Evaluate AI model candidates. Agent flow is renamed workflow.
- **Conclusion: taking it before 12-18 still tests the 44 bullets we reviewed (standard harness version).** Slipping past 12-18 means reviewing a whole new set, so 11-28 is a suitable date. If I fail, I can retake after 24 hours, and there's still a retake window before 12-18.
- Note: the study guide says the AI Skills Navigator PA "more closely aligns with the exam experience". PA attempt 2 already had GitHub Copilot harness questions, so the question bank may mix in new-version content. If I hit questions on skills, memory, Foundry IQ and the like, no need to panic if I get them wrong.
- Booking (I use my personal MSA account, OnVUE at home): on 2026-11-22 I booked **the evening of 2026-11-26**, language **Simplified Chinese**: reading questions in English is too slow, time would be tight, and the error rate would go up. The PA has no Chinese version, so I practise in English and sit the exam in Chinese; key terms need to map between English and Chinese. I took the slot before the timed mock exam, because rescheduling more than 24 hours before the start is free. README only records the date.

**Practice Assessment attempt 3 (2026-11-21)**: **79%** (target 80%). Still study mode, clicking "Check your answer" question by question, not timed, and not split into "seen / not seen", so it can't count as the timed mock exam. Bar chart estimates: Plan about 82%, Integrate about 71%, Test about 79%. The three attempts were 78%, about 76%, 79%, **stuck around 78–79%**. Integrate was the weakest all three times, and has the heaviest weighting (40–45%).

| Topics wrong or partly right | bullet | Reason |
|---|---|---|
| Distribution: visible to the whole organisation requires **submit for admin approval** (show to teammates only reaches people it's shared with) | 3 | Picked the right channel, wrong distribution method |
| Failure classification: the material is right and was retrieved correctly, but the answer is still wrong → **Prompt or instruction gap** | 40 | Took the expected answer (reference answer) as the agent's answer |
| Creating a test set: generate N questions from a file → **Full question set**; reuse a test chat → **Use your test chat conversation** | 38 | Third miss on how to create one |
| An authenticated connection → **connection reference** (a Secret environment variable stores a value) | 43 | Partly right |
| An existing shared table with only one column added → **Edit objects, select only that column** (table segmentation; "metadata" doesn't include columns) | 41 | New knowledge |
| Terminology for real-time knowledge → **synonyms + glossary** on the knowledge source (action description belongs to a tool) | 24 | New knowledge |
| "creator's identity", no credentials stored → **Entra ID Integrated** | 25 | Third miss on "a person or an app" |
| AI Search with public access off, going through a private endpoint → **VNet support** (gateway is for on-premises data centres; the stem mentioning Managed Environment is the cue) | 25 | Same point missed in PA attempt 2 |
| Copilot Studio agent in the same environment → connection type **Copilot Studio** (A2A is for other platforms) | 32 | Partly right; got the description blank right |

- Got right, worth noting: Copilot connector (must be searchable in Microsoft Search) and real-time knowledge (data stays in the source system, always changing) are a pair: same data source, opposite answers; a computer use session status showing In progress can't be trusted, verify with **transcript mode** (this item on the to-verify list counts as found); for A2A you enter the **communication endpoint**, not the agent card, and choose OAuth 2.0 authentication per the parameters the other side gives.
- The questions' Objective numbers (1.3 Configure topics, 2.1 Connect to enterprise knowledge sources) are the old exam objective groupings, which shows this PA question bank is still mainly the old version.

**PA3 missed-question remediation (2026-11-22): 21 / 21.** I wrote my own English questions; within each group the stems differ by only one keyword, forcing me to spot the cues:

| Group | bullet | Questions | Discriminator cues |
|---|---|---|---|
| 1 | 25 | 4 / 4 | Must still work after the person leaves → service principal; use the maker's own identity, no app registration → Entra ID Integrated; Azure private endpoint → VNet support; on-premises data centre → gateway |
| 2 | 32, 43 | 4 / 4 | Same environment, published, reused in several places → Add agent → Copilot Studio; non-Microsoft platform → A2A `/a2a` communication endpoint + OAuth 2.0; "whose connection" → connection reference; "a single value" (URL) → environment variable |
| 3 | 38, 40 | 7 / 7 | Fast, small → Quick; a set number, generated from knowledge → Full; reuse a test conversation → test chat. Failure classification, ask in order: is the exam paper right (Evaluation setup) → was the book put in (Knowledge config) → is the book's content right (Knowledge content) → did the manual say so (Prompt gap) |
| 4 | 41, 24, 3 | 6 / 6 | Only a new column → Edit objects; only table properties → Include table metadata; knowledge source doesn't recognise terms → synonyms + glossary; tool not selected → the tool's name and description; whole organisation → admin approval; only people it's shared with → show to teammates |

- Noted from follow-up questions: an AI Search knowledge source in Copilot Studio **has no "use the end user's identity" option**. If the stem wants "each person sees only content they have permission to", look for a Copilot connector or user authentication; don't pick among AI Search's three authentication types.

**Practice Assessment attempt 4 (2026-11-24): 84%** (target 80%; my own mock exam standard is 85%). The PA can't be reviewed after finishing, so I clicked "Check your answer" as I went, counting the first answer. Bar chart estimates: Plan about 84%, Integrate about 68%, Test about 94%. The four attempts were 78%, about 76%, 79%, 84%, **the first time above 80%**. Integrate is still the weakest.

| Topics wrong or partly right | bullet | Cue |
|---|---|---|
| Querying agent events in App Insights → **customEvents** table (not traces); designMode == "False" was right | 37 | When Copilot Studio goes into App Insights, always query customEvents |
| Semantic retrieval over ServiceNow articles → **unstructured data source** (goes into Dataverse to build a semantic index, checks permissions in real time at query time) | 23 / 24 | "semantic retrieval across article content"; querying table records is what real-time knowledge is for; a tool is not knowledge |
| Middle tier calling downstream: signed-in employee → **OBO**; scheduled job with no user → **client credentials** (got them reversed) | 2 / 44 | The incoming token's audience is the middle tier, so the token has to be exchanged |
| Instructions for the generative answers node → the node's **Data source configuration panel** (not the custom prompt editor) | 20 | "configure the generative answers node", right in the node's own properties |
| Pipeline source → **the approved environment** (the in-progress dev environment doesn't go into the pipeline) | 44 | "isolating in-progress changes" |

**PA4 missed-question remediation (2026-11-24): 10 / 10.** Paired questions for each of the 5 topics: customEvents and channelId; the three ways to connect ServiceNow (unstructured, real-time, tool); OBO and client credentials; the node's Data source panel and the agent's Instructions; the pipeline source.

## Exam result (2026-11-26)

**Passed: 788 / 1000** (pass mark 700). OnVUE at home, Simplified Chinese.

| Domain | Weighting | My estimated score |
|---|---|---|
| Plan and configure agent solutions | 30–35% | 80-something % |
| Integrate and extend agents in Copilot Studio | 40–45% | 80-something % |
| Test and manage agents | 20–25% | **Lowest, about 60–70%** |

- In the PA, Test was always the strongest (PA4 about 94%), but in the real exam it was the lowest. Integrate was the weakest in the PA (about 68%) but reached the 80s in the real exam, which shows the paired remediation questions of the last few days really worked.
- **The translation of the Chinese exam paper was the biggest obstacle.** Reading the questions was very hard work; for example connector and connection: their Chinese names are hard to tell apart at a glance, and during the exam I couldn't recall which English term each one maps to. Test and manage has the densest ALM and evaluation terminology (connection reference (Chinese: 连接引用), environment variable (Chinese: 环境变量), pipeline (Chinese: 管道), test set (Chinese: 测试集), grader / test method (Chinese: 评分方法)), so translation probably hurt it the most.
- Lesson for next time: taking the exam in your native language means faster reading, at the cost of **terms not matching up**. If taking it in Chinese, build an English-Chinese glossary at least a week ahead, and **practise with the wording the exam paper is likely to use**, not just look at it the day before. Learn's Chinese pages are mostly machine-translated and won't necessarily match the exam's wording. The PA has no Chinese version, so this is hard to practise in advance.

## Concepts learned (each answers: what problem it solves, and when not to use it)

### DLP (data policy) (Task 3 experiment + round E bullet 5, 2026-11-21)

**What it solves:** once makers can build their own agents, admins need to control "where data can flow". Every connector goes into one of three groups:

| Group | Meaning | Rule |
|---|---|---|
| Business | Connectors that handle **company data** (nothing to do with whether it's a Microsoft product; the company's Salesforce can go here too) | Can only be used with other Business ones |
| Non-business | Connectors for non-company, personal data (Gmail, Dropbox); **new connectors land here by default** | Can only be used with other Non-business ones |
| Blocked | Fully forbidden | No one can use it; core connectors such as SharePoint and Dataverse can't be Blocked |

- Analogy: Business is the intranet office area, Non-business is the visitor area, with no door between them; Blocked is a locked-off restricted zone.
- Scope: Add all environments / Add multiple environments / Exclude certain environments. Environment admins can only manage their own environments; when an environment has several policies, the restrictions stack and the strictest wins.
- Signals in the stem: all agents must use Entra ID authentication → block `Chat without Microsoft Entra ID authentication`; forbid calling arbitrary URLs → block `HTTP`; allow only certain addresses → **Endpoint filtering**; forbid publishing to websites → block `Direct Line channels`.
- Restricting access by IP range is **not** DLP; it's the Managed Environment IP firewall or Conditional Access.

**When not to use it / pitfalls:**
- Too broad a scope causes collateral damage. In the experiment I scoped it to HR-Dev only and deleted it afterwards; never use Add all environments.
- **It also blocks at runtime**: already-published agents fail immediately, with no warning to live users. Check which agents are affected before changing it.
- DLP governs where data flows, content moderation governs answer content; don't mix them up.

### Internal and external audiences (Task 3 `HR Careers FAQ`, bullet 7)

**What it solves:** the same capability, offered to employees vs to the public, needs a different set of authentication, channels, knowledge, tools and who can use it (comparison table in `planning/07-audiences.md`).

- Internal: Authenticate with Microsoft, Teams / M365 Copilot, knowledge filtered by the user's permissions, tools can use the user's identity.
- External: No authentication (public information) or manual authentication (need to identify the customer), channels such as a website, **public content only**, the fewer tools the better.
- Tested hands-on: asked about an employee's annual leave, `HR Careers FAQ` declines. The refusal relies on instructions, but the real protection is that **there's no internal data in the knowledge sources and tools at all**: instructions can be bypassed by a jailbreak, "not attached" can't.

**When not to use it / pitfalls:** the most common mistake with an external agent is also attaching internal knowledge sources, or tools that use the maker's credentials, so anyone can look things up. Under No authentication you don't get the user's identity, so "look up my own orders" can't be done. If the organisation's DLP requires authentication, the external agent can't be published (in the experiment the Publish button was simply greyed out).

### Round E explanation extras (2026-11-18 to 11-21)

- **Grader = the exam marker**, three kinds: compare against a model answer (Exact match, Text similarity, Compare meaning), check by rules (Keyword match), AI as judge (General quality, Content safety, Custom). Custom = write your own instructions (what to look at) + labels (what result to stick on, each label set to Pass or Fail).
- **A solution is the parcel, a pipeline is the logistics.** Without a solution, the pipeline has nothing to deliver; without a pipeline, you can still export and import manually.
- **The pipeline's host environment** = configuration plus logs: stage definitions, deployment records and approval flows live here. There are two kinds, platform host (created automatically) and custom host. Target environments must be a **Managed Environment**; that's a different thing from a managed solution (a read-only package).
- **Managed Environment** = an environment-level governance enhancement pack: sharing limits, solution checker enforcement, usage insights, maker welcome content, environment groups and rules, pipeline targets, IP firewall, CMK. Users need a premium license.
- **Trace / span**: the call chain of one request from start to finish; each segment (span) carries a start time and duration, like parcel tracking, used to see where it's slow and where it breaks. Environment-level telemetry records this; agent-level records individual events. They're two independent pipelines that can be on at the same time, with all data going into App Insights.
- **Retry policy** (Default, None, Fixed, Exponential): only when retries are used up does the action count as failed and Catch fire; if retries take too long, the agent side may time out first. In Catch, return a friendly status to the agent, then use **Terminate (Failed)** to mark this run as failed. The full pattern is Try → Catch → Finally.
- **AI Search query type**: simple (keywords), semantic (keywords + semantic reranking), vector (by meaning), vector_simple_hybrid (keywords + vectors), **vector_semantic_hybrid (keywords + vectors + semantic reranking)**. Requires vector fields and a semantic configuration to be selectable.
- **Foundry model catalog**: mostly vendors' original models (OpenAI, Meta, Mistral, DeepSeek, Anthropic, etc.); fine-tuning is just one option. The reason to pick it is range of choice and control (your own subscription, region, quota); the cost is that deployment, version retirement and fees are all yours to manage.

### ★ Exam objectives map (review after round D, 2026-11-14)

The illustrated version is a web artifact: https://claude.ai/artifact/LZ4DSzwMhLnHtcXbrSjU9U (private, only I can open it). A text version is kept here.

**Three domains and weightings** (official study guide, read on 2026-11-14; page updated 2026-10-21):

| Domain | Weighting | Skill groups | bullet | Can explain after round D |
|---|---|---|---|---|
| Plan and configure agent solutions | 30–35% | Plan an agent solution; Create and monitor agent flows; Configure topics | 1–22 | 18 / 22 |
| Integrate and extend agents in Copilot Studio | **40–45%** | Connect to enterprise knowledge sources; Add tools to agents; Configure multi-agent collaboration; Integrate agents with Azure | 23–37 | 9 / 15 |
| Test and manage agents | 20–25% | Evaluate agent performance; Implement ALM | 38–44 | 3 / 7 |

**Exam objectives mapped onto the HR Assistant architecture (top to bottom is the path of one request):**

```
Planning and governance (1–7, spans everything)
 │
 ① Users and channels: internal employees → Teams / M365 Copilot (authenticated); external job seekers → website (no auth)   2, 3, 7
 ② The agent itself (Copilot Studio): orchestrator + instructions
      ├ Topics: fixed flows             14–22
      ├ Knowledge: read-only            18, 20, 23, 25
      ├ Tools: real-time read/write     16, 24, 26–29, 36
      └ Agent flows: multi-step / approval   8–13
 ③ Hand off to another agent: child / connected / Foundry / Fabric / A2A   30–34
 ④ Backend and Azure: Dataverse, Employee API, MCP server; AI Search + Foundry, model catalog, App Insights   35–37
 ⑤ Testing and moving: test set → grading → review results; HR-Dev → solution → Pipeline → HR-Test   38–44
```

**One-line mnemonics for scenario questions:**
- Read-only documents → knowledge; fixed flow → topic; real-time data or getting something done → tool.
- Each person can only see their own → End user; public data that's the same for everyone → Maker-provided.
- Look for an existing connector first → REST API tool → custom connector → MCP → HTTP node → agent flow → computer use last.
- For multi-agent, first ask where the other agent lives; for MCP vs A2A, look at the shape of the interaction (fill in a form and get a result / delegate a task and wait for the report).
- 35 vs 36: the model has to find material itself → librarian (35); you hand it the material → secretary who writes (36).
- General doesn't look at the answer sheet; Compare checks meaning against the answer sheet, but only accepts the same language.
- A connection reference is a socket that travels with the package; a connection is the key that stays in each environment.

### ★ Master table: which to pick when an agent connects to outside things (round C bullet 24, 2026-11-08)

**First decide which column it belongs to, then pick within the column.**
- **A. Search content to answer questions (read-only) → knowledge**
- **B. Query real-time data or get things done (read/write) → tool**
- **C. Hand a whole block of responsibility to another agent → multi-agent**

Connector (the manual), connection (the key) and connection reference (the label in the solution pointing to the key) aren't options; they're the parts behind column B. Everything in column B except the HTTP node uses them, and Foundry and A2A in column C also need a connection.

#### A. Knowledge: search content to answer

| Option | Where it's built, who builds it | Whose identity | Pros | Cons, limits | When not to use it | This project |
|---|---|---|---|---|---|---|
| **SharePoint / OneDrive / uploaded files** (18) | Copilot Studio → Knowledge → Add, maker | SharePoint: the user themselves, filtered by permissions (agent needs Authenticate with Microsoft); uploaded files: stored in Dataverse, searchable by all users | Zero setup, fastest | Uploaded files must be updated manually; no control over chunking and embedding | Content isn't in M365; need fine control over retrieval | M1 |
| **Copilot connector** (23) | **M365 admin center**, configured by an admin; then added as knowledge in Copilot Studio | The user themselves, filtered by the source system's ACL | Microsoft-managed index; configure once and M365 Copilot and all agents can use it | Needs an admin; read-only; crawl delay; can't see or change the index | Need to write data or need real-time data (→ column B); agent is No auth or external | Didn't get it connected in M4 |
| **Azure AI Search** (25, 35) | **Azure portal**: create the Search service + import wizard; connect in Copilot Studio with a connection | The connection's key (maker); **not filtered by user** by default | Full control over chunking, embedding, ranker; any app can use it | Needs an Azure subscription and costs; Copilot Studio only connects vector indexes, one index per knowledge source; citations need `metadata_storage_path` | Content is in SharePoint and needs per-user permissions → use SharePoint; no Azure budget | M4 |

#### B. Tool: query real-time data or get things done

| Option | Where it's built, who builds it | Whose identity | Pros | Cons, limits | When not to use it | This project |
|---|---|---|---|---|---|---|
| **Existing Power Platform connector** (24) | Copilot Studio → Tools → Add tool → Connector; or add an action in an agent flow | Either End user or Maker-provided | Over a thousand ready-made; maintained by Microsoft; DLP manages per connector | Can only do the actions it offers; some are premium | No existing one; just need to search content (→ column A) | M1 Dataverse, M2 Outlook/Approvals |
| **REST API tool** (29) | Copilot Studio → Tools → Add tool → REST API, upload OpenAPI | Depends on the API's authentication: API key → Maker; OAuth 2.0 → can be End user | With an OpenAPI file, connected in minutes (a custom connector is generated automatically behind the scenes) | Needs an OpenAPI file; the wizard doesn't read `securitySchemes`, so authentication must be configured by hand | The same API is also needed by flows and apps → custom connector | M3 |
| **Custom connector** (28) | **Power Apps** (or Power Automate) → Custom connectors, maker | Same as above; authentication type chosen in the connector's Security | Environment-level, reusable by agents, flows and apps; can go into a solution; DLP can manage it separately | Self-maintained; counts as premium when used in Power Apps/Automate | An existing connector already exists; a simple API called only once | M3 `EmployeeApiConnector` |
| **MCP tool** (27) | Copilot Studio → Tools → Add tool → Model Context Protocol; the other side provides the server URL | End user by default, can also be fixed | One URL brings in a whole set of tools; the tool list updates automatically with the server; other MCP clients can use it too | The maker can't control tool descriptions and parameters; needs generative orchestration | Need precise control over parameters and return types yourself; the other side only has a plain REST API | M3 `HR MCP Server` |
| **Send HTTP request node** (19) | Add a node in a topic, maker | Only a fixed key, written in plain text in the header, travels with the solution package | No connector needed; if you have a URL you can call it | The orchestrator can't see it; not reusable; can't use the user's identity; DLP can only block `HTTP` as a whole | Need the user's identity; need reuse; need to hold a real secret | M3, M6 |
| **Agent flow** (8) | Copilot Studio → Flows / New agent flow, maker | Each action in the flow uses the author's connection | Fixed multi-step flows; approvals; error handling; has Run history | Slower than calling a tool directly; the conversation has to wait for it to return (timeout limit not checked) | Can be done in one step (→ attach a connector tool directly); an approval that takes a long time (→ keep it out of the real-time conversation) | M2 |
| **Computer use** (26) | Copilot Studio → Tools → Add tool → Computer use, needs a machine to run on | Maker-provided by default, credentials stored in a vault | Can operate web and desktop UIs even when the other side has no API | Slow, brittle (breaks as soon as the UI changes); needs a machine and credentials; Preview | Don't use it if there's an API; it's the last resort | Didn't get it working in M3 |

**Selection order for column B (M3 Task 9):** existing connector → custom connector (needs reuse) → MCP (the other side provides a server, or tools change often) → HTTP node (one-off, well-defined call) → computer use (last resort).

#### C. Multi-agent: hand off a whole block of responsibility

| Option | Where it's built, who builds it | Whose identity | Pros | Cons, limits | When not to use it | This project |
|---|---|---|---|---|---|---|
| **Child agent** (30) | New child agent inside the main agent | Same as the main agent | Simplest; published together with the main agent, no switch to manage | Can't be used by other agents on its own | Maintained by another team, needs reuse across several agents → connected agent | Discussed in the M5 design notes |
| **Connected agent** (30, 32) | Another separately published Copilot Studio agent in the same environment; it must turn on **Let other agents connect to and use this one** | The conversation user themselves | Each published and maintained independently, reusable | Slow (13–28 seconds tested hands-on in M5); if the other side turns the switch off, the main agent breaks; variables must be passed explicitly | Just adding one capability (→ column B); small scale → child agent | M5 Onboarding Agent |
| **Foundry agent** (31) | Build the agent in the **Foundry portal**, turn on the Activity protocol; Add agent in Copilot Studio | End user credentials | Pro-code, can use Foundry's models and tools | Needs an Azure subscription and costs; governance split across two sides | Things low-code can do | M5 `hr-policy-summariser` |
| **Fabric data agent** (33) | Build and publish in a **Fabric workspace** (needs Fabric capacity); Add agent in Copilot Studio | End user credentials | Query a lakehouse / warehouse in natural language for statistics | Needs capacity, unusable when paused; only suited to analytical queries | Looking up single records or writing data (→ column B) | M5 |
| **A2A** (34) | The other side is an agent on any platform that supports the A2A protocol, providing an agent card; Add agent in Copilot Studio | Depends on what the other side supports; M5 used an API key | Open cross-platform standard | Preview; the other side is controlled by someone else; in M5 the agent card wasn't accepted, didn't get it working | The other side is a Copilot Studio or Foundry agent → use the dedicated way to connect | Didn't get it working in M5 |

**Column C in one line:** if you need "one capability", use a tool or MCP; only if you need "a collaborator" (with its own knowledge, instructions and release cadence) use multi-agent.

### How existing Power Platform connectors are categorised (round C follow-up, 2026-11-09)

Over a thousand of them; the full catalogue is the **Connector reference** on Microsoft Learn; Copilot Studio → Tools → Add tool → Connector shows the same list. No need to memorise them all, memorise the categories.

**By license (commonly used in the exam and DLP):**

| Type | Examples | Notes |
|---|---|---|
| **Standard** | Office 365 Outlook, Office 365 Users, SharePoint, Teams, OneDrive, Excel Online, Approvals | Mostly Microsoft's own M365 services; M365 licenses include basic Power Apps / Automate usage |
| **Premium** | **Dataverse**, **HTTP**, SQL Server, Salesforce, ServiceNow, SAP, Dynamics 365, the Azure family | Using them in Power Apps / Automate needs a premium license |
| **Custom** | `EmployeeApiConnector` | Anything self-built counts as premium |

Whether a Copilot Studio agent's use of premium connectors is included in the Copilot Studio license: I remember it is, not checked against the official docs.

**By publisher:** published by Microsoft (Outlook, SharePoint, Dataverse); **Verified publisher** (published by the third-party vendor itself, certified by Microsoft, e.g. Salesforce, ServiceNow); **Independent publisher** (published by individuals in the community, certified by Microsoft, not official vendor releases).

**Useful for HR Assistant:**

| Need | connector | This project |
|---|---|---|
| Read/write employee data | Dataverse | M1 |
| Send email, check calendar | Office 365 Outlook | M2 |
| Approvals | Approvals | M2 (`CancelApprovedLeave`) |
| Look up manager, org structure | Office 365 Users | Not used |
| Send Teams messages | Microsoft Teams | Not used |
| Real HR / ticketing system | ServiceNow, Salesforce, SAP | Not used (the Salesforce and ServiceNow seen on the M4 Knowledge page are this kind, queried in real time) |
| Call arbitrary URLs | HTTP | Not used (the topic's HTTP node isn't this connector, but DLP controls it with the same switch) |

**Relationship with DLP:** admins put each connector into one of three groups, **Business / Non-business / Blocked**; Business and Non-business can't be mixed in the same agent or flow (round A DLP experiment).

### How Microsoft 365, Power Platform and Azure relate (round C follow-up, 2026-11-08)

```
┌─────────────────────────── Microsoft cloud ───────────────────────────┐
│                                                                       │
│  Microsoft 365             Power Platform (low-code family)  Azure    │
│  (office work)                                     (pro development)  │
│  ─────────                 ───────────────────────          ───────── │
│  Teams                     Power Apps      apps              Foundry   │
│  SharePoint / OneDrive     Power Automate  flows             (models,  │
│  Outlook                   Copilot Studio  agents             agents)  │
│  M365 Copilot              Power BI        reports           AI Search │
│                            Power Pages     websites          Storage   │
│                                                              App Service│
│                            ─── shared foundation ───         ...       │
│                            Dataverse (database)                        │
│                            Connectors (manuals)                        │
│                            Environments (compartments)                 │
│                            DLP / Admin center (admin)                  │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  Microsoft Entra ID (identity): all three share one set of accounts and tenant │
└───────────────────────────────────────────────────────────────────────┘
             (Power Platform and M365 themselves also run in Azure data centres)
```

- **Power Platform is a family name, not one app.** The members share Dataverse, connectors, environments and DLP, so the same custom connector can be used by all three products.
- **Copilot Studio** is the member of Power Platform for building agents; its predecessor was Power Virtual Agents. Agent flows use the Power Automate engine.
- **Power Apps / Power Automate**: this project mainly borrows their pieces: the Power Apps UI to view Dataverse tables and build custom connectors; the Power Automate engine to run flows.
- **Azure** is for professional developers, with subscriptions paid by usage. When low-code isn't enough, Power Platform reaches out to call it (M4, M5).
- **Microsoft 365** plays two roles for an agent: **data source** (SharePoint, Outlook) and **publishing channel** (Teams, M365 Copilot).
- **Entra ID** is shared by all three, so Authenticate with Microsoft lets the same account sign in to the agent, read SharePoint and call Foundry.

| | Admin entry point | How it's charged |
|---|---|---|
| Microsoft 365 | M365 admin center | Per-user licenses |
| Power Platform | Power Platform admin center | Per-user licenses or by capacity (Copilot Studio by messages / credits) |
| Azure | Azure portal | Subscription, pay by usage |

| Used in this project | Which part it belongs to |
|---|---|
| HR Assistant, agent flow, custom connector, Dataverse employee table, HR-Dev/HR-Test, DLP, Pipelines | Power Platform |
| SharePoint policy site, Teams channel, Copilot connector, M365 admin center | Microsoft 365 |
| Foundry `hr-assistant` project, AI Search `hr-policies`, Blob, Application Insights | Azure |
| Fabric data agent | Fabric (a separate analytics platform; Power BI has now been merged into Fabric too) |

In one line: M365 is the office employees use every day; Power Platform is the workshop where business people build their own tools, and Copilot Studio is the machine in the workshop that makes agents; Azure is the professional engineers' factory; Entra ID is the same access badge everyone swipes at the door.

### Agents and flows are stored in Dataverse too (round B follow-up, 2026-11-06)

I used to think Dataverse was just a data source that an agent reads through knowledge or a tool. In fact it plays two roles for an agent:

| Role | What it stores | Examples |
|---|---|---|
| The agent's "filing cabinet" | The agent's own definition: instructions, topic, tool, knowledge settings | `bot`, `botcomponent`, `workflow` |
| Business data the agent reads | Read/written through knowledge or a tool | `crc6c_employee`, `crc6c_leaverequest` |

Conversation records (transcripts) are stored in Dataverse too; analytics come from here.

In make.powerapps.com → HR-Dev → Tables → **All** (the Recommended filter hides system tables) → search `bot` to find:

| Display name | System name | What it stores |
|---|---|---|
| Agent | `bot` | One row per agent |
| Agent component | `botcomponent` | Topics, knowledge sources, tools, etc., one row each |
| Agent component collection | `botcomponentcollection` | component collection (bullet 6) |
| Process | `workflow` | Flows, including agent flows |

- The display name has changed several times (Chatbot → Copilot → Agent); **searching the system name `bot` is the most reliable**. Searching `copilot` finds tables used by the Copilot feature in Power Apps, unrelated to agents.
- Tables I built myself have Managed = No and the publisher prefix `crc6c_`; Microsoft's built-in tables have Managed = Yes.
- This explains a few things:
  - Each environment has its own Dataverse, so environments are isolated from each other.
  - A solution can package agents, flows, tables and environment variables together (M6) because they are all records in the same database.
  - When the Tools list in Copilot Studio shows empty, the flow is still there in Power Automate (M2), because both UIs read the same table.
- When sharing a topic via a component collection, several agents link to the same collection row. Copying the YAML instead creates a new `botcomponent` row, so it's an independent copy.
- Dataverse has no standalone portal; there are several entry points:
  - Makers use make.powerapps.com → Tables.
  - Admins use the Power Platform admin center to manage environments and capacity.
  - Developers use the Web API or TDS (SQL read-only).
- Look, don't touch: editing system tables directly can easily break an agent or flow; to change something, go back to Copilot Studio or Power Automate.

### How agent flows relate to topics and Power Automate flows (round B follow-up, 2026-11-06)

- **An agent flow is one kind of tool**, whose logic you write yourself. The other tools (connector, REST API, MCP, prompt, another agent) mostly plug into ready-made capabilities.
- **The topic is the front desk, the agent flow is the back office**:
  - The topic handles the conversation with the user.
  - The flow handles fixed actions and doesn't talk to the user.
  - The two pass data through input/output parameters; they don't share variables.
  - With generative orchestration, the orchestrator can also skip the topic and call the flow directly as a tool.
- **Agent flows and Power Automate cloud flows are the same thing underneath**: the same engine, the same designer, the same `workflow` table, all monitored with Run history.
- The differences are the entry point and billing:
  - Agent flows are built in Copilot Studio and use Copilot Studio capacity; no separate Power Automate license is needed.
  - Ordinary cloud flows use a Power Automate license.
  - Billing details are from memory, not checked against the official docs.
- An existing cloud flow can also be an agent's tool, but it has to use the "called by an agent" trigger and be in a solution.

### Layers and identity of connector, connection, action, tool (round B follow-up, 2026-11-06)

**Figure 1: layers of the concepts**

```
┌──────────────────────────── Agent (HR Assistant Classic) ─────────────────────────────┐
│                                                                                       │
│   Topic (handles the conversation: what to ask, how to branch)                        │
│     └─ nodes can call ──┐                                                             │
│                         ▼                                                             │
│   Tools (the agent's "toolbox"; the orchestrator can also pick from it directly)      │
│     ├─ Agent flow ─────────── contains a chain of Actions ──┐                         │
│     ├─ Connector action (attach a single action) ───────────┤                         │
│     ├─ Custom connector action ─────────────────────────────┤                         │
│     ├─ REST API (a custom connector is built behind it) ────┤                         │
│     ├─ MCP server (also goes through a connector) ──────────┤                         │
│     ├─ Prompt (calls a model, no external system)           │                         │
│     └─ Another agent (connected agent, M5)                  │                         │
│                                                             │                         │
│   HTTP node in a topic ─── no connector, sends the request directly ──────┐           │
└─────────────────────────────────────────────────────────────│────────────│───────────┘
                                                              ▼            │
        Action    = one "button" in a connector (Add a new row, List rows) │
          │ belongs to                                                     │
        Connector = a system's "manual": which actions, which auth method  │
          │ which account signs in?                                        │
        Connection = one specific "sign-in", holds credentials, belongs to a person (me, in M2)
          ▲                                                                │
          │ a solution doesn't store the connection directly; it stores a "socket"
        Connection reference = a pointer to a connection (M6); swap the connection plugged in when changing environments
          │                                                                │
          ▼                                                                ▼
                     External systems: Dataverse, Outlook, Employee API...
```

| Concept | Banking app analogy | Example in the project |
|---|---|---|
| Connector | The banking app (installed, not signed in) | Microsoft Dataverse connector |
| Action | One button in the app | `Add a new row`, `Update a row` |
| Connection | The account signed in to the app | The one created the first time I added a Dataverse action |
| Connection reference | A sticky note saying "sign in with the company account"; fill in the actual account at the new office | The connection reference in the solution (M6) |
| Agent flow | A pre-written script: press several buttons in order, can make decisions, can wait for approval | `SubmitLeaveRequest`, `CancelApprovedLeave` |
| Tool | Anything the agent can pick up | All of the above |
| HTTP node | Skip the app, phone the bank directly and give the passphrase yourself | Department Lookup (M3) |

- A connector is the manual, a connection is one sign-in; the same connector can have many people's own connections.
- A connector itself neither reads nor writes; what reads and writes is one of its actions.
- Attaching a connector action = the agent presses one button; attaching an agent flow = the agent runs a whole script.
- REST API and MCP both have a custom connector behind them, so they also have connections and are also governed by DLP.
- The HTTP node doesn't go through a connector, has no connection, and can only put a fixed key in the header.

**Figure 2: identity in two segments**

```
   User ──①──▶ Agent ──②──▶ External system
   ① how the user gets in     ② whose identity the agent uses to call the backend
```

① User → Agent (the agent's Authentication setting):

| Option | Meaning | Where it's used |
|---|---|---|
| No authentication | Anyone with the link can use it; the agent doesn't know who the user is | HR Careers FAQ |
| Authenticate with Microsoft | Automatic Entra ID sign-in; only supports channels such as Teams, M365 Copilot, SharePoint | HR Assistant |
| Authenticate manually | Configure Entra ID or Generic OAuth 2 yourself; any channel | When sign-in is needed on a website |

② Agent → external system, question A: which authentication the connector supports (decided by the manual):

| Type | Common authentication methods |
|---|---|
| Microsoft standard connectors (Dataverse, Outlook, SharePoint) | Entra ID (OAuth) |
| Custom connector / REST API / MCP | No auth, API key, Basic, OAuth 2.0 (M3 used an API key, mock value `dev-local-key`) |
| HTTP node | No connection; a fixed key hand-written in the header; can't act as the user |

② Agent → external system, question B: whose credentials (most often tested in the exam):

| How it's called | Whose identity | Can you choose? |
|---|---|---|
| An action inside an agent flow | The flow author's (maker's) connection, the same whoever is chatting | Basically no |
| A connector action attached directly as an agent tool | End user credentials or Maker-provided credentials | Yes; if you pick End user, ① can't be No authentication |
| HTTP node | Fixed key (system identity) | No |

- Users should only see their own data (my email, my calendar) → attach a tool directly + End user credentials.
- Everyone does the same fixed thing, and users themselves shouldn't have permissions on that system (submitting leave writes into the HR table) → agent flow (maker identity); users can only write by the flow's rules.
- Risk: maker identity means lending the maker's permissions to all users. If the flow looks up records by an ID the user enters, someone can see data that isn't theirs → add validation in the flow, or switch to End user credentials.
- **Example (round B re-ask 10): an employee reads their own Outlook calendar**
  - Connector = **Office 365 Outlook** (the app itself, a whole bundle of actions)
  - Action = `Get calendar view of events` (the button)
  - Connection = the account each employee signs in with
  - With End user credentials, each employee **is asked to sign in or consent once on first use, creating their own connection**. 50 employees means 50 connections, each using their own, so each person can only see their own calendar.
  - Prerequisite: the agent's Authentication can't be No authentication.

### Which human-in-the-loop action: Request for information, Approval, Send an email (Practice Assessment follow-up, 2026-11-16)

In Practice Assessment attempt 2 (study mode) I missed a bullet 9 question: it needed to collect "approved or not + a number" for later steps, I picked Send an email, and the right answer was **Request for information**.

**The ladder (simple to complex):**

```
Send an email                  Notify only; moves on after sending, doesn't wait, collects no value
Send email with options        Stops and waits; collects one button option back (text)
Start and wait for an approval Stops and waits; collects Approve/Reject + comments back   ← used by M2 CancelApprovedLeave
Request for information        Stops and waits; collects several typed fields back (Yes/No, Number, Text...)
```

| | Send an email | Request for information |
|---|---|---|
| What's in the email | A block of text | A form you can fill in directly |
| After the flow sends it | Moves on immediately | Stops and waits; continues only when someone submits (can be set to continue on the first person's reply) |
| Where the reply goes | Back to the sender's inbox, free text, the flow can't read it | Submitted to the flow; each field becomes an output that later steps use directly |

- Analogy: Send an email = sending the contractor an ordinary email saying "the drawings changed"; Request for information = an **RFI form** on site, with fixed fields, **work stops waiting for the signed reply**, and construction continues per the answer.
- Building it yourself with Send an email (email with a link → Forms form → wait → match it to the right request → continue on the first reply → type conversion) is technically possible, but Request for information covers it all in one action. **Exam principle: pick the ready-made feature that directly meets every requirement.** Ask yourself: "Using only this one action, adding nothing else, does it meet every requirement?"
- Other distractors: AI approval can **use** the information a person filled in, but **can't replace** human review; Post adaptive card and wait for a response is a **Teams** UI, not Outlook.
- **Why Approval was enough in M2:** cancelling approved leave only needs HR to give an "approve / reject". If HR also had to fill in a field like "how many days of leave to give back", it should switch to Request for information. When Approval sends an approval, the approver also gets an email with Approve/Reject buttons; it looks like an email, but behind it Approvals is waiting for the result, which isn't the same as Send an email.
- Signal words: **capture … for use by subsequent actions** (needs to collect values), **continue after … submits** (needs to wait), **Outlook** (the UI), **first reviewer** (whoever replies first).

### Difference between Activity and Run history (round B bullet 11, 2026-11-07)

| | Copilot Studio Activity | Power Automate Run history |
|---|---|---|
| Perspective | The orchestrator's view: why it chose this topic or tool, which parameters it passed | The technical facts of execution |
| Content | Leans toward explaining intent | Each action's status (succeeded, failed, Skipped), actual inputs and outputs, duration |
| Reliability | A lead | The verdict |

- When the two disagree, Run history wins. In M2 the test pane reported `BadGateway` and `NoResponse` at least 5 times, and Run history mostly showed the flow had actually succeeded.
- Entry point: make.powerautomate.com → My flows → the flow → Run history.

### Two key points about input/output parameters (round B bullet 12, 2026-11-07)

- **Not shared; explicitly mapped.** The flow can't see the topic's variable pool:
  - When calling, map topic variables (`Global.EmployeeID`, `Topic.LeaveType`) one by one to the flow's inputs.
  - After the flow returns, each output automatically creates a new topic variable to receive it (in M2, `Topic.RequestId`, `Topic.Status`).
  - Types must match: in M2 Task 4, the topic's Date passed to the flow's String parameter didn't match.
- **Left empty = the key disappears.** If an output in `Respond to the agent` isn't assigned, that key simply vanishes from the result, and the topic reports "output parameter missing". Even if you just want to return an empty string, write an explicit empty-value expression (hit repeatedly in M2 Task 6 and Task 7).

### Error handling: Scope + Configure run after (round B bullet 13, 2026-11-07)

- **`Scope` is an action (node)** in the Control category, the same kind as `Condition` and `Apply to each`. It's a "folder" that wraps several actions together. If any step inside fails, the whole Scope counts as failed.
- **`Configure run after` isn't a node; it's a setting every action has** (in the action's `...` menu or Settings). It decides "only run me when the previous step had this result", with four checkboxes: Is successful, Has failed, Is skipped, Has timed out. **By default only Is successful is ticked**, so as soon as the previous step fails, everything after it is skipped.
- Put together, it's try / catch:

```
[Scope: Try]                       ← wraps the risky actions
   └─ Add a new row (write to Dataverse)
[Scope: Catch]                     ← Configure run after: tick only Has failed / Is skipped / Has timed out
   └─ Respond to the agent (ErrorCode = write failed)
[Condition / Respond on the success branch]    ← its own run after also needs opening as needed, or it gets skipped on the success path
```

- **Respond to the agent doesn't tell the topic about errors automatically** (my M2 prediction was disproved); you have to design the returned `ErrorCode` yourself.
- Consequences of not adding it:
  - The user sees platform errors they can't understand (`BadGateway`, "output parameter missing").
  - Worse: the topic still shows "submitted", but nothing was written to the database.
- Pitfall: `Configure run after` may be quietly reset after publishing; verify with a real test plus Run history.
- **Configure run after and the Condition node are both conditional checks, but they check different things**:
  - run after checks the previous step's run status (succeeded, failed, skipped, timed out); you can only tick four options; it's a setting on the action.
  - Condition checks a data value (e.g. whether `Outcome` equals `Approve`); you can write expressions; it's a node.
  - When an action fails it has no normal output, so Condition gets no data; that's why error handling uses run after.
- **Got it backwards again in round B re-ask 13; remember**:

| | What it is | How to remember |
|---|---|---|
| Scope | **A node** (Control category, same kind as Condition) | A box, visible, can be dragged onto the canvas |
| Configure run after | **A setting** (every action has it, in the `...` menu or Settings) | A label stuck on every box, only visible when you open the settings |

- **A flow that errors doesn't hang forever**: it ends, just with all later steps skipped. What "waits forever" is an approval (`Waiting`, bullet 9); don't mix them up.

### Put an agent flow inside a topic or attach it as a tool (round B bullet 14, 2026-11-07)

| | Inside a topic | Attached directly as an agent tool |
|---|---|---|
| Who decides when to call it | The topic's flow | The orchestrator |
| Where parameters come from | Topic variables mapped one by one, collected before the call | The orchestrator finds them in the conversation itself |
| Where it goes after the call | The next step set in the topic | The orchestrator decides |
| Suited to | Fixed steps, parameters must be exact (leave uses an adaptive card to collect type and dates in one go) | Varied user phrasing, simple parameters, low cost of a wrong guess |

- In M2, `SubmitLeaveRequest` was **put inside** a topic (adaptive card + `Global.EmployeeID`).
- `CancelApprovedLeave` was **deliberately not put inside** a continuous-conversation topic: it has human-in-the-loop, the flow stops at `Waiting` for a person to approve, possibly for hours or even days, and putting it in the conversation would leave the user waiting. At the time I triggered it on its own from the test pane to verify.
- Remember them together: **a flow that waits a long time for a person doesn't belong in a conversation that needs real-time responses** (bullet 9 + 14).

### Where answer format is controlled, and channel differences (round B bullet 15, 2026-11-07)

| Location | Scope | M1 hands-on result |
|---|---|---|
| The agent's instructions | Global | Item 6, Response format (conclusion first, with citations, in Chinese), worked consistently on all main paths |
| Settings → `Response formatting` (Preview) | Global; the page says it overrides other instructions | **Didn't work as documented** (M1 Task 4) |
| Message node in a topic | A single node | What you write is what's shown; format fully under your control |

- **The same format doesn't necessarily display the same on different channels**:
  - Markdown (bold, lists, tables, links) is supported to different degrees per channel; some support only part of it, some show the raw symbols.
  - Adaptive cards: channels support different versions and elements; the same card can look different in Teams and on a web page, and some elements don't display.
- Exam approach: the format is broken on some channel → first check what formats that channel supports → switch to a simpler, more universal format, or test that channel separately.
- **Corrections from round B re-ask 15**:
  - The fix is **not to make users switch channel**: which channel users are on is a business decision. Make the format fit the channel (no tables, use short sentences or simple line breaks), or tune for that channel separately.
  - The unreliable one is **Settings → Response formatting (Preview)**, not custom prompt. Its name matches bullet 15 word for word, and yet it's the one that doesn't work well.
  - What controls format for a single node is the **Message node** in a topic, not custom prompt. Custom prompt is a tool (bullet 17).

### Put a tool inside a topic or attach it to the agent (round B bullet 16, 2026-11-07)

- Attached to the agent: the orchestrator can see it and decides itself when to call which tool.
- Inside a topic: the orchestrator only decides whether to enter this topic; once inside, it's called in fixed steps.
- An agent flow is one kind of tool, so bullet 14 is a special case of bullet 16; the same goes for REST API, MCP and connector actions.
- **A tool added inside a topic also appears in the agent's Tools list.** Whether the orchestrator can bypass the topic and call it directly is decided by **When this tool may be used** on the tool's settings page (confirmed in the UI on 2026-11-07):
  - `Agent may use this tool at any time`: the orchestrator can call it directly at any time.
  - `Only when referenced by topics or agents`: called only when a topic or another agent references it. If you want the tool to go only through the fixed flow, pick this.

### Redirect and the "who calls whom" layer table (Practice Assessment follow-up, 2026-11-16)

**Redirect** = a node inside a topic (Topic management → Go to another topic) that jumps from the current topic to run another topic. It works like a function call:

```
Topic A (close ticket)
  ├─ Steps 1, 2
  ├─ Redirect → Topic B (verify identity) ── ask employee ID, check, end ──┐
  ├─ Step 3  ◀──────────────────────────────────────────┘  after B ends, back to A to continue
  └─ End
```

- When B finishes it **always returns to A** and continues from the step after Redirect; exception: B uses End all topics / End conversation.
- Variables can be passed both ways (Receive values / Return values / Receive and return, see bullet 22) → B becomes a shared module with parameters.
- Use it when several topics share a stretch of conversation (verify identity, collect contact details, confirm before transferring to a human), or to split a long topic into smaller ones.
- **Fixed vs dynamic**: Redirect is hard-coded; once execution reaches it, the jump always happens. Generative orchestration is AI judging that it **might** pick a topic. "Must verify identity before doing X" calls for Redirect.

**What Redirect can't do (exam trap):**

| What I want to do | Use |
|---|---|
| Jump to another topic | Redirect ✅ |
| Call an agent flow, connector, prompt | **Add a tool** (Action node). A Practice Assessment question used "Redirect to a flow" as a distractor |
| Hand off to a human agent | Transfer conversation |
| Hand off to another agent | child / connected agent, etc. |
| End | End current topic / End all topics |

**Layer table: calls within the same layer each have their own mechanism; across layers, it depends on what the other side is.**

| Layer | Who and whom | What to use |
|---|---|---|
| topic ↔ topic | Within the same agent | **Redirect** |
| topic → tool | Topic calls a flow, connector, prompt | **Add a tool** (Action node) |
| agent ↔ agent | The other side lives inside your agent | child agent |
| | The other side is another Copilot Studio agent in the same environment | connected agent |
| | The other side is on an external platform | A2A, Foundry agent, Fabric data agent |

| | Between topics (Redirect) | Between agents |
|---|---|---|
| Who decides to jump | You, hard-coded in the flow | Usually the orchestrator decides who to hand to |
| Does it come back | Always comes back and continues with the next step | The other side finishes and hands the result back to the main agent |
| What gets passed | Variables | Natural-language tasks and results (A2A: "hand over a task, get a report back") |

Analogy: Redirect = in a design institute, following procedure and passing the drawings to the structural team next door; they always send them back when done. Between agents = the project manager deciding which consultant to bring in: a discipline team inside the institute (child), a sister company in the group (connected), an outside partner firm (A2A).

### Limits of the HTTP node (round B bullet 19, 2026-11-07)

- Problem it solves: at some step in a topic flow, directly call a system that has an HTTP endpoint to read or write data.
- **It's not "can't carry credentials", it's "can only use a fixed system identity"**: the header can carry a fixed key (M3 Department Lookup carries the mock `dev-local-key`), but it can't call on behalf of the user's identity. In both round A bullet 1 and round B bullet 19 I said "can't configure a credential"; remember this distinction.

| Limit | Explanation |
|---|---|
| Only usable inside a topic | It's a node, not a tool; the orchestrator can't pick it on its own |
| Hard to reuse | URL and header are hard-coded in the topic; another agent has to write it all again; a custom connector is one shared definition at environment level |
| Key lives in the topic | Awkward secret management; changing the key means editing topic by topic |
| Governed by DLP | Can block HTTP entirely, or use **Endpoint filtering** to allow only certain addresses |

- Choosing: one-off, simple, fixed key → HTTP node. Need reuse, user identity, or orchestrator calls → REST API tool or custom connector.

### Generative answers node vs agent-level knowledge (round B bullet 20, 2026-11-07)

- The node isn't "hand the topic output back to the orchestrator"; it is itself "look things up + write the answer": takes a question (the user's original words by default, or a variable) → searches the specified sources → generates an answer with citations, sent straight to the user or stored in a variable. M1's Policy QA topic works this way.
- What can be configured on the node (M1 Task 4): Input, **Search only selected sources**, Web search, Allow the AI to use its own general knowledge, Content moderation (can be overridden separately), a custom prompt text box.
- Ticking specific sources on the node = search them unconditionally ("Trigger conditions will be ignored for explicitly selected sources"); the agent-level knowledge description no longer plays a role in deciding. Bullet 18's "specify data sources on the node" is configured here.

**My question: isn't "which topic to go into" also a judgment by the orchestrator?**

Yes, both approaches carry the risk of that step. The difference isn't whether there's a judgment, but how much you can control after it:

- Agent level = telling the front desk "if there's a question, go find it in the archive room yourself"; which cabinet, and what to say, is all up to them.
- Node = the front desk only decides "send this to the policy counter"; once at the counter, which cabinet to search, whether general knowledge can fill in, what to do if nothing is found, are all written rules.

| What the node can do once inside the topic | Example |
|---|---|
| Rework the question before searching | First use `Global.EmployeeID` to look up the employee's country, rewrite the question as "annual leave policy for employees in Germany", then search |
| Search only specified sources | Policy questions only search `HRPolicies`, no web search |
| Tune settings for this step alone | Turn off answering from general knowledge, set a separate moderation level, add a dedicated prompt |
| Keep working after answering | Store the answer in a variable; if nothing is found, use a Condition to transfer to a human or give the HR email |

- Two cases where there is no "decide which topic" step at all:
  - The topic is reached by a Redirect from another topic, or triggered by a button or event.
  - Under classic orchestration it is triggered by trigger phrases, with no AI judgment; and under classic, agent-level knowledge answering is actually a generative answers node inside the system topic **Conversational boosting**.
- Conclusion: if it's only "enter topic → search → answer" with nothing added, it's about the same as agent level, and there's no need for a topic. **The node's value is the control you can add before and after.** In scenario questions, when you see "may only rely on a certain document", "get some information before searching", "transfer to a human if nothing is found" → choose the node.
- **Example (round B re-ask of 20): Germany and China have different annual leave policies, answers may only rely on the SharePoint policy library, give the HR email if nothing is found**

| Requirement | Configuration |
|---|---|
| Search only the SharePoint policy library | Turn on **Search only selected sources**, tick only HR's SharePoint |
| No web | **Web search** off |
| No general knowledge | **Allow the AI to use its own general knowledge** off |
| Search by country | First use `Global.EmployeeID` to look up the country, change **Input** to the reworked question variable |
| Give the HR email if nothing is found | Store the answer in a variable → `Condition` checks for empty → Message node replies with the HR email |

### Adaptive card (round B bullet 21, 2026-11-07)

- Problem it solves: collecting structured user input. The user fills in or picks in a set format, with no natural language mixed in, which is more reliable than having a topic pick parameters out of a sentence. M2 leave uses it to collect the type and dates.
- **Collect everything at once**: what would take three rounds of questions (type, start date, end date) becomes one submission. Each input's return value (`Input.ChoiceSet`, `Input.Date`) binds to its own topic variable; no need to split it yourself.
- **Can also be used just for display**: e.g. showing a confirmation card after a leave request is submitted.

  **Display vs collect (Practice Assessment follow-up, 2026-11-16):** I used to think adaptive cards were only for collecting. Actually it's itself a display format, a "laid-out card"; it only becomes a form when you put input fields in it and place it on a node that waits for submission.

  | Purpose | Node | Example |
  |---|---|---|
  | **Display** (only for the user to see) | Adaptive Card added in a **Message node** | Lay out the product name, stock and support link returned by a prompt as labelled fields, with a clickable link |
  | **Collect** (for the user to fill in) | **Ask with adaptive card** (Question type) | M2 leave: pick the type, pick the dates; on submit the values go into variables |

  - Signal words: display / fixed labeled fields / actionable link → display; collect / capture input → collect.
  - Common combination: set the prompt output to **JSON + Custom format** (fixed structure, not refreshed by Auto-detected on retest) → the Adaptive Card in the Message node binds to those JSON fields.
- When not to use it:
  - Asking just one simple question (yes or no): a Question node is less hassle.
  - The channel doesn't support it or supports it poorly (see bullet 15): voice channels can't show cards, and some channels support only some elements.

### Copilot connector vs Power Platform connector vs Azure AI Search (round C bullet 23, 2026-11-08)

**Copilot connector ≠ Power Platform connector.** The names just collide (Copilot connector was formerly Microsoft Graph connector). The connector layers covered in round B (connection, connection reference, End user / Maker credentials) all belong to Power Platform connector.

```
Power Platform connector (telephone)
  agent ──real-time call each time──▶ other side's API        can read and write
  e.g.: call Employee API to check leave balance, submit leave request

Copilot connector (library)
  other system ──crawled and indexed in advance──▶ Microsoft Graph ◀──search── agent
  read-only, with latency
  e.g.: index external HR knowledge base articles, search them when employees ask
```

| | Copilot connector | Power Platform connector |
|---|---|---|
| What it does | Builds an index in advance, for search | Calls the other side's API in real time each time |
| Can it write | No | Yes |
| Counts as, in the agent | knowledge source | tool / action |
| Who configures it | Admin, M365 admin center | Maker, Copilot Studio / Power Automate |
| Permissions | Carries the source system's ACL; users only find what they can see | The connection's identity |

- How content gets in: Microsoft's ready-made connectors (ServiceNow, Confluence, etc., crawled on a schedule), or push items yourself with the Graph connector API. Each item = body + properties + ACL; not limited to documents, tickets and records work too.
- When not to use it: you need to write data (use Power Platform connector / flow); you need real-time data (the index has latency); the agent is No auth or an external agent (filtering by user ACL requires sign-in).

**Addendum from re-ask 23 (round C, 2026-11-10):** The scenario is thousands of Confluence articles, each with different permissions; employees can only find what they can see; read-only.
1. Where to configure: the admin in **M365 admin center** (Copilot → Connectors), not "inside Copilot"; the maker then adds it as knowledge in Copilot Studio.
2. The **main reason** not to pick Azure AI Search **is permissions**, not "no need for customisation": Copilot connector brings the source system's **ACL into the index** and filters per person automatically; Azure AI Search uses the connection's key by default, so everyone finds the same thing, and per-person filtering means designing security fields and syncing permissions yourself. "Each article has its own access permissions" in the question is the cue.
3. Authentication: the agent needs **Authenticate with Microsoft** (not No authentication); the system first has to know "who is asking". "End user credentials" is a setting for tools in column B; knowledge has no such option.

**Correction for scenario question 8 (Task 5, 2026-11-14, answered wrong):** The scenario is thousands of ServiceNow Knowledge articles, some visible only to specific groups. Requirements: each person may only get answers from articles they're permitted to see, no writing APIs, and the index must also be used by M365 Copilot. I chose "add ServiceNow's Power Platform connector as a tool", wrong. The correct answer is **Copilot connector**.
- All three cues point to Copilot connector: ① "can only see what they're permitted to" → index with ACL, permission trimming; ② "no writing APIs" → admin configures it in M365 admin center; ③ "used by M365 Copilot" → the index is in Graph, shared tenant-wide.
- Why I got it wrong: seeing "ServiceNow" I thought of the ready-made ServiceNow connector. But that one is a **tool** (does things: create tickets, change status); each call gets one result, with no pre-built index, no semantic retrieval, and it can't do "the same index used by M365 Copilot".
- Mnemonic: **to "know", use Copilot connector (knowledge); to "do", use Power Platform connector (tool)**. The same system (ServiceNow) has both; check whether the question wants to "read articles" or "create tickets".

**Mnemonic refined (Practice Assessment 2nd attempt, 2026-11-16):** The mnemonic above is too simple. A Power Platform connector **can also serve as knowledge**, called a **real-time knowledge connector** (preview). Two Practice Assessment questions map here: one is creating/updating ServiceNow tickets, pick the ready-made connector's tools; the other is a real-time knowledge connector for an enterprise app, added on a topic's generative answers node, selecting only the needed tables.

| Approach | How it gets data | Can it write? | Good for |
|---|---|---|---|
| **Copilot connector** (knowledge) | **Builds an index** into Microsoft Graph in advance, filtered by ACL | No | Many articles, semantic search, shared with M365 Copilot (scenario question 8) |
| **Power Platform connector as knowledge** | Queries the other system **in real time** at question time, no index | No | Need the **latest** business data: order status, account info |
| **Power Platform connector as a tool** | Calls an action | **Yes** | Need to **do things**: create tickets, change records |

Decision order:
1. **Need to write?** Yes → Power Platform connector **as a tool**.
2. Read-only → **need real time, or need an index to search?**
   - Real-time business data → Power Platform connector **as knowledge** (questions often say "real-time knowledge connector" outright).
   - Many documents, permission filtering, shared with M365 Copilot → **Copilot connector**.

- When configuring a real-time knowledge connector, also watch: **scope** (used only by one topic → add it on that topic's generative answers node, not at agent level) and **minimal data** (tick only the needed tables; don't bring in sensitive tables like payroll).

**Architecture diagram: what connects to what among Copilot connector, Graph and agent (Practice Assessment follow-up, 2026-11-16)**

Trigger: on the 2nd Practice Assessment I got another bullet 23 question wrong (an agent using Authenticate manually with a Copilot connector, which Graph delegated scope to add; I chose `Files.Read.All`, correct is **`ExternalItem.Read.All`**). The root cause was not having the layers of these things straight.

```
 ┌──────────── External systems (outside M365) ────────────┐
 │  ServiceNow knowledge base, Confluence, own doc library… │
 └──────────────────────┬──────────────────────────────────┘
                        │ ① Copilot connector periodically "crawls" content
                        │   (admin configures it in M365 admin center)
                        ▼
 ┌──────────────── Microsoft Graph (M365's "main service desk") ────────────────┐
 │   M365's own data                   Data crawled in from outside             │
 │   ├─ Mail (Exchange)                ├─ External connection (the connection)  │
 │   ├─ Files (OneDrive)               └─ External items (each piece of content │
 │   ├─ Sites (SharePoint)                  + its access permissions ACL)       │
 │   └─ Users (Entra)                                                           │
 │   All have search indexes, in and out through the one door graph.microsoft.com │
 └───────────────▲───────────────────────────────▲──────────────────────────────┘
                 │ ② queries on behalf of "a user"  │ The same index is used by these too
                 │   (holding that user's token + scope) │
 ┌───────────────┴───────────────┐     ┌─────────┴──────────────────────┐
 │  Copilot Studio agent          │     │  M365 Copilot, Microsoft Search │
 │  Copilot connector added in Knowledge │ └────────────────────────────────┘
 └───────────────▲───────────────┘
                 │ ③ the user signs in first, so the agent knows "who is asking"
              User
```

| Thing | What it is | Relationship |
|---|---|---|
| **Microsoft Graph** | The unified entry point to all M365 data (main service desk) | Middle layer; neither an agent nor a connector |
| **Copilot connector** | Mover: carries external content along with its ACL into Graph | Only responsible for **putting into Graph** |
| **External connection / item** | Their names in Graph once moved in: connection = the connection itself (config, schema), item = each piece of content | Another category of data, on a par with Files and Sites |
| **Copilot Studio agent** | The one asking; adds the Copilot connector as knowledge | Only responsible for **taking from Graph**, on behalf of the signed-in user |
| **Scope** | What the user's token says about "which Graph counters you may take things from" | Taking external items needs `ExternalItem.Read.All` |

**Library analogy:**
- Graph = the city library's **main service desk**; the library has its own collection (Files, Sites, Mail).
- Copilot connector = the **acquisitions department**, which buys books from outside publishers (ServiceNow articles), shelves them, labels each with "who can borrow" (ACL), and files them in the "**external collection**" area (External items).
- Copilot Studio agent = an **assistant** who looks things up for readers, going to the service desk with **the reader's own library card**.
- Scope = the **areas the library card allows entry to**: `openid`, `profile` only prove "who I am"; `Files.Read.All`, `Sites.Read.All` get into M365's own files and sites areas; **`ExternalItem.Read.All`** gets into the external collection. `ExternalConnection.Read.All` can only see the library's configuration, not the books.
- The service desk filters by label; readers can only borrow books they're permitted to see (permission trimming).
- Rule: **anything a Copilot connector brings in is called "External" in Graph**.

| Agent authentication method | Who manages scopes |
|---|---|
| Authenticate with Microsoft | Handled by the system automatically |
| **Authenticate manually** | Configure it yourself in the Entra app registration; you must add `ExternalItem.Read.All` manually |
| No authentication | Can't use a Copilot connector (doesn't know who it is, so can't filter by ACL) |

**Power Platform connector doesn't go through Graph**: it calls the other side's API directly through a connection (a direct phone line); permissions sit on the connection's identity (End user / Maker credentials) and have nothing to do with Graph scopes.

In one line: **the Copilot connector puts into Graph, the agent takes from Graph, and the scope on the user's token decides which category it can take.**

**Compared with Azure AI Search (bullet 25):**

| | Copilot connector | Azure AI Search |
|---|---|---|
| Where the index lives | Microsoft Graph (inside M365) | Your own Azure resource |
| Embedding, chunking | Managed by Microsoft; can't see or change it | Choose your own model, configure it yourself |
| Who can use it | M365 Copilot, Copilot Studio agent, Microsoft Search | Any app that calls it |
| Permissions | Filtered by ACL automatically | Design it yourself (e.g. a security filter field) |
| Cost | Included in M365 (with quotas) | Billed as an Azure resource |
| This project | Not done | Done in M4 |

In one line: Copilot connector is a **managed** knowledge index, convenient but not controllable; Azure AI Search you build yourself and can control everything.

**Microsoft Graph is not a vector database.** Graph is the **unified API entry point** to M365 data (one big door: `graph.microsoft.com`), with various stores behind it: Exchange mail, SharePoint/OneDrive files, Entra users, etc. Copilot connector content is stored in the Microsoft Search index and also goes in and out through the Graph door. The vector layer is called the **Semantic Index** (the semantic index Copilot uses), also managed by Microsoft. Which connector content goes into the Semantic Index: not yet checked against official docs.

**Is Graph "a set of M365 APIs"? (Practice Assessment follow-up, 2026-11-16)** Basically yes; more precisely it's a **unified API entry point**, which has three things more than "a set of APIs":

| | A set of independent APIs | Microsoft Graph |
|---|---|---|
| Entry | One address per service | Only one: `graph.microsoft.com` |
| Authentication | Each authenticates separately | One system: a single Entra token, with scopes deciding which data you can access |
| Between data | Each manages its own | Linked together: user → manager → files → meetings (hence "Graph", a "relationship graph") |

- Analogy: a set of APIs = a **campus** where every building has its own entrance and its own access card; Graph = the campus built one **main entrance** plus a **universal access card** (token); the card says which buildings you can enter (scope), and there are **covered walkways** between buildings (data relationships), so from "Zhang San" you can walk straight to "Zhang San's files".
- Graph doesn't just read and write M365 data, it **can also take in data sent from outside**: the Copilot connector puts external content in through Graph, sharing the same entrance, the same permission system and the same search index as M365's own data, so M365 Copilot, Microsoft Search and agents can all use it. See the architecture diagram above, "Architecture diagram: what connects to what among Copilot connector, Graph and agent".

**Where Azure AI Search stuff is stored (using M4 as the example):** three places, all in your own Azure subscription.

```
Azure subscription → resource group
│
├─ ① Storage account → Blob container `policies`
│     Original documents (policy .docx), the "raw material"; Search doesn't manage it
│
├─ ② Foundry resource → project `hr-assistant`
│     Embedding model `text-embedding-3-small`, only turns text into vectors, stores nothing
│
└─ ③ Azure AI Search service (separate resource, with its own region and pricing tier)
      ├─ hr-policies-datasource   where the documents are (points to ①'s Blob)
      ├─ hr-policies-skillset     chunking + calls ② to generate vectors
      ├─ hr-policies-indexer      the executor: pulls ① in and processes it per the skillset
      └─ hr-policies (index)      ★ where the data really lives: each entry = chunk + vector + other fields
```

- The index lives inside the Search service; capacity and number of indexes depend on the pricing tier (M4 used Free). The Search service is itself a vector store and also supports keyword search; no need to build a separate vector database.
- The original documents aren't in Search; only chunks and vectors are stored. So opening a citation shows only the chunk and can't link back to the original (missing `metadata_storage_path`, see M4 break-and-fix).
- Both building the index and every query call ②'s embedding model.
- Compared with Copilot connector: the Copilot connector's index is hidden in the M365 back end; Azure AI Search's index can be opened in the Azure portal to see each record, and deleting the Search resource deletes the index.

**Two additions on bullet 25 (round C, 2026-11-08):**
1. **Permissions**: Azure AI Search **doesn't filter by user** by default; the agent uses the connection's key, so whoever asks searches the same index. A scenario question saying "employees can only see documents they're permitted to" → choose SharePoint or Copilot connector (filter by ACL automatically).
2. **"Is the content in M365" isn't the deciding factor**: content may be in SharePoint, but if you need custom chunking, hybrid retrieval, semantic ranker, or the index must also serve other apps, still choose Azure AI Search. The cost is an Azure subscription and fees.

### Four authentication types for an Azure AI Search connection: person or application (Practice Assessment 2nd attempt, 2026-11-17, bullet 25)

**Question (answered wrong):** Create an Azure AI Search knowledge connection that uses **the connection creator's own** Entra organizational identity, **without storing** an access key, certificate or application credential. I chose Service principal, wrong. The correct answer is **Microsoft Entra ID Integrated**.

| Method | Whose identity | What must be stored |
|---|---|---|
| Access Key | No identity; anyone with the key can use it | The Search key (**what M4 used**: endpoint + admin key) |
| Client Certificate Auth | An application | Certificate |
| Service principal (Entra ID application) | An application (registered in Entra) | Client secret or certificate |
| **Microsoft Entra ID Integrated** | **The person signed in who creates the connection** | **Nothing stored**; uses the sign-in token |

- Cues: "connection **creator's** organizational identity" = a person; "without storing … **application credential**" = explicitly rules out service principal.
- Prerequisite: that person needs an RBAC role on the Search resource (e.g. Search Index Data Reader). Better than Access Key in production: no secret to look after.
- **Why I got it wrong: led astray by question 38.** I had just learned "need an application identity → service principal", and saw Entra and applied it. The two questions are exact opposites:

| | Question 38 (Pipelines) | Question 42 (AI Search) |
|---|---|---|
| Stem | "application identity **rather than a user account**" | "connection **creator's organizational identity**", no stored application credential |
| Wants | Application | Person |
| Pick | Delegated deployment + service principal | Entra ID Integrated |

**Mnemonic: first ask "person or application", then ask "what may be stored".**
- **Person**: user account / organizational identity / signed-in user / creator → Entra ID Integrated (or End user credentials, OAuth delegated).
- **Application**: application identity / not a user account / unattended → service principal (stores a secret or certificate).
- Nothing may be stored → rule out Access Key, certificate and service principal; only methods using the sign-in token remain.

**The same mnemonic in OAuth flow names: OBO vs client credentials (PA 2nd attempt question 45, bullet 2, answered wrong 0/2, picked the two the wrong way round):** Scenario: the agent calls a middle-tier API, which then calls two downstream APIs (both support delegated and application permissions).

| Call | Signal in the stem | Person or application | Flow |
|---|---|---|---|
| Cases API | "**preserve the signed-in employee's** existing permissions"; the inbound token's audience is the middle tier | **Person** (on behalf of the employee) | **On-behalf-of (OBO)** |
| Events API | "scheduled process … **without a signed-in user**" | **Application** (the program itself) | **Client credentials** |

- **client credentials** = the application exchanges **its own** credentials (secret or certificate) for a token and uses application permissions; this is the service principal pattern.
- **OBO** = the middle tier takes the employee's token to Entra and **exchanges it for a new token**; the new token is for the downstream API and still represents this employee, keeping the employee's delegated permissions.
- **What audience is**: what the token says about "who this ticket is for". The employee's token says "for the middle tier"; the middle tier can't use it as is to call the Cases API (the downstream sees the ticket isn't addressed to it and refuses), so the ticket has to be exchanged, and that exchange is OBO.
- Distractors: **authorization code** (user signs in in a browser) and **device code** (user enters a code on another device) both need **the user to interact on the spot**; the middle tier calls in the background, and nobody is there to click sign-in.
- **Lawyer analogy:**
  - OBO: the employee engages a **lawyer** (middle tier), who takes the power of attorney to court (Cases API) and acts **in the employee's name**; the court only recognises the employee's own permissions, so what the employee can't look up, the lawyer can't either.
  - client credentials: the company's **legal department** (scheduled task) acts **in the company's own name**, not representing any individual, and can act at midnight with nobody around.
  - The employee's ticket says "enter the law firm" (audience = middle tier); it can't get into court directly, so the lawyer uses it to get an "appearance pass" in exchange.

**Agent authentication: Authenticate with Microsoft vs Authenticate manually (PA 2nd attempt question 56, bullet 2, answered right; follow-up 2026-11-18):** Scenario: employees in Teams use their work accounts; the service a tool calls has per-user permissions. Answer: agent **Authenticate with Microsoft** + tool **User authentication**. Distractors: Authenticate manually (needs a separate setup, not "the existing Teams identity"), Agent author authentication (tool uses the author's credentials = M3's Maker-provided; everyone sees data with the author's permissions).

| | Authenticate with Microsoft | Authenticate manually (Microsoft Entra ID) |
|---|---|---|
| What to configure | **Nothing**, just select it | The author **registers an app** in Entra and fills in client ID, secret, scopes (SSO also needs a token exchange URL) |
| Channels | **Microsoft's own only**: Teams, M365 Copilot, etc. (exact list not checked) | **Any channel**: your own website, mobile app... |
| Can scopes be specified | No | **Yes** (e.g. Graph `ExternalItem.Read.All`) |
| Token purpose | Mainly confirms "who this person is" | Takes the user's access token to call **the APIs you specify** |
| Evaluation (test set) | Supported | **Not supported** |

- **"manually" means the author configures it manually, not that the user types something manually.** Employees don't type any Entra ID, nor a client ID. What employees see is just a normal sign-in:
  - SSO configured in Teams → seamless, the Teams identity is used directly;
  - No SSO, or another channel → the agent shows a **sign-in card**; click it and sign in with **your usual work account** (in some channels you then paste a verification code back into the chat).
  - The manual part is on the **author's** side: register the app in Entra, copy the client ID and secret, fill them into Copilot Studio's Security → Authentication.
- **Office building access control analogy:** with Microsoft = the staff card issued centrally by property management; swipe and you're in, but it only works in this building. manually = hire your own access control company to install a system; more hassle to set up, but it can be installed at branch offices and warehouses, and each door's permissions can be set individually. For employees it's the same either way, **swipe your own card**; the difference is **who installed the access control**.
- Related: question 28's stem is exactly Authenticate manually, which is why there's somewhere to add the scope `ExternalItem.Read.All`.
- **Reading cues:** "existing Teams identity" / "no additional configuration" → with Microsoft; "custom website" / "specific scopes" / "Graph permissions" / non-Microsoft channel → manually.

**I've already missed several identity questions** (PA 2nd attempt 28, 38, 41, 42, 45: Graph permission ExternalItem.Read.All, deployment identity, Foundry role scope, AI Search authentication, OBO vs client credentials); Task 6 pulls "identity and permissions" out into a round of its own. There's one main thread: **person or application → which credential → how broad a scope.**

### Connecting Azure AI Search to an agent: M4 review + networking (public network, private network, VNet, gateway) (Practice Assessment 2nd attempt, 2026-11-17, bullet 25)

**Question (answered wrong, had no idea):** The agent is in a Managed Environment; Azure AI Search has **public network access turned off**, with only a **private endpoint**; the index must be added as a knowledge source, and the connection must **stay on the private network**. I chose custom connector, wrong. The correct answer is **Virtual Network support for Power Platform**.

**① First, a review of how M4 Task 4 connected it (it didn't stick this time):**
1. In Azure, created Storage account `sthrassistantdemo`, with container `policies` holding the 4 docx files.
2. Created Search service `srch-hr-assistant-demo` (Free tier).
3. **Import data (new) → RAG wizard**: pick Blob as data source → vectorise with Foundry's `text-embedding-3-small` → turn on semantic ranker → creates all four things in one go: datasource, skillset, indexer, and index `hr-policies`.
4. Copilot Studio: **Add knowledge → Azure AI Search** → create a new connection (choose **Access Key**, fill in Search endpoint + admin key) → pick index `hr-policies` → Ready.
- In one line: **the Azure side turns documents into an index; the Copilot Studio side creates a connection pointing at the index.** When the agent gets a question, Copilot Studio uses the connection to query the index and hands the retrieved passages to the model to write the answer.

**② Networking basics: where does Copilot Studio knock on Search's door from?**
- **Copilot Studio is SaaS**: it runs in Microsoft's own cloud, not in your Azure subscription. When it queries Search, by default it goes over the **public network**: the request hits `https://srch-xxx.search.windows.net`.
- **Public endpoint**: on by default for Azure services; reachable from anywhere on the internet (still has to pass authentication). M4 could connect directly precisely because the public endpoint was open.
- **Private endpoint**: gives Search an internal IP inside your Azure **virtual network (VNet)**; only things in that VNet (and connected networks) can reach it. Common enterprise practice: **turn off the public network, keep only the private endpoint**, so data isn't exposed on the internet.
- Problem: Copilot Studio isn't in your VNet, and the public door is shut, so it **can't reach** Search.
- **VNet support for Power Platform**: **delegate** a subnet in your VNet to a Power Platform environment (create an enterprise policy in Azure, then associate it with the environment; **requires a Managed Environment**). After that, requests sent by connectors in this environment **originate from your subnet** and travel over the private network to the private endpoint.

```
Default:  Copilot Studio ──public network──✕──▶ AI Search (public access off)
VNet:     Copilot Studio ──enters the subnet delegated to it──private network──▶ private endpoint ──▶ AI Search ✅
```

**③ VNet support vs on-premises data gateway:**

| | VNet support | On-premises data gateway |
|---|---|---|
| Where the data is | In **Azure**, public access off, with a private endpoint | In **your own server room** (on-prem SQL, file shares) |
| How it connects | Subnet delegated to Power Platform; requests originate from your subnet | **Install a piece of software** on a machine on the internal network; it connects outward to Azure and relays requests for the cloud |
| Prerequisite | Managed Environment + enterprise policy configured in Azure | An always-on machine + gateway installed |

**Covered walkway analogy:** AI Search is a building that has **sealed its street entrance** and kept only an **underground walkway entrance** (private endpoint).
- custom connector = switching to a different courier who still walks down the street and still can't get in (the problem is the **route**, not the **interface**; and AI Search has native knowledge source support, so no need to wrap it in a connector).
- Opening public access to selected networks = reopening a street door, which breaks "stay on the private network".
- data gateway = setting up a mailroom in **your own house**, for the things in your own house.
- **VNet support = building an underground walkway from Power Platform's office straight to that entrance.**

**Mnemonic: data in an on-prem server room → gateway; data in Azure, public access off, with a private endpoint → VNet support.** "Managed Environment" appearing in the stem is often laying the groundwork for VNet support.

- To verify: whether Free tier Search supports private endpoints (I recall it needs Basic or above); M4 used Free tier, so no chance to try hands-on.

**Four follow-up points (2026-11-17):**

**(1) Does an AI Search knowledge source also go through a connection? Yes.** Add knowledge → Azure AI Search creates two things behind the scenes:

| Thing | What it is | Where it lives |
|---|---|---|
| Knowledge source | "Which index to query" (`hr-policies`) | In the agent (an agent component) |
| connection | "Which key to query with" (endpoint + key) | In the **environment** (M4: Power Apps → Connections gained an Azure AI Search connection) |

The knowledge source carries no key; it references a connection. Same scheme as round B's "layers of connector, connection, tool": connector = socket type, connection = the specific one with a key plugged in, and knowledge sources and tools are the things that use it. Don't mix them up: a Copilot connector (bullet 23) puts content into Graph first and then reads it, not this path; a PP connector as a tool performs actions.

**(2) Is Azure networking tested? Only "recognise the signal", not how to configure it** (configuring networking is AZ-700's job):
- "public network access disabled" / "private endpoint" → **VNet support**;
- "on-premises SQL" / on-prem file shares → **data gateway**.
- VNet support is a **Power Platform feature**: configured in the Power Platform admin center, applies to an **environment**, requires a Managed Environment. It's like a hand Power Platform reaches into your Azure network, which is why it shows up in a Copilot Studio exam.

**(3) Copilot Studio is in the public cloud; does that conflict with "only for internal employees"? No.** "Public" has three meanings:

| Term | What it's asking | Office building analogy |
|---|---|---|
| Public cloud | **Who owns** the building | An office building built by Microsoft, with many companies each renting a floor |
| Public network access | **Which route** to take | The street entrance or the underground walkway |
| A public agent | **Who has an access card** | Only your own company's staff can swipe into your floor |

- The opposite of public cloud is "building your own server room" (private cloud, on-premises), not "internal use".
- Internal use is controlled by **identity**: set the agent to **Authenticate with Microsoft**, and only Entra accounts in this tenant can use it; publishing to Teams or M365 Copilot already requires a company account.
- The project did both, running on the same public cloud: HR Assistant (internal, sign-in required) vs M7 `HR Careers FAQ` (external, no authentication). The only difference is the access control.

**(4) Copilot Studio and Power Platform: family members.** Power Platform = Power Apps (apps), Power Automate (flows), Power BI (reports), Power Pages (websites), **Copilot Studio** (agents, formerly Power Virtual Agents). They share the same foundation:

| Foundation | Where I ran into it in the project |
|---|---|
| Environment | HR-Dev, HR-Test |
| Dataverse | Employee table; the agent itself is also stored in Dataverse |
| connector, connection | Agents and flows use the same set |
| solution, pipeline | Agent, flow and table packed up and moved together |
| DLP, governance | M7's data policy governs both agents and flows |

**Campus analogy:** Power Platform is an **industrial park** with shared utilities, roads and security gates (environment, Dataverse, connector, DLP); Copilot Studio is the **workshop** in the park dedicated to building agents, using all of the park's infrastructure. A "park-level" setting like VNet support is configured once, and every workshop in the park benefits. See also round C, "How Microsoft 365, Power Platform and Azure relate".

### Configuring and monitoring computer use (round C bullet 26, 2026-11-08)

M3 Task 9 didn't work end to end (stuck on the Hosted browser connection); details in `milestones/M3-tools/notes.md` Task 1, Task 9.

**Monitor: no need to dig through logs on the other system; Copilot Studio records every step itself.** M3's error "The test ended before any screenshots were captured" shows that a normal run takes a screenshot at every step.

| Where to look | Content |
|---|---|
| Test directly / Preview pane | Watch where the agent clicks in real time; screenshot per step + the model's reasoning |
| Activity / transcript | After go-live, review each step's action, screenshot and reasoning |
| Output = Text | Summary after the run, with an execution recap |

**Risk-related settings in Configure (common in scenario questions):**
- **Human supervision**: when unsure, sends a confirmation request to a reviewer via Outlook.
- **Allowed websites and desktop apps**: an allowlist, **off by default**, should be on in production. It only blocks "acting on sites not on the allowlist", not "opening" them.
- **Credentials**: default is **Maker-provided**; once shared, everyone acts with the author's permissions.
- **Machines**: web pages only → Hosted browser; need to reach **internal systems** → Cloud PC pool (Entra-joined, SSO possible); special configuration → Bring-your-own-machine.

**When not to use it:** don't if there's an API; slow and expensive (5 Copilot Credits per step, the model looks at a screenshot each step); breaks as soon as the UI changes; can't be called from a topic, only by the orchestrator under generative orchestration.

**Transcript mode: confirming whether a session actually finished (Practice Assessment 2nd attempt, 2026-11-17, answered right):** Scenario: computer use submitted a service request and a confirmation number was already received, but the Activity page still shows this session as **In progress**; you need to confirm whether it finished, **without resubmitting**. Answer: **review this agent session in transcript mode**.
- **Activity status lags**: a session may keep showing In progress after it has ended. The status bar can't be trusted; look at the record itself.
- **transcript mode** = opening a session's full record in Activity: every step's action, screenshot, the model's reasoning, and whether it reached a successful submission at the end. Official docs state this is the way to verify completion.
- Analogy: the site daily report (Activity status bar) still says "under construction", but the acceptance form (confirmation number) has been signed; to confirm, go through the **construction log** (transcript) entry by entry, rather than having the workers do the job again.

| Option | What problem it fits | This question |
|---|---|---|
| **Review the session in transcript mode** | Determining an existing session's real outcome | ✅ |
| Wait a few minutes and run again | Automation already running on the machine, conflicts | ❌ would **submit twice** |
| Check the machine page in Power Automate | Machine can't connect, offline | ❌ this isn't a connection problem |
| Run the tool's test feature | Testing how the tool itself behaves | ❌ can't see a session that already happened |

- **Reading cue:** "without submitting/running again" → rule out every "rerun" option and pick among the "review the record" ones.
- To verify: the exact UI entry point for transcript mode (M3 computer use didn't work end to end, so I haven't seen a real session).

### Adding a tool from an existing custom connector (round C bullet 28, 2026-11-09)

- The key word is **existing**: a custom connector is **environment-level**; built once in Power Apps, agents, flows and apps in the same environment can all use it directly. It solves "someone already wrapped this API, don't wrap it again": authentication method, action descriptions and DLP classification are maintained in one place, and changing one place updates everything.
- Can go into a **solution** and be deployed from Dev to Test with Pipelines (M6).
- Steps to add the tool (M3 Task 5): Tools → Add tool → find `EmployeeApiConnector` → pick an action → create or pick a connection → pick Credentials to use (End user / Maker-provided) → write the description (decides when the orchestrator uses it).
- When not to use it: a ready-made standard connector exists; a simple API called once by just this agent (→ REST API tool; inside a topic → HTTP node); the other side already provides an MCP server (→ MCP).

### Can an MCP tool go into a topic (round C bullet 27 re-ask, UI verified 2026-11-10)

**I originally said "MCP can't go into a topic, only the orchestrator can call it"; that was wrong.** Verified in the `Policy QA` topic of `HR Assistant Classic` (not saved, undone):
- Node **+** → Add a tool → search "MCP" on the **Tool** tab: No plugins.
- Switch to the **Connector** tab and search "MCP": **HR MCP Server is there**; selecting it lets you pick a connection, and Submit adds a node.
- The same list also has ready-made third-party MCP connectors (`MCP Hive.T Integration`, `Affinity MCP`, `TrueDialog MCP`, `Seismic MCP`). **In Power Platform an MCP server is just a connector.**
- Side note: the REST API tool also shows up on the Connector tab, named `Employee API`, alongside `EmployeeApiConnector`, which proves a REST API tool is a custom connector under the hood.

**But what goes in is the protocol's raw interface, not a particular tool:**
- The node's Inputs are **raw JSON-RPC fields**: `Session Id`, `jsonrpc`, `id`, `method`, `params`, `result`, `error` (7 Advanced parameters).
- To always call `search_employee`, you'd have to write it yourself: `method` = `tools/call`, `params` = `{"name":"search_employee","arguments":{...}}`, and possibly `initialize` first to get a session.
- Outputs are only `Result (string)`, raw text, not typed fields.
- Analogy: a REST tool in a topic = **filling in a printed form** (each box labelled "employee ID"); MCP in a topic = **taking a blank sheet and writing the envelope yourself in the post office's format**; it can be posted, but every character has to be right.
- This node was never actually run; whether the call works is not verified.

**Conclusion (scenario questions):** "fixed step N in a topic, with parameters set by the topic" → first choice is to wrap that interface as a **REST API tool / custom connector** and put it in the topic (form-style parameters, typed return fields). MCP in a topic is technically possible but needs hand-written JSON-RPC, hard to write and maintain. The normal use of MCP is attached to the agent, with the orchestrator choosing tools and filling parameters.

**MCP vs REST API tool vs custom connector:**

| | MCP tool | REST API tool | Custom connector |
|---|---|---|---|
| Who writes the manual | **The other side** (the server declares its tools) | You (upload OpenAPI) | You (built in Power Apps) |
| When tools change | Updates automatically with the server | Must re-import | Must re-edit |
| Control description, parameters | No | Yes | Yes |
| Put into a topic | Yes, but only as the raw JSON-RPC interface | Yes, form-style parameters (orchestrator can't see it when Trigger = None) | Same as left |
| Reuse | Other MCP clients (Claude, VS Code) can use the same server | Mainly for this agent | Agents, flows, apps in the same environment |

In one line: the other side already provides an MCP server, or the tools change often → MCP; you want to control parameters yourself or use it as a fixed step in a topic → REST API tool; also needs reuse by flows and apps → custom connector.

### MCP's two transports: SSE and Streamable (Practice Assessment 2nd attempt, 2026-11-17, bullet 27)

**Question (answered right 3/3):** A Power Apps custom connector connects to an MCP server; the OpenAPI schema has only one `POST /mcp`, with `x-ms-agentic-protocol: mcp-streamable-1.0`.
- Still compatible if changed to SSE? **No**, Copilot Studio no longer supports the SSE transport.
- Does each tool need its own OpenAPI path? **No**, tools are published dynamically by the MCP endpoint (`tools/list`).
- Does this schema configure a supported transport? **Yes**, look at the `x-ms-agentic-protocol` line.

**What a transport is:** **how messages go back and forth over HTTP** between the agent and the MCP server. The content is the same JSON-RPC either way; the only difference is how the line is wired.

**The term SSE itself:** Server-Sent Events, an older browser technology. The client sends one HTTP request, and the server doesn't hang up but keeps it open and pushes messages down (`text/event-stream`), **one-way**, like a radio that's always on.

**Old: HTTP + SSE transport (2024 spec, deprecated): two lines:**
```
① agent ──GET /sse──────────▶ server   long-lived connection, always open, only for "listening"
         ◀── endpoint=/messages?session=abc   server tells you where to send requests
② agent ──POST /messages?session=abc──▶ server   send request (tools/call)
         ◀── 202 Accepted                         only replies "received"
③ Result  ◀═══ pushed back over line ① ═══
```
- The long-lived connection must never drop; load balancers, gateways and serverless easily cut it off on timeout.
- The two lines have to match up: if ① is connected to machine A and ② hits machine B, the result can't get back.

**New: Streamable HTTP transport (since 2025, the only one Copilot Studio supports): one address:**
```
agent ──POST /mcp (JSON-RPC)──▶ server
      ◀── a) plain JSON, answered in one go (most cases)
          b) this response is upgraded to an SSE stream: pushes progress... finally pushes the result, then closes
```
- One endpoint; question and answer complete within the same request.
- The long-lived connection is **optional**, opened temporarily when you need to push while working, and closed afterwards.
- The session is maintained by the header **`Mcp-Session-Id`**, not by a hanging connection, so multiple servers and serverless are easy to deploy.
- "Streamable" = **can** stream, not must. SSE as a technology hasn't disappeared; it's been downgraded from "a separate channel that must always stay open" to "an optional way to return a particular answer".

**Bank analogy:**

| | Old: HTTP + SSE | New: Streamable HTTP |
|---|---|---|
| How you do business | **Hold a walkie-talkie the whole time** in the hall (long-lived connection), and **drop the form into another window's inbox**; when it's done they call you over the walkie-talkie | Hand the form directly to **one counter** |
| How the result comes back | Always over the walkie-talkie | Simple ones handed over on the spot; for complex ones the teller reports progress while working, then gives the result |
| What can go wrong | If the walkie-talkie drops, you get nothing; switch halls (another server) and it doesn't match up | With a queue ticket (`Mcp-Session-Id`) any counter can carry on |

**Why the OpenAPI has only one path (menu analogy):** a normal REST connector is like a printed menu, with every dish (every path) printed on it; an MCP connector prints only one line, "please ask the waiter" (`POST /mcp`), and the waiter tells you on the spot what's available (`tools/list`); the kitchen can add dishes without reprinting the menu.

**Relation to the project:** M5's `HR MCP Server` is Streamable: `POST /` + JSON-RPC body, with no separate `/sse` long-lived connection.

**How to recognise it in the exam:** `x-ms-agentic-protocol: mcp-streamable-1.0` or the stem says Streamable → supported; "switch to SSE" → not supported; "one path per tool" → not needed.

### Difference between REST API tool and custom connector (round C bullet 29, 2026-11-09)

**The difference isn't "simple vs complex operations".** Both can call the same API with the same number of operations (M3 Task 4 and 5 both called the Employee API). The difference is **where it's built and who it's for**:

| | REST API tool (29) | Custom connector (28) |
|---|---|---|
| Where it's built | **In Copilot Studio**: Tools → Add tool → REST API | **Power Apps** (or Power Automate) → Custom connectors |
| What it needs | An **OpenAPI** file | OpenAPI, Postman collection, or filled in by hand from blank |
| Under the hood | **Automatically generates a custom connector** | What you build is the custom connector |
| Mainly for | This agent | Agents, flows, apps in the same environment |
| Authentication | The wizard **doesn't read** `securitySchemes`; must be configured by hand (hit this in M3) | Configured on the Security page |

**How to remember:** underneath, both are custom connectors. REST API tool = a one-step shortcut from the agent side; custom connector = built on the platform first, shared by everyone.

**When not to use a REST API tool:** the same API is also needed by flows and apps (→ custom connector); the other side has no OpenAPI (→ custom connector filled in by hand, or an HTTP node in a topic); the other side provides an MCP server (→ MCP).

**Addendum from re-ask 29 (round C, 2026-11-10, not passed):** The scenario is a meeting room booking system with OpenAPI, 5 operations and an API key; A: only HR Assistant uses it and it must go live today; B: a month later flows and a Power App will also use it.
1. Case A: **REST API tool** (Tools → Add tool → REST API, upload the OpenAPI). **What gets generated under the hood is a custom connector** (in the UI, `Employee API` shows up on the Connector tab). Not an HTTP node: 5 operations would need 5 nodes, the key is in plain text, and it can't be reused.
2. Case B: switch to a custom connector. You can also take over and tidy up the connector auto-generated in A directly in Power Apps; you don't necessarily have to build from scratch.
3. Authentication: **the wizard doesn't read the OpenAPI's `securitySchemes`; configure it by hand** (the M3 gotcha); API key authentication → **Maker-provided**; setting it to End user would mean every employee types in the same key (M3 Task 4).

**File format: the exam answer is v2 JSON, which conflicts with M3 hands-on testing (Practice Assessment 2nd attempt, 2026-11-17, answered right 2/2):** Scenario: a REST API supports GET, POST, PATCH, DELETE; there are four equivalent files at hand: OpenAPI v2 JSON, OpenAPI v3 YAML, WSDL XML, Postman collection; the requirement is **"use one of the available definition files without converting it before upload"**, and the agent may only **create and update**.
- **Operations: POST (create) + PATCH (update).** When adding the REST API tool you can tick which operations to expose one by one; GET (read) and DELETE (delete) are not exposed.
- **File: OpenAPI v2 JSON.** Official explanation: the REST API tool only accepts **OpenAPI v2 JSON**.
- **Only both sentences together pin down the answer:** "without converting it before upload" = **you can't convert the format yourself first**, only upload an existing file as is; add the rule "only accepts v2 JSON", and the other three all need converting (v3 YAML needs v3→v2 and YAML→JSON; WSDL is a SOAP format, not OpenAPI; Postman must be converted to OpenAPI), leaving only v2 JSON.

| File | Must I convert it before upload | Can it be chosen |
|---|---|---|
| **OpenAPI v2 JSON** | No | ✅ |
| OpenAPI v3 YAML | Yes (v3→v2, YAML→JSON) | ❌ |
| WSDL XML | Yes (SOAP, not OpenAPI) | ❌ |
| Postman collection | Yes (convert to OpenAPI) | ❌ |

- **⚠️ Conflicts with M3 hands-on testing:** M3 Task 4 uploaded **OpenAPI 3.0.3 YAML** (`openapi.yaml`), and Copilot Studio **accepted it directly**, converting it to 2.0 automatically in the background after upload (in the Swagger editor it's `swagger: '2.0'`, see `milestones/M3-tools/notes.md`). The Power Apps custom connector entry point also accepts 3.0. The product may have been relaxed later, with docs and the question bank not yet updated. Going by M3's actual behaviour, v3 YAML would also satisfy "not converted before upload" (the conversion is done by the system **after** upload), so the question would have two answers; the question writer went by the documented rule.
- **In the exam, answer by the docs: REST API tool → OpenAPI v2 JSON.** A similar case: component collection (bullet 6, where the official wording differs from my M6 experience).
- Analogy: the building authority's rule says "only paper A3 blueprints accepted", while in practice the counter also accepts electronic copies and converts them for you; for a question testing the code, answer by the rule.
- **Reading tip:** restriction phrases like "without converting / without manual reentry / without duplicating" are there to rule out distractors.

### Difference between HTTP and REST API (round C follow-up, 2026-11-10)

**They're not on the same layer, and it's not either-or.** HTTP is "how the message is delivered"; REST API is "what message is sent, and by what rules".
- **HTTP = the postal system**: it sets how to write the envelope, where the address goes, where the stamp goes. A browser opening a web page, an app refreshing data: underneath it's all HTTP.
- **REST API = a company's published business counter instructions**: "send to this address, write these things in the letter, and we'll handle this for you". The letters all go through the postal system (HTTP).
- So a REST API is **built on top of HTTP**; calling a REST API means sending an HTTP request according to its rules.

**What an HTTP request looks like** (M3 Employee API, address illustrative):

```
GET  https://<tunnel address>/employees?department=Engineering
     ───  ─────────────────────────────────────────────────
    Action      Address: which "counter" to go to, what to look up

x-api-key: dev-local-key      ← header: extra info on the envelope; here, the key
```

The reply:

```
200 OK                         ← status code: 200 success, 401 wrong key, 404 wrong address
[ {"id":"E001","name":"...","department":"Engineering"}, ... ]
```

The 401, 404 and 502 seen in M3 and M4 are status codes.

**REST's three rules:** use addresses to represent "things" (`/employees`, `/employees/E001`); use actions to represent "what to do" (`GET` read, `POST` create, e.g. submit a leave request, `PUT`/`PATCH` modify, `DELETE` delete); data is usually JSON.

**An OpenAPI file = the manual for this REST API**: which addresses exist, which actions each address supports, which parameters are needed, what's returned, what key is required.

**HTTP node vs REST API tool in Copilot Studio:** in the end both send HTTP requests to the same REST API (M3's three approaches all called the Employee API); the difference is **who writes the letter**.

| | HTTP node | REST API tool |
|---|---|---|
| Analogy | **Write the letter by hand yourself**: fill in address, action, key and content yourself | **Import the manual** (OpenAPI), and the system writes it for you accordingly |
| API has 5 operations | Write 5 nodes | One import gets them all |
| Where the key goes | Plain text in the node header | Stored in the connection |
| Who decides to call | Only called when the topic reaches the node | The orchestrator can choose it itself, and it can also go into a topic |
| Return value | A chunk of text, parse it yourself | Turned into typed fields per the manual |

In one line: HTTP is the postal system, REST API is the other side's business counter; the HTTP node is writing the letter by hand, the REST API tool is handing over the manual and letting the system write it for you.

### Where request parameters go: path, query, header, body (Practice Assessment follow-up, 2026-11-16, bullet 29)

On the 2nd Practice Assessment I got half of a bullet 29 question right: in an OpenAPI v2 spec, `shipmentId` in the URL path `/shipments/{shipmentId}` should be `"in": "path"`, and I chose header; the returned `2026-04-18T15:30:00Z` uses `"format": "date-time"` (right; `date` would drop the time). The root cause was not knowing what each of these four locations represents.

```
GET https://api.contoso.com/shipments/SH-1001?lang=zh
                            └── path ──┘└─ query ─┘
Header:  x-api-key: dev-local-key      ← header (outside the URL)
Body:    { "shipmentId": "SH-1001" }   ← body (GET usually has none; only POST/PUT do)
```

**Analogy: sending a letter to an office building.**

| Location | Analogy | Role |
|---|---|---|
| **path** | The **address** on the envelope (which building, which floor, which room) | Specifies **which one** thing you want |
| **query** | A **sticky note** next to the address ("only 2026", "filter by department") | **Filters or adjusts** the result; optional |
| **header** | The **sender's badge and postmark** on the envelope | Says **who you are** and what format, unrelated to the thing itself |
| **body** | The **letter inside** the envelope | The **content being handed over**, used when creating or modifying |

**All used in our project:**

```
M3 Employee API
GET /employees/{id}                    ← path: {id} specifies "which employee"
GET /employees?department=Sales        ← query: "only the Sales department"
x-api-key: dev-local-key               ← header: sent with every request, proves you may call it

M5 A2A agent
POST /
x-api-key: dev-local-key               ← header: identity
{ "method": "message/send", ... }      ← body: the task content handed to the other side
```

**How to decide:**

| Ask yourself | Put it in | Examples |
|---|---|---|
| Is it the ID of **which one** thing? | **path** | Employee ID, order number, waybill number |
| Is it an optional condition like **filtering, sorting, paging**? | **query** | Department, year, page number, language |
| Is it something unrelated to the data, like **identity, key, format**? | **header** | API key, Bearer token, Content-Type |
| Is it a whole set of data to **submit**? | **body** | The contents of a new leave request, a message to send |

- How to recognise them: **`{curly braces}`** in the path template = path parameter; **after `?`** = query; anything **not in the URL** can only be header or body. "embedded in the request URL" in the stem rules out header.
- **Why it matters in Copilot Studio:** the REST API tool assembles the request according to the OpenAPI `"in"`. Write it as header and the waybill number gets stuffed into the request header; the API can't find it by path and the call fails. M3 hit a similar gotcha: the wizard's Authentication defaulted to None, `x-api-key` wasn't put in the header, and everything returned 401.

### Child agent and connected agent (round C bullet 30 correction, 2026-11-09)

**Correction 1: a connected agent is not a linear "one after another" relationship.** Just like a child agent, the main agent calls it, it finishes and hands back to the main agent, and the one who talks to the user at the end is always the main agent (M5: after Onboarding Agent answered, HR Assistant repeated it once more).

```
            User
             │
        HR Assistant (main agent, the orchestrator decides whom to call)
        ┌────┴──────────────┐
   child agent         connected agent
  (built inside the main agent)   (another separately published agent)
        └────┬──────────────┘
          both hand back to the main agent when done; the main agent replies to the user
```

**The difference is "where it lives", not how it is called:**

| | Child agent | Connected agent |
|---|---|---|
| Where it's built | **Inside** the main agent: New child agent | **Another** separate Copilot Studio agent, same environment |
| Publishing | Together with the main agent | Published separately, and **Let other agents connect to and use this one** must be on |
| Who maintains it | The same person or team | Can be another team, each with its own release cadence |
| Reuse | Belongs only to this main agent | Several main agents can connect to it |
| Risk | Low | If the other side turns off the switch, the main agent breaks (M5 experiment 2); variables must be passed explicitly |
| Speed | Fast | Slow (M5 tested hands-on 13–28 seconds) |

**How to choose:** child agent by default; only split it into a connected agent when other agents need to reuse it, or another team maintains it separately. M5 conclusion: making Onboarding Agent a child agent is enough.

**Correction 2: don't treat parallel time-saving as a selling point.** The main benefit of splitting is **division of labour**: each one's knowledge, instructions and description don't interfere with each other, and they can be maintained and tested separately. Whether the orchestrator calls two sub-agents at the same time was never verified; tested hands-on, the connected agent was actually slower.

**Correction on re-asked 30 (round C, 2026-11-10, not passed):** Scenario (a) onboarding checklist: one checklist + one line of instructions, maintained by HR themselves, used only by HR Assistant; (b) `IT Helpdesk Agent`, built and published by the IT department, its own knowledge base, updated weekly, also needed by the finance agent; (c) leave-day statistics by department, data in a Fabric lakehouse.

| | My answer | Correct | Why |
|---|---|---|---|
| (a) | custom prompt | **child agent** | A custom prompt is a processing tool (the "text secretary", bullet 36); it doesn't own a block of responsibility. Small, used by only one main agent, maintained by the same team = the typical child agent scenario (M5 conclusion). "Who maintains it" is not the basis for the choice |
| (b) | A2A | **connected agent** | An existing Copilot Studio agent that is "built and published" = bullet 32; reused by finance + maintained by another team → connected. A2A is only for when the other side is on **another platform**. If the question doesn't say cross-environment, assume the same environment; a real cross-environment case is usually solved by deploying into the same environment, not by switching to A2A |
| (c) | Fabric data agent | Correct | Addendum: in Copilot Studio it is an **MCP tool**, not a sub-agent |

"Make all three connected agents because parallel is faster" is wrong because:
1. **No evidence that parallel is faster**: tested hands-on, connected is slower (M5 13–28 seconds); the benefit of splitting is **division of labour**.
2. **Shouldn't be one-size-fits-all**: (a) is too small, use child; (c) is just one query capability, use Fabric data agent.
3. **Every extra connected agent is one more point of risk**: if the other side turns off "Let other agents connect", the main agent breaks (M5 experiment 2).

### Least privilege for calling a Foundry agent: role + scope (Practice Assessment attempt 2, 2026-11-17, bullet 31)

**Question (answered wrong):** A Copilot Studio agent connects to Foundry agent `Agent1`, the connection uses Entra ID authentication; the Foundry project that `Agent1` lives in **also contains other agents**; the identity must get permission that is **only enough to call Agent1**. I chose "Foundry Agent Consumer at the Foundry project scope", wrong. The correct one is **Foundry Agent Consumer at the Agent1 scope**.

**Azure RBAC authorization = role (what you can do) + scope (where you can do it)**; both should be minimal.

| Option | Role | Scope | Problem |
|---|---|---|---|
| Contributor @ project | Manage | Whole project | Too much permission, and it **doesn't include** permission to call the agent endpoint |
| Foundry User @ project | Develop in the project | Whole project | Carries development permission, more than "call only" |
| Foundry Agent Consumer @ project | Call only | Whole project | Can call **all** agents in the project |
| **Foundry Agent Consumer @ Agent1** | Call only | Only this one agent | ✅ |

- **Memorise the role names: Foundry Agent Consumer = only calls the agent endpoint; Foundry User = develops in the project.**
- **Key card analogy:** Agent Consumer is the key card for "entering a room to use it". Granted at project level = access to the whole building; granted at Agent1 level = opens only Agent1's room. A visitor gets only the room they're going to. Contributor is like the building manager's keys (can change the fit-out) but can't necessarily go in and use it; Foundry User is like the construction crew's site pass (can come in and change things).
- **Reading signal:** "only" + a seemingly redundant background sentence "project that also contains other agents" — it's there precisely to separate C from D. If the project contained only Agent1, there'd be no difference between them. "other agents / other tables / other environments" in a question stem often hints that **the scope should be narrowed**.
- **Relation to the project:** In M5 I connected the Foundry agent with my own admin account, which already had broad permissions; I never assigned a least-privilege role, and the project notes contain no Foundry role names. This point can only be filled in from the docs.

### Connecting to an existing Copilot Studio agent (round C bullet 32, 2026-11-09)

**Bullet 32 is about connected agents.** The exam objectives list it separately because the angle is different: 30 asks "should you split it this way" (design question), 32 asks "how do you connect it, and why won't it connect" (operations and troubleshooting question).

In the Add an agent screen several kinds are listed separately: an existing **Copilot Studio** agent in the same environment (32), Connect to an external agent → **Microsoft Foundry** (31), **Fabric data agent** (33), **Agent2Agent** (34).

**Reasons the other agent can't be found in the Add an agent list:**
1. The other agent hasn't been **published**.
2. Not in **the same environment** (e.g. one in HR-Dev, one in HR-Test).
3. The other agent hasn't turned on **Settings → Generative AI → Connected agents → Let other agents connect to and use this one** (On by default; a change only takes effect after Publish; it's not set at creation time).
4. (Not verified) The other agent hasn't been shared with you; the main agent doesn't have generative orchestration turned on.

**The other side turns off the switch after connecting (M5 experiment 2, tested hands-on):**
- The main agent **still selects it** and writes the Task; it only fails at execution.
- The user sees the **raw error** `ConnectedAgentFlagDisabled`, even the internal name `crc6c_OnboardingAgent` is exposed.
- **The turn simply ends**; it doesn't fall back to the knowledge base or suggest the HR mailbox.
- The main agent's Agents list **shows nothing wrong** (Errors empty); the maker only finds out when something goes wrong.

Exam memory hook: the risk of a connected agent = **one unilateral settings change on the other side and the main agent breaks, and breaks ungracefully**. This is also one reason M5 recommends a child agent.

### Fabric data agent (round C bullet 33, 2026-11-09)

**What it solves: statistical analysis in natural language.** It translates the question into **SQL** (or DAX, KQL), queries the lakehouse / warehouse, then explains the result in words.
- Asking "**what is it, how do I do it**" → knowledge ("what is the sick leave policy")
- Asking "**how many, which is most, trend**" → Fabric data agent ("how many people in each department", "which department took the most leave this year")

**When not to use it:** looking up a single record or writing data (→ column B tool / flow); data isn't in Fabric; no Fabric budget (requires paid **F2 or above**, about US$0.42/hour; **trial capacity doesn't support data agents**).

**Prerequisites (M5 Task 6):** the capacity is running (when paused, every turn reports `CapacityNotActive`); workspace type set to Fabric and bound to the capacity; the data agent built in Fabric and **published**; the user themselves has permission on the workspace and lakehouse.

**Identity:** not a choice between maker options. Per the docs, it queries data with **the identity of the user asking** (identity passthrough). M5 didn't manage to verify this (the person asking and the person who created the connection were the same account).

**The M5 surprise: in Copilot Studio it comes in via MCP.** The activity map shows it as **Model Context Protocol**, side by side with HR MCP Server, tool name `DataAgent_HR_Data_Agent`. Although the entry point is under Add an agent, **it is essentially a capability (MCP tool), not a sub-agent**: one question one answer, no context of its own, and what's passed is the user's original words `userQuestion`. The tool description shown is the sentence filled in when publishing in Fabric.

**Correction on re-asked 33 (round C, 2026-11-10, not passed):** Leave records are synced to a Fabric lakehouse; an employee asks three questions.

| Question | My answer | Correct | Why |
|---|---|---|---|
| (a) Total sick leave days per department per quarter last year, which is highest | Fabric data agent | Correct | Aggregation and ranking across time and departments |
| (b) How many days of annual leave I have left | Copilot connector | **Column B tool** (Employee API REST / custom connector, or Dataverse connector) | Single record, needs real time; a Copilot connector is a pre-built index with latency; a Fabric data agent is good at aggregation, not at looking up one personal record |
| (c) Is a doctor's certificate needed for sick leave over 3 days | Copilot connector | **knowledge: SharePoint knowledge source** | The policy is in SharePoint; only use a Copilot connector when the content is in a **third-party system** (Confluence, ServiceNow) |

Three-way split: asking "**what is it, how do I do it**" → knowledge; asking "**how many, which is most**" → Fabric data agent; asking "**a specific value of mine, do something for me**" → tool.

"Data is in Fabric, doing statistical analysis" is **when to use it**, not a **prerequisite**. Prerequisites are what must be in place before connecting: a paid F2+ capacity that is running; workspace type set to Fabric and bound to the capacity; the data agent built and **published**; the asking user themselves has permission on the workspace and lakehouse (because it uses identity passthrough).

### Difference between A2A and MCP (round C bullet 34, 2026-11-09)

A2A can connect to agents on **any platform** that support the protocol, extending the multi-agent boundary beyond the platform. When the other side is a Copilot Studio or Foundry agent, use the dedicated connection method, not A2A.

**"The other side of MCP can't use natural language" is inaccurate**: an MCP server can call a large model internally (Fabric data agent goes through MCP and translates into SQL behind the scenes). The difference is in **the shape of the interaction**:

| | MCP | A2A |
|---|---|---|
| The other side is | A set of **tools** | A **peer agent** |
| What's passed | Tool name + **structured parameters**, returns a structured result | **Natural language messages**; the other side decides how to do it |
| Conversation | One question one answer, stateless | Has a **task**, can be multi-turn, has its own state |
| Control | Always in the main agent's hands | Handed to the other side; internally a black box |
| Analogy | Adding a **tool** to the main agent | Bringing in an **outsourced colleague** to collaborate |

**Details I touched in M5:**
- **Agent card**: the other side puts a "business card" at `/.well-known/agent-card.json` (name, description, address, capabilities, skills); Copilot Studio reads it automatically after you fill in the endpoint.
- Communication is **JSON-RPC** over HTTP; authentication depends on what the other side supports; M5 used an API key.
- Where it got stuck: Copilot Studio kept saying "We couldn't find an agent card at this URL"; our service returned 200 and the card for every path, and it never sent a single POST.

**When not to use it:** the other side is a Copilot Studio / Foundry agent (use the dedicated method); you only want to add one capability (→ MCP or tool); the other side is untrusted or not under control and sensitive data is involved (internally it's a black box; once data is handed over you can't control it).

### Generative answers with Azure AI Search + Foundry (round C bullet 35, 2026-11-09)

**Difference from bullet 25: who writes the answer.**

```
bullet 25: Azure AI Search connected as knowledge
  User asks → Copilot Studio fetches snippets from Search → [Copilot Studio's own model] writes the answer

bullet 35: generative answers node → Classic data → Azure OpenAI on your data
  User asks → the node hands the question to Foundry
           → Foundry uses [its own deployed gpt-4.1-mini] + its own index hr-policies to fetch snippets and write the answer
           → the answer goes back to the node, then the reply goes to the user
```

The problem it solves: both steps of RAG, **retrieval + generation**, use things you control on Azure yourself: the model, the index, the retrieval mode (M4 used `vectorSimpleHybrid`), `Strictness`, `Top N`, System message, answering only from your data.

**How M4 Task 5 did it:**
- Policy QA topic → generative answers node → Data sources → **Classic data → Azure OpenAI Services on your data**
- First create an **Azure OpenAI** connection in Power Apps (Foundry key + Search endpoint + Search key); it's not the same as the **Azure AI Search** connection auto-created for bullet 25, and they can't be shared.
- Field mapping: Content `chunk`, Vector `text_vector`, Embedding `text-embedding-3-small`, URL left empty.
- Foundry Monitor showed the requests coming from Copilot Studio, proving the model was called.

**When not to use it:**
- General Q&A → bullet 25's agent-level knowledge is enough and simpler.
- The feature is old: API versions are only `2023-06-01-preview` and `2024-02-15-preview`; being called "Classic" means it's not really updated anymore.
- When the index has no URL field, citations are **broken links** (in M4, clicking one went to `annual-leave-policy.docx/`, DNS error).
- **Can only be configured in a topic node**; the orchestrator won't use it automatically.
- Hard to troubleshoot: Activity only shows the topic; you can't tell which model wrote the final passage.

**In one sentence:** 25 = Search only finds, Copilot Studio writes; 35 = both finding and writing are handed to Foundry, Copilot Studio only passes it on.

**Correction on re-asked 35 (round C, 2026-11-10, not passed):** The scenario is a compliance requirement to use a model deployed on your own Azure, control the retrieval mode / `Strictness` / `Top N` yourself, answers may only come from `hr-policies`, and only the Policy QA topic needs it.
- **25 isn't Microsoft-hosted either**: both approaches use a Search index on your own Azure. What Microsoft hosts the index for is a Copilot connector (23); don't mix them up. The only difference is **who writes the answer**. The question's "must use your own deployed model" directly rules out 25; `Strictness`, `Top N` and retrieval mode also exist only in 35's configuration.
- **Where to configure it**: Policy QA → **Create generative answers node** → Data sources → Edit → **Classic data → Azure OpenAI Services on your data**; first create an **Azure OpenAI** connection in Power Apps (Foundry key + Search endpoint + Search key, not 25's Azure AI Search connection); in the field mapping select `hr-policies` and fill in Content / Vector / Embedding; the query type, `Strictness` and `Top N` are also here.
- **Drawbacks**: old feature (API versions only 2023, 2024 preview); citations are broken links without a URL field; can only be configured in a topic node, the orchestrator won't use it automatically; hard to troubleshoot (can't tell which model wrote it); charged on both sides.

### Custom prompt with a Foundry model (round C bullet 36, 2026-11-09)

**Correcting the premise: a custom prompt can already choose a model.** The dropdown has Managed models (GPT-4.1 mini default, GPT-4.1, GPT-5 chat, GPT-5 reasoning), Anthropic models (Claude, paid experimental), xAI (disabled by the admin), and **Azure AI Foundry Models** (ones you connect yourself, which is what bullet 36 is). The question isn't "can't choose", it's how to use **a model outside the managed list** → **BYOM**.

- **What it solves: control, not faster or better.** Models not in the managed list or fine-tuned models, pinned versions, data staying in a specified region (M4 Australia East), configuring your own content filtering. M4 tested hands-on with the same gpt-4.1-mini: same quality, BYOM slightly slower (about 3.8s vs 3.1s).
- **How to connect it (M4 Task 6):** model dropdown → the **+** next to Azure AI Foundry Models → deployment name, base model name, endpoint URL, API key. Gotcha: the URL must include `/chat/completions?api-version=…`, otherwise it reports "Failed to send request to PowerApps-RP service".
- **When not to use it:** managed models are good enough (BYOM charges on both sides: Copilot credits as usual + Azure per token); you don't want to manage keys and rotation yourself; you don't want to own responsible AI yourself; you need the latest models (at M4 time the GPT-5 series couldn't be connected).

**Difference between bullet 35 and 36: who brings the material.**

- **35 = the librarian**: you just ask a question, and they **go to the shelves themselves** (the Search index), find the relevant pages, read them and answer you.
- **36 = the text secretary**: you **hand them a document** and say "summarise this into 5 points"; they only process this one and don't look elsewhere; give them the wrong document and they'll summarise the wrong one.
- Both can use the same "brain" (Foundry's gpt-4.1-mini); they just work differently.

```
35: Employee asks "Can annual leave be carried over?"
    → the generative answers node hands the original words to Foundry
    → Foundry searches the hr-policies index itself, finds the carry-over passage → writes the answer
    → "You can carry over 5 days; use them by March 31."
    (the employee gave no material; Foundry found it itself)

36: the topic first gets the full annual leave policy text and stores it in the variable PolicyText
    → calls the prompt "Summarise Leave Policy", stuffing PolicyText in
    → the model looks only at this full text and outputs per the instructions
    → "1. 20 days per year  2. Accrues 1.67 days per month ... (at most 5 points, in Chinese)"
    (the model doesn't know where the document came from and won't search anything else; you handed over the material)
```

| | Bullet 35 | Bullet 36 |
|---|---|---|
| Where it's used | generative answers **node** (in a topic) | custom **prompt** (a kind of tool) |
| What the model does | Retrieval + writing the answer (RAG) | Fixed processing of the data passed in, **no retrieval** |
| Where the data comes from | Foundry searches the index itself | Passed in via an input variable (`PolicyText`) |
| How to connect | Azure OpenAI connection in Power Apps | prompt model dropdown → Foundry Models **+** |

**Telling them apart at a glance: ask "does the model have to go find the material itself?"** Yes → 35 (or 25; the only difference is who writes the answer); no, the material is already in hand and just needs processing (summarise, translate, classify, rewrite, extract fields) → 36.

Practice: an employee asks "Does sick leave need a doctor's certificate?" → 35; deciding whether a leave reason is sick leave, personal leave or annual leave → 36; compressing a long complaint email into three sentences for HR → 36.

**Addendum on re-asked 36 (round C, 2026-11-10, not passed):** The scenario is an employee pasting a leave reason, and the agent decides whether it's sick leave, personal leave, annual leave or other; compliance requires using the company's **fine-tuned classification model** on Azure, which isn't in the managed list.
1. Use a **custom prompt** (here it's **classification**, not summarising; it's good at fixed processing of material handed to it: summarise, classify, rewrite, extract). Model dropdown → the **+** next to **Azure AI Foundry Models** → deployment name, base model name, endpoint URL, API key (= BYOM). Gotcha: the URL must include `/chat/completions?api-version=…`, otherwise "Failed to send request to PowerApps-RP service"; the green tick under the URL box is only a format check.
2. Not 35: ask "does the model have to go find the material itself?" → no, the material is just the passage the employee pasted, it only needs processing → 36 (text secretary). 35 is the librarian who has to go search the index.
3. Costs: charged on both sides (Copilot credits 0.2 per call + Azure per token); you manage and rotate keys yourself; you own responsible AI yourself; the models you can connect are limited (at M4 time the GPT-5 series couldn't be connected); it isn't faster or better (M4 tested hands-on, BYOM slightly slower); you use it for **control**.

### Are BYOM and the prompt tool the same thing? (follow-up after round D, 2026-11-14)

**No. One is "what work to do", the other is "who does it".**

| | Prompt tool (custom prompt) | BYOM (Bring Your Own Model) |
|---|---|---|
| What it is | A written **work order**: requirements + blank inputs → get back a piece of text (take `.text`) | **Which model** this work order is handed to |
| Where | A standalone tool built in Copilot Studio, called by a topic or the orchestrator | The **model dropdown** in the prompt tool → Azure AI Foundry Models |
| Exam objective | bullet 17 | bullet 36 ("Configure custom prompts to use the Foundry model catalog") |
| This project | M4 `Summarise Leave Policy` | M4 used `gpt-4.1-mini` in Foundry |

- Analogy: the prompt tool is the **letter of instruction**, the model is the **secretary** who takes the job. A built-in model (e.g. Basic GPT-4.1 mini) = the company's in-house secretary, no extra charge; BYOM = a specialist secretary hired from outside (Azure): you pick the skills yourself, pay Azure separately, and have to set up the contact details (URL with `?api-version`, create a connection). The letter of instruction stays the same; changing the secretary is switching the model.
- A prompt tool is not instructions, and doesn't override instructions.
- **The M6 example:** deployment reported Missing dependencies `msdyn_aimodelcatalog`, because a BYOM model is external and doesn't travel with the solution; I switched to the built-in **Basic GPT-4.1 mini (default)** without changing a single word of the prompt. The names look alike: `gpt-4.1-mini` (all lowercase with hyphens, BYOM) vs `Basic GPT-4.1 mini` (built-in).
- Use BYOM when: the built-in model isn't good enough, a specific model is mandated, or data may only go into the company's own Azure. Don't use it when: the built-in model is good enough (BYOM charges on both sides, and moving requires reconnecting).
- In one sentence: **the prompt tool decides "what to have the AI do", BYOM decides "which AI does it"**; BYOM is just one way of choosing the model inside a prompt tool.

### Application Insights vs Copilot Studio Analytics (round C bullet 37 correction, 2026-11-10)

**Correction: I had high-level and low-level reversed.**
- **Copilot Studio Analytics** = a **high-level summary dashboard**, works out of the box, shows "how it's doing overall": session volume, resolution rate, escalation rate, satisfaction, which topics are used most.
- **Application Insights** = **low-level detailed logs**: every event is recorded, and you query and slice it yourself with **KQL**.
- Analogy: Analytics is the summary page of a health check report ("blood pressure on the high side"); App Insights is the raw record of each measurement ("10-18 14:03 measured 150/95, just after a run").

**What Analytics can't answer but App Insights can (M4 Task 7):**

| Question | How to query |
|---|---|
| The full trace of one session: original words → which topic → which nodes → what was replied | `customEvents` (Q6 single-session timeline) |
| Success/failure, status code and duration of each outbound call | `dependencies` (Q10) |
| Full error message when something fails | `OnErrorLog` |
| Custom metrics: duration per turn, "answered twice", separating tests from real users | Write KQL with `DesignMode`, `channelId` |
| Alerts, analysis together with other systems' logs | Azure Monitor |

**How to connect it:** Settings → Advanced → Application Insights → paste the connection string → turn on Enable logging, Log conversation details, Node execution events.

**When not to use it:**
- Only looking at overall trends → the built-in Analytics is enough.
- You don't know KQL, or have no Azure subscription (billed by data volume).
- **Privacy**: with **Log sensitive properties** off, the user's original words are still recorded (M4 tested hands-on); watch the retention period; admins can block it with a data policy.
- Blind spots: for MCP you can't see which tool was called; prompts and SharePoint / Dataverse knowledge retrieval don't show up in `dependencies`.

**Addendum on re-asked 37 (round C, 2026-11-10, not passed):** Scenario (a) an HR manager looks at two weeks of session volume, resolution rate, topic ranking → Analytics (answered correctly); (b) a developer checks which step a failed leave request submission got stuck at, and what status code Employee API returned → App Insights.
- **Where Analytics is: I never specifically looked at it in the project.** It used to be the **Analytics** tab at the top of the agent; now the top menu is Overview, Knowledge, Tools, Agents, Topics, Activity, Evaluation, **Monitor**, Channels; my guess is it was merged into Monitor (or Overview), not checked.
- **App Insights is not in Foundry**: it's a separate Azure resource (M4's `appi-hr-assistant`); open it in the Azure portal → write KQL in **Logs**: `customEvents` shows which topic / node it got stuck at, `dependencies` shows the status code. Foundry's Monitor shows **model** call volume and cost (M4 used it to prove bullet 35 called the model); don't mix them up.
- **Configuration**: first create the App Insights resource in Azure → agent **Settings → Advanced → Application Insights** → paste the connection string (doesn't go into the repo) → turn on Enable logging, Log conversation details, Node execution events.
- **Privacy**: with Log sensitive properties off, **the user's original words are still recorded** (the `text` field; even the display name went into the logs); test pane conversations are recorded too (distinguished with `DesignMode`); consider who can see it and how long it's kept; admins can block it with a data policy.

**KQL to exclude the test pane (Practice Assessment attempt 2, 2026-11-17, half right):** Scenario: employees are using the agent and the author is also testing in the test canvas; when querying agent events, **exclude those produced by the test pane**. I picked the right table `customEvents`; for the dimension I picked `'type'`, wrong; the correct one is **`'designMode'`**.

```kql
customEvents
| extend isDesignMode = customDimensions['designMode']
| where isDesignMode == "False"
```

**Line-by-line translation (KQL is a pipeline; `|` = "finish this step, hand the result to the next step"):**
- `customEvents`: open this table. Everything Copilot Studio sends (message received, message sent, topic start/end...) is one event per row, **including the test pane's**.
- `| extend isDesignMode = customDimensions['designMode']`: **add a column** `isDesignMode` to each row, with the value taken from `designMode` in `customDimensions`. `customDimensions` is each row's "grab bag", holding many key-value pairs (`DesignMode`, `channelId`, `TopicName`, `conversationId`...); `['designMode']` = take this item out of the bag.
- `| where isDesignMode == "False"`: **filter**, keeping only the False rows = not the test pane = real users. `"False"` is in quotes; it's a **string**, not a boolean (everything in customDimensions is text).
- In one sentence: **from all events, take out the "is test mode" flag and keep only the False ones, i.e. exclude the test pane and look only at real users.**

| KQL | Equivalent in Excel |
|---|---|
| `customEvents` | Open a worksheet |
| `extend newColumn = …` | Insert a column on the right and write a formula that takes a value from some cell |
| `where condition` | Turn on a filter, showing only rows that meet the condition |
| `\|` | After this step, do the next step on the result |

**Don't mix up the three dimensions:**

| Dimension | What it distinguishes |
|---|---|
| **designMode** | **Whether it came from the test pane** (True = test, False = real use). "Design" = design time: clicking test in the Copilot Studio design UI |
| channelId | **Which channel** it went through (Teams, web...) |
| type | **Activity type** (message, event...) |

- **Why I got it wrong: I wrote the same query in M4 and didn't remember it.** Q2 in `milestones/M4-azure/queries.kql` groups by `DesignMode` and `channelId`, with a comment saying "DesignMode = True is the test pane".
- **Question-reading tip:** in code fill-in questions, variable names often give the answer away: the left side is called `isDesignMode`, so the right side is `designMode`. Read the whole code block before choosing.
- Case: in M4, tested hands-on, the key is `DesignMode` (capitalised; keys are case-sensitive, see line 5 of `queries.kql`); in the exam just pick from the options, don't agonise over it.
- This snippet only filters, it doesn't aggregate; in practice it's often followed by `| summarize count() by name` (the way M4 Q1 and Q2 are written).

**Two telemetry scopes: environment-level vs agent-level (Practice Assessment attempt 2, question 51, answered wrong):** Scenario: a Managed Environment has both **standard harness** and **GitHub Copilot harness** agents; the operations team wants centralized telemetry for **all agents** (agent invocations, tool executions, dependencies); the developer of standard-harness agent `Agent1` wants messages, topic events and custom events for troubleshooting. I chose "agent-level for both needs", wrong. The correct answer is **environment-level for centralized monitoring, agent-level for troubleshooting Agent1**.

| | Environment-level telemetry | Agent-level telemetry |
|---|---|---|
| Where it's configured | On the Power Platform **environment**; configured once, covers all agents in the environment | Each **agent's** Settings → Advanced → Application Insights (**this is what M4 did**) |
| Which agents it supports | standard harness **and** GitHub Copilot harness | **Only standard harness** |
| What the data looks like | OpenTelemetry-style **spans**: agent invocations, tool executions, outputs, dependencies | **Events**: messages sent/received, topic start/end, custom events (BotMessageReceived, TopicStart... in M4's `customEvents`) |
| Who it's for | **Operations**: all agents together for the global view | **Developers**: digging deep into one agent |

- **Question-stem signals:** "centralized … across all agents" + GitHub Copilot harness agents in the environment → agent-level doesn't support GHCP, so only environment-level works; "standard-harness agent … message activity, topic events, custom events" → agent-level.
- **Building monitoring analogy:** environment-level = **the whole building's monitoring centre**, with every floor's water and power, lifts and access control summarised on one big screen; agent-level = **a smart meter one unit installed itself**, showing when each appliance switches on and off. Building management watches the big screen to run the whole building; a resident checks the meter for their own unit's problems. Newer apartments (GHCP agents) can't take the old-style meter and can only hook into the building's system.
- The specific entry point for environment-level configuration isn't verified (M4 only configured agent-level); what the GitHub Copilot harness is, I'll fill in from the docs in Task 6.

### Test sets (round D bullet 38, 2026-11-11)

**What it solves:** not just "test once", but **repeatable**: after changing the agent, rerun the whole set and compare question by question. In M6, after changing the Leave Balance Message I reran 30 questions; E004 went from Fail to Pass, yet the overall Answer quality score dropped from 77% to 73%; only by looking question by question did I see the drop was AI grading fluctuation, not something I broke.

**Three ways to build one:**

| Method | When it fits |
|---|---|
| Auto-generate | Early baseline, no expected answers yet |
| Import CSV | Many questions, needs version control, needs script validation (M6's 30 questions; a test script checks the balance numbers) |
| Write by hand | Add a few questions, or build a small test set to retest separately (in M6 I reran only the 2 summariser questions) |

**Correction: "open-ended questions can't go into a test set" is wrong.** For questions without an expected answer, use **General quality** (no expected answer; it only judges relevance, completeness and groundedness). The problem with open-ended questions is **picking the wrong method**, not that they can't be tested.

**What really can't be tested:**
- **Multi-turn conversations**: each question is a new conversation and only the first reply is checked. Submit Leave Request only got as far as "What is your employee ID?".
- **Foundry agent**: both summariser questions were Error, while Test chat worked fine (cause not confirmed).

**Follow-up: can a connected agent be tested? Partly.** M6's Onboarding Agent (a Copilot Studio agent in the same environment):

| What's tested | Possible? | What happened in M6 |
|---|---|---|
| Answer content (Meaning, Text, Keyword) | ✅ Yes | All 3 onboarding questions passed |
| Groundedness (General quality) | ⚠️ Unreliable | Grading only looks at **the main agent's knowledge sources**; correct answers from the sub-agent's knowledge get judged "Not based on sources"; the same question passed the first time and failed the second |
| Whether it took the right path (Tool use) | ❌ No | Expected capabilities only include Topics and Tools, no Agents; you can't select a sub-agent |

So: a Copilot Studio connected agent can run evaluations and compare content; a Foundry agent can't even return an answer (Error). Sub-agent routing has to be checked in Test chat and Activity.

**Correction on re-asked 38 (round D, 2026-11-14, not passed):** Scenario: (a) "I want to take leave", expecting the submission-success confirmation; (b) "Summarise the sick leave policy", actually handed to the Foundry summariser; (c) "Is next Wednesday a company holiday?"
- (a) Can't be tested (answered correctly): one question one new conversation, only the first line is checked, and it's always "What is your employee ID?".
- (b) **Can't be tested either (I missed this)**: evaluations of Foundry agent questions are all Error; it can only be checked manually in Test chat and Activity.
- (c) **Can be tested**: an ordinary knowledge question, use Compare meaning; provided the knowledge source really contains the holiday table.
- Import (answered correctly), but the reason has to be precise: **Copilot Studio doesn't version test sets**; version control comes from keeping the CSV in git, with a script validating against the file (M6's `test-sets.test.mjs` checks balances against `employees.csv`). Re-importing just puts the latest version from git in.

**Refinement: there are actually five ways to build one (Practice Assessment attempt 2, 2026-11-17).** The "three ways" above are too coarse: "auto-generate" splits into Quick and Full, and "use the test chat conversation" was missing. For "reuse the questions from the most recent test chat without manual re-entry" I chose import file, wrong: importing requires first organising the questions into a CSV, which is itself manual entry.

| Method | Where the questions come from | When to pick it |
|---|---|---|
| **Quick question set** | AI generates them from the agent's description, instructions and capabilities, **fixed at 10 questions** | Quick baseline, smoke test |
| **Full question set** | AI generates them from **selected knowledge sources** (you can select just one file), **you set the number** | "N questions, based only on a certain file" |
| **Use your test chat conversation** | Brings in the questions asked in **the most recent test chat** directly | "Reuse the questions just asked while testing" |
| **Import test cases from a file** | An uploaded CSV | You already have a question bank file and want it in git (M6's 30 questions) |
| **Write questions yourself** | Typed in one by one | A small number of hand-picked cases |

**Memory hook: first ask "where do the questions come from".**
- AI writes the questions: a number given or a specific knowledge source → Full; just want it fast → Quick.
- They already exist: in the chat window → test chat; in a file → Import.
- Neither → Write yourself.

**Reading signals:** "without manual reentry", "reuse", "most recent interactive test session" mean the data is already in the system; just take it over and use it.

**Correction: multi-turn conversations can be tested, with a conversational test set (Practice Assessment attempt 2, 2026-11-17).** The statement above that "multi-turn conversations can't be tested" only holds for a **single response test set**; M6 only used that kind. We never did this hands-on; the following is based on the official docs ("Create a conversational test set", page date 2026-10-05).

**Difference between the two kinds of test set (analogy: single-question written test vs situational interview):**

| | Single response | Conversation |
|---|---|---|
| What one test case is | One question one answer, each question a new conversation | A whole multi-turn conversation, up to 12 messages (6 questions, 6 answers) |
| Cases per test set | Many (M6 used 30 questions) | Up to 20 |
| What it tests | Whether an answer is right, wording, whether the right capability was called | Whether it remembers context, whether it asks clarifying follow-ups, whether multi-step tasks get completed |

**How to build one (UI steps, original names from the docs):**
1. The agent's **Evaluation** page → **New evaluation** → choose **Conversation**.
2. Choose a build method (only three; no import file and no writing by hand):
   - **Quick conversation set**: auto-generates 10 short conversations from the description, instructions and capabilities;
   - **Full conversation set**: generates from knowledge sources or defined topics; you can choose short or long conversations;
   - **Use your test chat**: turns the most recent test chat into one test case.
3. Fill in a name in **Name**.
4. **Add test method** to choose the grader (some methods need a passing score).
5. Edit the test cases: apart from General quality, every method needs an expected response or keywords.
6. **User profile**: choose which identity's connections to run with, or no authentication.
7. **Save** (save only) or **Evaluate** (run right away).

**Which graders can be used on conversations:**
- ✅ **General quality** (scored, no expected answer), **Content safety**, **Keyword match**, **Custom** (write your own judging rules and labels).
- ❌ **Compare meaning**, **Text similarity**, **Exact match** only work with single response: a conversation doesn't have one "expected answer" to compare word for word.
- **Tool use**: the docs are inconsistent (the table says single response only, while the steps list it); not verified.

**Relation to bullet 38 question 33:** to reproduce "after an unrelated question is slipped in it forgets the site, and after the date is changed it still uses the old date", use a conversation test set, **put the whole conversation in one case** (splitting it breaks the context), and **later messages must not repeat information given earlier** (if repeated, the agent can answer correctly even if it forgot, masking the failure).

**General limits (apply to both single response and conversation):** results are kept for 89 days and can be exported as CSV; it runs with the identity of the person currently signed in, so that person needs permission on the knowledge sources and connections; only agents with **No authentication** or **Authenticate with Microsoft** are supported, not **Authenticate manually**; Fabric data agents aren't supported.

### Choosing a grader (round D bullet 39, 2026-11-11)

**The exam uses the docs names, not the UI names** (the options will be listed; I need to match scenario to name, not recite them):

| Docs name (used in exam) | Called in the UI |
|---|---|
| General quality | Answer quality |
| Compare meaning | Meaning match |
| Text similarity | Text match |
| Exact match | Exact match |
| Keyword match | Keyword match |
| Tool use | Tool use |
| Custom | Custom |

**Four cases (answered correctly):** generative answer → Compare meaning; fixed answer hard-coded in a topic → Exact match; numbers or email addresses that must appear → Keyword match; whether it took the right topic / tool → Tool use.

**Correction: the grader that misjudges refusal questions is General quality, not Keyword match.**
- General quality doesn't look at the expected answer; it only asks "is the answer relevant and complete". Refusing = not answering → 4 of M6's 5 refusal questions were judged **"Not answered"**. That's why it (77%) actually scored lower than Compare meaning (80%).
- The Keyword match misjudgement I described was really **a badly written question**: the expected answer for a refusal question should say "refuse", with the keyword set to `HR` or `hr@contoso.com`; then Keyword match tests it correctly.
- Refusal questions should use **Compare meaning**, with the expected answer "refuse and suggest contacting HR" (M6 refusal questions passed 4/5).

**Commonly tested "when not to use":**

| Method | Don't use for | M6 example |
|---|---|---|
| General quality | Refusal questions | A correct refusal judged "Not answered" |
| Compare meaning | Reply language differs from the expected answer | Submit Leave replied in Chinese "What is your employee ID?", expected answer written in English → 0 points |
| Keyword match | The same meaning can be phrased several ways | The carry-over question expected "March 31", keyword didn't match, 0 points; Meaning 100 points |
| Exact match | Any generative answer | Only 2 of 30 questions passed (both Password Reset's fixed prompts) |

**Correction on re-asked 39 (round D, 2026-11-14, not passed):**
- A refusal question must show `hr@contoso.com` → Keyword match (answered correctly; writing the expected answer as "refuse" also works with Compare meaning); the balance must show 14 → Keyword match (answered correctly).
- **No expected answers written yet, want a baseline first → General quality**, not Compare meaning. The names look alike:
  - **General** quality: **no expected answer needed**; only judges relevance, completeness, groundedness.
  - **Compare** meaning: compares meaning against the expected answer; **an expected answer must exist first**.
- **Expected in English, reply in Chinese, meaning fully correct → Compare meaning gives 0 points** (the M6 Submit Leave question; the grading explanation said "different language"). It compares "meaning" but **not across languages**. Exact would also fail, but it shouldn't be used on generative answers in the first place; Keyword, if it's a number (`14`), still appears in a Chinese reply, so it doesn't necessarily fail.
- Memory hook: **General = doesn't look at the answer sheet, only whether the answer looks decent; Compare = checks meaning against the answer sheet, but only recognises one language.**

**Custom (Practice Assessment attempt 2, 2026-11-17, answered wrong):** Scenario: an expense policy agent; responses must be judged against **the company's own expense rules**, with each response **classified** as `Compliant` or `Noncompliant`, and Compliant counts as Pass. I chose Keyword match, wrong. The correct one is **Custom**.
- **How Custom is configured:** write **judging instructions** (e.g. "Judge whether the response is compliant according to the following expense policy: ...") + define **labels** (Compliant / Noncompliant), each label mapped to Pass or Fail. During grading the AI reads each response per the instructions and attaches a label.
- **Why I got it wrong: the label is the grader's verdict, not a word in the response.** The agent replies "In-city taxi one-way cap is 200 yuan, receipt required"; it won't say "Compliant". Keyword match checks whether a word appears **in the response**; it can't tell compliance; a response can contain every keyword and still give non-compliant advice.
- **Follow-up: why not make the expense policy a knowledge source, write an expected answer for each question and use Compare meaning?** It can be tested that way, but it doesn't satisfy this question:

| | Expected answer per question + Compare meaning | Custom |
|---|---|---|
| What it judges | Whether the meaning resembles this question's expected answer | Whether it complies with **a set of rules** |
| Workload | Write an expected answer for each question | Write the rules **once**, shared by all questions |
| Result | A score or Pass/Fail | **Custom labels**, then mapped to Pass/Fail |
| Risk | A response phrased differently but also compliant may be misjudged | Counts as compliant as long as it doesn't break the rules |

- **Drawing review analogy:** Keyword match = only checking whether the words "fire door" are written on the drawing; if written it passes, even if it's drawn in the wrong place; Exact match = must match the reference drawing stroke for stroke; **Custom = the plan checker goes through each sheet holding the code clauses (judging instructions), and the verdict is only "complies with code / doesn't comply" (the label); compliant ones pass.** "Compliant" is the checker's stamp, not words written on the drawing.
- **Reading signals:** classify / label / custom category names + organization-specific criteria / rules → Custom.
- Complete selection list: expected answer, compare meaning → Compare meaning; fixed answer → Exact match; numbers or email addresses that must appear → Keyword match; took the right topic / tool → Tool use; no expected answer, baseline first → General quality; **judge by organizational rules, need custom labels → Custom**.

### Reading evaluation results (round D bullet 40, 2026-11-11)

**What to look at:** each question's Pass / Fail / Error / Invalid; the score and the AI's explanation (Meaning will say "different language" outright); the agent's actual reply; which topics, tools and knowledge were used. In the overall score, **Error counts in the denominator, Invalid doesn't**.

**Failed questions fall into four categories; rule them out in order (platform first → method → question → only then the agent):**

| Category | Meaning | M6 example | What to do |
|---|---|---|---|
| ① Environment / platform | The evaluation itself errored; no reply was obtained | Both Foundry summariser questions Error, fine in Test chat | Verify another way (Test chat, Activity) |
| ② Method not suitable | The reply is right; this method can't measure it | Refusal question judged "Not answered" by General quality; "March 31" didn't match Keyword | Change the grader |
| ③ Question written wrong | The expected answer itself is wrong | Submit Leave expected answer in English, actual reply in Chinese "What is your employee ID?" | Fix the test set |
| ④ The agent is really wrong | The reply genuinely isn't good | E004 only replied `AL: 17; SL:6` | Fix the agent, rerun |

Special case: the anti-injection question was Error, with details `ContentFiltered`: content filtering blocked the attack (a good thing), but the evaluation counted it as Error.

**When the overall score drops after one change, you can't directly say the change broke it:**
- AI grading fluctuates by itself: the onboarding training question passed the first time and failed the second, with the agent unchanged.
- Compare question by question: in M6 I only changed the Leave Balance Message; E004 Fail → Pass came from the change; Answer quality 77% → 73% was the onboarding question being regraded, unrelated to the change.
- So: **change one thing at a time, rerun the whole set, compare question by question**; only then can you separate the change from the noise.

### Component collection: environment-level vs primary agent (Practice Assessment follow-up, 2026-11-16, bullet 6)

In Practice Assessment attempt 2 I got a bullet 6 question wrong: three agents share the same set of topics, knowledge, connectors and flows; the lead maker builds it, and other authors (without System Customizer / System Administrator) can only use it, not change it. I chose "create the collection for Agent1, set Agent1 as the primary agent, then share it with the other authors"; the correct answer is **an environment-level component collection, connected to all three agents**.

| Option | What the official explanation says |
|---|---|
| **Environment-level collection, connected to all agents** | One set of components, shared equally by all connected agents; authors lack the Customizer / Admin role, so they can only use it, not change it |
| Create it for Agent1, set Agent1 as **primary agent**, then share | A primary agent **restricts the collection to that agent**; it isn't equal sharing |
| A separate collection for each agent | Becomes three sets, violating "one set" |
| Put the three agents in one custom solution | A solution is ALM packaging (a packing list); it doesn't provide shared components |

- Memory hook: **several agents sharing one set equally** → environment-level; seeing "set Agent1 as the primary agent" → rule it out. "Use but not change" comes from the **role** (no System Customizer / System Administrator), not from a setting on the collection itself.
- **Conflicts with what M6 tested hands-on, to verify:** M6's `HR Shared` was created inside `HR Assistant Classic` via Settings → Component collections → New, and was still installed into Onboarding Agent and passed testing (see M6 notes). So "created from within an agent = only usable by it" doesn't hold. Maybe primary agent is a different setting that restricts who can edit it or whose name it sits under; or maybe what M6 created was an environment-level collection all along. **In the exam, answer per the official explanation**; in Task 6, verify in the UI by looking only, without saving.
- Review: a component collection is shared only **within the same environment**; across environments use a solution (`planning/06-reusable-components.md`); change a shared topic in one place and every agent that installed it changes.

### Identity for external customers: Entra External ID vs B2B collaboration (Practice Assessment follow-up, 2026-11-16, bullet 7)

In Practice Assessment attempt 2 I got a bullet 7 question right: external customers keep using an existing portal, must be able to sign up themselves (social or work accounts), and customer identities are kept separate from the employee directory.

| Option | Where the users live | Who it fits |
|---|---|---|
| **Entra External ID external tenant** | A **separate** customer directory (external tenant) | External **customers**: self-service sign-up, sign-in with social accounts (Google, Facebook, etc.) or work accounts, completely separate from the employee directory |
| **B2B collaboration** | As a **guest** in the **employee directory** (workforce tenant) | A small number of external collaborators like partners and suppliers who need to access internal company resources |
| Workforce account | Employee directory | Your own employees |

- Deciding: the question says "keep separate from the directory used for employees", which rules out B2B (guests are also in the employee directory); it says "customers create and manage their own accounts", so choose External ID.
- Whether there's an "account" requirement decides the option: no sign-in needed → No authentication (scenario question 5, M7 `HR Careers FAQ`); customers create their own accounts → External ID external tenant.
- The channel in the same question: keep using the **existing** portal → **Custom Website**; only choose Power Pages if the portal itself is built with Power Pages; Facebook is for use in Messenger.

### Three kinds of "isolation": environment, business unit, solution (Practice Assessment follow-up, 2026-11-16, bullet 5)

In Practice Assessment attempt 2 I got a bullet 5 question wrong: a department's agent must have its **data and lifecycle** isolated from other departments in the default environment; I chose business unit; the correct answer is **a dedicated environment**.

| Option | Analogy | What it isolates | What it doesn't isolate |
|---|---|---|---|
| **Dedicated environment** | Building a separate building | Data, lifecycle (its own dev/test/prod), DLP policies, admins, backups | — |
| **Dataverse business unit** | A few locked floors in the same building | **Security partitioning** within the environment: who can see which rows | Same environment: same DLP, same environment admins, same lifecycle |
| **Separate solution** | A packing list | Packaging components, making moves and versioning easy (bullet 41) | **No data boundary** |

- Signal words: **lifecycle** + data → only environment satisfies it; if it only says "certain users can only see certain records" → business unit / security role is enough.
- The question opening with "everyone builds in the **default environment**" = a negative signal. Microsoft's zoned governance recommends moving important, sensitive agents out of the default environment.
- The other blank in the same question (answered correctly): give permissions to a **Dataverse group team** (bound to an Entra group), assign the security role to the team, and permissions follow automatically as group membership changes (minimize role administration). For the role choose **Environment Maker** (enough for development); System Customizer gives too much (least privilege).

### Solution and publisher (round D bullet 41, 2026-11-11)

**What it solves (answered correctly):** configure and test in Dev, package it and move it to Test / production; the target environment is managed and can't be changed directly; to change something, go back to Dev, change it and redeploy.

**Why create your own publisher (done in M6 Task 4: `Contoso HR`, prefix `chr`):**
- The prefix is stamped on every component's internal name: `chr_EmployeeAPIBaseURL`, `chr_sharedcomm...`; at a glance you know it belongs to this project.
- Using the default gets mixed up: `Employee API` is `crc6c_` (CDS Default Publisher), `EmployeeApiConnector` and `HR MCP Server` are `new_` (system default).
- The publisher decides who owns a component; when other solutions are installed into the same environment there are no name clashes or mutual overwrites.

**Correction: environment variable definitions do go into the solution**; what's per-environment is the **value** (filled in the deployment wizard, changed afterwards in Default Solution). A variable is a form; the form travels with the package and each environment fills in its own value.

**What can't go into a solution:** connections (the keys), Azure resources (Foundry project and agent, Search index, model deployments, Fabric capacity), local services and the tunnel, data in tables (tables only bring structure).

**Follow-up: is a solution like a container? Partly; it's more like a phone app install package:**

| | Docker container image | Power Platform solution |
|---|---|---|
| Built in one place, moved elsewhere | ✅ | ✅ |
| Versioned, can't be changed after deployment, repackage to change | ✅ image is immutable | ✅ managed is read-only |
| **Does it bring the runtime** | ✅ brings the OS and runtime libraries | ❌ **doesn't**; the target environment must already have Dataverse and Copilot Studio (HR-Test had no Dataverse at first and couldn't create agents) |
| After installation | Each runs independently | Installed into a **shared environment**, stacked with other solutions (solution layers) |
| Secrets and configuration | Injected from outside at runtime | Same: connections and environment variable values are provided by the target environment |

**Addendum on re-asked 41 (round D, 2026-11-14, passed):** Scenario: prefixes mixed between `crc6c_` and `new_`; an API key put in a Text environment variable must be exported; the production environment has no Search index or Foundry agent.
- Messy prefixes = the default publisher was used. Avoiding it takes **two steps**: create your own publisher (`Contoso HR` / `chr`) **plus** set the **preferred solution**; if you only create the publisher without setting preferred, new components still land in the default solution.
- The type I couldn't remember is called **Secret**: the value is in Azure Key Vault, the variable only stores a reference, and it doesn't go into the export package. The more common practice is to put it in a **connection** (the solution only brings the connection reference). Rule: **a key a connector needs → connection; a secret value that a flow etc. reads directly → Secret environment variable.**
- Search and Foundry won't appear automatically. Strictly, they're **Azure resources**, deployed in Azure (ideally with scripts or templates), not built in the Power Platform production environment. Order: create resources in Azure → create connections in the production environment → the deployment wizard hooks up the connection references.

**Publisher and prefix are not the same thing (Practice Assessment attempt 2, 2026-11-17, answered correctly):** Scenario: Solution1 uses Publisher1 (prefix `agt`); a new Solution2 is created, and components must later be movable between the two solutions and keep using `agt`. Answer: **Solution2 also selects Publisher1**.

| | Publisher | Prefix |
|---|---|---|
| What it is | The component's **owner** (a record with its own identity) | An **attribute** of the publisher, a tag added before a component's internal name |
| What it decides | Who owns the component; **components can only move between solutions with the same publisher** | Just naming, easy to recognise, avoids name clashes |
| Can it be "copied" | No: a new one is a different owner | Yes: two publishers can have the same prefix |

- **Trap**: create a new publisher and also set its prefix to `agt`. The name looks the same but the owner is different, so components still can't move over. The default publisher, or a new publisher with a different prefix, doesn't work either.
- **Rule**: a component belongs to **the publisher of the solution that created it**. To reorganise components across several solutions, those solutions **share one publisher**.
- **Analogy**: the publisher is the design institute, the prefix is the institute's abbreviation in the title block. Another company opened with the same abbreviation still isn't the original design institute; the drawing copyright doesn't transfer automatically.
- M6 comparison: `Contoso HR` is the publisher, `chr` is its prefix. When creating new solutions for other HR agents later, still choose `Contoso HR`.

Install package analogy: phone OS = Dataverse + Copilot Studio; signing in after installation = connection; settings you fill in yourself = environment variable values; deleting the app deletes its data too = uninstalling a managed solution; source code = unmanaged, the copy on the user's phone = managed. If you know Kubernetes, a **Helm chart** fits better: chart = solution, values file = environment variables, secret = connection.

### Adding an existing agent to a solution (round D bullet 42, 2026-11-11)

**Keep the three layers apart** ("can go in but isn't brought automatically" and "can't go in" are two different things):

| | Examples (M6) | What to do |
|---|---|---|
| **Brought in automatically** | topics, knowledge sources, tools, instructions (93 agent components); connected agent `Onboarding Agent`; prompt; the flow `SubmitLeaveRequest` **that a topic calls**; 4 custom connectors; 8 connection references | Nothing to do; 111 in total |
| **Can go in, but isn't brought automatically** | flow `CancelApprovedLeave` (not called by a topic or tool, so not a dependency); tables `Employee`, `LeaveRequest`; the Approvals connection reference | Add manually with **Add existing** |
| **Can't go in** | connections (the keys), Azure resources, local services and the tunnel, data in tables | Rebuild in the target environment, or deploy separately |

- Why it was missed: the system only follows the "who calls whom" chain to find dependencies; `CancelApprovedLeave` was deliberately not attached to a topic (human-in-the-loop would wait a long time), so it isn't found on the chain.
- Gotcha: adding a table with only "Include table metadata" ticked gives an empty shell, and deployment reports Missing dependencies; first Remove it, then re-add with **Include all objects**.

**Correction on re-asked 42 (round D, 2026-11-14, didn't know):** The decision comes down to one question: **following "who calls whom" downward, can the system find it?**

| Problem after deployment | Which layer | Cause | Fix |
|---|---|---|---|
| `CancelApprovedLeave` missing in HR-Test | Can go in, not brought automatically | Not on the call chain (not attached to a topic, not a tool) | Dev solution → Add existing → Cloud flow, redeploy |
| The `LeaveRequest` table has only a name, no columns | Can go in, not brought automatically, **and the wrong option was chosen** | Only Include table metadata was ticked; it's an empty shell | First **Remove from this solution** (don't choose Delete from this environment), then Add existing → Table → **Include all objects** |
| Employee API key is empty | Can't go in | The key is in the connection; a connection belongs to the environment and can't be exported; the solution only brings an empty slot | Create a new connection in HR-Test with the key, and hook it up in the deployment wizard's Connections step or Default Solution → Connection references (fixed in M6 Task 7 by filling in `dev-local-key`) |

- Easiest to confuse: **the connection reference is brought automatically, the connection isn't**. The former is the slot, the latter is the key; the keys always stay in their own environments.
- **Follow-up: isn't `CancelApprovedLeave` attached to a topic?** No, the one attached to a topic is a different flow:

| | `SubmitLeaveRequest` | `CancelApprovedLeave` |
|---|---|---|
| Built in | M2 Task 3 | M2 Task 5 |
| What it does | Writes one leave record and returns immediately | Sends an approval, stops at `Waiting` until someone clicks, then changes the status |
| Attached to a topic | ✅ `Submit Leave Request` | ❌ Deliberately not attached (the approval may wait hours, and the conversation would hang) |
| How it's triggered | The employee says "I want to take leave" in the conversation | Triggered separately in the test pane in M2 |
| Adding the agent to a solution | Brought automatically | Not brought; must be added manually |

**Correction on scenario question 19 (Task 5, 2026-11-14, answered wrong):** The scenario: an agent has 8 topics, a topic calls `CreateTicket`, `EscalateToManager` isn't in any topic, `CreateTicket` writes to the custom table `IT Ticket`; Add existing → Agent has been done; which two items still need adding manually? I chose "table + connection", wrong. The correct answer is **table + `EscalateToManager`**.
- The table (B) was right; I missed `EscalateToManager` (D): not on the call chain = same as `CancelApprovedLeave`.
- The connection (C) is in the "can't go in" layer, not the "add manually" layer. **It can't be added at all**; there's no connection in the Add existing menu either. What comes in automatically is the connection reference (the socket); the connection (the key, with credentials) stays in its own environment; after import, create a new one in the target environment and plug it in.
- A question asking "what must be added manually" is asking about **the middle layer** of the three-layer table; anything with credentials is in the bottom layer.

**Add required objects and Add existing (Practice Assessment attempt 2, 2026-11-17, answered wrong):** Scenario: Agent1 is already in Solution1, and cloud flow `Flow1` was added to it **afterwards**; before deployment the dependencies must be completed with **as little manual selection as possible**. I chose "add Agent1 again", wrong. The correct answer is **Add required objects**.
- **Dependencies are computed only once, when the component is first added**, like taking a snapshot. Things newly attached to the agent later don't follow automatically; the agent is already in there, so adding it again does nothing and doesn't recompute.
- **Add required objects**: in the solution select Agent1 → **Advanced** → **Add required objects**; it walks the call chain again based on the **current state** and adds everything missing (Flow1, along with the other dependencies it brings).
- Add existing → Flow1 on its own, or adding every component by hand one by one: requires manual selection, and may also miss Flow1's own dependencies.

| | Add required objects | Add existing |
|---|---|---|
| Target | Components already in the solution (e.g. an agent) | Components not yet in the solution |
| What it does | **Recomputes dependencies** from the current state and fills in automatically | **Hand-pick** one component to add |
| What it can find | Only things **on the call chain** | Can add anything (as long as it can go into a solution) |
| Used for | Dependencies that are on the chain but were **added later** (Flow1 in this question) | Things **not on the chain** (`CancelApprovedLeave`, `EscalateToManager`, custom tables) |

- **Decide with two sentences:** the system **can find it** along the call chain, it was just added late → Add required objects; it **can't be found** along the call chain → Add existing. Connections can't be added by either (bottom layer).
- **Analogy:** the bill of materials (BOM) is counted from the drawings at the moment they're issued. If a door is added to the drawing later, the list doesn't change by itself; submitting the same drawing again doesn't help; you have to **recount from the current drawings** (Add required objects). If a sample isn't drawn on the drawings at all, you can only **list it separately** (Add existing).

**What kind of flow `CancelApprovedLeave` is:** an **agent flow** built in Copilot Studio in M2 (trigger `When an agent calls the flow`, with an approval). In storage it's the same thing as a Power Automate cloud flow (Dataverse's `workflow` table), so: it also shows in Power Automate's My flows and can be edited in the designer (that's where M6 changed the connection reference); in a solution it falls under the **Cloud flows** category. The difference is in purpose and billing: an agent flow uses Copilot Studio capacity and doesn't need a separate Power Automate licence.

**Preferred solution:** decides which solution new components created in Copilot Studio go into by default. If not set, they land in the Common Data Services Default Solution with the default publisher, prefixes get messy, and when moving you have to find them one by one. M6: Solutions → Set preferred solution → `HRAssistant`; after that new components go into it automatically, with prefix `chr_`. Analogy: a computer's "default downloads folder".

### Environment variables (round D bullet 43, 2026-11-11)

**What I got right:** the same package takes different values in different environments; a connection reference is only a reference; changing a value doesn't require re-saving the connector or publishing; a value that's the same in every environment doesn't need to be a variable.

**Division of labour in one sentence:** connection references handle **credentials** (whose identity, which key); environment variables handle **ordinary values** (API address, site URL).

**The most commonly tested "don't": don't put credentials in a plain text variable.**
- The value travels with the export package: in M6 one variable had Export value set to No, and the value still went into `environmentvariablevalues.json`; anyone who can see the solution can see it.
- The right way: put it in a **connection** (stays in the environment, doesn't go into the package); or use a **Secret type** variable (the value is in Azure Key Vault, the variable only holds a pointer; to change the key you change it only in Key Vault, no redeployment). I never built a Secret type; I only read the docs.

**The format must match where it's used; the wizard doesn't check:** in M6 Task 7 I filled in the value with an extra `https://`, and the topic concatenated `"https://" & Env...` again → `InvalidUriContent` at runtime. In a managed environment the definition is locked; change the value in Default Solution.

### Pipelines (round D bullet 44, 2026-11-11, didn't know)

**Where I did it:** M6 Task 6 (2026-11-01 ~ 11-02), deploying `HRAssistant` from HR-Dev to HR-Test, "route A", about 1 hour 15 minutes.
- make.powerapps.com → `HRAssistant` → **Pipelines** tab → new pipeline, target HR-Test.
- **Deploy here** prompted that the target must be a **Managed Environment**; one click converted it.
- Wizard: Destination → Connections → Environment variables → Summary (auto version bump, AI-generated deployment notes).
- 1.0.0.1 failed (`CancelApprovedLeave` couldn't find its connection reference), 1.0.0.2 succeeded; **a version number that failed can't be reused**.
- The 5 blockers (empty-shell table, `msdyn_aimodelcatalog`, adding connections on the Connections page, etc.) were all at this step.

**Compared with manual export and import:**

| | Manual export, import | Pipelines |
|---|---|---|
| How it moves | Export zip, download, upload to the target environment | One click in the solution |
| Connections and environment variables | Also asked during import | The wizard asks one by one |
| Version number | Managed yourself | Bumped automatically |
| Deployment record | None | History, plus AI-generated notes |
| Approval | None | Can be added (extend) |
| Prerequisite | None | **Target must be a Managed Environment** |

Pipeline configuration is stored in a Microsoft-hosted, invisible **platform host**.

**When not to use it:** there's only one environment; a one-off handover to someone else's tenant (pipelines only work within the same tenant; give them a zip); the target can't be converted to a Managed Environment (production environments generally need a premium licence; Developer environments don't).

**What "Extend" means (not done, only read the docs):**
- **Gated extensions**: turn on "requires a step before deployment" on a stage; deployment pauses and triggers a Power Automate cloud flow, e.g. sending Approvals to a manager; after approval the flow tells the pipeline to continue, on rejection it's cancelled. Same idea as the M2 approval.
- **Delegated deployment**: a service principal or a designated person does the deployment; developers don't need permissions on production.
- **Custom host**: instead of the Microsoft-hosted platform host, create your own environment to store pipeline configuration, for central management and to add extensions.

Analogy: Pipelines is the logistics; extend is adding security checkpoints along the route (approval) and switching to a licensed driver (delegated deployment).

**Correction on re-asked 44 (round D, 2026-11-14, not passed):** Scenario: Dev → Test → Prod in the same tenant; the Prod manager must approve first; developers shouldn't have Prod permissions; also it has to be handed over to another company.
- Dev → Test → Prod, needing records and automatic versioning → Pipelines (answered correctly).
- Handing over to another company → can't use Pipelines (same tenant only); export a solution zip for them to import; choose **managed** so they can't change it (answered correctly).
- **Manager approval → Gated extension**: turn on "requires a step before deployment" on the Prod stage; deployment pauses and triggers a Power Automate cloud flow that sends Approvals; approve → the flow tells the pipeline to continue, reject → cancel. The manager **only approves or rejects**; he doesn't do the deployment.
- **Developers without Prod permissions → Delegated deployment**: a **service principal** (service account) or a designated person (stage owner) deploys, not the submitter's account.
- **Prod prerequisite → must be a Managed Environment** (prompted when I clicked Deploy here in M6; production environments generally need a premium licence).
- Remember the three names together: **Managed Environment = the entry ticket; Gated extension = the security checkpoint at the gate, only let through once someone approves; Delegated deployment = send a driver with a pass, the developer doesn't enter Prod themselves.**

**Choosing one of three deployment identities (Practice Assessment attempt 2, 2026-11-17, answered wrong):** Scenario: a custom-host pipeline deploys to production; makers **without production permissions** must still be able to request deployment; production deployment must use **an application identity, not a user account**. I chose "Standard deployment using the requesting maker", wrong. The correct answer is **Delegated deployment using a service principal**.

| Option | Who deploys | Identity type | This question |
|---|---|---|---|
| Standard deployment using the requesting maker | **The maker who clicked "deploy" themselves** | User | ❌ the maker has no production permissions; deployment would fail |
| Delegated deployment using the pipeline stage owner | The owner designated for this stage | **User** (a real person) | ❌ violates "not a user account" |
| **Delegated deployment using a service principal** | An application registered in Entra | **Application** | ✅ |
| Pre-export step required | (doesn't change identity) | — | ❌ just adds a check before export |

- **Who the "requesting maker" is:** the developer who clicks **Deploy** in the pipeline to submit the deployment request. Standard = "whoever requests it deploys it", writing into the target environment with their own permissions, so they must have permissions in the target environment (that's how M6 worked: I clicked deploy myself and I'm the HR-Test admin).
- **Two kinds of driver:** delegated = the developer doesn't drive into Prod themselves but sends a driver. The driver can be **the company fleet** (service principal, application identity) or **a particular colleague** (stage owner, personal account). The question says application identity, so it can only be the fleet.
- **Building facilities department analogy:** the contractor (maker) can't enter the owner's plant room (production environment), so hands the equipment to the **facilities engineering department** (service principal) to install. The department is an institution, not one employee; when an employee leaves, plant room access still works. That's why an application identity is wanted: it's not tied to one person's account, their leaving, password expiry or MFA.
- **Reading signals:** "without access to production" → delegated; "application identity / not a user account" → service principal; "a specific person / owner" → stage owner.

### Readiness question 1: choosing between knowledge, topic and tool (round D, 2026-11-11, passed)

| Scenario | Choice | Reason | Why not the other two |
|---|---|---|---|
| Does sick leave need a doctor's certificate | knowledge | The answer is in the policy document, the same for everyone; it only needs to be **read** | A topic would hard-code the policy and need changing whenever the policy changes; a tool has no system to call |
| Reset VPN password (ask for employee ID first, verify, give instructions) | topic | The steps are **fixed**, order matters, identity must be verified; left to the AI it might skip verification | knowledge only answers; it can't control the flow |
| How many days of annual leave I have left | tool | **This person's real-time data**, in another system, not in documents | knowledge has no personal balances; a topic alone can't get the data |

- The three can be combined: M3's `Leave Balance` is **a tool called inside a topic** (confirm the employee ID first, then call Employee API). If the only option given is tool, choose tool.
- Rhyme: **just reading documents → knowledge; fixed process → topic; real-time data or doing something → tool.**

### Readiness question 2: choosing between REST API tool, custom connector and MCP (round D, 2026-11-11, passed)

| Scenario | Choice | Reason |
|---|---|---|
| Have an OpenAPI file, only this one agent uses it, want it connected fastest | REST API tool | Import the OpenAPI in Copilot Studio and it's built |
| The same API is needed by an agent, a flow and a Power App, and has to go into a solution for production | custom connector | Shared at environment level, can go into a solution |
| The tool server adds tools every month, and the agent should be able to use them without config changes | MCP | Connect to the server once; the tool list updates automatically |

- **A REST API tool is also a custom connector behind the scenes** (auto-generated by the wizard; `Employee API` is visible in a topic's Connector tab). The difference isn't technical, it's **where it's built and who it's for**: a REST tool is built in Copilot Studio, for this agent; a custom connector is built in Power Apps and shared across the environment. The REST tool wizard doesn't read `securitySchemes`; the API key is configured manually, using Maker-provided.
- **The cost of MCP:** best suited to letting the orchestrator choose by itself; put in a topic it's just a raw JSON-RPC node, awkward for fixed steps; whether the right tool is picked depends entirely on the tool descriptions the server writes; in Power Platform it's also a connector, governed by DLP just the same.

### Readiness question 3: MCP and A2A (round D, 2026-11-14, again → passed on re-ask)

**Decide by the shape of the interaction, not by where the other side is:** an external service can also be MCP. **Fill in a form, get a result → MCP; assign a task, wait for a report → A2A.**

| Scenario | Choice | Reason |
|---|---|---|
| Exchange rate / weather service: give parameters, get one value back | MCP | Structured parameters, each call independent |
| Travel planning / visa processing agent: assign the task in one sentence, it figures things out itself, asks back, and returns a complete plan | A2A | Natural language task; the other side decides how to do it; internally a black box |
| Reports "We couldn't find an agent card at this URL" | A2A | The other side lacks an **agent card** (`/.well-known/agent-card.json`, a business card: what it's called, what it can do, how to call it); M5 hit exactly this error |

- First attempt: I described the difference correctly (MCP is tools, A2A is agents talking to each other per a protocol), but didn't clearly match scenarios; "the other side must support the A2A protocol" was too vague, and I didn't mention the agent card.

**Follow-up: A2A and child agent are easy to confuse.** The key question is **where the other side lives**:

```
          Main agent (HR Assistant)
   ┌───────────┼───────────┬────────────┐
 child       connected     Foundry      A2A
 lives inside  another Copilot  Foundry      an agent anywhere,
 the main      Studio agent in  agent in     on any
 agent         same environment Azure        platform
```

| | Child agent | Connected agent | A2A |
|---|---|---|---|
| Where the other side is | **Inside the main agent** | Another independent Copilot Studio agent in the same environment | **Anywhere**: another company, another platform |
| Who builds and manages it | You, together with the main agent | You or another team, published separately | Someone else; you can't see inside |
| Can be published separately and used by others | ❌ | ✅ multiple agents can connect | ✅ independent by nature |
| How to connect | Create directly inside the main agent | The other side publishes and turns on "Let other agents connect…" | The other side provides an **agent card** |
| Travels with the solution | ✅ | ✅ can go in together within the same environment (M6 Onboarding Agent was brought in automatically) | ❌ external ones can't go in |
| This project | Not built | `Onboarding Agent` | `Onboarding Schedule Agent` (didn't get it working in M5) |

- Analogy: child = a team member sitting next to you who works only for you; connected = another department in the company; A2A = an outsourcing company: you only see their business card and assign tasks in the contract format.
- How to choose: used only by this agent, splitting off a piece of logic → child; an existing Copilot Studio agent in the company, or one to be reused by several agents → connected; another platform or another company → A2A. (The IT Helpdesk in re-asked 30 is a Copilot Studio agent in the same environment → connected, not A2A.)

### Readiness question 4: Copilot Studio agent and Foundry agent (round D, 2026-11-14, again → passed on re-ask)

**Correction: "Foundry always requires writing code" is wrong**; M5's `hr-policy-summariser` was clicked together in the portal. The real reasons to choose Foundry:

| Reason | Explanation |
|---|---|
| Need to choose models, switch models | The model catalog has thousands; only a few are selectable in Copilot Studio |
| Complex orchestration you need to control yourself | Multi-step reasoning, custom tool calls, using the SDK |
| Data and resources are in Azure | Your own Search index, deployments, network isolation |
| Professional-grade evaluation and tracing | Azure-side tracing, evaluation, content safety |

- Employee-facing conversations, publishing to Teams / M365 Copilot, using Power Platform connectors → Copilot Studio (it can publish directly to these channels; a Foundry agent can't on its own).
- Common combination: **Copilot Studio as the front desk, Foundry as the back-office expert** (that's exactly M5).

**After connecting it into Copilot Studio:**
- Entry point: **Agents → Add → Microsoft Foundry** (not Tools).
- Form: **behaves like a tool**; the orchestrator calls it as a tool; in a component collection its type shows as "Model Context Protocol". Different from a connected agent (that's a Copilot Studio agent in the same environment).
- Protocol: the Foundry side must support the **Activity protocol**.
- Identity: **End user credentials** (the first time I answered developer identity, wrong). Evidence: in M6 evaluation User profile → Manage I had to connect to Foundry myself; in the HR-Test test pane, Manage your connections also requires each user to connect themselves. So on the Copilot Studio side, Authenticate with Microsoft has to be on.
- Cost: **Azure**.

**Connecting various agents: what the other side must provide:**

| What you connect | The other side must provide |
|---|---|
| Foundry agent | **Activity protocol** |
| A2A agent | **A2A communication endpoint** + authentication (the other side gives client ID, secret, authorization / token / refresh URL → OAuth 2.0). The agent card (`/.well-known/...json`) is only metadata describing "who I am, what I can do"; **it's not what you fill in in Copilot Studio** (PA 2026-11-21) |
| Connected agent | Publish, and turn on "Let other agents connect to and use this one" |

## Predictions vs reality (written in Task 1, original text unchanged)

| Prediction | Actual | Right or wrong |
|---|---|---|
| 1. Of the 44 bullets, 15 will pass Explain on the first try | A 2, B 6, C 6, D 1, **exactly 15** | Right |
| 2. A data policy that only blocks `HTTP` only blocks at Publish time | The test pane errors as soon as it reaches the HTTP node, and the published version is blocked too | Wrong: it blocks at runtime |
| 3. Scenario questions on Integrate and extend will have the most misses | Scenario questions: Integrate missed 1 (8/9), Test missed 1 (3/4), tied; proportionally Test is worse. In PA attempt 2 Test was also lowest (about 56%), Integrate second (about 67%) | Half right: Integrate is indeed weak, but Test is weaker, it just had fewer questions |

## Not yet understood, left for later

- **The configuration entry point for environment-level telemetry**, and whether there's a precedence when it's on together with agent-level. M4 only configured agent-level.
- **Details of the GitHub Copilot harness**: only the new exam objectives from 12-18 centre on it. If I take the old version on 11-28 there's no need to fill this in; if it slips past 12-18 I'll have to re-review against the new study guide.
- **The semantics of Asynchronous response** (the bullet 10 question I got wrong in PA attempt 2), and how many seconds the agent waits for a flow: neither verified against the docs.
- **Conflicts with hands-on testing; in the exam answer per the docs**: the REST API tool docs say only OpenAPI v2 is accepted (M3 uploaded 3.0.3 YAML and it was accepted); component collection's primary agent (M6's experience doesn't match the question explanation); Settings → Response formatting (Preview): the docs say it applies globally, but M1 tested hands-on and it had no effect.
- **Billing for internal agents**: whether usage is included in the licence when employees have M365 Copilot licences is a guess (`planning/07-audiences.md`).
- **The timed mock exam hasn't been done yet**: neither PA attempt reached 80%, and I haven't practised speed. See the readiness check in Task 6.

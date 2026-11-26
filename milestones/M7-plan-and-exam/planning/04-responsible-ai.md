# 4. Plan responsible AI strategy

## What this bullet tests

Making the agent answer accurately (grounding), speak appropriately (moderation, scope), and be accountable (transparency, human oversight, evaluation). The course module splits it into four parts: applying the principles, content moderation, model selection, and guardrails and transparency.

## How HR Assistant does it

| Practice | Specifics | Source |
|---|---|---|
| Limit scope | instructions: "Only answer questions covered by the employee handbook…"; out of scope, direct people to contact hr@contoso.com | M1 instructions verbatim |
| Don't make things up | "Base all policy answers on the configured knowledge sources. If you cannot find supporting information, say so clearly" | M1 |
| Don't touch sensitive information | "Do not ask for or repeat sensitive personal information…" | M1 |
| Don't overstep authority | "Do not approve requests or promise exceptions" | M1 |
| Transparency | Answers carry citations and Sources | M1 Task 4, M4 Task 9 |
| Content moderation | The standard harness has three levels, Low / Moderate / High, with Low the default for new agents; set to High. The reply shown when something is blocked can be customised | M1 Task 2, 7 |
| Human oversight | Cancelling already-approved leave needs manager approval (human-in-the-loop agent flow) | M2 Task 5 |
| Evaluation | 30-question test set, several graders | M6 Task 2, 3 |
| Monitoring | Application Insights, Activity map, flow run history | M4 Task 7, M2 Task 6 |

**One point the tests didn't catch:** in M1, turning moderation down from High to Low gave the same results. That's because the test questions were stopped by the "scope" clause first and never reached moderation. To test moderation you need questions that are "in scope but offensive in tone".

## Comparing the options

| Measure | What it solves | When it isn't enough or shouldn't be used |
|---|---|---|
| **Boundaries in Instructions** | Scope, tone, refusals, things not to do | Only a prompt; the model may not comply; can't be treated as a security control |
| **Content moderation level** | Blocks harmful content (predefined categories) | Can't block admin-defined custom topics (the docs say explicitly that this capability doesn't exist); too high and it wrongly blocks normal questions |
| **Answer only from knowledge sources (turn off general knowledge / web)** | Reduces making things up | When the knowledge sources themselves lack content, it can only answer "I don't know" |
| **Citations and sources** | Users can check for themselves | A correct citation doesn't mean the summary is correct |
| **Telling users it's AI** (welcome message, disclaimer) | Transparency | Doesn't replace accuracy |
| **Human-in-the-loop** | High-risk actions (approvals, payments, deleting data) confirmed by a person | Low-risk, high-frequency actions; having a person confirm every time is too slow |
| **Evaluation (test set) + monitoring** | Compare before and after a change; spot problems after go-live | AI grading itself fluctuates (M6: the same question gave different results on two runs) |
| **Choosing a model** | Use evaluation to judge whether a model can go to production | Not re-running evaluation after switching models |

## Easily confused points in the exam

- **Moderation levels differ between the standard and GitHub Copilot harness**: in M1 the standard harness had three levels, while on the GitHub Copilot harness agent I only saw Medium.
- **Generative nodes can override moderation individually** (Customize in the generative answers node); if left unchanged they inherit the agent-level setting.
- **Scope control and content moderation are two different checkpoints**, and their order affects test results.
- The answer for high-risk actions is usually **human-in-the-loop**, not "turn moderation up".

## Sources

- Tested hands-on: `milestones/M1-knowledge-agent/notes.md` (instructions verbatim, Task 2, Task 7 Step 3), `milestones/M1-knowledge-agent/break-and-fix.md`, `milestones/M2-leave-flow/notes.md` Task 5, `milestones/M6-test-alm/notes.md` Task 3
- Docs: course module [Design a responsible AI strategy for agents](https://learn.microsoft.com/en-us/training/modules/design-responsible-ai-strategy-copilot-studio/) (haven't finished reading all units yet), [Security and governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance) (moderation can't block custom topics)

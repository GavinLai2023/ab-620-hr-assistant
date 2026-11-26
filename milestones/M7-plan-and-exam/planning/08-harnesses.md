# 8. Choosing a harness (not a separate bullet; related to 3 and 7)

## What this page solves

The study guide (2026-04-09 version) doesn't mention harnesses, but the AB-620T00 course has already been fully reworked around the GitHub Copilot harness. The exam may ask "which harness should you use", so at the very least I need to tell them apart.

## What it is

A harness is the runtime between the agent and the model: it decides when to call the model, what to send it, how to interpret what comes back, and which tool to call.

## How to explain it to someone who doesn't know AI

1. **Horse and harness.** A harness originally means a horse's harness. The horse (the AI model) is strong and clever, but it needs the harness on before its strength turns into "pulling the cart to the destination".
2. **What it manages.** The model can only "think" and "speak". The harness decides when to let the model think, what material to show it, which system to call once it's done thinking (query a database, send an email, submit a form), and what to do when something goes wrong.
3. **The same clever new employee, three ways of organising the work:**

| harness | Equivalent to | Suited to |
|---|---|---|
| standard | Handing them an **operations manual** to follow by the book | Fixed questions where the answer must be the same every time (HR Q&A) |
| GitHub Copilot | Giving them only the **goal**; they plan the steps, find tools, and change approach when they hit problems | Complex multi-step work (checking invoices) |
| Customer Conversation | Sitting at the **front desk receiving customers**, calling a supervisor for what they can't handle | Website and phone customer service |

**In one sentence:** the model is the brain, and the harness is the "way of working" that puts the brain to work. Same brain, different way of working: what it can do, how stable it is and how much it costs all change.

## The three harnesses

| | standard | GitHub Copilot | Customer Conversation |
|---|---|---|---|
| Suited to | Clear rules, stable answers needed (internal help desk) | Complex multi-step business processes (e.g. reading invoices, matching orders, sending exceptions for approval) | Customer-facing website chat, phone customer service |
| How it runs | Follows the defined topics and rules | Breaks down the goal itself, reasons step by step; retries or takes another route on failure | Several sub-agents, each able to hand off to a human |
| When things go wrong | Follows the path you built | Retries automatically or takes another route | Hands off to a human |
| Files | Not the focus | Can create and edit Word, Excel, PowerPoint and PDF | Not the focus |
| Skills, memory | Not the focus | Yes | Yes |
| Publishing | Internal or external | Internal or external | Website chat or a phone number |
| Billing | The standard harness's licensing model | Copilot Credits | Copilot Credits |

## In this project

- On day one of M1, the home page created a GitHub Copilot harness agent by default: only Build / Preview / Evaluate / Monitor, no Topics, orchestration not configurable, and moderation only showing Medium.
- To do topics, variables and adaptive cards, I instead built the standard HR Assistant Classic from **Other ways to build**. **Once built, the two harnesses can't be converted into each other.**
- Most exam objectives bullets (topics, variables, adaptive cards, generative answers node, agent flow) are standard harness features.

## When to choose which

- The question stresses **stable, predictable, following a process, existing topics** → standard.
- The question stresses **multi-step reasoning, spanning several tools, handling files, recovering from failures on its own** → GitHub Copilot.
- The question stresses **customers, website or phone, handoff to a human** → Customer Conversation.
- They can be mixed in one solution: a GitHub Copilot harness agent can also call a connected agent as a tool.

## Term mapping (names used in the course)

| Course (GitHub Copilot harness) | What we built (standard) |
|---|---|
| Workflow | Agent flow |
| Skills | Component collection (different granularity, both about reuse) |
| Preview | Test pane |

This mapping table is a guess; verify it while reading the course.

## Sources

- Docs: [Harnesses in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview) (2026-10-19)
- Tested hands-on: `milestones/M1-knowledge-agent/notes.md` "Finding: Copilot Studio has two harnesses"

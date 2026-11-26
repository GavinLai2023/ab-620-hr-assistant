# 6. Plan reusable agent components

## What this bullet tests

What should be built to be reusable, and at what granularity: one topic, one tool, a whole agent, or a whole deployment package.

## How HR Assistant does it

| What was reused | How | Source |
|---|---|---|
| Password Reset topic | Put into component collection `HR Shared`, installed into Onboarding Agent | M6 Task 4 |
| Employee API | custom connector, an environment-level resource | M3 Task 5 |
| Onboarding checklist | A separate Onboarding Agent, used as a connected agent | M5 Task 2 |
| The whole HR Assistant | solution `HRAssistant` (publisher Contoso HR, prefix `chr`), managed package deployed to HR-Test | M6 Task 4, 6 |
| Environment-specific values | environment variables such as `chr_EmployeeAPIBaseURL` | M6 Task 5, 7 |

## Comparing the options

| Component | Granularity of reuse | When to use it | When not to use it |
|---|---|---|---|
| **Component collection** | At the level of topics, knowledge and tools, shared by several agents in the same environment | Several agents all need the same conversation logic (identity verification, handoff to a human, password reset) | Only one agent uses it; agents need different wording (change it in one place and every agent changes) |
| **Custom connector** | One API, shared by all agents, flows and apps in the environment | The same system is called from several places | A one-off simple call |
| **Agent flow** | One fixed process, callable by several agents | The same business action is used in several places | The process is tightly bound to one agent |
| **Connected agent** | A whole agent | Used by several main agents; maintained by another team; needs different settings (knowledge permissions, authentication, DLP, model) | Small scale → a child agent is enough (M5: a connected agent takes 13–28 seconds per call) |
| **Child agent** | A sub-agent inside the main agent | A specialised responsibility used only by this one main agent | Needs to be reused across agents |
| **Solution** | A whole set of components, deployed across environments | ALM from dev → test → prod | Just trying things out casually in one environment |
| **Environment variable** | Values tied to the environment | URLs, sites and keys that differ per environment | Constants that are the same in every environment |
| **Skills** (new, GitHub Copilot harness) | A packaged piece of reusable behavior, referenced in instructions | Agents using the GitHub Copilot harness | Not the focus for the standard harness |

## Easily confused points in the exam

- **Component collections are shared within one environment**; across environments, use a solution.
- **When you add an agent to a solution from Copilot Studio**, its components come along automatically, but the tables used by flows don't (M6 Task 7).
- **Create your own publisher** with a consistent prefix instead of the default `new_`.
- **Once a managed package is installed in the target environment, don't edit components there**, or an unmanaged layer is created that later upgrades can't override.
- **A connected agent's description is a local copy** and doesn't sync with the sub-agent (M5).

## Sources

- Tested hands-on: `milestones/M6-test-alm/notes.md` (Task 4, "Concepts learned" 6), `milestones/M5-multi-agent/notes.md` "Multi-agent design", `milestones/M3-tools/notes.md` Task 5
- Docs: course module [Design reusable behavior with skills](https://learn.microsoft.com/en-us/training/modules/design-reusable-behavior-skills-copilot-studio/) (only read the introduction)

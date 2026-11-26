# AB-620 exam prep project: HR Assistant

Goal: pass Microsoft Exam AB-620 and earn Microsoft Certified: AI Agent Builder Associate.
Approach: one end-to-end HR Assistant project that covers all 44 bullets of the official exam objectives.
Design doc: `docs/superpowers/specs/2026-09-13-ab-620-hr-assistant-design.md`

> **Disclaimer.** This is a personal study project. It is not affiliated with or endorsed by Microsoft. It contains no exam questions and no Practice Assessment question text: only my own notes, scores and the topics I missed. All employee and HR data is fictional, and the tenant name has been replaced with `contoso`. The notes were originally written in Chinese and translated into English for this public copy. The agent itself also answered in Chinese, so in `test-sets/results/` the replies are translated, while some grader explanations still mention that the reply was in Chinese.

## Current milestone

All done. Passed AB-620 on 2026-11-26 with 788 / 1000 (OnVUE at home, taken in Simplified Chinese).

## Milestones

| Milestone | Status | Plan |
|---|---|---|
| M0 Environment setup | Done 2026-09-17 | `docs/superpowers/plans/2026-09-13-m0-environment.md` |
| M1 HR policy Q&A agent | Done 2026-10-10 | `docs/superpowers/plans/2026-09-17-m1-knowledge-agent.md` |
| M2 Leave request agent flow | Done 2026-10-12 | `docs/superpowers/plans/2026-10-10-m2-leave-flow.md` |
| M3 Tool integration | Done 2026-10-15 | `docs/superpowers/plans/2026-10-12-m3-tools.md` |
| M4 Azure integration | Done 2026-10-22 | `docs/superpowers/plans/2026-10-15-m4-azure.md` |
| M5 Multi-agent | Done 2026-10-25 | `docs/superpowers/plans/2026-10-22-m5-multi-agent.md` |
| M6 Testing and ALM | Done 2026-11-03 | `docs/superpowers/plans/2026-10-25-m6-test-alm.md` |
| M7 Planning domain wrap-up and exam prep | Done 2026-11-26 | `docs/superpowers/plans/2026-11-03-m7-plan-and-exam.md` |

## Services used and expiry dates

| Service | Start date | Expiry | Notes |
|---|---|---|---|
| Microsoft 365 Business Basic | On trial | 22/09/2026 | On 23/09 it converts automatically to 1 paid seat, monthly, about A$10/month; provides SharePoint, Teams, Entra |
| Power Apps Developer Plan | 15/09/2026 | Permanent | Environment HR-Dev |
| Environment HR-Test (Developer) | 01/11/2026 | Permanent | Converted to a Managed Environment during deployment, no license needed; HRAssistant 1.0.0.5 (managed) installed through a Pipeline (uninstalled and reinstalled in M6 Task 7). `chr_EmployeeAPIBaseURL` holds the host name for port 3001, without `https://` |
| Copilot Studio trial | 16/09/2026 | 16/10/2026 | Auto-renew turned off; tested on 16/10: after expiry HR-Dev can still be edited and tested |
| SharePoint site HR Policies | 16/09/2026 | Permanent | https://contoso.sharepoint.com/sites/HRPolicies |
| Copilot Studio pay-as-you-go | | | Only supports production / sandbox environments, so HR-Dev can't be linked; tested in M4 Task 9 that HR-Dev can publish to M365 Copilot without it, so it was never turned on |
| Azure free account | 16/10/2026 | 15/11/2026 | US$200 credit for 30 days; resource group rg-hr-assistant (Australia East); budget alert at US$10; kept Foundry hr-assistant-demo (gpt-4.1-mini, text-embedding-3-small), Search srch-hr-assistant-demo (Free), Storage sthrassistantdemo; App Insights deleted at the end of M4, and the action group it left behind deleted at the end of M5; the M5 Foundry agent `hr-policy-summariser` also lives in this Foundry project, kept for M6; by 25/10 total spend was only about A$0.47, remaining credit US$199.99. **Decided 03/11: no upgrade, let it expire on 15/11.** After expiry the subscription is disabled and the resources can't be used; M4 and M5 were already tested and written up, and neither M7 nor the exam needs these resources. Upgrade later if needed |
| Microsoft Fabric capacity F2 | 22/10/2026 | Deleted 25/10/2026 | `fabrichrdemo` (rg-hr-assistant, Australia East), about US$0.42/hour, charged against the Azure free credit; must be paused after use. Didn't use the Fabric trial: trial capacity doesn't support data agents. Total spend about A$0.45. The HR-Analytics workspace and HR Data Agent lost their capacity and no longer work; HR Data Agent is set to Off in HR Assistant |

## Source of truth for progress

`docs/coverage.md`. Updated at the end of every milestone, based on evidence rather than gut feeling.

## Local services

Everything was cleaned up after the exam on 2026-11-26: nothing runs locally, and the tunnels `hr-employee-api` and `hr-mcp-server` have been deleted (`hr-a2a-agent` was already gone before that). The code is still in the repo; to run it again, start it locally and create new tunnels:

- `src/employee-api`, port 3000 (for HR-Dev) and 3001 (for HR-Test, `$env:PORT=3001`), previously behind tunnel `hr-employee-api`.
- `src/mcp-server`, port 3100, previously behind tunnel `hr-mcp-server`.
- `src/a2a-agent`, port 3200, previously behind tunnel `hr-a2a-agent`: A2A never connected successfully.
- All the tunnels were anonymous, which was acceptable only because the data is fake.

## License

Code is under the MIT License (see `LICENSE`). Notes are shared for learning purposes.

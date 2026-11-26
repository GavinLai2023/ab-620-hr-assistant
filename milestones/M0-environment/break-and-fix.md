# M0 break-and-fix log

| Date | What I changed / ran into | Symptom | Cause | Fix or conclusion |
|---|---|---|---|---|
| 2026-09-16 | Chatted in the Test pane right after creating an agent in HR-Dev | Reply `You need credits to continue. This environment is out of credits.`, error code `EnforcementUsageCredits` | The tenant had no Copilot Studio trial license; the Developer Plan only grants permission to build agents, not run capacity; and even with capacity, it isn't automatically allocated to a new environment | Signed up for **Microsoft Copilot Studio (Trial)** in the M365 Marketplace (the one with capacity, not User License), turned off auto-renew, then went to PPAC → Licensing → Copilot Studio → Manage Copilot Credits and allocated the credits to HR-Dev; chat worked again |

# M6 checklist

- [x] 30-item test set written, validation tests pass (`test-sets/test-sets.test.mjs`, 5 tests)
- [x] Built-in evaluation run, at least five test methods have results (Answer quality, Meaning, Text, Keyword, Exact, plus Tool use)
- [x] Grader comparison table written, at least 3 failed questions' transcripts reviewed and categorized (7 categories, see notes Task 3)
- [x] Solution HRAssistant built, with the agent, flows, connector and tables in it
- [x] Two environment variables created, each used once in a connector and in a topic (`Employee API` Host; `Leave Policy Summary`, and Task 7 added `Department Lookup`)
- [x] HR-Test built, all three kinds of capability tested after importing the managed solution (knowledge, tools, flow; in Task 6 E002 was 401, after the Task 7 reinstall all three sentences pass)
- [x] Pipelines working, or the reason it doesn't work recorded (1.0.0.2 to 1.0.0.5, all Pipeline deployments)
- [x] Two break-and-fix experiments done and reverted (hard-coded URL; missing connector)

Not done (doesn't affect the ticks): Pipeline extensions (approvals, gated extension) not tried; no secret-type environment variable created; the Host for HR MCP Server and Onboarding Schedule Agent is still hard-coded.

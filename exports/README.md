# exports

Solution packages don't go into Git (`.gitignore` has `exports/*.zip`), because the packages contain tunnel addresses and a mock key. This file only records what was exported.

| Item | Details |
|---|---|
| Solution | `HRAssistant` (Publisher: Contoso HR, prefix `chr`) |
| Version | 1.0.0.3 (same as the version installed in HR-Test via Pipeline) |
| Export date | 2026-11-02 |
| Files | `HRAssistant_1_0_0_3_managed.zip`, `HRAssistant_1_0_0_3.zip` (unmanaged) |
| Source environment | HR-Dev |

## What's in the package (managed package, 224 files total)

- `botcomponents/`: the topics, tools, knowledge sources and instructions of the two agents (HR Assistant Classic, Onboarding Agent)
- `Workflows/`: two cloud flows (SubmitLeaveRequest, CancelApprovedLeave)
- `Connector/`: OpenAPI definitions and connection parameters of 4 custom connectors
- `environmentvariabledefinitions/`: two environment variables
- `Assets/`: connection references, AI model, DVTableSearch, etc.

## Check results

Searched for devtunnels.ms, x-api-key, dev-local-key, Bearer, eyJ, AccountKey.

| Found | Where | Notes |
|---|---|---|
| tunnel address (3000) | HTTP node of the `DepartmentLookup` topic | Hard-coded URL, to be changed in Task 7 |
| `dev-local-key` | Same as above | Mock key hard-coded in the request header |
| tunnel addresses (3100, 3200) | `host` of the HR MCP Server and Onboarding Schedule Agent connectors | No environment variable used, so after switching environments they still point at Dev's backend |
| `x-api-key` | `securityDefinitions` of 3 connectors | Just the request header's name, not the key itself |
| Value of HR Policy Site URL | `environmentvariablevalues.json` | Still included even with Export value set to No |

Bearer, eyJ and AccountKey were not found. Keys in connections don't go into the package.

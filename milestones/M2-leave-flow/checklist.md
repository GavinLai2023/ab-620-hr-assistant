# M2 checklist

- [x] LeaveRequest Dataverse table built, columns match the design doc
- [x] SubmitLeaveRequest flow input/output parameters work end to end, Dataverse write verifiable
- [x] Submit Leave Request topic collects info with an adaptive card and calls the flow as a tool
- [x] Both the Approve and Reject paths of CancelApprovedLeave tested
- [x] SubmitLeaveRequest has an explicit error-handling branch, verified in Power Automate Run history with one successful and one failed run (both verified during Task 6/7; during Task 7 Step 4 debugging I hit a schema deadlock that blocked publishing, fixed the same day by deleting and rebuilding both Respond to the agent nodes, see the last row of break-and-fix.md)
- [x] All four break-it-on-purpose experiments done and reverted (the cascading failure triggered during experiment 4 was fixed the same day)

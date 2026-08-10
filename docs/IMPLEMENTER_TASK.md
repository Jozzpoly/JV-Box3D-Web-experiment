# JV Web — implementer task

Updated: 2026-08-10
Status: **INACTIVE — IMPLEMENTATION FROZEN FOR ORCHESTRATOR HANDOFF**
Task: **NONE**

There is no active implementer assignment.

Do not infer a task from the frozen work branch, old chat messages, historical `IMPLEMENTER_TASK.md` versions or nearby unresolved geometry.

## Frozen evidence branch

```text
branch: work/owner-rig-s1-attachment-authority
tip:    393ef4600be5c83ef42bced4a8a451446e372c32
tree:   92c896a8b0579a66b3c5381b777baf853a469908
state:  FROZEN / NO WRITES
```

Its latest S1-D static FL upper-wishbone FRONT + TOP placement is OWNER ACCEPTED at current visual precision, but the branch is **not integrated into `main`** and is not permission to continue S1.

## Reopening implementation

The controlled takeover sequence is:

1. new orchestrator passes **O1 — State Reconstruction**;
2. new orchestrator passes **O2 — Continuation Reasoning**;
3. only then may the new orchestrator prepare/replace this file with the first new bounded task as **O3 — First Implementer Packet**;
4. that O3 task packet must be audited/accepted before any implementer execution starts.

A future ACTIVE task must provide:

```text
task id / status
work branch
CONTROL TIP supplied by orchestrator handoff
EXECUTABLE PRODUCT BASE when different from control tip
execution mode
one technical objective
accepted input evidence
allowed/protected scope
required evidence/tests
stop conditions
owner question
return contract
```

Do not store a task file's own future commit SHA as `Expected starting SHA`. The exact **CONTROL TIP** is a transaction value supplied/verified at handoff time. `EXECUTABLE PRODUCT BASE` is a separate stable concept when docs-only control commits sit above the product state.

Until O1 and O2 pass and this file is deliberately replaced for an audited O3 packet:

**STOP — no bounded implementer work is authorized.**

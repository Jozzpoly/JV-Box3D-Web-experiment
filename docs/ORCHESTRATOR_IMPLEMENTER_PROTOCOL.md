# JV Web — orchestrator / implementer protocol

Updated: 2026-08-10
Status: **ACTIVE EXECUTION PROTOCOL**

This document defines the split between project orchestration and bounded implementation. Its purpose is context control and reliable execution, not ceremony.

```text
owner intent / observation
-> orchestrator task + execution packet
-> bounded work branch
-> implementer evidence + candidate
-> orchestrator review
-> focused owner validation when needed
-> accept / revise / reject / replan
-> clean integration + record
-> next task
```

## 1. Roles

### Owner — Jozz

Owns product intent, priority and final visual/feel verdict. The owner should not perform technical debugging agents can automate.

### Orchestrator

Owns current project truth, evidence classification, dependency order, task scope, branch lifecycle, implementer review, owner-candidate decision, integration and durable checkpoints.

The orchestrator does not perform ordinary product implementation while an implementer slice is active. It may review evidence, maintain the task/control surface and perform bounded branch/integration operations.

### Implementer

Owns technical execution of exactly one active task. Inside the declared blast radius it has broad freedom to inspect directly relevant source, choose an algorithm, add focused diagnostics/tests and conclude that no patch is justified.

It does not own project priority, the next task, `main`, public release, native modifications, unrelated cleanup, cross-mechanism expansion or OWNER ACCEPTED classification.

## 2. Context packet vs execution packet

Every implementer handoff has two separate concerns.

### Context packet

`docs/IMPLEMENTER_TASK.md` is the single active implementation contract. It contains only the current question, current accepted evidence needed to start, allowed/protected scope, validation requirements and return contract.

The implementer normally reads:

1. remote branch identity;
2. `AGENTS.md`;
3. `docs/IMPLEMENTER_TASK.md`;
4. directly required source/tests.

This protocol is reference material, not mandatory preload when the task is complete.

The implementer must not reconstruct the project from `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, baselines, archived branches or chat history unless the task explicitly names one exact historical item.

`personal_context`, conversation-memory recovery, `summary_reader`, broad File Library/history search and equivalent tools are forbidden for ordinary bounded implementation unless the task explicitly authorizes one named historical query. Accidental exposure does not become evidence; re-derive the claim from allowed current sources.

### Execution packet

The task must declare one execution mode:

```text
CONNECTOR_ONLY_OK
SOURCE_ZIP_REQUIRED
CANONICAL_WINDOWS_REQUIRED
```

`CONNECTOR_ONLY_OK`: source-level/static work is sufficient for the task's decision.

`SOURCE_ZIP_REQUIRED`: the owner supplies a GitHub Download ZIP of the exact named work branch after the orchestrator says it is ready. Remote GitHub SHA remains write authority; the ZIP is an execution/read mirror and has no Git identity.

If required ZIP is absent, the implementer stops early after remote ref verification and asks for it. Do not spend a long time attempting private clones, `gh`, DNS workarounds or archive reconstruction.

`CANONICAL_WINDOWS_REQUIRED`: the task cannot reach its review/owner gate without the exact Windows launcher/toolchain. The orchestrator prepares the operation; the owner should not hand-debug it.

If exact dependencies remain unavailable even with source present, execute what is valid, classify the limitation explicitly and return the smallest missing input/environment.

## 3. One active task

`docs/IMPLEMENTER_TASK.md` is replaced when the next bounded task starts. Do not create dated implementer handoff stacks.

A task defines:

```text
task id / status
work branch
execution mode
one technical objective
accepted input evidence
required reading / source start points
allowed change surface
protected scope
technical freedom
required evidence/tests
decision/stop conditions
owner question if applicable
return contract
```

Specify outcomes and invariants rather than dictating a recipe unless prior evidence makes a method mandatory.

## 4. Branch transaction / main freeze

`main` is frozen for ordinary writes while a bounded work transaction is active.

The implementer writes only the named `work/<topic>` branch, never force-pushes and never creates extra branches without orchestrator direction.

The orchestrator reviews the complete base-to-candidate diff before owner validation or integration.

A work branch may contain diagnostic/revision commits. An accepted result does not require preserving noisy intermediate history on `main`; the orchestrator may integrate a clean, independently verified final diff/tree when that is safer and clearer. Candidate SHA and provenance remain recorded.

If a task produces useful evidence but no production patch, the orchestrator may keep the same work branch for the next tightly related subtask rather than multiplying refs. The next task must state which prior diagnostic changes are temporary and whether they should be retained, rewritten or removed before final integration.

## 5. Implementer freedom vs scope control

Inside allowed scope the implementer may choose algorithms/data structures, inspect directly related call chains, add the smallest useful diagnostics, revise its own approach and return `NO_PATCH_JUSTIFIED`.

It must stop rather than broaden when evidence points to a protected subsystem. A visual task may diagnose a physical-hardpoint problem but may not silently rewrite suspension physics.

The owner-visible question, not code-file proximity, defines scope.

## 6. Evidence contract

Keep distinct:

```text
CURRENT SOURCE FACT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED
OWNER ACCEPTED
HYPOTHESIS
UNKNOWN
```

For the current vehicle campaign also use E0-E5 from `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

A test that pins a current bad value is not automatically a regression gate. Diagnostic evidence may belong in measurement output or the task report rather than the durable test suite. Hard acceptance thresholds normally appear only after independent truth/owner acceptance justifies them.

## 7. Tested bytes must equal candidate bytes

When a source ZIP/local mirror is used:

1. remote work-branch SHA is identity authority;
2. local files are modified/tested in isolation;
3. final changes are written to the work branch;
4. before claiming tests for REVIEW_READY, compare/fetch the final candidate changed files and ensure they equal the locally tested content.

Do not claim a local test against a candidate whose bytes changed afterward.

## 8. Implementer return contract

Return compactly:

```text
TASK
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
BASE SHA
CANDIDATE SHA
FILES CHANGED
ROOT CAUSE / DECISION
WHAT CHANGED AND WHY
EVIDENCE / TESTS RUN
KEY MEASUREMENTS
ASSUMPTIONS / UNKNOWNS
PROTECTED SCOPE CONFIRMATION
WHAT WAS NOT TESTED
RECOMMENDED ORCHESTRATOR ACTION
```

Long narrative is optional. Exact diff, independent evidence and unresolved uncertainty matter more.

## 9. Orchestrator review gate

Before owner validation, independently check:

1. base/candidate identity and ancestry;
2. full diff/blast radius;
3. whether the task question was answered;
4. whether evidence is independent enough for the claim;
5. whether tests/builds apply to the exact candidate bytes;
6. protected scope;
7. whether temporary diagnostic assertions accidentally freeze known-bad state;
8. native/history used as evidence rather than false authority;
9. whether the owner can answer one attributable question.

Verdicts:

```text
REVISE
OWNER_READY
NO_PATCH / REPLAN
REJECT
```

Only the orchestrator integrates into `main`.

## 10. Owner validation

Normal owner gate:

```text
launch exact reviewed candidate
-> inspect requested state/view
-> answer one concrete question
```

Do not ask the owner to judge unrelated unresolved mechanisms just because they are visible.

`ACCEPTED`: freeze the interface and add a durable gate where useful.

`PARTIAL`: preserve accepted subparts and reopen only the unresolved sub-question.

`REJECTED`: revise/replace the approach; preserve the durable lesson, not a growing branch stack.

## 11. Context-overload stop rule

Implementer conversations are disposable.

If the active technical question can no longer be stated in a few paragraphs or the chat is accumulating unrelated archaeology/debugging:

1. stop broadening;
2. leave the work branch coherent if possible;
3. return the compact report;
4. let the orchestrator issue a fresh task to a fresh implementer conversation.

Do not wait for context failure.

## 12. Current vehicle campaign

`docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md` defines dependency order and evidence semantics. This protocol defines who controls and executes each slice.

The implementer receives only the subset needed for the active task and never plans later S-stages unless explicitly tasked.

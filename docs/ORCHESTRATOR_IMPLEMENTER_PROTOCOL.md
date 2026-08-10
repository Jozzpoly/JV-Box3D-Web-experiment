# JV Web — orchestrator / implementer protocol

Updated: 2026-08-10
Status: **ACTIVE EXECUTION PROTOCOL**

Purpose: reliable bounded implementation with low context load.

```text
owner intent / observation
-> orchestrator task + execution packet
-> bounded work transaction
-> implementer evidence + candidate
-> orchestrator review
-> focused owner validation
-> ACCEPT / PARTIAL / REJECT / REPLAN
-> integrate/freeze/record
-> next task
```

## 1. Roles

### Owner — Jozz

Owns product intent, priority and final visual/feel verdict. The owner should not perform technical debugging agents can automate.

### Orchestrator

Owns current truth/evidence classification, dependency order, task scope, branch lifecycle, implementer review, owner-candidate decision, integration and durable checkpoints.

The orchestrator does not perform ordinary product implementation while an implementer transaction is active.

### Implementer

Owns technical execution of one ACTIVE task. Inside the declared blast radius it may inspect directly relevant source, choose an algorithm, add focused diagnostics/tests, revise its approach and return `NO_PATCH_JUSTIFIED`.

It does not own project priority, next-task selection, `main`, public release, native modifications, unrelated cleanup, cross-mechanism expansion or OWNER ACCEPTED classification.

## 2. Context packet vs execution packet

`docs/IMPLEMENTER_TASK.md` is the single task context packet. It contains only the current question, accepted starting evidence, allowed/protected scope, validation requirements and return contract.

Normal implementer read set:

1. remote work-branch identity;
2. `AGENTS.md`;
3. `docs/IMPLEMENTER_TASK.md`;
4. directly required source/tests.

Do not reconstruct project history from memory files, handoffs, archived branches or chat history unless one exact historical item is explicitly authorized.

The task declares an execution mode:

```text
CONNECTOR_ONLY_OK
SOURCE_ZIP_REQUIRED
CANONICAL_WINDOWS_REQUIRED
```

If required source/environment is missing, ask for the smallest exact packet early rather than spending time on brittle workarounds.

## 3. CONTROL TIP vs EXECUTABLE PRODUCT BASE

These are separate identities.

**CONTROL TIP**
- exact current remote work-branch tip;
- supplied/verified by orchestrator handoff;
- transaction/write authority;
- may include docs-only control commits.

**EXECUTABLE PRODUCT BASE**
- stable product/source state from which the technical change is evaluated;
- recorded in task packet when it differs from CONTROL TIP.

Do not store a task file's own future commit SHA as an `Expected starting SHA`; a docs commit would immediately make it stale/self-referential.

Before every write verify the live CONTROL TIP. If it moved unexpectedly, STOP.

## 4. One active task

`docs/IMPLEMENTER_TASK.md` is either:

```text
ACTIVE
```

with exactly one bounded task, or:

```text
INACTIVE / FROZEN
```

with no implementation authorized.

Tasks are short-lived. Implementer **conversations may be longer-lived** across several tightly related microstages when that preserves useful local technical context.

Start a fresh implementer conversation when:
- the mechanism/topic changes;
- context becomes noisy or archaeology-heavy;
- stale hypotheses dominate;
- the product/control base changes materially;
- a fresh independent review is useful.

Conversation identity never becomes source authority.

## 5. Branch transaction / main freeze

While an implementer transaction is ACTIVE:

- `main` is frozen for ordinary writes;
- implementer writes only the named work branch;
- no force-push;
- no extra branches without orchestrator direction;
- orchestrator reviews complete diff before owner validation/integration.

A work branch may contain diagnostic/revision commits. Clean integration into `main` may preserve the reviewed final result without copying noisy experimental history.

`PARTIAL` owner acceptance may freeze one constraint while leaving the larger work branch unintegrated. During a controlled orchestrator handoff, a work branch may remain frozen at an exact SHA until the new orchestrator decides a safe integration/continuation boundary.

## 6. Scope control

The owner-visible question, not file proximity, defines scope.

Inside scope the implementer may choose implementation details and conclude no patch is justified.

When evidence points into a protected subsystem, stop and report rather than silently broadening.

## 7. Evidence and test integrity

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

Use E0-E5 from the vehicle campaign when relevant.

A test pinning a current bad value is not automatically a regression gate.

When a local/source-ZIP mirror is used:

1. remote SHA is identity/write authority;
2. local exact bytes are modified/tested;
3. final changes are written;
4. candidate changed bytes are re-fetched/compared;
5. only then may local tests be claimed for candidate.

Canonical and supplemental environments must be labeled separately.

## 8. Implementer return contract

Return compactly:

```text
TASK
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
CONTROL TIP / BASE SHA
EXECUTABLE PRODUCT BASE when relevant
CANDIDATE SHA
FILES CHANGED
ROOT CAUSE / DECISION
WHAT CHANGED AND WHY
EVIDENCE / TESTS
KEY MEASUREMENTS
CANDIDATE-BYTES == TESTED-BYTES
ASSUMPTIONS / UNKNOWNS
PROTECTED SCOPE
WHAT WAS NOT TESTED
RECOMMENDED ORCHESTRATOR ACTION
```

Exact diff/evidence matters more than a long narrative.

## 9. Orchestrator review gate

Before owner validation independently check:

1. control/base/candidate identity and ancestry;
2. complete diff/blast radius;
3. task question vs neighboring problems;
4. independence/strength of evidence;
5. candidate-bytes vs test bytes;
6. focused/canonical validation appropriate to claim;
7. protected scope;
8. diagnostic assertions do not freeze known-bad state;
9. owner gets one attributable question.

Verdicts:

```text
REVISE
OWNER_READY
NO_PATCH / REPLAN
REJECT
```

Only orchestrator integrates into `main`.

## 10. Owner validation

```text
launch exact reviewed candidate
-> inspect requested state/view
-> answer one concrete question
```

`ACCEPTED`: freeze the proven constraint and add a durable regression only where justified.

`PARTIAL`: preserve accepted subparts and reopen only unresolved constraints.

`REJECTED`: revise/replace; preserve durable negative evidence.

Owner acceptance of one static relation does not imply live-motion, neighboring-interface or whole-branch acceptance.

## 11. Orchestrator context migration

When orchestrator context becomes large enough that continued implementation risks drift:

1. finish/review the current bounded task;
2. do not open another product task;
3. obtain final owner verdict if a reviewed candidate is already ready;
4. freeze implementation and exact work refs;
5. update `OWNER_CHECKPOINTS`, `PROJECT_STATE`, `HANDOFF`, and set `IMPLEMENTER_TASK` INACTIVE;
6. compact stale hypotheses into explicit negative memory;
7. start a fresh orchestrator.

Controlled takeover gates:

**O1 — State reconstruction:** no writes; reconstruct accepted state, frozen transaction, owner accepted/rejected/provisional/deferred truth.

**O2 — Continuation reasoning:** no product write; propose the next bounded direction without reopening protected/deferred scope.

**O3 — First implementer packet:** prepare the next bounded task; previous orchestrator/owner audit it before execution.

Only after O1-O3 pass is orchestrator handoff complete.

## 12. Current vehicle campaign relation

`docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md` defines dependency/evidence semantics. This protocol defines who controls and executes each slice.

The implementer receives only the subset needed for the current task and does not plan later stages unless explicitly tasked.

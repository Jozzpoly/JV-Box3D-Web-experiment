# JV Web — orchestrator / implementer protocol

Updated: 2026-08-10
Status: **ACTIVE EXECUTION PROTOCOL**

This document defines the split between project orchestration and bounded implementation. Its purpose is context control, not ceremony.

The durable rule is:

```text
owner intent / observation
-> orchestrator task packet
-> bounded implementation branch
-> implementer evidence + candidate
-> orchestrator review
-> focused owner validation when needed
-> accept/revise/reject
-> integrate + record
-> next task packet
```

## 1. Roles

### Owner — Jozz

Owns product intent, priorities and the final visual/feel verdict. Jozz should not be asked to perform technical debugging that agents can automate.

Owner observations return to the orchestrator. The orchestrator converts them into the next bounded technical question instead of asking the implementer to reinterpret the whole project.

### Orchestrator

The orchestrator owns:

- current project truth and evidence classification;
- task ordering and dependency control;
- exact task packets and protected scope;
- remote identity / branch lifecycle;
- review of implementation diffs, tests and evidence;
- deciding whether a result is ready for owner validation;
- recording accepted/rejected lessons and checkpoints;
- integration into `main` and preparation of the next task.

The orchestrator does **not** perform ordinary product implementation while an implementer slice is active. It may prepare/maintain control documents, review evidence and perform bounded integration/branch operations.

### Implementer

The implementer owns the technical execution of exactly one active task packet.

Within its declared blast radius the implementer has broad freedom to inspect the necessary current source, choose an implementation strategy, add the smallest useful diagnostics/tests, revise its own approach and produce one or more commits.

The implementer does **not** own:

- project priority or the next task;
- broad reinterpretation of owner intent;
- writes to `main`;
- public R0 / Pages publication;
- native JV modifications;
- unrelated cleanup/refactors/polish;
- expansion into another mechanism because it appears nearby;
- final OWNER ACCEPTED classification.

## 2. Context firewall

The orchestrator may load broad current-state context when needed. The implementer should not.

Normal implementer bootstrap:

1. Resolve the exact current tip of the named work branch and compare it with the SHA supplied in the handoff message.
2. Read `AGENTS.md`.
3. Read `docs/IMPLEMENTER_TASK.md`.
4. Read only files named by the task or files directly required to answer its active technical question.
5. Inspect native JV or historical source only when the task explicitly names a salvage/evidence question.

Do **not** preload `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, old baselines, archived branches or old chat history unless `IMPLEMENTER_TASK.md` explicitly requires a specific item.

If the task packet is insufficient, the implementer reports the exact missing fact/file/question. It must not solve uncertainty by reconstructing the whole project history.

The implementer conversation is disposable. A new conversation may replace it between slices, or earlier if the technical chat becomes large. Continuity must live in Git + the task packet + exact candidate report, not in chat memory.

## 3. One active task packet

`docs/IMPLEMENTER_TASK.md` is the single active implementation contract. It is replaced when the next bounded slice is prepared; do not create dated stacks of implementer handoffs.

Each task defines:

```text
task id / status
one technical objective or discriminating question
work branch
authoritative starting point from the orchestrator handoff
required reading
allowed change surface
protected scope
technical freedom
required evidence
decision/stop conditions
owner-validation question if applicable
return contract
```

The task should specify outcomes and boundaries, not dictate an implementation recipe unless prior evidence makes a method mandatory.

## 4. Branch transaction and main freeze

Implementation uses one bounded `work/<topic>` branch only when isolation is useful. Branches belong to tasks, not agents or conversations.

When an implementer branch is active:

- `main` is frozen for ordinary orchestrator documentation/product writes;
- implementer writes only to the named work branch;
- implementer never force-pushes or rewrites shared history;
- implementer does not create additional branches unless the orchestrator changes the task;
- orchestrator reviews `base..candidate` before any integration;
- owner validation uses the reviewed exact candidate commit;
- accepted work is integrated into `main`, then the work branch is removed;
- rejected work is revised on the same branch when the scope is unchanged, or the branch is abandoned and replaced only after the orchestrator records the durable lesson.

Freezing `main` prevents harmless-looking parallel documentation edits from destroying simple ancestry and making accepted implementation harder to integrate safely.

Emergency/security/public-repair work may override this freeze, but the active implementation must then stop and rebase/replan explicitly; never silently continue from stale identity.

## 5. Implementer freedom vs control

The task packet should define **what must remain true**, not micromanage how code must be written.

Inside allowed scope the implementer may:

- choose algorithms/data structures;
- inspect directly related call chains;
- add focused measurement/debug/test code;
- make several local attempts and keep only the justified result;
- conclude that no product patch is justified yet.

The implementer must stop and report rather than broaden scope when evidence points to a protected subsystem. Example: a visual-mapping task that reveals the physical hardpoint itself is wrong may diagnose that fact, but may not silently rewrite suspension physics in the same task.

## 6. Evidence contract

Implementation claims must distinguish:

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

For the current owner-vehicle campaign also preserve E0-E5 from `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md`.

A passing consistency test is not permission to call cross-asset geometry or owner-visible output correct.

## 7. Implementer return contract

When ready for review, the implementer returns a compact report with:

```text
TASK
RESULT: REVIEW_READY | BLOCKED | NO_PATCH_JUSTIFIED
BASE SHA
CANDIDATE SHA
FILES CHANGED
WHAT CHANGED AND WHY
EVIDENCE / TESTS RUN
KEY MEASUREMENTS OR OBSERVATIONS
ASSUMPTIONS / REMAINING UNKNOWNS
PROTECTED SCOPE CONFIRMATION
WHAT WAS NOT TESTED
RECOMMENDED NEXT REVIEW ACTION
```

If a canonical environment was unavailable, say so explicitly. Supplemental execution must not be promoted to canonical evidence.

A long implementation narrative is optional. The exact diff, focused evidence and unresolved uncertainty matter more.

## 8. Orchestrator review gate

Before asking Jozz to inspect a candidate, the orchestrator independently checks:

1. branch/base/candidate identity;
2. complete `base..candidate` diff and blast radius;
3. whether the implementation answered the task rather than a neighboring problem;
4. whether evidence is independent enough for the claim being made;
5. tests/build/artifact identity appropriate to the slice;
6. protected mechanisms remained unchanged;
7. whether native/historical prior art was used as evidence rather than falsely promoted to authority;
8. whether the candidate asks Jozz one attributable visual/feel question.

Possible orchestrator verdicts:

```text
REVISE — same task, same branch
OWNER_READY — exact candidate is safe/useful to validate
NO_PATCH / REPLAN — evidence changed the problem definition
REJECT — approach is not worth continuing
```

Only the orchestrator integrates accepted work to `main`.

## 9. Owner validation

Owner validation should be narrow:

```text
launch reviewed exact candidate
-> inspect the requested state/view
-> answer one concrete question
```

Do not ask Jozz to evaluate unrelated unresolved mechanisms just because they are visible.

The owner verdict returns to the orchestrator, which records ACCEPTED/PARTIAL/REJECTED and decides the next task packet.

## 10. Context-overload stop rule

If the implementer conversation accumulates enough debugging/history that the active question is no longer easy to state in a few paragraphs:

1. stop broadening the chat;
2. leave the work branch in a coherent committed state if possible;
3. return the compact implementer report;
4. let the orchestrator decide whether to continue in a fresh implementer conversation.

Do not wait for context failure. Conversation continuity is expendable; exact Git/evidence continuity is not.

## 11. Current campaign relation

For owner-vehicle visual recovery, `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md` defines dependency order and evidence semantics. This protocol defines **who controls and executes each slice**.

The implementer should receive only the campaign subset required by the active task. It is not expected to plan S2-S9 while executing S1.

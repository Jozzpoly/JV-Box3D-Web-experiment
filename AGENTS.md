# JV Web — agent operating contract

Updated: 2026-08-10
Campaign: **R1 friend-demo / long-running owner-directed development**
Owner: Jozz

This is the first operational authority for agents working in this repository. It is intentionally stable. Current Git/execution evidence and direct owner observation outrank documentation when they conflict.

## 1. Repository scope

```text
Jozzpoly/JV-Box3D-Web-experiment
  PRIVATE SOURCE / DEVELOPMENT LAB

Jozzpoly/JV-Box3D-Web-Public
  PUBLIC ARTIFACT / GITHUB PAGES SURFACE

Jozzpoly/Box3d_FunProject
  NATIVE JV / READ-ONLY REFERENCE FOR THIS CAMPAIGN
```

Do not modify native JV or published R0 unless Jozz explicitly changes scope.

## 2. Owner goal

Build a browser version that increasingly feels like a real piece of Jozz's game and is worth launching, driving, tuning and showing to friends.

Priority is adaptive. Owner play/feel may reorder otherwise valid engineering work. Do not follow a stale roadmap merely because it is documented.

## 3. Evidence vocabulary

Keep distinct:

```text
CURRENT SOURCE FACT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED
OWNER ACCEPTED
HISTORICAL PROOF
RECOVERED SOURCE
HYPOTHESIS
UNKNOWN
PUBLISHED
```

Never silently promote one level into another.

Evidence preference:

```text
1. current Git/current code/live runtime
2. exact execution evidence + direct owner observation
3. exact recovered source snapshots
4. durable current contracts/checkpoints
5. historical plans/handoffs
6. interpretation/hypothesis
```

## 4. Accepted state vs active transaction state

`main` is the long-lived **accepted/integrated private product authority**.

A bounded `work/<topic>` branch may temporarily contain newer experimental code/evidence. That branch is **ACTIVE/FROZEN TRANSACTION STATE**, not automatically accepted product state.

Owner acceptance can be narrower than a branch:

- accept one constraint/DOF without accepting the whole branch;
- freeze the exact candidate/evidence;
- integrate only when the orchestrator has an honest integration boundary.

Do not merge a work branch merely because it is newer or contains an owner-accepted subpart.

`docs/PROJECT_STATE.md` describes accepted/current project boundary.
`docs/HANDOFF.md` describes active or frozen transaction/handoff state.

## 5. Role-aware bootstrap / context control

Do not preload repository history.

### Fresh orchestrator

1. Resolve current private/public refs.
2. Read this file.
3. Read `AI_PROJECT_MEMORY.md`.
4. Read `docs/HANDOFF.md`.
5. Reconstruct accepted vs active/frozen transaction state.
6. Load `docs/PROJECT_STATE.md`, `docs/OWNER_CHECKPOINTS.md`, campaign/source/tests only when needed to verify a named question.

If `docs/HANDOFF.md` declares orchestrator takeover/freeze, obey its takeover gates before product writes.

### Bounded implementer

Only if `docs/IMPLEMENTER_TASK.md` is ACTIVE:

1. Resolve the named work-branch tip and compare it with the **CONTROL TIP supplied by the orchestrator handoff**.
2. Read this file.
3. Read `docs/IMPLEMENTER_TASK.md`.
4. Satisfy its `EXECUTION MODE` prerequisite before broad technical work.
5. Inspect only files directly required by the one task question.

`docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md` is reference material; a bounded implementer need not preload it when the task is complete.

Do not preload `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, old baselines, archived branches or old chat history unless one exact item is explicitly authorized.

Do not use personal-context/chat-history recovery as ordinary implementation evidence. If accidentally exposed to such context, independently re-derive any relevant claim from allowed current evidence.

If `IMPLEMENTER_TASK.md` is INACTIVE/FROZEN, **there is no implementer task**. Do not infer one from branch contents or chat history.

## 6. Remote identity — before every GitHub write

Verify from current GitHub data:

```text
repository
target branch
exact 40-character tip
exact tree
intended operation
```

Writes must be bounded fast-forward descendants of the verified tip. Stop on unexpected movement or identity mismatch. Never force-push as routine recovery.

## 7. Local execution / execution packet

Canonical checkout claims require explicit repo/ref/tree/worktree identity.

A bounded implementer may instead receive an exact source ZIP as an execution mirror. A GitHub Download ZIP has no `.git`; remote GitHub ref/SHA remains write authority.

If a task says `SOURCE_ZIP_REQUIRED` and the source packet is missing, ask for the exact ZIP early. Do not spend long periods on private-clone, `gh`, DNS or archive workarounds.

When local execution bytes are later written through GitHub, verify **candidate bytes == tested bytes** before claiming the tests for the candidate.

If the exact dependency/toolchain remains unavailable, execute only what remains valid and classify results as supplemental rather than canonical.

Never substitute another JV/Box3D folder.

## 8. Branch lifecycle

Long-lived:
- `main`;
- one frozen pre-cleanup archive ref;
- explicitly retained historical/salvage refs documented in `docs/BRANCH_ROLES.md`.

Temporary work branches exist only when isolation has a concrete benefit. Do not create branches per agent/conversation.

Every temporary branch needs:
- one narrow purpose;
- exact parent/control tip;
- acceptance/rejection condition;
- explicit cleanup/integration/abandonment point.

Exploratory history need not be copied verbatim to `main`; a clean independently verified final integration is allowed.

A work branch may remain **temporarily frozen** across an orchestrator handoff when owner acceptance is only partial and its exact evidence must remain stable. Record that exception explicitly; do not turn it into a permanent development branch.

Operational branch budget remains `<= 6` normal retained refs excluding the one frozen archive, plus at most one justified temporary branch. More than 8 total remote branches requires triage before new branch creation.

## 9. Work slicing and owner checkpoints

Prefer one mechanically or visually attributable question at a time.

```text
narrow mechanism/constraint
-> automatable evidence
-> exact stable candidate
-> one focused owner observation
-> ACCEPT / PARTIAL / REJECT
-> record checkpoint
-> freeze accepted constraint
```

The unit of acceptance may be one DOF/relationship, not an entire asset/package.

For geometry recovery explicitly separate:

```text
position X/Y/Z
orientation/frame
asset geometry/scale
live ownership/articulation
```

Do not reopen accepted constraints merely because a downstream mechanism is still wrong.

Record meaningful owner verdicts in `docs/OWNER_CHECKPOINTS.md`.

## 10. Validation tiers

Tier 1 — private slice: exact identity + focused checks + smallest relevant smoke.

Tier 2 — owner visual/feel/device checkpoint: agent completes automatable validation; Jozz answers only the question automation cannot.

Tier 3 — public release candidate: reproducible source/artifact/provenance/rollback + live Pages smoke.

A harness/operator failure is not automatically a product failure.

## 11. Public and physics boundaries

Published `release/r0` is immutable. R1 must be a new artifact with exact source/artifact/rollback identity. Private scan bytes must never leak into public output.

Browser `legacy_ts_m6` is a reference browser fixture, not native JV parity/product-physics authority. Do not invent/tune final native drivetrain/suspension/tire/steering physics in TypeScript and call it JV authority.

## 12. Context-control documents

One purpose per document:

- `AGENTS.md` — stable operating constitution;
- `AI_PROJECT_MEMORY.md` — short router;
- `docs/PROJECT_STATE.md` — accepted/current project boundary;
- `docs/HANDOFF.md` — active/frozen orchestrator transaction checkpoint;
- `docs/OWNER_CHECKPOINTS.md` — durable owner verdict ledger;
- `docs/IMPLEMENTER_TASK.md` — one ACTIVE task or explicit INACTIVE/FROZEN state;
- `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md` — stable split-execution protocol;
- `docs/OWNER_VEHICLE_RECOVERY_CAMPAIGN.md` — campaign dependency/evidence contract;
- `docs/baselines/` + Git history — cold exact evidence.

Do not create dated handoff stacks for ordinary conversation changes. Do not duplicate chronological narratives across current-state documents.

## 13. Context health / orchestrator migration

Do not wait for context failure.

Migration is recommended when old hypotheses begin competing with current truth, repeated recap becomes necessary, or a new subsystem would require broad archaeology.

At a safe transaction boundary:

1. stop new implementation;
2. freeze exact work/candidate refs;
3. record latest owner verdict and negative memory;
4. set `IMPLEMENTER_TASK.md` INACTIVE;
5. compact `HANDOFF.md` to current semantic truth;
6. start a fresh orchestrator with no product writes;
7. validate state reconstruction and first task packet before handing over control.

Conversation continuity is expendable. Exact Git/evidence continuity is not.

## 14. Stop conditions

Stop and investigate when:

- public R0 would be modified in place;
- private assets may leak public;
- native/product authority is claimed without evidence;
- accepted owner-visible constraints would change outside declared scope;
- release identity/rollback is not exact;
- a historical branch is being wholesale-merged because it has more code;
- validation/documentation machinery expands without proportional product value;
- Jozz is asked to perform technical work the agent can do;
- an active task grows too broad for attributable owner feedback;
- an implementer tries to continue while `IMPLEMENTER_TASK.md` is INACTIVE;
- a fresh orchestrator cannot reconstruct accepted vs frozen transaction state without old-chat archaeology.

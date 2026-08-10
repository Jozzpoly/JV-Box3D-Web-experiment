# JV Web — agent operating contract

Updated: 2026-08-10
Campaign: **R1 friend-demo / long-running owner-directed development**
Owner: Jozz

This file is the first operational authority for agents working in this repository. It is intentionally stable. Current Git/evidence and direct owner observation still win when they contradict documentation.

## 1. Repository scope

```text
Jozzpoly/JV-Box3D-Web-experiment
  = PRIVATE SOURCE / ACTIVE DEVELOPMENT LAB

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC ARTIFACT / GITHUB PAGES SURFACE

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY REFERENCE FOR THIS CAMPAIGN
```

Do not modify native JV or published R0 unless Jozz explicitly changes scope.

## 2. Owner goal

Build a browser version that increasingly feels like a real piece of Jozz's game and is worth launching, driving, tuning and showing to friends.

Priority is adaptive. Owner play/feel may reorder otherwise valid engineering work. Do not follow a stale roadmap merely because it is documented.

## 3. Evidence vocabulary

Keep these distinct:

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

When evidence conflicts, prefer:

```text
1. current Git/current code/live runtime
2. raw exact execution evidence + direct owner observation
3. exact recovered source snapshots
4. durable baseline/contract documentation
5. historical plans/handoffs
6. current interpretation/hypothesis
```

## 4. Role-aware bootstrap / context control

Do not preload repository history.

### Orchestrator or unspecialized fresh agent

1. Resolve current private/public refs.
2. Read this file.
3. Read `AI_PROJECT_MEMORY.md`.
4. If continuing active work, read `docs/HANDOFF.md`.
5. Inspect only source/tests directly needed to answer the active question.
6. Load `docs/PROJECT_STATE.md`, baselines or history only on demand.

### Bounded implementer

If `docs/IMPLEMENTER_TASK.md` names an active task/branch, use the smaller bootstrap:

1. Resolve the named work-branch tip and compare it with the exact SHA supplied by the orchestrator handoff.
2. Read this file.
3. Read `docs/IMPLEMENTER_TASK.md`.
4. Satisfy the task's `EXECUTION MODE` prerequisite **before** broad technical work.
5. Inspect only files explicitly named by the task or directly required by its one technical question.

`docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md` is a reference for orchestration and ambiguity; a bounded implementer does **not** need to preload it when `IMPLEMENTER_TASK.md` is complete.

Do not preload `AI_PROJECT_MEMORY.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, old baselines, archived branches or old chat history unless the active task explicitly names one exact item.

Do not use `personal_context`, conversation-memory recovery, `summary_reader`, broad File Library/history search or similar mechanisms to reconstruct project history during a bounded implementer task unless the task explicitly authorizes one named historical query. If accidentally exposed to such context, independently re-derive any relevant claim from allowed current evidence before using it.

If a fresh agent needs old-chat archaeology to know what to do next, the handoff system has failed and should be repaired before broad implementation.

## 5. Remote identity — before every GitHub write

Verify from current GitHub data:

```text
repository
target branch
exact 40-character tip
exact tree
intended operation
```

Writes must be bounded fast-forward descendants of the verified tip. Stop on unexpected movement or identity mismatch. Never force-push as routine recovery.

## 6. Local execution identity / execution packet

A canonical local build/test/artifact claim from a real checkout requires explicit identity:

```text
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short --branch
```

A bounded implementer may instead receive an owner-uploaded **exact source ZIP** as an execution mirror. A GitHub Download ZIP has no `.git`; do not pretend it proves commit identity. Remote GitHub ref/SHA remains write authority, while the ZIP exists only to make source inspection/execution practical.

If `IMPLEMENTER_TASK.md` says `SOURCE_ZIP_REQUIRED` and the archive is not attached, stop early after remote identity verification and ask Jozz for the exact ZIP of the named work branch. Do not spend a long time attempting private clones, `gh` workarounds, DNS fixes or archive reconstruction.

If changes are tested in a local execution mirror and then written through the GitHub connector, verify that the final candidate's changed files match the locally tested bytes/content before claiming those tests for the candidate.

Do not substitute another JV/Box3D folder. Use isolated/disposable workspaces when Windows execution is genuinely required.

If an exact dependency/toolchain is still unavailable after the source is present, finish source-level work that remains valid and report the smallest missing environment/input. Supplemental execution must not be promoted to canonical evidence.

## 7. Branch lifecycle

`main` is the long-lived private source authority.

`archive/pre-cleanup-2026-08-10` is one frozen history-retention ref created during the 2026-08-10 cleanup. It is not a development base and must not be inspected by default. Do not create additional archive refs merely to preserve branch names; Git history, exact SHAs and durable baselines are the normal archive system.

Use a temporary work/candidate branch only when isolation has a concrete benefit. Do not create per-agent branches. A temporary branch must have:

- one narrow purpose;
- an exact parent;
- a clear acceptance/rejection condition;
- a cleanup point after integration or abandonment.

After a slice is accepted, integrate the reviewed result into `main` and remove redundant temporary branches. A work branch may contain exploratory/revision commits; `main` does not need to preserve that noisy sequence if the orchestrator can prove and integrate an exact reviewed final diff/tree cleanly.

Operational branch budget, excluding the single frozen archive ref: **<= 6**. Current steady state is five operational retained refs plus the one frozen archive ref. One justified temporary branch may therefore raise the physical remote-ref count from 6 to 7. More than 8 total remote branches requires explicit cleanup before new branch creation.

See `docs/BRANCH_ROLES.md`.

## 8. Work slicing and owner checkpoints

Prefer one mechanically or visually attributable question at a time.

For owner-sensitive work:

```text
narrow mechanism
-> automatable evidence
-> stable playable candidate
-> one focused owner observation
-> record checkpoint
-> freeze accepted scope
-> next mechanism
```

Do not treat an entire multi-asset vehicle package as the unit of feedback merely because the generator produces one package.

After owner acceptance, record the durable checkpoint in `docs/OWNER_CHECKPOINTS.md`: exact source, artifact identity, changed scope, owner verdict, protected scope and remaining issue.

## 9. Validation tiers

### Tier 1 — ordinary private slice

Use exact branch identity, focused tests/checks for the changed subsystem and the smallest relevant browser smoke. State what was not tested.

### Tier 2 — owner feel/visual/device checkpoint

Agent performs all automatable validation first. Jozz only needs to look/drive/feel and answer the specific question automation cannot answer.

### Tier 3 — public release candidate

Use reproducible source/artifact/provenance/rollback discipline and live Pages smoke. Do not recreate release ceremony for every private commit.

A harness/operator failure is not automatically a product failure.

## 10. Current public boundary

Published R0 is immutable. Never edit its bytes in place.

A later public R1 is a new artifact with its own source identity, artifact identity and rollback point. Private scan bytes must never enter a public artifact accidentally.

## 11. Physics authority

Current browser `legacy_ts_m6` is a reference browser fixture, not native JV parity and not product-physics authority.

Do not invent/tune final native drivetrain, suspension, tire/contact or steering physics in TypeScript and present it as JV authority. A bounded port of an already-existing native mechanism may be evaluated when explicitly selected.

## 12. Context-control rules

- One current-state document: `docs/PROJECT_STATE.md`.
- One rolling continuation note: `docs/HANDOFF.md`.
- One owner checkpoint ledger: `docs/OWNER_CHECKPOINTS.md`.
- One short navigation memory: `AI_PROJECT_MEMORY.md`.
- One active implementer contract when split execution is used: `docs/IMPLEMENTER_TASK.md`.
- One stable orchestrator/implementer execution protocol: `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md`.
- Historical exact proof belongs in `docs/baselines/` or Git history.
- Do not create dated handoff stacks for ordinary conversation changes.
- Do not duplicate current-state paragraphs across several documents.
- Update documentation when a fact changes authority level, branch role, owner acceptance or next-step meaning — not after every tiny edit.

## 13. Stop conditions

Stop and investigate when:

- public `release/r0` would be modified in place;
- private assets would leak into a public artifact;
- native parity/product authority is claimed without evidence;
- accepted owner-visible behavior would be changed outside the declared slice;
- a release cannot be tied to exact source/artifact/rollback;
- a historical branch is being wholesale-merged because it contains more code;
- validation/foundation/documentation machinery expands without proportional product value;
- Jozz is being asked to perform technical work the agent can do itself;
- the active task becomes too broad to attribute owner feedback.

## 14. Orchestrator / implementer split

When an active `docs/IMPLEMENTER_TASK.md` exists, `docs/ORCHESTRATOR_IMPLEMENTER_PROTOCOL.md` defines the full coordination model.

Core rules:

```text
orchestrator owns scope / truth / review / integration
implementer owns bounded technical execution
owner owns product intent / visual-feel acceptance
```

The implementer writes only the named work branch and never integrates `main`. During an active implementer slice, `main` is frozen for ordinary orchestrator writes so the branch can remain a controlled descendant. The implementer may choose its solution freely inside the declared blast radius, but must stop instead of silently expanding into a protected subsystem.

The implementer conversation is disposable. Preserve continuity in exact Git identity, the active task packet, execution packet when required, and a compact return report rather than relying on a long chat transcript.

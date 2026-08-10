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

## 4. Minimal fresh-agent bootstrap

Do not preload the repository's history.

1. Resolve current private/public refs.
2. Read this file.
3. Read `AI_PROJECT_MEMORY.md`.
4. If continuing active work, read `docs/HANDOFF.md`.
5. Inspect only source/tests directly needed to answer the active question.
6. Load `docs/PROJECT_STATE.md`, baselines or history only on demand.

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

## 6. Local execution identity

A canonical local build/test/artifact claim requires a complete clean checkout and explicit identity:

```text
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short --branch
```

Do not substitute another JV/Box3D folder. Use isolated/disposable workspaces when Windows execution is genuinely required.

If environment/connector limits block required files or exact source, finish all independent work first and then ask Jozz for the smallest exact file/archive needed. Do not spend long periods on brittle workarounds when a direct upload solves the problem.

## 7. Branch lifecycle

`development/jv-web-r1` is the long-lived private source authority.

Use a temporary work/candidate branch only when isolation has a concrete benefit. Do not create per-agent branches. A temporary branch must have:

- one narrow purpose;
- an exact parent;
- a clear acceptance/rejection condition;
- a cleanup point after integration or abandonment.

After a slice is accepted, fast-forward/integrate it into `development/jv-web-r1` and remove redundant temporary branches. Git history, baseline docs and exact SHAs are the archive; branch names are not an archive system.

Target branch budget: **<= 6 total private branches**. More than 8 requires explicit cleanup before new branch creation.

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

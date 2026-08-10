# JV Web — branch roles and lifecycle

Updated: 2026-08-10

Branch names are workflow pointers, not project memory. Exact commits, owner checkpoints and current-state documents carry durable meaning.

## Long-lived authority

### `main`

**ACCEPTED / INTEGRATED PRIVATE PRODUCT AUTHORITY AND DEFAULT BRANCH.**

Fresh agents resolve its live tip before writes. Do not maintain another permanent development branch merely to separate “real work” from the default branch.

## Frozen archive ref

### `archive/pre-cleanup-2026-08-10`

**FROZEN HISTORY RETENTION — NEVER AN ACTIVE DEVELOPMENT BASE.**

```text
commit: ee77c4760a08a739a712fec5418e3489746ad63d
tree:   37fe95af17cb21836cadc552830d55e6889048c1
```

Open only for a named historical/salvage question that current source/baselines cannot answer.

## Preserved historical evidence/salvage refs

- `product/jv-web-car-map-scan` — retained c8e0 scan evidence lineage;
- `repair/jv-web-release-r0` — closed private R0 repair/release lineage;
- `candidate/jv-web-owner-vehicle-visual-r1` — frozen early owner-vehicle tooling salvage;
- `candidate/jv-web-render-host-r1` — frozen render-host experiment salvage.

Do not inspect by default.

## Frozen handoff transaction

### `work/owner-rig-s1-attachment-authority`

Current handoff freeze:

```text
tip:  393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
state: FROZEN — NO WRITES DURING ORCHESTRATOR HANDOFF
```

Purpose: preserve exact S1-A..D experimental evidence and the owner-accepted **static FL upper-wishbone constraint** while the project is handed to a fresh orchestrator.

This branch is **not a second source authority** and is **not automatically mergeable**. The latest owner acceptance is narrower than the entire experimental branch.

The new orchestrator must first complete takeover gates in `docs/HANDOFF.md`. Afterward it may:

- integrate a clean reviewed subset/result into `main`;
- continue the same topic only after explicitly reopening a bounded task;
- or record evidence and abandon/delete the branch if a cleaner integration supersedes it.

Do not create another S1 archive branch merely to preserve this ref.

## Temporary branch rules

Allowed when isolation is justified:

```text
work/<bounded-topic>
candidate/<owner-checkpoint-or-release-candidate>
```

No `agent/*` branches.

Every temporary branch needs one narrow purpose, exact parent/control tip, acceptance/rejection condition and cleanup point.

Git history + exact SHA + checkpoint documentation are normal archival mechanisms. Branch names are not memory.

## Branch budget

Normal retained operational refs excluding the single frozen archive: **5**.

The frozen S1 work transaction temporarily makes **6 operational refs + 1 archive = 7 total remote refs**.

This is within budget and should return to steady state after handoff/integration/abandonment.

More than 8 total remote branches requires branch triage before any new branch creation.

## Durable cleanup rule

The 2026-08-10 cleanup reduced a 23-branch state to a controlled set.

Do not recreate branch cemetery. Preserve facts in current documents, exact SHAs, Git ancestry and owner checkpoints; delete temporary branch names when their transactional purpose is complete.

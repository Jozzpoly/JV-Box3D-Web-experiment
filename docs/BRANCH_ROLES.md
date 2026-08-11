# JV Web — branch roles and lifecycle

Updated: 2026-08-11
Status: **CURRENT**

Branch names are workflow pointers, not project memory. Exact commits, current-state docs and owner checkpoints carry durable meaning.

## 1. Product authority

### `main`

**ACCEPTED / INTEGRATED PRIVATE PRODUCT AUTHORITY AND DEFAULT BRANCH.**

Resolve its live tip before every write. Do not treat any work/candidate/frozen branch as a parallel product authority.

Current fresh-rebuild bootstrap checkpoint at the time of this document update is a docs-only descendant of the accepted S1 product. Always resolve the live SHA rather than trusting this prose.

## 2. Active write transaction

### `work/front-corner-golden-rebuild-r1`

**ACTIVE / SINGLE WRITE AUTHORITY FOR S2-PORT.**

Purpose: rebuild the front-left corner from the owner-accepted authored/golden contract in `docs/IMPLEMENTER_TASK.md`.

Rules:

- branch starts from the exact orchestrator-supplied current `main` control tip;
- fresh implementer writes only here;
- no additional work/candidate branch is needed during this transaction;
- `main` is not updated by the implementer;
- owner gate + orchestrator review are required before promotion.

## 3. Cold technical evidence

### `work/owner-rig-s1-attachment-authority`

```text
tip:  393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
state: FROZEN / READ ONLY
```

Historical exact S1 technical evidence only. The accepted FL-upper result has already been curated into `main`; this ref is not a development base or a second source authority.

Open only if a named S1 regression question requires exact historical evidence.

## 4. Completed / cleanup-only refs

The following refs contain no current write authority:

- `work/owner-rig-s1-clean-integration` — completed clean-integration transaction; currently redundant with the old integrated S1 tip;
- `noop-should-not-create` — accidental no-op ref, no unique product state;
- `noop-should-not-create-2` — accidental no-op ref, no unique product state.

Delete these when an actual delete-ref operation is available. Do not reuse them for development or evidence.

## 5. Preserved historical / salvage refs

Do not inspect by default:

- `archive/pre-cleanup-2026-08-10` — frozen history retention;
- `product/jv-web-car-map-scan` — retained scan evidence lineage;
- `repair/jv-web-release-r0` — closed private R0 repair/release lineage;
- `candidate/jv-web-owner-vehicle-visual-r1` — frozen early owner-vehicle tooling salvage;
- `candidate/jv-web-render-host-r1` — frozen render-host experiment salvage.

These refs are not current authority and are never an automatic merge source.

## 6. Temporary branch policy

Allowed only when isolation has a concrete benefit:

```text
work/<bounded-topic>
candidate/<owner-checkpoint-or-release-candidate>
```

No `agent/*` branches.

Every temporary branch needs one narrow purpose, exact parent/control tip, acceptance/rejection condition and cleanup point.

## 7. Branch-budget exception currently in effect

Normal policy remains: more than 8 total remote branches requires triage before creating another branch.

The repository is temporarily above that budget because three completed/accidental refs cannot currently be deleted through the available connector. This is **cleanup debt, not permission to keep creating branches**.

For S2-PORT:

- branch triage has already occurred;
- `work/front-corner-golden-rebuild-r1` is the one justified active transaction;
- create **no additional remote branch** unless the orchestrator explicitly replans the transaction.

## 8. Durable cleanup rule

Do not recreate branch cemetery. Preserve facts in current Git, exact SHAs and owner checkpoints. Delete completed temporary refs when proper delete-ref tooling is available.

A branch name never outranks current source, current owner truth or exact evidence.

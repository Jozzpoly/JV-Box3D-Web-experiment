# JV Web — branch roles and lifecycle

Updated: 2026-08-13
Status: **CURRENT**

Branch names are workflow pointers, not project memory or mechanical authority. Exact commits, current state docs and owner checkpoints carry durable meaning.

## 1. Product authority

### `main`

**ACCEPTED / INTEGRATED PRIVATE PRODUCT AUTHORITY AND DEFAULT BRANCH.**

Current control tip for this transaction: `97055331a2eef8bdbf8411db243417591731e664`.

Resolve its live tip before every write. Work branches are not parallel product authority.

## 2. Active R1 transaction

### `work/front-corner-golden-rebuild-r2`

**ACTIVE / SINGLE WRITE TRANSACTION FOR CURRENT R1 VEHICLE WORK.**

The word `golden` is historical branch naming. It does **not** mean the branch, M5/M6, latest native rig, current carrier topology or current steering law is golden architecture.

Current purpose:

- preserve S1/S2 owner checkpoints;
- checkpoint the owner-accepted **temporary** R1 driving bridge;
- keep deferred rig/mating debt explicit;
- run bounded steering research only after the temporary product baseline is protected.

Rules:

- write only after re-resolving live `main` and work tip;
- no additional remote branch unless a concrete isolation/replan need appears;
- private `main`, public R0 and native JV are not modified by this transaction;
- experimental physical steering remains disposable until separately justified;
- owner acceptance of a temporary bridge never promotes its implementation details to future architecture.

## 3. Cold S1 technical evidence

### `work/owner-rig-s1-attachment-authority`

```text
tip: 393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908
state: FROZEN / READ ONLY
```

Open only for a named S1 regression question. Accepted S1 behavior already belongs to the current product history.

## 4. Completed / cleanup-only refs

Do not reuse as development bases:

- `work/front-corner-golden-rebuild-r1` — abandoned pre-handoff transaction;
- `work/owner-rig-s1-clean-integration` — completed integration transaction;
- `noop-should-not-create` and `noop-should-not-create-2` — accidental no-op refs.

Delete when proper delete-ref tooling is available.

## 5. Preserved historical / salvage refs

Do not inspect by default:

- `archive/pre-cleanup-2026-08-10`;
- `product/jv-web-car-map-scan`;
- `repair/jv-web-release-r0`;
- `candidate/jv-web-owner-vehicle-visual-r1`;
- `candidate/jv-web-render-host-r1`.

They are historical/salvage evidence only, never automatic merge or authority sources.

## 6. Temporary branch policy

Create a temporary branch only when isolation has a concrete benefit:

```text
work/<bounded-topic>
candidate/<owner-checkpoint-or-release-candidate>
```

No `agent/*` branches. Every temporary branch needs one narrow purpose, exact parent/control, acceptance/rejection condition and cleanup point.

The repository remains above the preferred branch budget because old refs cannot currently be deleted through the available connector. That is cleanup debt, not permission to multiply branches.

## 7. Durable rule

A branch name never outranks current source, direct owner evidence or reproducible experiments.

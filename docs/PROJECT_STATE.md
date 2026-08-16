# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `P1 ACCEPTED / MAINTENANCE VALIDATION ACTIVE / EXACT GATE PENDING / PRODUCT ROADMAP PARKED / JURE PAUSED`

## 1. Authority

Private source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`. Resolve moving refs before writes. Git/current source, actually executed validation and direct Owner observation outrank documentation and branch names.

Durable anchors:

```text
P1 promoted evidence: 2b12a2fa99d49ebe4d748ed851c194825129d38f
Owner-tested P1 source: c9b5990b226685abe35851fc5e9496323096ecf7
Public Friends: Jozzpoly/JV-Box3D-Web-Public release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
Private pre-P1 rollback: rollback/main-before-p1-foundation-2026-08-16 -> f8eb0908f5934aed2d504f34ce483a02754039ec
Immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

## 2. Accepted product foundation

P1 Owner acceptance covers the working desktop/mobile foundation: Plac E2R, Offroad, owner vehicle, approved JSPREV2, Camera Manual Rig V1, Fullscreen V1, current X-only analog steering `POSITION` reference, analog pedals, fixed-step/timestamped inputs, independent throttle/brake ownership, fail-closed lifecycle handling, D/R behavior and the tested Galaxy A53 / Chrome render-1x performance boundary.

Evidence: Owner-tested source passed 48/48 focused P1 checks + TypeScript + normal production build. Promotion candidate passed 444/444 complete repository tests, portable/build identity checks and 0 production dependency vulnerabilities.

P1 is not final UX/rig/handling. Product-roadmap work is deliberately parked for the current maintenance/foundation conversation; do not start P1.2/P2 or later polish until the Owner explicitly returns to product work.

## 3. Neutral rig consumer foundation

JV `main` owns a small read-only consumer-side neutral rig seam:

- `src/vehicle/neutral-mechanism.ts` — engine-neutral bodies/frames/relations and explicit `jv-rig-space/v1`;
- `src/vehicle/m6/m6-neutral-geometry.ts` — read-only current procedural M6 front-left coherent double-wishbone projection;
- `tests/jure-neutral-geometry.test.mjs` — geometry/provenance/authority checks;
- `tests/jure-neutral-graph-invariants.test.mjs` — unique identity, valid graph references, finite neutral data, unit quaternions, coherent cross-body relations, coincident relation endpoints and revolute-axis compatibility;
- `tools/write-jure-neutral-geometry-receipt.mjs` — deterministic diagnostic receipt exporter;
- `npm run export:jure-neutral-geometry` — diagnostic export;
- `npm run gate:neutral-rig-foundation` — repo-owned exact foundation gate.

The seam does **not** feed Box3D, replace runtime hardpoints, change Friends or define the future JURE authored schema. Current production entry remains independent of it.

### Validation boundary

Current neutral foundation classification is:

`SOURCE-VALIDATED / EXACT EXECUTION GATE PENDING`

Do not inherit the earlier `fd84fcf4...` full Windows PASS onto current `main`.

Two owner-side gate attempts on 2026-08-16 against `81c7c14...` stopped before dependency installation/project validation: V1 exposed a Windows PowerShell stderr/error-stream harness defect; V2 then reached the repository gate and exposed direct `spawnSync("npm.cmd")` incompatibility on Windows. These are validation-tooling failures, not neutral-rig or product failures. The current gate uses an explicit Windows command-shell path for npm, but that fix itself remains execution-pending until the exact current commit completes the gate.

The repo-owned gate performs: exact `npm ci`, strict TypeScript, focused neutral geometry/provenance + graph-invariant tests, deterministic double export, exact producer/factory Git blob/SHA-256 checks, wrong-origin falsifier, dirty tracked-source falsifier using an isolated temporary Git index, full `npm run check`, production bundle, neutral-seam leak scan and final repository cleanliness.

A planned gate or its source code is not execution evidence. Upgrade the classification only after `npm run gate:neutral-rig-foundation` actually completes on the exact current commit and its output is retained.

## 4. JURE boundary

JURE is intentionally paused. It remains future Owner-authored rig authority; JV remains runtime physics/controls/rendering authority.

Preserved JURE anchors:

```text
accepted JURE main: d971b8bef5dd7c65b78884b6b449e1f5ab0e7425
clean foundation candidate / closed PR #3: 4db04eee4da0216f6bd3df6b6b0c82aa20afab5a
paused real-JV authoring / closed PR #4: checkpoint/paused-jv-authoring-2026-08-16@f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Durable rule: procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never create a partial hybrid. First coherent future replacement target remains chassis reference + upper/lower arms + carrier reference + 2 inboard revolutes + 2 outboard spherical relations. Strict schema/provenance/units/basis/placement and neutral geometry coherence precede Box3D substitution.

## 5. Publication state

`Jozzpoly/JV-Box3D-Web-Public` is artifact-only. Its `main` is a documentation/control plane, not the deployed application. GitHub Pages is already served from `release/friends-r1` root with HTTPS enforcement. The live Friends artifact remains `a325c279...`; maintenance work in the private repository has not changed it.

The public control-plane documentation was re-grounded on the live Friends model on 2026-08-16. Do not resurrect the old claim that Pages or the application artifact are still pending.

## 6. Branch hygiene

Private steady-state target is **main-only**. Two historical JURE-preparation refs still physically exist at `7ff1c73...`, but they are not authority; their useful result is in `main`/closed PR evidence. Retire them when branch deletion is available.

Public `release/friends-r1`, `release/r0` and documentation `main` have distinct durable roles. Eight public `checkpoint/*` refs are confirmed ancestors of current Friends and therefore contain no divergent unique history; retire those redundant branch refs when deletion is available.

Do not create new branches/checkpoints as conversation markers or trophies. Use a temporary branch only for a concrete isolation/rollback need.

## 7. Current maintenance scope

Allowed work in the current conversation: repository organization, documentation grounding, validation infrastructure, technical invariant gaps, provenance/authority hardening and non-product cleanup.

Do not change product behavior, mobile layout, controls, physics, renderer, scan presentation or roadmap semantics in this maintenance pass.

The parked product sequence remains preserved for later Owner-directed resumption:

`P1.2 HUD composition -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait composition`

Historical note: `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md` and `docs/MOBILE_DRIVING_ROADMAP_READINESS_AUDIT_2026-08-16.md` record the pre-P1 investigation boundary and contain refs/findings that were current at that time. Preserve them as technical evidence, but do not treat their old alpha refs, readiness blockers or proposed closure steps as current project state. This file is the current-state authority.

## 8. Fresh-agent entry

Read:

1. `AGENTS.md`
2. this file
3. `docs/HANDOFF.md` only for takeover snapshot context
4. source/tests for the chosen maintenance task

Do not restart recovery archaeology, old Camera/Fullscreen reconstruction, P1 CSS repair, old Friends overlay work, accepted-A53 micro-optimization, private Actions workaround machinery or speculative JURE runtime substitution without new evidence.
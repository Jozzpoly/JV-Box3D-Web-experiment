# JV Web — current project state

Updated: 2026-08-17
Owner: Jozz
Status: `P1 ACCEPTED / MAINTENANCE FOUNDATION CLOSED / PRODUCT ROADMAP PARKED IN THIS CONVERSATION / JURE PAUSED`

## 1. Authority and durable anchors

Private source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`. Git/current source, actually executed validation and direct Owner observation outrank documentation and branch names.

```text
P1 promoted evidence: 2b12a2fa99d49ebe4d748ed851c194825129d38f
Owner-tested P1 source: c9b5990b226685abe35851fc5e9496323096ecf7
Public Friends: Jozzpoly/JV-Box3D-Web-Public release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
Private pre-P1 rollback: rollback/main-before-p1-foundation-2026-08-16 -> f8eb0908f5934aed2d504f34ce483a02754039ec
Immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
Neutral-foundation exact Windows PASS anchor: 3606e59368cac47d2fa7c505dbe4b5875a6a6c48
```

## 2. Accepted product foundation

P1 Owner acceptance covers the working desktop/mobile foundation: Plac E2R, Offroad, owner vehicle, approved JSPREV2, Camera Manual Rig V1, Fullscreen V1, current X-only analog steering `POSITION` reference, analog pedals, fixed-step/timestamped inputs, independent throttle/brake ownership, fail-closed lifecycle handling, D/R behavior and the tested Galaxy A53 / Chrome render-1x performance boundary.

P1 is not final UX/rig/handling. This maintenance conversation does not advance P1.2/P2 or later product work.

## 3. Neutral-rig consumer foundation — CLOSED

JV owns a dormant/read-only consumer-side neutral rig seam:

- `src/vehicle/neutral-mechanism.ts` — engine-neutral bodies/frames/relations and explicit `jv-rig-space/v1`;
- `src/vehicle/m6/m6-neutral-geometry.ts` — read-only projection of the current procedural M6 front-left coherent double-wishbone;
- geometry/provenance tests and graph invariants;
- deterministic receipt exporter with exact producer/factory Git blob/SHA-256 provenance;
- fail-closed canonical-origin and tracked-source guards;
- repo-owned exact gate: `npm run gate:neutral-rig-foundation`.

The seam does **not** feed Box3D, replace runtime hardpoints, change Friends or define the future JURE authored schema.

### Exact execution evidence

Owner-side Windows V5 completed against exact commit:

```text
3606e59368cac47d2fa7c505dbe4b5875a6a6c48
Git 2.54.0.windows.1
Node 24.16.0
npm 11.17.0
```

Executed evidence:

- exact private clone, detached checkout and canonical origin verification PASS;
- `npm ci` PASS;
- strict TypeScript PASS;
- focused neutral geometry/provenance + graph-invariant tests: **8/8 PASS**;
- deterministic double receipt export and exact provenance checks PASS;
- wrong-origin fail-closed falsifier PASS;
- dirty tracked-source fail-closed falsifier PASS;
- full repository tests: **452/452 PASS**;
- documentation link audit PASS;
- third-party notice verification PASS;
- production Vite bundle + neutral-seam leak scan PASS;
- final exact HEAD preserved and Git tree clean;
- neutral receipt SHA-256: `a43d079b7803e39bfec42a6c5f15f838ef1f5b5ac5e06d7474d15493b4ed9bf0`.

Earlier V1/V2 failures were validation-harness defects; V4 exposed and falsified one over-broad test assertion. Do not restart those incidents as project failures.

The closure documentation commit after this anchor is documentation-only. The exact execution PASS belongs to `3606e593...`; do not transfer that PASS across future source/test/dependency changes.

## 4. Security/dependency evidence

The V5 run captured npm audit evidence separately from the neutral-rig verdict:

- production-only (`npm audit --omit=dev`): **0 vulnerabilities**;
- all dependencies: **1 high**, transitive dev dependency `nanoid`, GHSA-2v37-7h3g-55p8 / CVE-2026-67213;
- this finding is build/dev-toolchain debt, not current public-runtime exposure.

Do not run `npm audit fix` blindly. Resolve it during a deliberate dependency-maintenance slice and revalidate any resulting lockfile/toolchain change.

## 5. JURE boundary

JURE remains intentionally paused and remains future Owner-authored rig authority; JV remains runtime physics/controls/rendering authority.

```text
accepted JURE main: d971b8bef5dd7c65b78884b6b449e1f5ab0e7425
clean foundation candidate / closed PR #3: 4db04eee4da0216f6bd3df6b6b0c82aa20afab5a
paused real-JV authoring / closed PR #4: checkpoint/paused-jv-authoring-2026-08-16@f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Durable rule: procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never build a partial hybrid. First coherent future replacement target remains chassis reference + upper/lower arms + carrier reference + 2 inboard revolutes + 2 outboard spherical relations.

## 6. Publication state

`Jozzpoly/JV-Box3D-Web-Public` is artifact-only. Its `main` is documentation/control-plane; deployed Friends remains `release/friends-r1@a325c279...`. This maintenance pass did not change the deployed product.

## 7. Non-blocking maintenance debt

These are real findings but do **not** block resuming product development in a separate product continuation:

1. transitive dev-only `nanoid` advisory described above;
2. portable network-policy validation formally covers HTML/CSS but not general JavaScript network behavior;
3. two redundant private neutral/JURE branch refs and eight redundant public checkpoint refs remain because current connector lacks delete-ref capability;
4. Vite build reports the existing `box3d.js` `node:module` browser-externalization warning and a >500 kB main-chunk warning.

Do not turn these into an open-ended cleanup campaign without evidence that they impede the next product goal.

## 8. Parked product direction

Preserved sequence for later Owner-directed resumption:

`P1.2 HUD composition -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait composition`

Historical pre-P1 mobile audits remain evidence only; their old alpha refs/readiness blockers are not current state.

## 9. Fresh-agent entry

Read:

1. `AGENTS.md`
2. this file
3. `docs/HANDOFF.md` only for takeover snapshot context
4. source/tests for the explicitly selected next task

Do not restart neutral-foundation gate debugging, recovery archaeology, old Camera/Fullscreen reconstruction, P1 CSS repair, old Friends-overlay repair, accepted-A53 micro-optimization or speculative JURE runtime substitution without new evidence.

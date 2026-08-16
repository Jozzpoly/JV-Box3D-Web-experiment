# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `P1 ACCEPTED / MAIN ACTIVE / JV NEUTRAL RIG FOUNDATION IN MAIN / JURE PAUSED`

## 1. Current authority

Private source/product authority is the live `main` of:

`Jozzpoly/JV-Box3D-Web-experiment`

Resolve `main` live before every write. Git/current source, reproducible execution evidence and direct Owner observation outrank stale branch names or old chat history.

Durable accepted P1 evidence anchors:

```text
P1 main-promotion candidate:
  2b12a2fa99d49ebe4d748ed851c194825129d38f

Owner-tested P1 runtime source:
  c9b5990b226685abe35851fc5e9496323096ecf7

Public Friends artifact:
  Jozzpoly/JV-Box3D-Web-Public
  release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f

Private rollback before P1:
  rollback/main-before-p1-foundation-2026-08-16
  -> f8eb0908f5934aed2d504f34ce483a02754039ec

Immutable public fallback:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Later main commits after `2b12a2fa...` are documentation or explicitly scoped foundation work unless a later task changes product runtime.

## 2. Accepted P1 product foundation

Preserve unless a new evidence-backed task changes them:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- source-owned Friends runtime with obsolete public executable overlay removed;
- deterministic CSS ownership and short-mobile-viewport fixes;
- current X-only analog steering `POSITION` behavior as the working reference;
- analog pedals as the current functional foundation;
- Camera Manual Rig V1;
- Fullscreen V1;
- fixed-step/timestamped input architecture;
- independent throttle/brake multitouch ownership and fail-closed lifecycle release;
- D/R state and permissive D<->R-under-throttle behavior;
- accepted Galaxy A53 / Chrome / render-1x performance foundation for the tested scan case.

Owner-tested runtime `c9b5990b...` passed the focused P1 gate (48/48), TypeScript and normal production build. The final P1 promotion candidate `2b12a2fa...` passed the complete repository gate (444/444), portable/build identity checks and 0 production dependency vulnerabilities.

## 3. JV neutral rig consumer foundation

JV `main` now owns the small read-only neutral rig seam that was previously isolated on `jure/neutral-geometry-receipt`.

It consists of:

- `src/vehicle/neutral-mechanism.ts` — engine-neutral body/frame/relation representation plus explicit `jv-rig-space/v1` convention;
- `src/vehicle/m6/m6-neutral-geometry.ts` — current procedural M6 front-left double-wishbone projection;
- `tests/jure-neutral-geometry.test.mjs` — geometry equivalence and authority/provenance tests;
- `tools/write-jure-neutral-geometry-receipt.mjs` — deterministic cross-project diagnostic receipt exporter;
- `npm run export:jure-neutral-geometry` — canonical export entry point.

This foundation is deliberately read-only. It does not feed Box3D, replace runtime hardpoints, change Friends, or define the future JURE authored schema.

The receipt records exact JV producer commit, exact repository identity, factory-receipt path/Git blob/SHA-256 and explicit neutral coordinate convention. Export fails closed when tracked source differs from `HEAD` or `origin` does not identify the canonical JV-Web repository.

The purpose is to preserve current JV mechanical consumer truth in a form that a future Owner-authored JURE rig can be compared against without reverse-engineering runtime code.

## 4. Durable JURE boundary

JURE is intentionally paused, but remains the future authored-rig/Owner authoring authority. JV remains runtime physics/controls/rendering authority.

Preserved JURE anchors:

```text
accepted JURE main:
  d971b8bef5dd7c65b78884b6b449e1f5ab0e7425

clean validated foundation candidate / closed PR #3:
  4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

paused real-JV authoring checkpoint / closed PR #4:
  checkpoint/paused-jv-authoring-2026-08-16
  @f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Closed JURE PR #2 retains detailed recovery/foundation evidence.

Critical geometric result remains: current procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never create a partial hybrid by replacing one authored hardpoint/relation inside the incompatible procedural shape.

First coherent future target remains:

`chassis reference + upper arm + lower arm + carrier reference + 2 inboard revolutes + 2 outboard spherical relations`

Strict schema/provenance/units/basis/placement and neutral geometry coherence must precede any Box3D substitution.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md` when authored-rig work resumes.

## 5. Repository branch policy

The intended steady state is now **main-only**. Historical JURE preparation branches contain no authority that is not preserved in `main`, closed PR evidence or the separate JURE repository.

Do not keep checkpoint/work branches merely as trophies. Create a temporary branch later only for a concrete risky implementation/rollback reason, and remove it once its accepted result is in `main`.

## 6. Explicitly open product work

P1 is a foundation, not final mobile interaction/design.

Owner feedback keeps these open:

- mobile HUD composition remains crowded and insufficiently coordinated;
- portrait/rotated layouts need intentional composition rather than accidental fit;
- pedals must not obscure useful interface;
- pedal interaction should become absolute-position Y demand over frozen geometry: bottom/low touch = low demand, top/high touch = high demand, pointerdown emits immediately, vertical movement continuously changes demand;
- pedal feedback should become mechanical depression rather than progress-meter authority;
- steering visual language needs cleanup;
- current X-only steering behavior remains the reference while rotational steering is tested later as an isolated A/B experiment;
- final rig/steering geometry, Ackermann/tie rods and handling remain provisional.

Default continuation order if mobile polish is chosen:

1. P1.2 coordinated mobile HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals;
6. P3 mechanical pedal depression;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B;
9. P6 joint wheel/pedal industrial design and feel;
10. P7 intentional portrait composition.

## 7. Immediate continuation boundary

For the next JV task:

1. resolve live `main` and public Friends only as needed;
2. read `AGENTS.md` and this file;
3. do not reopen JURE unless the chosen task genuinely requires authored-rig work;
4. choose one owner-visible/product-relevant slice;
5. use the smallest relevant technical checks, then rendered/browser/device evidence for visible changes.

Do not restart source recovery, old Camera/Fullscreen reconstruction, P1 CSS ownership work, old public-overlay repair, accepted A53 performance micro-optimization, or private Actions workaround machinery without new evidence.

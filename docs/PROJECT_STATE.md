# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `P1 ACCEPTED / MAIN ACTIVE / JURE PAUSED / NO ACTIVE WORK LANE`

## 1. Current authority

Private source/product authority is the live `main` of:

`Jozzpoly/JV-Box3D-Web-experiment`

Resolve `main` live before every write. Git/current source, reproducible execution evidence and direct Owner observation outrank stale branch names or old chat history.

Durable accepted evidence boundary:

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

The later `main` commits after `2b12a2fa...` are grounding/current-state documentation only unless a later task explicitly changes product source.

## 2. Accepted P1 product foundation

The current foundation is backed by source/build evidence plus direct Owner desktop/phone use.

Preserve unless a new evidence-backed task changes them:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- source-owned Friends root with the obsolete public executable runtime overlay removed;
- deterministic CSS ownership and short-mobile-viewport fixes;
- current X-only analog steering `POSITION` behavior as the working reference;
- analog pedals as the current functional foundation;
- Camera Manual Rig V1;
- Fullscreen V1;
- fixed-step/timestamped input architecture;
- independent throttle/brake multitouch ownership and fail-closed lifecycle release;
- D/R state and permissive D<->R-under-throttle behavior;
- accepted Galaxy A53 / Chrome / render-1x performance foundation for the tested scan case.

Owner-tested runtime source `c9b5990b...` passed the focused P1 gate (48/48), TypeScript and normal production build. The final main-promotion candidate `2b12a2fa...` passed the complete repository gate (444/444), portable/build identity checks and 0 production dependency vulnerabilities.

## 3. Explicitly open product work

P1 is a foundation, not final mobile interaction/design.

Owner feedback keeps these open:

- mobile HUD composition is still crowded and insufficiently coordinated;
- portrait/rotated layouts need intentional composition rather than accidental fit;
- pedals must stop obscuring useful interface;
- pedal interaction should become absolute-position Y demand over frozen geometry: bottom/low touch = low demand, top/high touch = high demand, pointerdown emits immediately, vertical movement continuously changes demand;
- pedal feedback should become mechanical depression rather than a progress-meter metaphor;
- steering visual language needs cleanup;
- the current X-only steering behavior remains the reference while rotational steering is tested later as an isolated A/B experiment;
- final rig/steering geometry, Ackermann/tie rods and handling remain provisional.

Default continuation order if the Owner chooses mobile polish:

1. P1.2 coordinated mobile HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals;
6. P3 mechanical pedal depression;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B against the X-only reference;
9. P6 joint wheel/pedal industrial design and feel;
10. P7 intentional portrait composition.

Do not create a work branch until a concrete implementation slice actually starts.

## 4. JURE is intentionally paused

JURE is no longer an active parallel lane. Its work is preserved for future continuation when JV genuinely needs authored-rig tooling again.

JURE accepted baseline remains unchanged:

`Jozzpoly/Jozz-Universal-Rig-Editor main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Preserved JURE boundaries:

```text
clean foundation candidate / closed PR #3:
  promotion/foundation-ready-squash-2026-08-16
  @4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

paused real-JV authoring checkpoint / closed PR #4:
  checkpoint/paused-jv-authoring-2026-08-16
  @f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Both PRs were closed without merge. Closure is administrative pause, not rejection or deletion.

JV-side preparation is also preserved without promotion:

```text
paused seam / closed JV PR #25:
  jure/neutral-geometry-receipt
  @7ff1c73ac74c46bce29bd4a4bd68d672dc662ef1

frozen checkpoint:
  checkpoint/jure-neutral-receipt-paused-2026-08-16
  @7ff1c73ac74c46bce29bd4a4bd68d672dc662ef1
```

The earlier exact `fd84fcf4...` seam passed its canonical Windows gate including full 448/448 repository tests, typecheck, build, deterministic receipt and clean source. Later `7ff1c73...` hardened provenance, removed the remaining Box3D type dependency from the neutral projection and added tracked-dirty fail-closed export behavior, but **has not received a final canonical execution PASS for that exact SHA**. Do not promote it on the older gate claim.

## 5. Durable JV <-> JURE boundary

Preserve the architectural result even while JURE is paused:

- JURE owns authored neutral rig truth and Owner-operable authoring workflows;
- JV owns Box3D/runtime identities, dynamics/force laws, controls, rendering integration and public release behavior;
- current procedural M6 geometry is working consumer code, not authored mechanical authority;
- exact/JURE-authored wishbone geometry and current procedural M6 wishbone were proven not rigid-congruent;
- never create a hybrid by replacing one JURE hardpoint/relation inside the incompatible procedural wishbone;
- the first coherent future replacement target remains chassis reference + upper arm + lower arm + carrier reference + 2 inboard revolutes + 2 outboard spherical relations;
- no runtime substitution until an actual coherent JURE fragment passes strict parse, explicit placement and geometry/coherence validation.

The paused JV neutral receipt is diagnostic consumer-side lowering evidence, not the JURE authored file format and not a second generic rig schema.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md` only when cross-project work resumes.

## 6. Repository / branch state

There is currently **no active ordinary work lane** ahead of `main`.

The three accidentally recreated historical branch refs from the previous recovery are confirmed absent:

- `archive/pre-cleanup-2026-08-10`;
- `candidate/jv-web-owner-vehicle-visual-r1`;
- `candidate/jv-web-render-host-r1`.

Paused/checkpoint JURE refs are retained for a concrete recovery reason and are not active authority.

Steady-state rule remains: `main` plus at most one concrete temporary work lane. Do not create per-agent/per-conversation/per-test branches.

## 7. Immediate continuation boundary

The previous grounding/handoff/JURE-preparation stage is complete.

For the next JV task:

1. resolve live private `main` and public Friends only as needed;
2. read `AGENTS.md` and this file;
3. do not reopen JURE unless the chosen task genuinely requires authored-rig work;
4. choose one owner-visible/product-relevant slice;
5. create one work branch only when implementation begins;
6. use the smallest relevant technical checks, then rendered/browser/device evidence for visible changes.

Do not restart source recovery, old camera/fullscreen reconstruction, P1 CSS ownership work, old public-overlay repair, accepted A53 performance micro-optimization, or private Actions workaround machinery without new evidence.

Default next product lane is **mobile control/UI polish beginning with coordinated HUD zones and portrait/usable-interface composition**, before changing pedal semantics. The Owner may choose a different concrete lane.
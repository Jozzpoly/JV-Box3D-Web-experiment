# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `FOUNDATION CLEANUP / PRODUCT IMPLEMENTATION PAUSED`

## 1. Authority during cleanup

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active cleanup lane: work/foundation-cleanup
clean product base: e04539c5132cd67c17bcfad86b2c9ae39c07ab51
public Friends branch: release/friends-r1@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
public Friends tree: byte/tree-equivalent to owner-tested Steering V2@2acd652f68d57497c8ce8886b2875789a70f4be3
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`work/foundation-cleanup` is a temporary normalization transaction only. It was created directly from exact pre-V3 source `e04539c...`, not from the later V3/revert/rebuild history. No product implementation should resume until this cleanup boundary is closed.

Git/current source, reproducible execution evidence and direct owner observation outrank this file.

## 2. Protected product foundation

The clean base already contains the owner-accepted work that must survive cleanup:

- Friends browser foundation: Plac E2R, Offroad, owner vehicle and full approved JSPREV2 on desktop/phone;
- Performance foundation v1: owner-validated Galaxy A53 / normal Chrome / current full textured JSPREV2 / render scale 1x / culling ON;
- Camera Manual Rig V1: accepted manual orbit/pan/pinch/zoom/framing/inspection foundation;
- Fullscreen V1: owner-validated mobile + desktop;
- Steering Control V2: owner-accepted mobile steering foundation with design still open;
- recoverable mobile Debug;
- current temporary JV-Web steering range of approximately +/-35 degrees at the wheels.

Owner acceptance remains scoped. Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive, handling and final steering physics are not established here. JURE remains the authoring boundary for final rig geometry.

See `docs/OWNER_CHECKPOINTS.md` only when a scoped acceptance claim needs the durable evidence ledger.

## 3. Mobile driving target recovered from history

The next mobile-control implementation target is now explicit in:

`docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md`

Summary:

```text
STEERING
- preserve V2 one-thumb X-only POSITION [-1,+1]
- release/lifecycle loss -> neutral
- keep the current ~35-degree product bridge
- replace generic joystick/rack presentation with a shallow panoramic steering-wheel arc
- rotate/animate internal visual feedback without changing the fixed input hitbox

PEDALS
- independent analog THROTTLE and BRAKE
- pointer-down position = local 0
- relative upward travel -> 0..1
- freeze origin/travel geometry at pointer-down
- active pedal may grow/lift while its neighbor shrinks/dims, presentation only
- independent pointer ownership and multitouch

D/R
- compact state selector
- allow D<->R while throttle is held and at any speed for now
- no Neutral/release/speed interlocks unless real driving proves a need
- UI and command layer must share one authoritative direction state
```

This is a product target, not a claim that any previous V3 implementation is accepted.

## 4. What happened to V3

The V3 product concept was not owner-rejected. The first public device gate failed before meaningful driving with:

```text
Driving V3 pedal reset: expected source fragment not found
```

The failure class was brittle public delivery based on text surgery against compiled runtime. It is evidence against that harness architecture, not against analog pedals or the steering concept.

Historical source remains available for selective donor use:

```text
db61b661...  V3.1 analog foundation
e651209f...  V3.1 presentation
c0b3ed22...  V3.1 short-landscape hardening
8736a2b6...  later post-rollback rebuild tip
```

Do not restore one of these wholesale merely because it is newer. Reuse only source-backed ideas/tests that fit the recovered target and clean architecture.

## 5. Repository cleanup boundary

The repository currently has excessive historical branch refs. Cleanup policy:

1. `main` remains the only long-lived private product authority.
2. `work/foundation-cleanup` is the only active private lane during this transaction.
3. Old `work/*`, `candidate/*`, `repair/*`, `noop-*` and redundant `checkpoint/*` refs are historical only.
4. Valuable old branch tips have been captured in the archive ref/history before deletion.
5. After the clean foundation is validated and promoted, retire the cleanup lane and redundant historical branch names rather than keeping parallel authorities.
6. A future `checkpoint/*` is justified only by a concrete rollback/evidence need; once the same milestone is safely ancestral to `main` or another retained rollback ref, retire redundant checkpoint names.

The public repository remains an artifact/release surface. Keep `release/r0` immutable and `release/friends-r1` as the moving Friends line. Public checkpoint pruning is lower priority than private source cleanup and must not weaken rollback evidence.

## 6. Validation constraint during cleanup

Private GitHub Actions were attempted during branch cleanup and GitHub refused to start the job because the account's private Actions billing/spending limit currently blocks runners. No branch deletion occurred in that attempt.

Do not add more private cleanup/validation workflows as a workaround. This is an infrastructure constraint, not a product failure.

Before `main` is advanced through this foundation transaction, still require the exact repository toolchain boundary:

- Node 24.16.0;
- npm 11.13.x;
- lockfile dependencies;
- TypeScript/Vite versions pinned by the repository;
- real `box3d.js@0.0.2` coverage;
- `npm run check`;
- Friends/portable build checks;
- rendered smoke where relevant;
- exact source/artifact/rollback identity for publication.

## 7. Next sequence

Cleanup stage:

1. normalize current docs around the clean base and recovered mobile-control target;
2. audit branch ancestry and retain only the minimum useful private refs;
3. validate the clean foundation without reopening product features;
4. fast-forward `main` only after the foundation gate is satisfied;
5. retire the cleanup lane and stale historical branch names.

Then resume product work from `main` with one ordinary work lane and small vertical slices:

1. steering presentation over the preserved V2 input semantics;
2. analog pedal input + deterministic longitudinal integration;
3. pedal presentation and multitouch;
4. D/R state selector with permissive under-throttle switching;
5. owner mobile driving/feel gate;
6. sensitivity/haptics/polish only from real feedback;
7. later additive dynamic camera assists over the accepted manual camera foundation.

Do not mix repository recovery, delivery-harness invention and control-design iteration into one slice again.

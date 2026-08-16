# AI project memory — JV Web

Updated: 2026-08-16
Status: `MAIN ACCEPTED / ISOLATED JURE NEUTRAL-RECEIPT LANE ACTIVE / OWNER-VISIBLE RUNTIME FROZEN`

This file is a compact router only. Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank it.

## Authority

- private source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- grounded main at JURE-lane start: `18b71bf002401543cdc448f48cc7b68a8c1b5aec`;
- promoted evidence boundary: `2b12a2fa99d49ebe4d748ed851c194825129d38f`;
- owner-tested P1 runtime: `c9b5990b226685abe35851fc5e9496323096ecf7`;
- public Friends: `release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- private rollback: `rollback/main-before-p1-foundation-2026-08-16 -> f8eb0908f5934aed2d504f34ce483a02754039ec`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Resolve moving refs live before writes.

## Accepted P1 boundary

P1 was owner-tested on desktop and Galaxy A53/Chrome. Steering works as the current X-only `POSITION` reference; pedals work as the current foundation; the worst old clipping/overlay failures are sufficiently resolved. Pedal design/semantics, HUD composition, steering design, final rig/Ackermann/tie rods and final handling remain open.

Final promotion evidence at `2b12a2fa...`: complete repository suite **444 PASS / 0 FAIL**, docs/third-party checks PASS, portable production build/validators PASS, exact build identity PASS, runtime equivalence to owner-tested `c9b5990b...` PASS, production audit 0 vulnerabilities.

## Current task

One isolated lane is active: `jure/neutral-geometry-receipt`.

Purpose: expose the current legacy front-left M6 double-wishbone as a read-only `JvNeutralMechanismV1` plus deterministic receipt so JURE can compare authored truth with current JV consumer truth before runtime substitution.

This lane is **not yet canonically validated**. Owner-visible product runtime remains frozen: no Box3D substitution, steering/handling change, renderer/HUD/mobile change or Friends/Public publication.

## Branch policy

Steady state is `main` plus at most one concrete temporary lane. The broad cleanup is complete; the current `jure/neutral-geometry-receipt` branch is intentional. Do not restore the old branch forest. After an accepted lane becomes safely ancestral to `main`, retire its branch name.

## JURE coordination and shared direction

JURE is authored-rig authority; JV-Web is the first real consumer/runtime falsifier. Current JURE snapshot:

- main `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- draft PR #3 clean foundation `4db04eee4da0216f6bd3df6b6b0c82aa20afab5a`;
- draft PR #4 `work/real-jv-rig-elements@7b385e8e591d13c3ccab06647390d9d28e06a1d4`.

Critical falsifier: procedural JV-Web M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never create a hybrid by replacing one authored hardpoint/relation inside an incompatible procedural shape.

JURE and JV are complementary by design. JURE's primary near-term role in the JV program is to author the coherent mechanical and representation truth needed to repair the M6 rig and later create new vehicle rigs: exact part placement, frames, relations, suspension/steering geometry and representation mappings. For dampers/springs, JURE owns attachment/axis/travel geometry and representation mapping; JV owns force laws, solver state and current compression. The same architecture may later serve non-vehicle mechanisms, but do not prebuild a universal framework without a real use case.

Do not freeze a concrete JV-Web JURE import schema yet. JURE should first finish Owner-operability of the coherent four-relation wishbone and freeze its multi-relation consumer fragment.

Future first consumer path:

`exact JURE fragment -> strict parse -> units/basis/provenance/placement validation -> coherent geometry proof -> lower into JvNeutralMechanism -> private jure/* runtime experiment -> later public decision`

No coordinate guessing, implicit identity transform, consumer dynamics in JURE, or public Friends change in the first consumer slice. See `docs/contracts/JURE_CONSUMER_BOUNDARY.md`.

## Neutral receipt rule

The JV neutral receipt is a diagnostic output mirror, not an authored format and not a runtime input. For cross-project use it must carry exact JV producer repository+commit, pinned factory-receipt path, exact factory-receipt Git blob, SHA-256 of canonical blob bytes, explicit `JV_RIG_SPACE_V1`, and deterministic bodies/frames/relations. Moving branch names are not provenance authority.

## Protected boundaries

Preserve Plac E2R, Offroad, owner vehicle, approved JSPREV2, accepted A53 render-1x foundation, Camera Manual Rig V1, Fullscreen V1, fixed-step/timestamped input, independent throttle/brake ownership, D/R semantics, fail-closed lifecycle, generation-safe UI, current X-only steering reference, temporary steering/drive bridge as intermediate, and the JURE-authored/JV-consumer authority split.

## Next boundary

Finish and canonically validate the neutral-receipt lane. If green, inspect the generated JSON itself, promote only the proven source/tool/docs slice, ground the handoff, and return to a small branch namespace.

The next real JURE -> JV runtime work begins only after JURE freezes the coherent multi-relation consumer fragment. Mobile polish remains a separate lane.

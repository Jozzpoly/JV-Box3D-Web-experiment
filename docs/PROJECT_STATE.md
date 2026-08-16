# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING V3 DEVICE GATE / OWNER VALIDATION PENDING`

## Authority and active lane

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
Camera Manual Rig V1 absorption: 997c9a34ea429220dbdb4f5408a0ac37200bd712
fullscreen source checkpoint: checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143
Analog Steering V1 source: d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2
Steering Control V2 UX/debug source: b9dd4f98ecee192af3302150c95542c772033949
temporary 35-degree drive bridge: d6c646b65a0d57306e138175209c0f652bdbfbda
public Steering V2 owner-device proof: release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3
public Mobile Driving V3 candidate: release/friends-r1@e94ab696d05b4a976a2673a69e40d5ddffea94d7
public A53 performance proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public known-good Friends rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git, reproducible execution evidence and direct owner observation outrank this file. `main` remains accepted source authority until the canonical promotion gate is completed. `work/friends-r1-usability` is the only ordinary active product lane ahead of `main`.

**V3 private source absorption is intentionally NOT DONE.** The active private lane contains the accepted V2/35-degree foundation and living documentation for the V3 experiment; the new V3 input/runtime behavior currently exists only in the isolated public owner-device gate.

## Protected working foundation

Friends currently includes Plac E2R, Offroad, the owner vehicle and full JSPREV2 scan on desktop/phone.

The following owner-visible foundations are closed unless new evidence demonstrates regression:

- **Performance foundation v1:** Galaxy A53 / normal Chrome / current full textured JSPREV2 / render scale 1x / culling ON reached stable 60 scene presents/s at about 16.7 ms. This does not generalize to every device, 2x or future larger worlds.
- **Camera Manual Rig V1:** responsive framing/reset, broad manual distance/clipping range, orbit, vehicle-local pan, touch pinch+pan and desktop pan form the accepted manual camera baseline. Future automatic assists must remain additive to user calibration.
- **Fullscreen V1:** owner-validated on mobile and desktop; preserve explicit enter/exit behavior.
- **Steering Control V2:** owner-accepted as the mobile control foundation, with visual design intentionally still open. Preserve X-only analog `POSITION` semantics, neutral/release behavior, usable mobile placement and recoverable Debug.
- **Temporary steering range:** native full rack travel is mapped to approximately +/-35 degrees for JV-Web driving while the pinned receipt/native rack and JURE/final-rig authority remain unchanged.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open. JURE owns rig authoring.

## Current experiment — Mobile Driving V3

The product question is now: **can touch driving become deliberately enjoyable rather than merely functional?**

The current V3 is deliberately a **public noncanonical device experiment**, not private source authority. Steering and pedals are separate acceptance questions even though they share one device gate.

### Steering Hybrid V3

The proven V2 input contract is unchanged:

```text
one thumb
X-only gesture
normalized POSITION [-1, +1]
release -> neutral 0
35-degree temporary full-lock bridge
```

Only the interaction language changes. The control presents a shallow, very wide steering-wheel arc / ellipse viewed from a steep angle. The internal wheel visual rotates with command while the physical thumb gesture remains linear X-only. This intentionally separates **comfortable touch acquisition** from **automotive visual feedback**.

The hitbox/layout geometry does not resize during the gesture. Visual active-state growth is applied to internal layers so it cannot alter steering command under the finger.

### Analog Pedals A1

The vehicle drive command already supports analog throttle/brake values, so this experiment adds an input layer rather than changing Box3D or the drive model.

Two independent vertical pedals are exposed:

```text
THROTTLE: relative upward thumb travel -> 0..1
BRAKE:    relative upward thumb travel -> 0..1
```

The control freezes `originY` and usable travel distance at pointer-down. Therefore active-pedal enlargement and neighbor shrink are visual feedback only and cannot change command geometry mid-gesture.

Expected interaction properties:

- touching a pedal starts at 0 rather than jumping to a value based on absolute screen position;
- sliding upward progressively increases command to 100%;
- sliding back down reduces it;
- release/cancel/blur/visibility/pagehide returns that pedal to 0;
- steering and one pedal can be owned simultaneously by separate pointers;
- throttle and brake have separate pointer ownership;
- existing keyboard/binary longitudinal demand remains a fallback and has priority when explicitly active;
- existing binary reverse is preserved for this slice.

A D/R direction selector is deliberately deferred. Direction switching while throttle/brake is active needs a separate semantic decision rather than being smuggled into the pedal experiment.

### V3 evidence boundary

```text
initial public V3 experiment: fba33f2e3f51228773ce96e49f03d9f4f12b0a83
post-publication loader repair: f4edea437b5f40700bbf98521fffd9690ecfb493
current public gate/cache-bust: e94ab696d05b4a976a2673a69e40d5ddffea94d7
public diff from V2 proof: only driving-v3-test/* plus the V3 loader repair/cache-bust chain
Pages publication: built for exact current candidate SHA
corrected loader Git blob: 406eb7a62c50d3e761dbc603d48838d45b482b41
local corrected loader `node --check`: pass and Git blob identity matches published blob
local noncanonical analog timeline/pedal focused smoke checks: pass
owner/mobile runtime + driving feel: PENDING
private V3 source absorption: NOT DONE
```

The first V3 publication was not handed to the owner: a final post-publication sanity check found a one-line loader transport corruption. The loader was repaired and cache-busted before owner testing. This is publication-harness evidence, not a product regression.

The public gate preserves the tested V1/V2/Camera/fullscreen basis and layers the V3 experiment over it. It must fail closed if required runtime patch points do not match. The gate is evidence only; it is not the canonical Friends build.

## What owner validation should answer

Judge steering and pedals independently:

1. Does the wheel-arc remain as precise and easy to grab as V2 while providing better automotive feedback?
2. Is full lock quick to reach without excessive thumb travel?
3. Can the steering control be released and recaptured without unexpected jumps?
4. Do portrait and landscape layouts keep the controls reachable without obscuring too much world view?
5. Can throttle be held around low/medium/high values rather than behaving like another button?
6. Can brake pressure be modulated meaningfully?
7. Does active-pedal growth plus neighbor shrink communicate control state without moving the effective gesture underneath the finger?
8. Does simultaneous steer + throttle/brake feel natural during sustained driving?

One half of V3 may pass while the other fails. Do not couple their acceptance artificially.

## Next actions after the device gate

If a V3 interaction is owner-accepted, absorb its **exact tested behavior** into private source as small commits with focused tests. Do not copy the public harness wholesale.

Likely sequence after acceptance:

1. steering hybrid source absorption if it beats V2;
2. analog longitudinal timeline + pedal adapter + host integration if pedals beat binary controls;
3. polish sensitivity/visual feedback only from demonstrated feel problems;
4. separate D/R selector experiment;
5. optional haptic feedback where browser/device capability allows it;
6. only after the driving-control language stabilizes, revisit additive dynamic camera assists.

If either part does not beat V2/binary controls, keep the known-good foundation and iterate only the failed interaction.

## Remaining formal promotion gate

Before advancing `main` / ordinary Friends release, run the exact repository toolchain:

1. Node 24.16.0 + npm 11.13.x + lockfile dependencies;
2. `npm run check` with real Box3D coverage;
3. `npm run build:friends-r1` and portable checks;
4. rendered browser smoke of the canonical artifact;
5. exact source/artifact/rollback identity verification.

The public V3 gate does not satisfy this boundary.

## Documentation/workflow hygiene

Default context is `AGENTS.md` + this file + current source/tests. Use `docs/OWNER_CHECKPOINTS.md` for durable owner acceptance, `docs/ARCHITECTURE.md` for stable boundaries, and Git history for detailed archaeology.

Do not create per-agent handoffs, campaign journals or duplicate roadmaps. Do not record V3 in `OWNER_CHECKPOINTS.md` until the owner actually tests it.

# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING OWNER-DEVICE ALPHA LIVE / POLISH GROUNDING / NO IMPLEMENTATION IN THIS STAGE`

## 1. Authority

```text
accepted private authority: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/mobile-driving-controls
live mobile-driving source: d96e393c466aa41c6436c12bcb1b4ab1861828b0
runtime implementation checkpoint: f56be8c85ea2b26533eee89c050b1b55cf21ec4b
implementation base / grounding closure: b453462cb9a0cbd28aadad500016d9be70e6756d
public Friends owner-device alpha: release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
public pre-alpha rollback: checkpoint/pages-before-mobile-driving-2026-08-16@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

`main` remains unchanged. `work/mobile-driving-controls` is still the only active lane ahead of it. The public Friends branch now contains the first real mobile-driving owner-device alpha built from exact clean private source `d96e393c...`.

Git/current source, reproducible execution evidence and direct owner observation outrank this file.

## 2. Gate status changed: build/public/device proof exists

The previous status `CANONICAL + RENDERED GATES PENDING` is closed for this alpha.

Executed canonical Windows build evidence:

- Node 24.16.0;
- npm 11.17.0, accepted by project range `>=11.13.0 <12`;
- TypeScript 7.0.2;
- Vite 8.1.5;
- real `box3d.js@0.0.2`;
- `npm ci` PASS;
- TypeScript typecheck PASS;
- third-party notice verification PASS;
- normal Vite production bundle PASS;
- owner M6 full rig R3 generation PASS;
- portable/runtime/vehicle/path/privacy/network/build-identity checks PASS;
- Friends artifact validation PASS after the release harness was corrected to preserve pinned scan bytes exactly.

Public artifact evidence:

- `release/friends-r1@7766f711...`;
- `build-manifest.json` records exact clean source `d96e393c...`;
- approved JSPREV2 remains byte-pinned;
- GitHub Pages reports `status=built` from `release/friends-r1`;
- pre-alpha rollback remains `fa00f4c3...`.

Owner directly confirmed the public build works in desktop browser and on Samsung Galaxy A53 / Chrome. Supplied screenshots show portrait, landscape and fullscreen states with the scan, vehicle and new controls rendered.

This is owner-device alpha proof, not final UX acceptance.

## 3. Protected product foundation

Preserve unless explicitly changed:

- Plac E2R, Offroad, owner vehicle and full approved JSPREV2;
- owner-validated A53 performance foundation for the tested Chrome/render-1x case;
- Camera Manual Rig V1;
- Fullscreen V1 capability;
- deterministic timestamped input architecture;
- independent throttle/brake values and multitouch ownership;
- D/R state authority and permissive D<->R-under-throttle behavior;
- fail-closed capture/lifecycle behavior;
- generation-safe presentation reset/coalescing;
- temporary approximately +/-35-degree JV-Web steering bridge;
- final rig/steering geometry and final handling remain outside this mobile-control polishing campaign and stay compatible with the JURE authoring boundary.

Do not restart old V3/V3.1 recovery, camera recovery, release-harness experimentation or compiled-runtime patching.

## 4. Owner-device alpha verdict

Current detailed authority:

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`

The earlier `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md` remains useful historical/design foundation, but is superseded where the new owner-device grounding explicitly changes a rule.

### What is working and should be retained

- analog throttle and brake work in real phone driving;
- they are materially better than the previous binary driving buttons;
- the analog control stack is worth polishing rather than replacing;
- the projected real-wheel metaphor is a strong direction;
- the wheel is convincing enough that the owner naturally tries to manipulate it as a physical wheel;
- desktop and phone public Friends build both work.

### What is not accepted

- current responsive HUD composition;
- current pedal relative-from-pointer-down mapping;
- current pedal progress/fill feedback;
- current pedal visual design;
- current blue steering background/shell;
- current placeholder spoke/rim geometry;
- X-only steering as necessarily the final gesture;
- final portrait/landscape placement;
- final dimensions, curves, visual travel or industrial design.

## 5. Major responsive/UI issue

The live alpha introduced a real layout regression/complexity problem:

- short/rotated landscape can clip or lose useful controls/interface;
- the right-side Camera/Reset/Debug action rail competes with the pedal cluster;
- pedals obscure useful interface/world area;
- independent fixed overlays do not compose robustly across browser-chrome landscape and fullscreen.

Treat this as a coordinated driving-HUD composition problem. Do not accumulate local positional patches.

The next layout work must explicitly reason about reserved steering/longitudinal/action/world zones, safe areas and short viewport classes.

## 6. Pedal target changed after real use

The current adapter uses relative upward travel from pointer-down. That behavior was a useful alpha, but the owner now wants direct position control.

Next pedal-input target:

```text
bottom of frozen pedal geometry -> low demand
top of frozen pedal geometry    -> high demand
pointer-down immediately emits value from touch position
move up                           -> increase
move down                         -> decrease
release/lifecycle loss            -> 0
```

Preserve current multitouch ownership, non-stealing, lifecycle fail-closed behavior, D/R semantics and physics boundary.

This is an input mapping change only. Do not couple it to M6 physics changes.

## 7. Pedal presentation target changed

Current fill/line feedback is rejected as too progress-bar-like.

The next presentation target is a real mechanical pedal metaphor:

- stable invisible acquisition geometry;
- visible pedal face/linkage presentation only;
- analog value physically depresses/tilts/translates the pedal into its mechanism;
- visual depth/pose communicates command magnitude;
- no hitbox motion from animation;
- no heavy blur/filter regression;
- brake/throttle styling should eventually share one deliberate mechanical/industrial language with the steering wheel.

Input mapping and pedal visual styling should be separate slices.

## 8. Steering target refined

Strongly retain the steeply projected real steering-wheel concept.

Immediate visual issues:

- remove the large blue shell/background;
- keep acquisition geometry ergonomic but visually transparent;
- improve rim/hub/spoke geometry;
- spokes should physically meet the rim/hub;
- improve material/perspective language without heavy compositing effects.

New interaction hypothesis from owner instinct:

- direct rotational manipulation around wheel centre may fit the metaphor better than X-only sliding;
- because the visible wheel is perspectively squashed, any rotation gesture should use local/unprojected or ellipse-normalized coordinates rather than naïve screen-space angle;
- preserve the currently working X-only path until a rotational experiment is owner-proven;
- do not mix steering-gesture experiments with steering physics/rig work.

## 9. Preferred polishing decomposition

Do not implement all feedback together.

### P1 — responsive driving-HUD composition

Fix clipping/overlap and recover useful world/interface space across browser-chrome short landscape, alternate phone rotation, fullscreen landscape and portrait sanity. Keep command semantics unchanged.

### P2 — absolute-position pedal input

Change only the pedal Y mapping from relative-origin to direct absolute position inside frozen gesture geometry.

### P3 — mechanical pedal motion

Replace progress/fill feedback with physical depression/tilt/translation. No full styling redesign required yet.

### P4 — steering visual cleanup

Remove blue shell and improve wheel geometry/perspective while deliberately keeping current X-only input for this slice.

### P5 — rotational steering gesture experiment

Prototype and owner-test direct wheel rotation against the still-working X-only baseline.

### P6 — joint wheel/pedal industrial design + feel tuning

Refine the two instruments together: proportions, material language, spacing, visual travel, command curves and active emphasis.

### P7 — portrait-specific composition

Adapt the proven mechanics intentionally for narrow/tall use rather than shrinking landscape blindly.

These are semantic work packets, not branch/version requirements.

## 10. Fault localization

```text
clipped/overlapping controls             -> responsive composition
wrong pedal value at touch position      -> pedal mapping
stationary finger changes pedal command  -> gesture geometry
correct pedal value but weak feedback    -> pedal presentation
wheel shell/spokes/perspective look wrong-> steering presentation
wheel is awkward to manipulate           -> steering gesture
T+B physical consequence feels wrong     -> later vehicle/handling work
camera behavior feels wrong              -> camera work
scan/frame rate regresses                 -> performance/render work only with new evidence
```

A local failure must not cause destruction of the complete analog-control stack.

## 11. Next boundary

This documentation grounding stage intentionally implements **nothing**.

Before P1 begins:

- preserve live public alpha and rollback;
- use the screenshots/owner observations as the current rendered baseline;
- keep `MOBILE_DRIVING_POLISH_GROUNDING.md` as the owner-intent authority;
- change one layer at a time;
- run only the smallest relevant automated checks;
- return quickly to real A53/desktop product judgement after each owner-visible slice.

The next justified implementation slice is **P1 — responsive driving-HUD composition**, unless the owner explicitly reprioritizes.

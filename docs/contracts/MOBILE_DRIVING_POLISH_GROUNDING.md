# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING FOUNDATION ACCEPTED IN SOURCE / FUTURE CONTROL-POLISH INTENT / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Current accepted evidence boundary

```text
older P1.2/P1.3/P1.3.1 accepted executable:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

pre-integration steering evidence parent:
  1b25cf242a007b84f236155e6067539c825876ec
  tree: 20bf084af97fe0c3b780e621467c53362b779303

device/browser integration proof:
  Samsung Galaxy A53 / Chrome
```

The older P1.2/P1.3/P1.3.1 close passed Node 24.16.0 / npm 11.17.0 and full tests **462/462**. The later dual-mode steering integration executable `4961cee4...` passed a fresh `windows-latest` close using the repository-declared Node/npm, `npm ci` and full `npm run build`; Owner then passed a real-device regression smoke covering both steering modes, steering+pedal multitouch, JSPREV2, fullscreen and basic UI.

Dual-mode steering is therefore now an accepted source foundation. Final tuning remains open.

## 2. Protected current baseline

Preserve unless a later focused slice explicitly changes it:

- readable/useful central world region through current browser/fullscreen mobile states;
- lower-left steering zone and lower-right longitudinal-control zone as the working composition;
- minimal persistent driving HUD + transient utility drawer;
- compact top action surface;
- larger physical-wheel presentation;
- steering background/plate default OFF and optional ON;
- Owner-facing `DIRECT_ROTATION` / `Obrót` and `RELATIVE_X` / `Przeciąganie` as retained source-product modes;
- `X_POSITION` as historical/regression reference only;
- analog throttle/brake foundation;
- independent throttle/brake ownership and simultaneous use;
- frozen gesture geometry during owned pointer interaction where required by the control model;
- fail-closed release/cancel/lifecycle behavior;
- current D/R semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

Do not use UI/control polish as a reason to change drivetrain, vehicle physics, rig topology or JURE authority.

## 3. Composition — accepted foundation, not final design

The earlier chaotic/overlapping mobile composition was materially improved through P1.2/P1.3/P1.3.1. Do not treat old `P1.2 next` or later numbered roadmap language as current work.

Future composition changes should preserve:

- central world/vehicle visibility over decorative chrome;
- stable steering and longitudinal driving zones;
- reachable Camera/Reset/Debug/fullscreen/location actions without sustained pedal-drag competition;
- separate browser-chrome short-landscape and true-fullscreen viewport classes;
- portrait as a distinct layout problem;
- no remapping of an already-owned continuous gesture under a stationary finger;
- explicit safe-area/viewport composition instead of accumulated offsets.

A later composition slice should be triggered by concrete Owner/device feedback, not by old stage numbering.

## 4. Pedal input semantics — strongest next hypothesis, not implemented truth

Current accepted pedals are **relative-from-touch displacement** controls. Pointer-down captures the pedal and starts semantic value at `0`; subsequent value comes from upward travel relative to that touch `originY`, using a clamped travel distance. This is the actual current code behavior and should not be confused with the desired next hypothesis.

The strongest durable Owner hypothesis is **absolute position inside stable/frozen pedal acquisition geometry**:

```text
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by Y
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

If selected for implementation:

- capture the relevant pedal geometry once at pointer-down;
- map current pointer Y against that frozen geometry to `[0,1]`;
- allow initial low/medium/high command depending on touch position;
- clamp safely while pointer capture remains owned;
- preserve independent throttle/brake ownership, simultaneous throttle+brake, D/R semantics and fail-closed lifecycle behavior;
- animation must never redefine command geometry;
- margins/dead bands/value curve remain Owner/device tuning variables.

Do not change M6 physics in the same slice.

The first pedal checkpoint should falsify whether this absolute-position model actually feels more direct and predictable than the current relative-from-touch mapping. Do not assume implementation merely because the hypothesis is well grounded.

## 5. Pedal mechanical feedback — separate Owner target

Progress-fill feedback is functional alpha, not the desired final metaphor. Preferred future presentation: the finger controls how far a physical pedal appears depressed.

Keep two layers separate:

1. **stable invisible acquisition geometry** — command authority;
2. **visible pedal mechanism** — presentation only.

Useful visual variables may include hinge rotation/foreshortening, translation into a pedal well, linkage/arm motion and restrained contact/shadow/highlight cues. Reject hitbox scaling, numeric percentages outside Debug and GPU-heavy blur/filter effects as primary feedback.

Input semantics should be validated before or independently from a larger visual redesign so feel and appearance are not confounded.

## 6. Pedal + steering industrial design

Future controls should converge gradually toward one lightweight automotive/mechanical language rather than unrelated generic widgets. Shared material language, depth cues, edge/line treatment and mechanically plausible motion are valuable; exact styling is not frozen.

Keep input semantics and industrial-design changes separable where possible so feel and appearance can be judged independently.

## 7. Steering — two accepted Owner-facing foundation modes, tuning open

### `DIRECT_ROTATION` / `Obrót`

Direct grab-and-rotate manipulation. Preserve no-jump acquisition, ellipse/wheel-local geometry handling, explicit lock clamp and fail-closed release semantics unless focused Owner evidence requires a change.

### `RELATIVE_X` / `Przeciąganie`

Relative horizontal drag with accumulated wheel angle and progressive gain, currently rising from 1 near center toward 4 at lock. Preserve direct accumulator clamping/no hidden overshoot debt while tuning only from real driving evidence.

The current `1 -> 4` gain progression remains a tuning hypothesis, not frozen truth.

### Accepted meaning

Both modes are integrated into source `main` and accepted as a foundation. This does not accept final sensitivity/gain/haptics/self-centering/industrial design or steering physics. Tune Direct and Relative independently through small causal slices; do not delete one merely to force a winner.

## 8. Portrait-specific composition — future direction

Portrait should eventually be designed intentionally for tall/narrow use rather than blindly shrinking landscape. This remains future product work, not a current failure of the accepted mobile foundation.

## 9. Fault localization

Use the smallest relevant layer:

```text
controls clipped/overlap actions        -> responsive composition
initial pedal value feels wrong         -> pedal mapping
stationary finger changes pedal command -> gesture geometry bug
pedal value correct but looks wrong     -> pedal presentation
wheel shell/spokes look wrong           -> steering presentation
Direct feels wrong                      -> Direct gesture/tuning
Relative feels wrong                    -> Relative gain/gesture tuning
car physics under T+B feels wrong       -> vehicle/handling stage
camera feels wrong                      -> camera stage
scan/frame-rate problem                  -> performance/render stage only with new evidence
```

A failure in one layer is not justification to discard the whole control stack.

## 10. Work-selection rule / roadmap meaning

There is **no fixed remaining P1.4 -> P2 -> P3 -> ... scheduler**. Old labels were useful planning packets, but real work crossed their boundaries.

Current living directions are:

- pedal mapping semantics — strongest next substantive control direction;
- pedal mechanical feedback;
- dual-mode steering refinement, with both modes retained;
- steering/pedal industrial-design convergence;
- desktop/mobile capability hygiene when concretely scoped;
- portrait-specific composition;
- later JURE/rig/handling work under their own boundaries;
- performance/scan scaling only from measured new need.

The steering integration close is complete, so there is no need to keep an ordinary steering work lane open before selecting the next need.

Default loop:

1. verify live refs/current state;
2. select one concrete Owner need;
3. state the hypothesis and falsifier;
4. make the smallest coherent source change only after the experiment is grounded;
5. run a causal check matching the blast radius;
6. deploy through Owner Preview;
7. judge on real device/render evidence;
8. keep, locally revise or reject;
9. run full canonical close only at a real milestone/foundation boundary.

Owner intervention is for appearance, feel and real-device behavior — not release-script mechanics.

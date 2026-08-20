# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING DIRECTION OWNER-ACCEPTED / FUTURE CONTROL-POLISH INTENT / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-20

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Current accepted evidence boundary

```text
owner-approved product source before final test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

canonical accepted executable source:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

accepted Friends executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

device/browser:
  Samsung Galaxy A53 / Chrome
```

Canonical close passed the normal Node 24.16.0 / npm 11.17.0 repository build path and full tests **462/462**. Owner confirmed the accepted steady-state world/vehicle, steering, throttle/brake, utility drawer, steering plate, landscape/browser/fullscreen sanity and JSPREV2 loading.

This closes P1.2/P1.3/P1.3.1 as the current mobile surface foundation.

The current steering experiment is separate from that accepted executable anchor:

```text
active steering source:
  1b25cf242a007b84f236155e6067539c825876ec

active steering tree:
  20bf084af97fe0c3b780e621467c53362b779303
```

Owner has driven both current steering modes and accepts retaining both as ongoing product directions, while final tuning remains open.

## 2. Protected current baseline

Preserve unless a later focused slice explicitly changes it:

- readable/useful central world region through current browser/fullscreen mobile states;
- lower-left steering zone and lower-right longitudinal-control zone as the current working composition;
- minimal persistent driving HUD + transient utility drawer;
- compact top action surface;
- larger physical-wheel presentation;
- steering background/plate default OFF and optional ON;
- X-only `POSITION` as the accepted historical/reference steering path;
- analog throttle/brake foundation;
- independent throttle/brake ownership and simultaneous use;
- frozen gesture geometry during owned pointer interaction;
- fail-closed release/cancel/lifecycle behavior;
- current D/R semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

The current Owner-valued `DIRECT_ROTATION` and `RELATIVE_X` modes are active product directions, but are not yet final accepted steering tuning in `main`.

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

## 4. Pedal input semantics — Owner target, not implemented truth

Current accepted pedals still use the existing working mapping. The strongest durable future hypothesis is **absolute position inside stable/frozen pedal acquisition geometry**:

```text
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by Y
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

If selected:

- capture pedal geometry once at pointer-down;
- map current pointer Y against that frozen geometry to `[0,1]`;
- allow initial low/medium/high command depending on touch position;
- clamp safely while pointer capture remains owned;
- preserve independent throttle/brake ownership, simultaneous throttle+brake, D/R semantics and fail-closed lifecycle behavior;
- animation must never redefine command geometry;
- margins/dead bands/value curve remain Owner/device tuning variables.

Do not change M6 physics in the same slice.

## 5. Pedal mechanical feedback — Owner target

Progress-fill feedback is functional alpha, not the desired final metaphor. Preferred future presentation: the finger controls how far a physical pedal appears depressed.

Keep two layers separate:

1. **stable invisible acquisition geometry** — command authority;
2. **visible pedal mechanism** — presentation only.

Useful visual variables may include hinge rotation/foreshortening, translation into a pedal well, linkage/arm motion and restrained contact/shadow/highlight cues. Reject hitbox scaling, numeric percentages outside Debug and GPU-heavy blur/filter effects as primary feedback.

Exact pivot/perspective/material design remains an Owner/device tuning problem.

## 6. Pedal + steering industrial design

Future controls should converge gradually toward one lightweight automotive/mechanical language rather than unrelated generic widgets. Shared material language, depth cues, edge/line treatment and mechanically plausible motion are valuable; exact styling is not frozen.

Keep input semantics and industrial-design changes separable where possible so feel and appearance can be judged independently.

## 7. Steering — two retained Owner-facing modes, tuning open

Current P1.3.1 wheel presentation remains the accepted working surface: larger wheel, mechanical rim/spoke/hub construction, compact top actions and optional plate default OFF.

Strongly preserve unless focused evidence proves better:

- steep-perspective physical-wheel metaphor;
- command-linked visible wheel rotation;
- asymmetric visual features that make rotation legible;
- lower-left placement as a useful driving zone;
- acquisition geometry independent from visible artwork.

Current active candidate exposes two Owner-facing interactions:

### `DIRECT_ROTATION` / `Obrót`

Direct grab-and-rotate manipulation. Preserve the current no-jump acquisition principle, ellipse/wheel-local geometry handling, explicit lock clamp and fail-closed release semantics unless Owner evidence requires a focused change.

Owner previously judged Direct materially better than X-only for small corrections.

### `RELATIVE_X` / `Przeciąganie`

Relative horizontal drag with an accumulated wheel angle and progressive gain, currently rising from 1 near center toward 4 at lock. Preserve direct accumulator clamping/no hidden overshoot debt while tuning only from real driving evidence.

The current `1 -> 4` gain progression is a tuning hypothesis, not frozen truth.

### Owner verdict

Owner has driven both modes on the current A53/Pages candidate and explicitly judges **both worth retaining and developing gradually**.

This is directional acceptance:

- do not delete either mode merely to force a winner;
- do not interpret the decision as final sensitivity/gain/haptics/self-centering/industrial-design acceptance;
- `X_POSITION` remains internal regression/reference rather than a third Owner-facing choice;
- tune Direct and Relative independently through small causal slices;
- do not combine steering gesture tuning with steering physics/vehicle mechanics changes.

## 8. Portrait-specific composition — future direction

Portrait should eventually be designed intentionally for tall/narrow use rather than blindly shrinking landscape. This remains future product work, not a current failure of the accepted P1.3.1 boundary.

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

There is **no fixed remaining P1.4 -> P2 -> P3 -> ... scheduler**. Old labels were useful planning packets, but real work crossed their boundaries. `docs/MOBILE_DRIVING_ROADMAP_READINESS_AUDIT_2026-08-16.md` is historical readiness evidence, not a current work queue.

Current living directions are:

- dual-mode steering refinement, with both modes retained;
- pedal mapping semantics;
- pedal mechanical feedback;
- steering/pedal industrial-design convergence;
- desktop/mobile capability hygiene when concretely scoped;
- portrait-specific composition;
- later JURE/rig/handling work under their own boundaries;
- performance/scan scaling only from measured new need.

Before opening another ordinary product lane, structurally close/integrate the current dual-mode steering foundation so the project does not accumulate competing active branches.

After that, choose one small need from Owner pain. Pedal semantics/mechanical feedback is currently the strongest already-grounded substantive control direction, but it is not an immutable stage number.

Default loop:

1. verify live refs/current state;
2. select one concrete Owner need;
3. make the smallest coherent source change;
4. run a causal check matching the blast radius;
5. deploy through Owner Preview;
6. judge on real device/render evidence;
7. keep, locally revise or reject;
8. run full canonical close only at a real milestone/foundation boundary.

Owner intervention is for appearance, feel and real-device behavior — not release-script mechanics.

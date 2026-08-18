# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / FUTURE CONTROL-POLISH INTENT / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-19

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define the next mandatory slice and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Current accepted evidence boundary

```text
owner-approved product source before final test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

canonical private executable source:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

public executable steady-state promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

Owner-acceptance public provenance anchor:
  086e25c9bd22bddca6462f0d585de6d0fd424012

device/browser:
  Samsung Galaxy A53 / Chrome
```

Public `main` may move through later documentation/provenance-only descendants; resolve its live SHA. Those docs-only moves do not change the executable promotion anchor above.

Canonical close passed the normal Node 24.16.0 / npm 11.17.0 repository build path and full tests **462/462**. Owner then confirmed the final public steady-state boots world/vehicle, steers, throttles/brakes, opens/closes the utility drawer, keeps steering plate OFF by default with working ON/OFF toggle, survives landscape/browser/fullscreen use without obvious regression and still loads JSPREV2.

This closes P1.2/P1.3/P1.3.1 as the current mobile surface foundation.

## 2. Protected current baseline

Preserve unless a later focused slice explicitly changes it:

- readable/useful central world region through current browser/fullscreen mobile states;
- lower-left steering zone and lower-right longitudinal-control zone as the current working composition;
- minimal persistent driving HUD + transient utility drawer for non-essential options;
- compact top action surface;
- larger physical-wheel presentation;
- steering background/plate default OFF and optional ON;
- current X-only analog steering `POSITION` interaction;
- analog throttle/brake foundation;
- independent throttle/brake ownership and simultaneous use;
- frozen gesture geometry during owned pointer interaction;
- fail-closed release/cancel/lifecycle behavior;
- current D/R semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

Do not use UI polish as a reason to change drivetrain, vehicle physics, rig topology or JURE authority.

## 3. Composition — accepted foundation, not final design

The earlier chaotic/overlapping mobile composition was materially improved through P1.2/P1.3/P1.3.1. Do not treat the old `P1.2 next` roadmap language as current work.

Future composition changes should still preserve these principles:

- central world/vehicle visibility matters more than decorative chrome;
- steering and longitudinal controls need stable driving zones;
- Camera/Reset/Debug/fullscreen/location actions must remain reachable without sustained pedal-drag competition;
- browser-chrome short landscape and true fullscreen are distinct viewport classes;
- portrait is a distinct layout problem, not merely scaled landscape;
- responsive layout may move inactive controls but must not remap an already-owned continuous gesture under a stationary finger;
- prefer safe-area/modern viewport geometry and explicit composition over accumulated offsets.

A later composition slice should be triggered by concrete Owner/device feedback, not by the old stage number.

## 4. Pedal input semantics — Owner target, not implemented truth

Current accepted pedals still use the existing working mapping. The durable future hypothesis is **absolute position inside stable/frozen pedal acquisition geometry**:

```text
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by Y
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

If selected for implementation:

- capture pedal geometry once at pointer-down;
- map current pointer Y against that frozen geometry to `[0,1]`;
- allow initial low/medium/high command depending on touch position;
- clamp safely while pointer capture remains owned;
- preserve independent throttle/brake ownership, simultaneous throttle+brake, D/R semantics and fail-closed lifecycle behavior;
- animation must never redefine command geometry;
- margins/dead bands/value curve remain device-tuning variables, not predetermined truth.

Do not change M6 physics in the same slice.

## 5. Pedal mechanical feedback — Owner target

Progress-fill style feedback is functional alpha, not the desired final metaphor. Preferred future presentation: the finger controls how far a physical pedal appears depressed.

Keep two layers separate:

1. **stable invisible acquisition geometry** — command authority;
2. **visible pedal mechanism** — presentation only.

Useful visual variables may include hinge rotation/foreshortening, translation into a pedal well, linkage/arm motion and restrained contact/shadow/highlight cues. Reject hitbox scaling, numeric percentages outside Debug and GPU-heavy blur/filter effects as primary feedback.

Exact pivot/perspective/material design remains a dedicated Owner/device tuning problem.

## 6. Pedal + steering industrial design

Future controls should converge toward one lightweight automotive/mechanical language rather than unrelated generic UI widgets. Shared material language, depth cues, edge/line treatment and mechanically plausible motion are valuable; exact styling is not frozen here.

Keep input semantics and industrial-design changes separable where possible so feel and appearance can be judged independently.

## 7. Steering — current accepted foundation and open hypothesis

Current P1.3.1 presentation is accepted as the working surface: larger wheel, cleaner mechanical rim/spoke/hub construction, compact top actions and optional plate default OFF.

Strongly preserve unless a later experiment proves better:

- steep-perspective physical-wheel metaphor;
- command-linked visible wheel rotation;
- asymmetric visual features that make rotation legible;
- lower-left placement as a useful driving zone;
- acquisition geometry independent from visible wheel artwork;
- current X-only `POSITION` behavior as the comparison/reference path.

Further visual polish is allowed when concrete Owner feedback identifies a defect, but the accepted current presentation is not an unfinished mandatory stage.

### Direct rotational steering — experiment only

A separate Owner hypothesis remains worth testing eventually: direct grab-and-rotate manipulation may feel more natural because the control looks like a wheel.

If selected, isolate the experiment:

```text
pointer-down on/near wheel
-> capture current wheel command + pointer angle
-> map pointer through wheel-local / ellipse-normalized geometry
-> track unwrapped angular delta
-> convert to steering command / visual rotation
-> clamp at product lock
-> release/cancel remains fail-closed/self-centering unless later Owner evidence changes it
```

Do not interpret screen-space angle as a true circle on the perspectively squashed wheel. Do not delete the working X-only adapter before real A53 comparison proves the replacement. Do not combine this experiment with steering-physics changes.

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
wheel feels unnatural to manipulate     -> steering gesture
car physics under T+B feels wrong       -> vehicle/handling stage
camera feels wrong                       -> camera stage
scan/frame-rate problem                  -> performance/render stage only with new evidence
```

A failure in one layer is not justification to discard the complete analog control stack.

## 10. Work-selection rule

There is **no fixed remaining P1.4 -> P2 -> P3 -> ... scheduler**. Those old labels were useful planning packets, but real work crossed their boundaries.

For the next conversation:

1. verify live private/public state;
2. inspect current Owner feedback/product pain;
3. choose one small need;
4. make the smallest coherent source change;
5. run the causal check for that risk;
6. use a faithful browser/public preview when appropriate;
7. judge on the real A53/desktop surface;
8. keep or locally revise.

Full canonical close/release validation belongs at an accepted milestone or foundational boundary, not every polish iteration.

Owner interventions should evaluate appearance, feel and real-device behavior — not release-script mechanics.

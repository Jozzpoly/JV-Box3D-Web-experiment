# JV Web — mobile driving polish grounding

Status: `P1 FOUNDATION OWNER-ACCEPTED / P2+ POLISH TARGET`
Owner: Jozz
Grounded: 2026-08-16
Updated after P1 owner-device acceptance: 2026-08-16

This document preserves the owner-device intent for the mobile driving polishing campaign. It incorporates and supersedes the former pre-device `MOBILE_DRIVING_CONTROLS_TARGET.md`, which is retained only in Git history.

P1 foundation work has now been implemented, published and owner-accepted. Sections describing future pedal, steering and composition behavior remain target authority; solved pre-P1 defects are retained only as context and must not be reimplemented as if still current.

It does **not** authorize final rig geometry, steering physics, handling or JURE-owned mechanical authoring.

## 1. Current accepted evidence boundary

Owner-tested P1 private product source:

```text
work/mobile-driving-controls product source: c9b5990b226685abe35851fc5e9496323096ecf7
```

Current public Friends artifact:

```text
release/friends-r1: a325c279cfe63a0607dba33c3c635a1716e09f8f
Pages: https://jozzpoly.github.io/JV-Box3D-Web-Public/
rollback immediately before P1: checkpoint/pages-before-p1-foundation-2026-08-16@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
```

The public build manifest records exact clean private product source `c9b5990b...`. The release preserved the approved JSPREV2 scan from exact public Git object bytes and removed the historical public executable runtime overlay.

Owner directly tested the resulting build on desktop and Samsung Galaxy A53 / Chrome, including portrait, landscape, browser-chrome and fullscreen states, and supplied screenshots from the live public build.

## 2. What is now protected

Protected positive evidence:

- the Friends artifact boots and runs on desktop and phone;
- the approved JSPREV2 scan and owner vehicle remain usable;
- analog throttle and brake are connected to real driving and work on the phone;
- independent pedal interaction remains valuable and should be refined rather than reverted;
- current X-only analog steering works well as the reference interaction;
- fullscreen remains a working capability;
- the source/input architecture survived real publication and repeated device use;
- P1 removed the known competing V2/current/base CSS ownership path and the historical public runtime overlay;
- the mobile scene can shrink below the old 420px floor;
- the owner judged the worst previous UI/presentation problems resolved sufficiently to close P1 foundation and begin main-promotion preparation.

This acceptance does **not** make the current HUD composition, pedal mapping, pedal visual design, steering visual design, final steering gesture or final portrait/landscape layouts final.

## 3. P1 result and remaining composition target

### Closed P1 foundation defects

The pre-P1 alpha exposed two structural problems:

- historical CSS layers could override the current mobile control presentation after production bundling;
- a `100svh` scene combined with a desktop `min-height:420px` floor and hidden overflow could clip short landscape/browser-chrome states.

Those specific foundation problems were repaired and owner-tested. Do not recreate V1/V2 presentation ownership or add another release-layer executable overlay.

### Remaining composition polish

The current public state is usable and accepted as the foundation, but the HUD is not final. Steering, pedals, actions, status/readouts and central world visibility still need intentional long-term composition rather than accumulating unrelated offsets.

Required direction for the next composition work:

- preserve a readable central world/vehicle region;
- steering owns a lower-left driving zone;
- longitudinal controls own a lower-right driving zone;
- Camera/Reset/Debug/fullscreen/location actions must remain reachable without sustained pedal-drag competition;
- browser-chrome short landscape and true fullscreen are distinct viewport classes and both must remain usable;
- portrait is a distinct layout, not a uniformly scaled landscape layout;
- responsive layout may move inactive controls, but must never remap an already-owned continuous gesture under a stationary finger;
- use safe-area/modern viewport geometry and explicit responsive composition rather than returning to one fixed overlay arrangement.

Keep layout slices isolated from pedal/steering semantic changes whenever possible so regressions can be localized.

## 4. Pedal input semantics — next owner target

The current accepted P1 baseline still uses relative travel:

```text
pointer-down anywhere = local 0%
then upward delta from that origin = 0..100%
```

That working baseline is intentionally **not** the final target.

Desired next model:

```text
stable pedal acquisition geometry
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by its Y position
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

This is an **absolute position inside a frozen pedal coordinate system**, not relative travel from pointer-down.

Implications for the next input slice:

- capture pedal geometry once at pointer-down;
- map current pointer Y against that frozen geometry to `[0,1]`;
- initial pointer-down may therefore begin at low, medium or high demand depending on where the owner touches;
- subsequent drag in either direction directly controls value;
- clamp safely to `[0,1]` when the finger leaves the visual pedal while captured;
- preserve independent throttle/brake ownership, non-stealing, simultaneous throttle+brake, D/R semantics and all fail-closed lifecycle behavior from the current adapter;
- animation must still never change the command geometry;
- exact end margins/dead bands/curve remain device-tuning variables rather than hardcoded product truth.

Do not change M6 physics while implementing this mapping. This is an input-surface change.

## 5. Pedal mechanical feedback — progress visualization rejected as final design

The current fill/line presentation remains a functional alpha mechanism, not final visual authority. The owner wants the pedal itself to behave visually like a physical mechanism.

Target metaphor:

> the finger controls how far the pedal is pressed; the pedal face visibly depresses as command increases, like a real automotive pedal.

Required separation:

1. **invisible/stable acquisition geometry** — command authority, frozen per gesture;
2. **visible pedal mechanism** — presentation only.

Preferred visual variables driven from the same `0..1` command:

- pedal-face hinge rotation / foreshortening;
- translation deeper into a pedal well or toward the simulated floor;
- visible linkage/arm/hinge movement if useful;
- restrained contact/shadow/highlight changes that reinforce depth;
- optional active-touch emphasis, secondary to the mechanical pose itself.

Reject as primary final feedback:

- vertical progress bars/fills;
- numeric percentages outside Debug;
- scaling the hitbox itself;
- GPU-heavy blur/filter effects over WebGL.

The exact pivot geometry and perspective are design/tuning work for a dedicated pedal-visual slice.

## 6. Pedal industrial design

The current red/green pedal blocks are functional alpha placeholders, not a final visual language.

Future pedal design should be developed deliberately with the steering instrument:

- shared material language and depth cues;
- shared mechanical plausibility;
- coherent edge radii, line weights, highlights and labels;
- color may distinguish brake/throttle but should not make them look like unrelated generic UI buttons;
- visual refinement is a separate stage from input mapping so feel and appearance can be judged independently.

## 7. Steering visual verdict

Strongly preserve:

- the idea of a real steering wheel viewed at a steep angle;
- command-linked visible wheel rotation;
- asymmetric visual features that make rotation legible;
- lower-left placement as a promising driving zone;
- the current X-only interaction as the working reference until a better interaction is owner-proven.

Still open for visual improvement:

- any remaining background/acquisition presentation that distracts from the physical-wheel metaphor;
- spokes/rim/hub geometry and mechanical continuity;
- coarse placeholder geometry/material cues.

Next steering-visual target:

- transparent/invisible acquisition zone where ergonomically useful;
- visible steering mechanism as the visual authority;
- cleaner rim geometry;
- spokes/linkages that meet the rim/hub correctly;
- improved perspective/foreshortening and material language;
- preserve lightweight transform-based rendering.

The acquisition zone may remain larger than the visible wheel for ergonomics, but it should not become a distracting joystick-like plate.

## 8. Steering gesture — owner hypothesis, not accepted replacement

The accepted P1 baseline uses the protected X-only `POSITION [-1,+1]` mapping and the owner reports that it works well.

A separate usability hypothesis remains valuable: because the control looks like a steering wheel, direct grab-and-rotate manipulation may eventually feel more natural than horizontal-only input.

Preferred experiment: direct rotational manipulation.

Conceptual mapping:

```text
pointer-down on/near wheel
-> capture current wheel command + pointer angle
-> inverse-project pointer into the wheel's circular local coordinate system
-> track unwrapped angular delta around wheel centre
-> convert angular delta to steering command / visual wheel rotation
-> clamp at current product lock
-> release/cancel remains fail-closed/self-centering unless later owner feedback changes that rule
```

Because the displayed wheel is perspectively squashed, screen-space angle must not be treated as if the visible ellipse were a true circle. Gesture math should use the wheel's local/unprojected geometry (or an equivalent ellipse-normalized coordinate system) so the finger can naturally trace the projected rim.

Critical experiment discipline:

- do not delete the working X-only adapter before rotational behavior is owner-proven;
- compare direct rotation against current X-only feel on the real A53;
- preserve frozen gesture geometry and pointer capture;
- keep visual pose independent from hitbox motion;
- full visual wheel rotation range is a tuning variable, not final truth;
- do not mix this experiment with vehicle steering-physics changes.

A hybrid/fallback mapping may be considered only if direct rotation shows a concrete usability problem. Do not design one speculatively first.

## 9. Work decomposition after main-promotion preparation

Do not resume these slices until the separate Main Promotion Preparation boundary is closed.

### P1.2 — coordinated mobile HUD zones

Refine the accepted P1 foundation into an explicit composition for navigation/info, actions, steering, longitudinal controls, central world and Debug overlay.

### P1.3 — action/navigation policy

Keep Camera/Reset/Debug/fullscreen/location reachable without pedal-drag competition.

### P1.4 — driving-zone sizing/spacing

Tune cluster placement only after the composition policy is explicit.

### P1.5 — portrait sanity

Keep portrait useful while mechanics are still evolving. Final portrait-specific design remains P7.

### P2 — absolute-position pedal input

Replace only relative-origin pedal mapping with absolute Y mapping in frozen geometry. Preserve ownership/lifecycle/D-R/physics boundaries.

### P3 — mechanical pedal motion

Remove progress-fill as primary final feedback and make pedal value visibly depress the pedal mechanism. No broad styling rewrite is required in the same slice.

### P4 — steering visual cleanup

Refine acquisition presentation, rim/spokes/hub geometry and projected-wheel presentation while keeping X-only behavior for this slice.

### P5 — rotational steering gesture experiment

Prototype direct wheel rotation as an isolated input experiment and compare against the still-working X-only path on A53.

### P6 — joint industrial design / feel tuning

Develop wheel + pedals as one automotive/mechanical language; tune dimensions, spacing, value curves, active emphasis and visual travel from real device use.

### P7 — portrait-specific composition

Adapt the proven mechanics intentionally for tall/narrow use rather than shrinking landscape blindly.

These names describe work packets, not permanent version labels or required branches.

## 10. Fault localization for the polishing campaign

Use the smallest relevant layer:

```text
controls clipped/overlap actions        -> responsive composition
initial pedal value feels wrong         -> pedal mapping
stationary finger changes pedal command -> gesture geometry bug
pedal value correct but looks wrong     -> pedal presentation
wheel shell/spokes look wrong           -> steering presentation
wheel feels unnatural to manipulate     -> steering gesture
car physics under T+B feels wrong       -> later vehicle/handling stage
camera feels wrong                       -> camera stage, not mobile-control rewrite
scan/frame-rate problem                  -> performance/render stage only with new evidence
```

A failure in one layer is never justification to discard the complete analog control stack.

## 11. Owner gate philosophy for later stages

Tests are support tooling. The primary acceptance loop is real driving on the actual public/browser surface.

For each owner-visible slice:

```text
small source change
-> smallest relevant automated check
-> normal browser build
-> real phone/desktop view
-> owner feel/visibility judgement
-> keep or locally revise
```

Owner interventions should evaluate the product itself, not release-script mechanics.

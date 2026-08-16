# JV Web — mobile driving owner-device alpha / polish grounding

Status: `OWNER-DEVICE ALPHA LIVE / POLISH TARGET / NO IMPLEMENTATION YET`
Owner: Jozz
Grounded: 2026-08-16

This document captures the first real owner-device verdict on the new mobile driving controls after canonical build and publication. It is the current authority for the next polishing stage where it explicitly supersedes `MOBILE_DRIVING_CONTROLS_TARGET.md`.

It does **not** authorize final rig geometry, steering physics, handling or JURE-owned mechanical authoring.

## 1. Exact evidence boundary

Private source used by the live artifact:

```text
work/mobile-driving-controls source: d96e393c466aa41c6436c12bcb1b4ab1861828b0
runtime implementation checkpoint: f56be8c85ea2b26533eee89c050b1b55cf21ec4b
```

Public Friends owner-device alpha:

```text
release/friends-r1: 7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
Pages: https://jozzpoly.github.io/JV-Box3D-Web-Public/
rollback checkpoint: checkpoint/pages-before-mobile-driving-2026-08-16@fa00f4c3a3c19f1319302bc1728f9cf6490ce462
```

The public build manifest records exact clean source `d96e393c...`. GitHub Pages reports the site built from `release/friends-r1`.

Owner directly tested the build on desktop browser and Samsung Galaxy A53 / Chrome, including portrait, landscape and fullscreen states, and supplied screenshots from the live public build.

## 2. What the alpha proves

Protected positive evidence:

- the new Friends artifact boots and runs on desktop and phone;
- the approved JSPREV2 scan and owner vehicle remain usable;
- analog throttle and brake are connected to real driving and work on the phone;
- the analog pedals are materially better for driving than the previous binary forward/reverse buttons;
- independent pedal interaction is valuable enough to keep and refine rather than revert;
- the projected steering-wheel concept is strongly promising: the owner is broadly satisfied with the direction and instinctively treats it as a real steering wheel;
- fullscreen still works as a capability;
- the source/input architecture survived real publication and device use, so this stage is **polish and interaction refinement**, not another recovery/rewrite campaign.

This does not accept the present HUD composition, present pedal mapping, present pedal visual design, present steering shell, final steering gesture or final portrait/landscape layouts.

## 3. First major regression: driving HUD composition

Owner observation: the new controls created UI clutter and regressions. In rotated/short landscape, part of the useful viewport/interface disappears or is clipped, and driving controls compete with useful Camera/Reset/Debug actions.

The supplied screenshots support the classification: multiple independently positioned overlays occupy the same lower/right screen region; in short landscape the right driving cluster and action rail compete for limited vertical space and lower controls can leave the useful viewport.

Treat this as a **composition problem**, not a request for more local `top/right/bottom` patches.

Required direction:

- redesign the mobile driving HUD as a coordinated set of reserved zones;
- preserve a readable central world/vehicle region;
- steering owns the lower-left driving zone;
- longitudinal controls own a lower-right driving zone;
- Camera/Reset/Debug/fullscreen/location actions must not share sustained pedal drag space;
- browser-chrome short landscape and true fullscreen are distinct viewport classes and both must remain usable;
- portrait is a distinct layout, not a uniformly scaled landscape layout;
- responsive layout may move inactive controls, but must never remap an already-owned continuous gesture under a stationary finger;
- use `dvh/svh`, safe-area insets and explicit compact/short-landscape composition rather than relying on one fixed overlay arrangement.

This layout slice should be isolated from pedal/steering semantic changes whenever possible so regressions can be localized.

## 4. Pedal input semantics — owner target changed after device use

The pre-alpha contract defined relative travel:

```text
pointer-down anywhere = local 0%
then upward delta from that origin = 0..100%
```

That rule is now **superseded for the next experiment** by direct owner-device feedback.

Desired model:

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

## 5. Pedal mechanical feedback — progress visualization rejected

The current rising/falling fill/line reads like a progress meter. The owner explicitly wants the pedal itself to behave visually like a physical mechanism.

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

Reject as primary production feedback:

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
- lower-left thumb placement as a promising driving zone.

Reject/change:

- the large blue closed background/shell around the wheel;
- any presentation that makes the control read again as a giant circular joystick;
- spokes that visually stop before meeting the rim;
- coarse placeholder geometry that weakens the physical-wheel illusion.

Next steering-visual target:

- transparent/invisible acquisition zone;
- visible steering mechanism only;
- cleaner rim geometry;
- spokes/linkages that actually meet the rim/hub correctly;
- improved perspective/foreshortening and material language;
- preserve lightweight transform-based rendering.

The acquisition zone may remain larger than the visible wheel for ergonomics, but it must not be rendered as a large distracting background plate.

## 8. Steering gesture — new owner hypothesis

The current live alpha still uses the protected V2 X-only `POSITION [-1,+1]` mapping. It works, but the owner reports an important natural reaction: because the visual now convincingly looks like a steering wheel, he instinctively tries to **grab and rotate it around its centre** rather than only slide horizontally.

This is not yet accepted replacement behavior. It becomes a dedicated experimental hypothesis.

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

## 9. Work decomposition

Do not solve the whole surface in one patch. Current preferred slices:

### P0 — grounding closure (this stage)

- record live source/public identity;
- record owner-device observations;
- supersede only the rules actually changed by feedback;
- no product implementation.

### P1 — responsive driving-HUD composition

Goal: remove clipping/overlap and recover useful viewport in short landscape/fullscreen without changing command semantics.

Judge:

- browser-chrome landscape;
- reverse phone rotation / alternate landscape orientation;
- fullscreen landscape;
- portrait sanity;
- Camera/Reset/Debug/fullscreen accessibility;
- central vehicle/world visibility.

### P2 — absolute-position pedal input

Replace only relative-origin pedal mapping with absolute Y mapping in frozen geometry. Preserve ownership/lifecycle/D-R/physics boundaries.

### P3 — mechanical pedal motion

Remove progress-fill as primary feedback and make pedal value visibly depress the pedal mechanism. No pedal styling overhaul required yet.

### P4 — steering visual cleanup

Remove blue shell, leave an ergonomic invisible hit region, repair rim/spokes/hub geometry and improve projected-wheel presentation while keeping X-only behavior for this slice.

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

## 11. Owner gate philosophy for the next stages

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

The next owner interventions should evaluate the product itself, not release-script mechanics.

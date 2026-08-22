# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING + ABSOLUTE-POSITION PEDALS ACCEPTED IN SOURCE / D-R MULTITOUCH GROUNDING NEXT / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Accepted evidence boundary

```text
accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

Owner-tested absolute-position pedal runtime:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

device/browser Owner evidence:
  Samsung Galaxy A53 / Chrome
```

Dual-mode steering and absolute-position pedals are accepted source foundations. Final steering tuning and final pedal neutral-zone/value-curve/mechanical feedback remain open.

## 2. Protected current baseline

Preserve unless a focused later slice explicitly changes it:

- useful central world/vehicle visibility and current mobile HUD composition;
- minimal persistent driving HUD + transient utility drawer;
- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes;
- absolute-position analog throttle/brake mapping inside frozen acquisition geometry;
- immediate pointer-down pedal command represented by touch position;
- independent throttle/brake pointer ownership and simultaneous use;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- core D/R command/sign semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

Do not use control polish as a reason to change drivetrain, vehicle physics, rig topology or JURE authority.

## 3. Pedal input semantics — accepted foundation, tuning open

Accepted source semantics:

```text
pointer-down -> freeze pedal top + height
current Y    -> direct [0,1] inside frozen geometry
bottom       -> low command
top          -> high command
range exit   -> clamp 0/1
release/lifecycle loss -> 0
```

Owner judged this model better than the previous relative-from-touch mapping after real-device low/mid/high acquisition, micro-adjustment, full sweep/reversal, throttle+brake multitouch and steering+pedal tests.

Do not reopen the basic mapping choice without contradictory Owner evidence.

### Open neutral/contact-zone tuning

Owner wants to be able to touch the pedal at exact zero and then roll smoothly into analog input. A likely later falsifier is roughly a lower **5–10%** zero/contact buffer with continuous remapping above the actuation threshold.

This percentage is **not frozen**. Keep two concepts distinct:

1. **contact / buffer** — finger has acquired the pedal but command remains exactly zero;
2. **actuation** — command has begun and should be visually/mechanically legible.

Tune this together with mechanical feedback so presentation and semantics agree. Do not let animated pedal geometry become command authority.

## 4. D/R multitouch — next functional boundary

Owner real-device testing showed that D/R does not switch while throttle remains held.

Current source architecture:

- D/R `pointerdown` stops propagation only;
- direction toggle occurs on `click`;
- D/R lacks explicit pointer ownership/lifecycle comparable to steering/pedals;
- if the toggle event does arrive, core D/R semantics correctly re-sign the current held throttle at the toggle timestamp.

Classification:

`OWNER OBSERVED — D/R MULTITOUCH ACQUISITION GAP / ROOT CAUSE NOT YET FULLY PROVEN`

First falsifier for the next slice:

- reproduce on accepted source with one finger holding throttle and another operating D/R;
- distinguish browser click-suppression/acquisition behavior from command semantics;
- establish the smallest explicit pointer contract that makes the intent reliable;
- preserve held throttle value, direction sign semantics and all existing steering/pedal ownership.

Do not change vehicle gearing, motor power or drivetrain behavior in this slice.

## 5. Pedal mechanical feedback — later separate Owner target

The current progress-fill feedback is functional alpha, not the desired final metaphor. Preferred future presentation is a mechanically legible pedal whose visible depression tracks actuation.

Keep separate:

1. stable invisible acquisition geometry — command authority;
2. contact/actuation semantic state — input meaning;
3. visible pedal mechanism — presentation only.

Possible visual variables include hinge rotation/foreshortening, translation, linkage/arm motion and restrained depth/contact cues. Do not make animated hitbox geometry authoritative.

## 6. Steering — accepted foundation, tuning open

`DIRECT_ROTATION / Obrót` and `RELATIVE_X / Przeciąganie` are accepted source foundation modes. Preserve no-jump/fail-closed principles and tune each only through focused real-driving evidence. Relative-X current `1 -> 4` progressive gain remains a tuning hypothesis, not frozen truth. `X_POSITION` is historical/regression reference only.

## 7. Longitudinal handling — separate future scope

Owner observed that very small brake input can dominate full throttle and reiterated broad low vehicle power. This is not pedal-input evidence.

Treat as later vehicle/handling work involving brake/motor balance and longitudinal dynamics. Do not tune it while fixing D/R acquisition or pedal presentation.

## 8. Fault localization

```text
controls clipped/overlap actions        -> responsive composition
initial pedal value feels wrong         -> pedal mapping/tuning
cannot acquire pedal at exact zero      -> neutral/contact-zone tuning
stationary finger changes pedal command -> acquisition geometry bug
pedal value correct but looks wrong     -> pedal presentation
D/R misses second-finger intent         -> D/R pointer acquisition/lifecycle
Direct feels wrong                      -> Direct gesture/tuning
Relative feels wrong                    -> Relative gain/gesture tuning
brake/motor balance feels wrong         -> vehicle/handling stage
scan/frame-rate problem                  -> performance/render stage with new evidence
```

A failure in one layer is not justification to discard the whole control stack.

## 9. Work-selection rule / living roadmap

There is no fixed remaining P-stage scheduler.

Current recommended sequence:

- D/R multitouch grounding and acquisition hardening;
- pedal mechanical feedback + neutral/contact-zone tuning;
- dual-mode steering refinement when concrete feel evidence calls for it;
- steering/pedal industrial-design convergence;
- desktop/mobile capability hygiene;
- portrait-specific composition;
- later JURE/rig/handling;
- performance/scan scaling only from measured new need.

Default loop:

1. verify live refs/current state;
2. select one concrete Owner need;
3. state hypothesis and falsifier;
4. make the smallest coherent source change;
5. run a causal check matching the blast radius;
6. deploy through Owner Preview;
7. judge on real device/render evidence;
8. keep, locally revise or reject;
9. run full canonical close only at a real foundation/release boundary.

Owner intervention is for appearance, feel and real-device behavior — not release-script mechanics.

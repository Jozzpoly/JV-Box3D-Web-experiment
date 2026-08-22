# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING ACCEPTED / ABSOLUTE-POSITION PEDALS OWNER-PREFERRED / D-R MULTITOUCH GAP EVIDENCED / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Evidence boundary

```text
accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

accepted executable/source head before pedal experiment:
  bd4f6ad5df097b65536f7cb63d4fcb88691d9042

Owner-tested absolute-position pedal candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

device/browser:
  Samsung Galaxy A53 / Chrome
```

Dual-mode steering is an accepted source foundation. Exact pedal candidate `e2d67ea1...` has focused **30/30 PASS** and Owner device evidence judging its absolute-position semantics better than the accepted relative-from-touch mapping. Pedal integration and final tuning remain open.

## 2. Protected current baseline

Preserve unless a focused later slice explicitly changes it:

- useful central world/vehicle visibility and current mobile HUD composition;
- minimal persistent driving HUD + transient utility drawer;
- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes;
- analog throttle/brake foundation;
- independent throttle/brake ownership and simultaneous use;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- core D/R command/sign semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

Do not use control polish as a reason to change drivetrain, vehicle physics, rig topology or JURE authority.

## 3. Pedal input semantics — Owner-preferred direction, integration open

The accepted pre-experiment implementation is **relative-from-touch displacement**:

```text
pointer-down -> semantic 0
move upward  -> command grows from originY
move downward -> command falls toward 0
release/lifecycle loss -> 0
```

Exact candidate `e2d67ea1...` tests **absolute position inside stable/frozen pedal acquisition geometry**:

```text
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by Y
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

The candidate freezes pedal `top + height` at pointer-down and maps current Y against that frozen rectangle. Animation remains presentation-only and cannot redefine command geometry. Range exit clamps safely.

Preserved invariants:

- independent throttle/brake pointer ownership;
- simultaneous throttle + brake;
- core D/R sign semantics;
- fail-closed pointer capture and lifecycle release;
- no M6 physics/drivetrain change;
- no steering-semantic change.

Owner A53/Chrome test confirms low/mid/high acquisition, micro-correction, full sweep/reversal, throttle+brake multitouch and steering+pedal coexistence. Owner verdict: **better**.

Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`.

Do not reintroduce relative-from-touch merely because it is still the accepted `main` baseline before integration. Also do not silently promote the candidate until the integration close is completed.

## 4. Zero/contact buffer — future pedal tuning

Owner wants the ability to touch the pedal at exact zero and then smoothly roll into analog actuation. A useful future falsifier is a lower **~5–10%** zero/contact region:

```text
finger touches lower buffer -> command stays 0
finger crosses actuation threshold -> command begins smoothly
further travel -> continuous analog command
release -> 0
```

The exact size, threshold shape and value curve are not frozen. Prefer to think of this as **contact before actuation**, not a hidden arbitrary dead zone.

Presentation should eventually reveal the state change:

1. finger/control acquired, still in zero/contact buffer;
2. pedal actuation has begun;
3. visible mechanical depression follows command.

This should be designed together with pedal mechanical feedback so visual and semantic thresholds agree. Do not add the buffer during the current integration close.

## 5. D/R multitouch — separate input-boundary problem

Owner real-device testing found that D/R does not switch while throttle remains held.

Core D/R command semantics are still deliberate: if a direction toggle event arrives while throttle is active, the same analog value is re-signed at the toggle timestamp.

The weak boundary is acquisition/lifecycle:

- D/R `pointerdown` only stops propagation;
- actual switching relies on `click`;
- D/R does not own a pointer lifecycle comparable to steering/pedals;
- this path is unchanged by the absolute-position pedal candidate.

Classification: `OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL-MAPPING DELTA / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`.

Prefer an isolated D/R acquisition experiment after the pedal semantics close. Do not change drivetrain direction semantics in that same slice unless evidence proves they are wrong.

## 6. Pedal mechanical feedback — separate but related Owner target

Progress-fill feedback is functional alpha, not the desired final metaphor. Preferred future presentation is a mechanically legible pedal whose visible depression tracks actual command.

Keep separate:

1. stable invisible acquisition geometry — command authority;
2. zero/contact vs actuation semantics — input-state meaning;
3. visible pedal mechanism — presentation only.

Possible visual variables include hinge rotation/foreshortening, translation, linkage/arm motion and restrained depth/contact cues. Do not make animated hitbox geometry authoritative.

## 7. Brake dominance and vehicle power — handling boundary

Owner observed that very small brake input can dominate full throttle and reiterated that the vehicle is broadly underpowered.

Treat this as future longitudinal/handling work, not evidence against the pedal input model. Do not tune motor power, brake torque or T+B arbitration while closing pedal semantics or D/R input acquisition.

## 8. Steering — accepted foundation, tuning open

`DIRECT_ROTATION / Obrót` and `RELATIVE_X / Przeciąganie` are accepted source foundation modes. Preserve no-jump/fail-closed principles and tune each only through focused real-driving evidence. Relative-X current `1 -> 4` progressive gain remains a tuning hypothesis, not frozen truth. `X_POSITION` is historical/regression reference only.

## 9. Fault localization

```text
controls clipped/overlap actions        -> responsive composition
initial pedal value feels wrong         -> pedal mapping/value curve
cannot touch at exact zero cleanly      -> pedal zero/contact buffer
stationary finger changes pedal command -> acquisition geometry bug
pedal command correct but looks wrong   -> pedal presentation
D/R misses second-finger intent         -> D/R pointer acquisition/lifecycle
small brake overwhelms full throttle    -> longitudinal/handling stage
Direct feels wrong                      -> Direct gesture/tuning
Relative feels wrong                    -> Relative gain/gesture tuning
scan/frame-rate problem                  -> performance/render stage with new evidence
```

A failure in one layer is not justification to discard the whole control stack.

## 10. Work-selection rule / living roadmap

There is no fixed remaining P-stage scheduler.

Current recommended sequence:

- integrate the exact Owner-preferred absolute-position pedal foundation without adding new tuning;
- D/R multitouch acquisition grounding/hardening;
- pedal mechanical feedback + zero/contact-zone tuning;
- dual-mode steering refinement when concrete feel evidence calls for it;
- steering/pedal industrial-design convergence;
- desktop/mobile capability hygiene;
- portrait-specific composition;
- later JURE/rig/handling, including longitudinal power/brake balance under its own boundary;
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

# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING FOUNDATION ACCEPTED IN SOURCE / ABSOLUTE-POSITION PEDAL FALSIFIER ACTIVE / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules for future mobile driving polish. It does **not** define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Accepted evidence boundary

```text
older P1.2/P1.3/P1.3.1 accepted executable:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

current accepted source head before pedal experiment:
  bd4f6ad5df097b65536f7cb63d4fcb88691d9042

active pedal candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4
```

Dual-mode steering is an accepted source foundation. Final steering tuning remains open. The active pedal candidate is experimental and has not yet received Owner feel acceptance.

## 2. Protected current baseline

Preserve unless a focused later slice explicitly changes it:

- useful central world/vehicle visibility and current mobile HUD composition;
- minimal persistent driving HUD + transient utility drawer;
- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` as retained Owner-facing steering modes;
- analog throttle/brake foundation;
- independent throttle/brake ownership and simultaneous use;
- steering + pedal multitouch foundation;
- fail-closed release/cancel/lifecycle behavior;
- current D/R command semantics;
- Camera Manual Rig V1 and Fullscreen V1;
- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x performance boundary.

Do not use control polish as a reason to change drivetrain, vehicle physics, rig topology or JURE authority.

## 3. Composition — accepted foundation, not final design

Future composition changes should preserve central world visibility, stable steering/longitudinal zones, reachable utility actions, explicit safe-area/viewport ownership and portrait as a separate layout problem. Do not remap an already-owned gesture merely because artwork moves.

## 4. Pedal input semantics — active falsifier, not accepted truth

Accepted `main` pedals are **relative-from-touch displacement** controls:

```text
pointer-down -> semantic 0
move upward  -> command grows from originY
move downward -> command falls toward 0
release/lifecycle loss -> 0
```

Active candidate `work/pedal-absolute-position@e2d67ea1...` tests the durable alternative hypothesis **absolute position inside stable/frozen pedal acquisition geometry**:

```text
bottom region -> low command
upper region  -> high command
pointer-down immediately takes the value represented by Y
move upward   -> command increases
move downward -> command decreases
release/lifecycle loss -> 0
```

The candidate freezes pedal `top + height` at pointer-down and maps the current pointer Y against that frozen rectangle to `[0,1]`. Animation remains presentation-only and cannot redefine command geometry. Range exit clamps safely.

Preserved invariants:

- independent throttle/brake pointer ownership;
- simultaneous throttle + brake;
- current D/R sign semantics;
- fail-closed pointer capture and lifecycle release;
- no M6 physics/drivetrain change;
- no steering-semantic change.

Focused causal evidence on exact `e2d67ea1...`: repo-declared Node/npm, `npm ci`, three directly relevant suites, **30/30 PASS**.

Still unresolved is the falsifier that matters: whether direct absolute positioning feels more intentional and predictable on the real A53 than relative-from-touch. Judge low/mid/high acquisition, micro-correction, full sweep/reversal and multitouch. If the result is ambiguous, add an A/B comparison only then.

Margins, dead bands and non-linear value curves remain possible later tuning variables; do not add them before Owner evidence identifies a need.

## 5. D/R multitouch — likely next functional boundary

Current D/R command semantics already do an important thing correctly: changing D/R while throttle is held re-signs the same current analog throttle value at toggle time.

The weaker boundary is input acquisition rather than drivetrain semantics. D/R currently stops pointerdown propagation but performs the actual switch through `click`; it does not own an explicit pointer lifecycle comparable to the steering and pedal adapters. Current tests prove D/R command semantics, but not a strong real-device second-finger sequence while another continuous control remains held.

Treat this as a grounded next experiment, **not** as a proven regression. If the active pedal semantics are retained, prefer D/R multitouch acquisition hardening before large pedal visual/mechanical redesign.

## 6. Pedal mechanical feedback — separate Owner target

Progress-fill feedback is functional alpha, not the desired final metaphor. Preferred future presentation is a mechanically legible pedal whose visible depression tracks command.

Keep separate:

1. stable invisible acquisition geometry — command authority;
2. visible pedal mechanism — presentation only.

Possible visual variables include hinge rotation/foreshortening, translation, linkage/arm motion and restrained depth/contact cues. Do not make animated hitbox geometry authoritative. Keep input semantics and industrial design separable wherever possible.

## 7. Steering — accepted foundation, tuning open

`DIRECT_ROTATION / Obrót` and `RELATIVE_X / Przeciąganie` are accepted source foundation modes. Preserve no-jump/fail-closed principles and tune each only through focused real-driving evidence. Relative-X current `1 -> 4` progressive gain remains a tuning hypothesis, not frozen truth. `X_POSITION` is historical/regression reference only.

## 8. Fault localization

```text
controls clipped/overlap actions        -> responsive composition
initial pedal value feels wrong         -> pedal mapping
stationary finger changes pedal command -> acquisition geometry bug
pedal value correct but looks wrong     -> pedal presentation
D/R misses second-finger intent         -> D/R pointer acquisition/lifecycle
Direct feels wrong                      -> Direct gesture/tuning
Relative feels wrong                    -> Relative gain/gesture tuning
car physics under T+B feels wrong       -> vehicle/handling stage
scan/frame-rate problem                  -> performance/render stage with new evidence
```

A failure in one layer is not justification to discard the whole control stack.

## 9. Work-selection rule / living roadmap

There is no fixed remaining P-stage scheduler.

Current recommended sequence:

- resolve the active absolute-position pedal falsifier from Owner evidence;
- if retained, D/R multitouch acquisition hardening;
- pedal mechanical feedback;
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

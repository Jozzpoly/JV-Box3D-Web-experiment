# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / PEDAL CONTACT V1-V1.1 NOT ACCEPTED + DEFERRED / DESKTOP-MOBILE CAPABILITY HYGIENE NEXT / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules. It does not define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Accepted foundations

```text
steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

D/R multitouch integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc
```

Protect:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`;
- accepted absolute-position pedals with acquisition geometry frozen at pointer-down;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- D/R explicit pointer ownership/lifecycle while other controls remain held;
- fail-closed continuous-control lifecycle;
- core D/R sign/re-sign semantics;
- product-owned active/focus/mechanical feedback without browser tap-highlight overlay;
- Camera, Fullscreen, Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53 performance boundary.

## 2. Pedal Contact + Mechanical Feedback V1/V1.1 — closed experiment

The experiment tested whether a lower zero/contact buffer would materially improve the accepted absolute-position pedal model.

Evidence:

- RED `6e228f103148b88c78f46a7cfc56bf2a0020c2c7` proved the old accepted mapping did not satisfy the proposed contact/actuation contract;
- logic GREEN `0c259fe67d10c1a23479968fd0ab86f2d7bfce35` followed a test-only float tolerance correction;
- V1 `8690368a...` passed focused causal validation and bundle build;
- a live-identity probe proved V1 was genuinely served by Owner Preview;
- V1.1 `6312906d...` preserved the same mapping and changed only contact observability/presentation;
- a second live-identity probe proved V1.1 was genuinely served;
- Owner A53/Chrome use found that a zero region existed, but its practical useful extent felt around 1% or less and the feature was not worth further iteration cost.

Classification:

`OWNER VERDICT — NOT ACCEPTED / DEFERRED FOR NOW`

Durable rules:

- do not integrate V1/V1.1 into accepted source;
- do not continue tuning zone percentages, hysteresis or contact-only presentation by default;
- accepted absolute-position pedals remain the current baseline;
- later pedal geometry/industrial design may justify revisiting the concept, but only from a new explicit goal and evidence.

This outcome is a prioritization/value decision, not proof that the experiment was technically invalid.

## 3. Next grounding target — desktop/mobile capability hygiene

Before implementation, inventory actual controls/functions across desktop and mobile.

For each item classify:

- `SHARED`: useful and semantically correct on both;
- `MOBILE_ONLY`: should not appear as an inert/misleading desktop control;
- `DESKTOP_ONLY`: should not pollute mobile;
- `SHARED_DIFFERENT_PRESENTATION`: same capability, different surface/layout;
- `UNCLEAR`: needs Owner/device evidence before change.

Do not begin with broad selectors or blanket hiding. Prefer one smallest high-confidence mismatch, then test only its real blast radius.

Protect driving semantics, pointer ownership, steering/pedals/D-R, drivetrain, vehicle physics and rig authority.

## 4. Longitudinal handling — separate

Small brake input dominating full throttle and broad low vehicle power belong to a dedicated handling/longitudinal slice. They are not evidence against the accepted pedal input foundation and must not be mixed into UI capability hygiene.

## 5. Fault localization

```text
cyan overlay on custom touch control    -> browser/touch presentation polish (accepted fix exists)
D/R second-finger intent missed         -> D/R pointer acquisition/lifecycle
gas drops during unrelated D/R touch    -> pointer ownership/lifecycle
absolute pedal mapping feels wrong      -> pedal input semantics/tuning
contact-zone idea low-value             -> deferred; do not reopen without new goal
mobile-only control inert on desktop    -> desktop/mobile capability hygiene
small brake overwhelms full throttle    -> handling/longitudinal
```

## 6. Living sequence

- desktop/mobile capability hygiene grounding -> smallest high-confidence fix;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- later JURE/rig/handling;
- performance only from measured need;
- Friends/Public promotion remains a separate release decision.

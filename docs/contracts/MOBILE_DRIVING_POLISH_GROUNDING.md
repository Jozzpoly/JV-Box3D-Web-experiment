# JV Web — mobile driving polish grounding

Status: `CURRENT MOBILE FOUNDATION OWNER-ACCEPTED / DUAL-MODE STEERING + ABSOLUTE PEDALS ACCEPTED / D-R MULTITOUCH ACQUISITION FALSIFIER ACTIVE / FUTURE CONTROL TUNING OPEN / NOT A SCHEDULER`
Owner: Jozz
Updated: 2026-08-22

This document preserves durable Owner intent and fault-localization rules. It does not define a mandatory numbered scheduler and does not authorize vehicle-physics, final rig or JURE-authored geometry changes.

## 1. Accepted foundations

```text
steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

current accepted source before D/R experiment:
  77eee609cf317dc135ec3e0fd9b8b107d90917ef
```

Protect:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`;
- absolute-position pedals with frozen acquisition geometry and immediate represented value;
- independent throttle/brake ownership;
- steering + pedal multitouch;
- fail-closed continuous-control lifecycle;
- core D/R sign semantics;
- Camera, Fullscreen, Plac E2R, Offroad, JSPREV2, owner vehicle and accepted A53 performance boundary.

## 2. D/R real-device failure and root boundary

Owner A53/Chrome test: hold throttle with one finger, operate D/R with another -> D/R does not switch.

The old implementation was not a true multitouch pointer contract:

```text
D/R pointerdown -> stop propagation only
browser click   -> actual toggle
```

This is weaker than steering/pedals. Existing tests proved what happens after a click reaches the adapter, not whether a non-primary second touch reliably produces that click while another touch remains active.

Do not classify this as a drivetrain failure. If `#toggleDirection` is invoked, held throttle is already re-signed correctly.

## 3. Active falsifier

```text
RED:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

GREEN candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

lane:
  work/dr-multitouch-acquisition
```

RED models:

1. pointer 1 acquires and holds throttle;
2. pointer 2 performs D/R pointerdown/pointerup;
3. D/R must toggle without releasing pointer 1;
4. held throttle value must be re-signed at the toggle timestamp.

Old click-only source failed this test as expected.

Candidate contract:

- D/R pointerdown acquires one explicit pointer capture;
- only the owned pointerup toggles;
- pointercancel/lost capture/lifecycle loss clears the in-flight D/R pointer without toggle;
- different pedal pointers remain independently owned;
- a pointer-generated click after the pointer gesture cannot double-toggle;
- keyboard/assistive click activation remains supported as a detail-zero fallback;
- command/sign semantics stay in the existing toggle path.

Focused candidate evidence: `npm ci`, typecheck, D/R tests, analog-drive, viewport lifecycle, host analog-drive contract and mobile integration contract — PASS on repo-declared toolchain; status `jv/dr-multitouch-causal = success`.

## 4. Owner falsifier still required

On A53/Chrome, judge only acquisition/reliability:

- hold throttle -> second finger D -> R;
- keep throttle -> second finger R -> D;
- throttle should not drop merely because D/R is operated;
- steering + throttle + D/R should coexist;
- ordinary single D/R tap should remain natural.

Do not use this checkpoint to tune power, brake torque, pedal dead zone or steering sensitivity.

## 5. Pedal neutral/contact tuning — later

Absolute-position pedal semantics are already accepted. Owner wants the ability to touch at exact zero and roll smoothly into actuation. Rough lower 5–10% zero/contact buffer remains a hypothesis, not a frozen value.

Future mechanical feedback should make three states legible:

1. acquired/contact;
2. actuation threshold crossed;
3. mechanical depression proportional to command.

Animated geometry must remain presentation-only.

## 6. Longitudinal handling — later

Small brake input dominating full throttle and broad low vehicle power belong to a dedicated handling/longitudinal slice, not D/R acquisition.

## 7. Fault localization

```text
D/R second-finger intent missed          -> D/R pointer acquisition/lifecycle
D/R event arrives but sign is wrong      -> D/R command semantics
gas drops during unrelated D/R touch     -> pointer ownership/lifecycle
cannot acquire pedal at exact zero       -> pedal contact-zone tuning
pedal value correct but looks wrong      -> pedal presentation
small brake overwhelms full throttle     -> handling/longitudinal
```

## 8. Living sequence

- resolve current D/R candidate from Owner evidence;
- if retained, integrate/close it before another product lane;
- pedal mechanical feedback + neutral/contact tuning;
- desktop/mobile capability hygiene;
- portrait composition;
- steering/pedal industrial-design convergence and later steering feel tuning;
- later JURE/rig/handling;
- performance only from measured need.

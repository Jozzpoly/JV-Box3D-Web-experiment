# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL CONTACT + MECHANICAL V1.1 ACTIVE ON PREVIEW / FIRST OWNER ATTEMPT INCONCLUSIVE ON OBSERVABILITY / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `work/pedal-contact-mechanics`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
5. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
6. Do not revive closed steering, absolute-pedal, D/R or tap-highlight work lanes merely because old refs remain visible.

## Exact anchors

```text
accepted mobile tap-highlight executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R multitouch executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active pedal contact/mechanical lane:
  work/pedal-contact-mechanics@6312906d5ad3c6781605859cd1d9613d7f2e220a

pedal contact RED:
  6e228f103148b88c78f46a7cfc56bf2a0020c2c7

pedal contact logic GREEN:
  0c259fe67d10c1a23479968fd0ab86f2d7bfce35

pedal contact V1 machine-green:
  8690368aa19242bb37b9476737ee9b1f5374724a

pedal contact V1.1 live candidate:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview source:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## Accepted control boundary

Protect:

- dual-mode steering (`Obrót` + `Przeciąganie`), final feel/tuning open;
- accepted absolute-position pedals with frozen acquisition geometry;
- independent throttle/brake pointer ownership;
- steering + pedal multitouch;
- D/R explicit pointer acquisition/lifecycle while other controls remain held;
- fail-closed lifecycle behavior and existing D/R sign/re-sign semantics;
- tap-highlight suppression on custom mobile driving controls;
- current camera/fullscreen/mobile composition and accepted map/scan/A53 performance foundations.

Keep drivetrain, motor/brake balance, vehicle physics and rig/JURE out of the active pedal slice.

## Active Pedal Contact + Mechanical Feedback V1.1

Accepted `main` is the fallback baseline. V1.1 is technically grounded but not Owner-accepted.

Input semantics remain the same as V1:

- lower 10% of frozen pedal height is experimental zero/contact space;
- pointer capture/contact is valid there while longitudinal command stays exactly zero;
- remaining 90% maps linearly to the full `0..1` range;
- `data-active` represents contact/ownership;
- derived `data-actuated` represents real actuation above zero;
- contact-only does not dim the peer pedal or mechanically depress the mechanism;
- only inner visual layers follow `--pedal-value`; outer hitbox remains stable.

10% is an experimental number, not a frozen product specification.

Evidence path:

- RED `6e228f10...` failed as expected on the accepted old contract;
- test-only float-oracle correction yielded logic GREEN `0c259fe...`;
- V1 `8690368a...` passed typecheck, focused analog/UI/lifecycle/host/D-R integration suites and bundle build; `jv/pedal-contact-causal = success`;
- first Owner A53 attempt reported no visible meaningful change;
- temporary live-identity probe proved exact V1 `8690368a...` was truly live, so deployment/cache was not the cause;
- recording review showed the experiment itself was too subtle to read reliably; classify that Owner attempt as `INCONCLUSIVE — OBSERVABILITY/DISCOVERABILITY INSUFFICIENT`;
- V1.1 `6312906d...` changes only mobile polish CSS relative to V1, adds an explicit lower 10% contact shelf and stronger contact-only feedback, and leaves input mapping untouched;
- live-identity probe independently confirmed exact `6312906d...` is now served by Owner Preview; helper was removed afterwards.

## Next checkpoint

Owner-test exact `6312906d...` on Samsung Galaxy A53 / Chrome.

Judge only the current falsifier:

1. the zero/contact shelf should now be visibly discoverable;
2. touch inside it -> exact zero with clear contact acknowledgment;
3. roll slowly from zero into low analog values;
4. cross the threshold repeatedly and report chatter if any;
5. verify 100% range remains practical;
6. judge contact versus real mechanical actuation;
7. quick throttle+brake, steering+pedal and pedal+D/R regression smoke.

Do not integrate solely from machine plausibility. After Owner evidence choose: accept, retune zone only, adjust presentation only, add hysteresis only if real chatter exists, or reject.

## Separate later work

- small brake dominating full throttle / broad low power -> longitudinal handling;
- desktop/mobile capability hygiene;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.

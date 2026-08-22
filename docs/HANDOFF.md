# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL CONTACT + MECHANICAL V1 ACTIVE ON PREVIEW / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

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
  work/pedal-contact-mechanics@8690368aa19242bb37b9476737ee9b1f5374724a

pedal contact RED:
  6e228f103148b88c78f46a7cfc56bf2a0020c2c7

pedal contact logic GREEN:
  0c259fe67d10c1a23479968fd0ab86f2d7bfce35

Owner Preview source:
  8690368aa19242bb37b9476737ee9b1f5374724a

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

## Active Pedal Contact + Mechanical Feedback V1

Accepted `main` is the fallback baseline. Candidate `8690368a...` is technically green but not Owner-accepted.

V1 intentionally tests one model:

- lower **10%** of frozen pedal height is zero/contact space;
- pointer capture/contact is valid there while longitudinal command stays exactly zero;
- the remaining 90% maps linearly to the full `0..1` range;
- `data-active` represents contact/ownership;
- derived `data-actuated` represents real actuation above zero;
- contact-only does not dim the peer pedal or mechanically depress the mechanism;
- only inner visual layers follow `--pedal-value`; the outer hitbox remains stable.

10% is an experimental value chosen to make the idea clearly testable on a phone. It is not a frozen product specification.

Evidence:

- RED `6e228f10...` failed as expected on the old contract;
- first logic run exposed only an over-strict floating-point test oracle; compile and UI already passed;
- test-only tolerance correction yielded logic GREEN `0c259fe...`;
- final `8690368a...` passed typecheck, focused analog/UI/lifecycle/host/D-R integration suites and bundle build; `jv/pedal-contact-causal = success`;
- temporary CI helper was retired after recording the result;
- normal Owner Preview now selects exact `8690368a...` plus accepted JSPREV2.

## Next checkpoint

Owner-test exact `8690368a...` on Samsung Galaxy A53 / Chrome.

Judge only the current falsifier:

1. acquire at the bottom at exact zero;
2. roll slowly from zero into low analog values;
3. cross the threshold repeatedly and report any chatter;
4. verify full 100% range remains practical;
5. judge whether contact and actual mechanical actuation are visually distinguishable;
6. quick throttle+brake, steering+pedal and pedal+D/R regression smoke.

Do not integrate solely from machine plausibility. After Owner evidence choose: accept, retune zone only, adjust presentation only, add hysteresis only if real chatter exists, or reject.

## Separate later work

- small brake dominating full throttle / broad low power -> longitudinal handling;
- desktop/mobile capability hygiene;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.

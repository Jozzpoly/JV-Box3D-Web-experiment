# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED / PEDAL CONTACT V1-V1.1 DEFERRED + NOT ACCEPTED / NO ORDINARY ACTIVE LANE / DESKTOP-MOBILE CAPABILITY HYGIENE NEXT / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
5. Do not revive closed steering, absolute-pedal, D/R, tap-highlight or pedal-contact experiments merely because historical refs remain visible.

## Exact accepted anchors

```text
accepted mobile tap-highlight executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

accepted D/R multitouch executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

accepted absolute-position pedal executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

pedal-contact V1 evidence only:
  8690368aa19242bb37b9476737ee9b1f5374724a

pedal-contact V1.1 evidence only:
  6312906d5ad3c6781605859cd1d9613d7f2e220a

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

There is currently **no ordinary active product lane**. Friends/Public remains a separate older artifact and does not automatically inherit later accepted source work.

## Accepted control boundary

Protect:

- dual-mode steering (`Obrót` + `Przeciąganie`), final feel/tuning open;
- absolute-position pedals with frozen acquisition geometry;
- independent throttle/brake pointer ownership;
- steering + pedal multitouch;
- D/R explicit pointer acquisition/lifecycle while other controls remain held;
- fail-closed lifecycle behavior and existing D/R sign/re-sign semantics;
- tap-highlight suppression on custom mobile driving controls;
- current camera/fullscreen/mobile composition and accepted map/scan/A53 performance foundations.

Keep drivetrain, motor/brake balance, vehicle physics and rig/JURE out of unrelated UI hygiene work.

## Pedal Contact + Mechanical Feedback V1/V1.1 — closed without acceptance

V1/V1.1 tested a lower zero/contact region on top of the accepted absolute-position pedal foundation.

Machine evidence was technically green, and live-identity probes proved the expected candidates were genuinely served by Owner Preview. Owner A53/Chrome use nevertheless found the practical contact region barely perceptible and not valuable enough to justify further tuning/presentation work. Owner explicitly requested that this function stop consuming effort and that the project move on.

Classification:

`OWNER VERDICT — NOT ACCEPTED / DEFERRED FOR NOW`

Do not integrate the experiment. Do not continue percentage/hysteresis/presentation tuning unless later pedal geometry or product needs materially change the value proposition.

Accepted absolute-position pedal semantics remain the current baseline.

## Next checkpoint

Perform **Desktop/Mobile Capability Hygiene Grounding** before implementation.

Start with an inventory of real controls/functions and classify each as shared, mobile-only, desktop-only, presentation-specific or unclear. Do not begin with blanket CSS hiding. Choose the smallest high-confidence mismatch for the first implementation slice.

Preserve steering, pedal mapping, D/R semantics, multitouch, drivetrain, physics and rig.

## Separate later work

- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- small brake dominating full throttle / broad low power -> longitudinal handling;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.

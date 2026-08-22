# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH + MOBILE TAP-HIGHLIGHT POLISH ACCEPTED / NO ORDINARY ACTIVE LANE / PEDAL MECHANICAL + CONTACT-ZONE GROUNDING NEXT / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.
5. Do not revive closed steering, pedal-mapping, D/R or tap-highlight work lanes merely because old refs remain visible.

## Exact accepted anchors

```text
mobile tap-highlight integration executable:
  86c99911a878136abee6485c88cd3ca2a18ed9fc

Owner-tested tap-highlight candidate:
  a8fb118bb75c3b15fbec20bd2537d4354077a16a

D/R multitouch integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

Owner-tested D/R candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

D/R RED falsifier:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

There is currently **no ordinary active product lane**. Preview is an operational control lane only. Friends/Public remains a separate older accepted artifact.

## Accepted control boundary

- dual-mode steering (`Obrót` + `Przeciąganie`) remains accepted; final feel/tuning open;
- absolute-position pedals with frozen acquisition geometry are accepted; neutral/contact/value-curve/mechanical presentation tuning open;
- throttle and brake have independent pointer ownership;
- steering + pedals can coexist under multitouch;
- D/R has explicit pointer acquisition/lifecycle and can be operated while other controls remain held;
- existing D/R command/sign semantics remain unchanged;
- custom mobile driving controls suppress the browser tap-highlight overlay while retaining product-owned active/focus/mechanical feedback.

## Recent accepted evidence

### D/R multitouch

Old click-dependent D/R acquisition failed a source RED test and Owner A53 use. GREEN `3f6acc82...` introduced explicit pointer capture/lifecycle only. Focused causal checks passed, and Owner A53/Chrome video confirmed simultaneous throttle, brake, D/R and steering. Integration `bd8980eb...` passed the full Windows repository build.

Classification: `OWNER ACCEPTED — D/R MULTITOUCH ACQUISITION FOUNDATION IN SOURCE`.

### Mobile tap-highlight polish

Owner recording exposed an intermittent cyan whole-control overlay. Candidate `a8fb118b...` changed only mobile polish CSS to set `-webkit-tap-highlight-color: transparent` on custom mobile driving controls.

Owner A53/Chrome re-test confirmed:

- cyan overlay gone;
- normal pedal visual feedback preserved;
- steering and D/R preserved.

Integration `86c99911...` mechanically preserves that exact CSS with current accepted docs.

Classification: `OWNER ACCEPTED — MOBILE TOUCH-HIGHLIGHT POLISH`.

## Next checkpoint

Do not start by drawing a prettier pedal.

First perform **Pedal Mechanical + Contact-Zone Grounding**. The Owner intent to preserve is:

- touching the pedal near the bottom should be able to mean exact zero;
- the finger should then roll smoothly into analog actuation rather than jump immediately above zero;
- a rough 5–10% lower contact/zero region is only a hypothesis to test;
- visual/mechanical feedback should make contact versus actual actuation legible;
- animated pedal geometry must remain presentation-only and must not alter the frozen input geometry beneath the finger.

Keep drivetrain, motor/brake balance, D/R, steering and rig/physics out of this slice.

## Separate later work

- small brake dominating full throttle / broad low power -> longitudinal handling;
- desktop/mobile capability hygiene;
- portrait-specific composition;
- steering/pedal industrial-design convergence and later steering tuning;
- JURE/rig/handling later;
- Friends/Public promotion remains a separate release decision.

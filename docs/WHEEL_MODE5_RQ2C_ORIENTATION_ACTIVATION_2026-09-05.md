# Wheel mode5 — RQ2C orientation activation

Date: 2026-09-05

Status: **ACTIVE BOUNDED RESEARCH AFTER RH0 CLOSURE**

This record activates `research/wheel-mode5-rq2c-orientation-2026-09-05` from exact green RH0 closure head `c596684ea9a4b99e70d730c1b1b6f02f74cdab63`.

The former branch `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03` is retained as ancestry / historical evidence. No new experiments should be appended there.

## Source-of-truth split

- `docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json` is the RH0 closure/evidence ledger and is intentionally retained as provenance of the closed campaign.
- `docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json` is the current execution pointer after RH0.
- The active apparatus remains the explicit consolidated suite `tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp` plus the frozen replay contract.

## Immediate gate

The next experiment is not a stiffness sweep.

1. First execute a translationally-free `0 deg` control with the existing local-axis `b3ParallelJoint` angular mount at `120 Hz` and damping ratio `1.0`.
2. If the wheel cannot preserve RQ0-like straight rolling without the historical world `linearZ` lock, classify the apparatus as insufficient for the orientation challenge and design a mechanically local translational carrier. Do not hide the failure by increasing angular stiffness.
3. Only if the `0 deg` control is valid, execute symmetric `+3.5 deg` and `-3.5 deg` yaw-rotated-heading cases. Rotate wheel orientation, linear velocity and matched spin consistently so this remains an orientation/mount equivalence test rather than a lateral tire-force test.

## Predeclared apparatus budgets

The challenge angle is `3.5 deg`, equal to 10% of the current temporary JV-Web `35 deg` full-lock scale.

- mount stiffness: `120 Hz`, unchanged from RQ2C0A;
- max axle-axis orientation error: `0.035 deg`;
- max heading error: `0.035 deg`;
- the historical `<100 microrad` gate is not reused as product truth;
- the prior corrected 120 Hz error `0.008525 deg` is evidence only and is already below the challenge-derived budget.

No result from this stage validates full annular side/inner/bore contact semantics, representative suspension loads, lateral grip, final steering geometry or production wheel architecture.

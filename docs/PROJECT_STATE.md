# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `STEERING + ABSOLUTE PEDALS ACCEPTED IN MAIN / D-R MULTITOUCH ACQUISITION CANDIDATE SELECTED ON OWNER PREVIEW / OWNER DEVICE VERDICT OPEN / PEDAL TUNING OPEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted source before active D/R experiment:
  77eee609cf317dc135ec3e0fd9b8b107d90917ef

accepted absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active ordinary product lane:
  work/dr-multitouch-acquisition

RED falsifier anchor:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

active D/R candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

Owner Preview control lane:
  preview/owner-control

Owner Preview pointer source:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/public artifact:
  Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` remains accepted source truth. The D/R branch is experimental. Preview selection and machine PASS do not grant source acceptance.

## 2. Protected accepted foundations

Preserve during this slice:

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` steering foundation; tuning open;
- absolute-position throttle/brake mapping inside geometry frozen at pointer-down;
- immediate pointer-down pedal value;
- independent throttle/brake ownership and simultaneous use;
- steering + pedal multitouch;
- fail-closed release/cancel/lifecycle behavior;
- existing D/R command/sign semantics;
- current mobile composition, Camera Manual Rig V1, Fullscreen V1;
- Plac E2R, Offroad, JSPREV2 and owner vehicle;
- accepted A53/Chrome render-1x boundary.

Do not change drivetrain, motor/brake balance, vehicle physics, pedal neutral-zone tuning or steering feel in the D/R acquisition slice.

## 3. Owner-observed D/R failure

On Samsung Galaxy A53 / Chrome, Owner held throttle with one finger and attempted to switch D/R with another. D/R did **not** switch.

Source grounding showed:

- D/R is a real `<button>`;
- CSS uses `touch-action: manipulation`;
- existing adapter handled D/R `pointerdown` only with `stopPropagation()`;
- actual toggle depended on later `click`;
- tests injected `click()` directly and therefore proved command semantics, not second-finger acquisition.

Web-platform multi-pointer semantics make compatibility click/mouse behavior an unsafe dependency for a non-primary second touch. The failure is therefore localized to D/R acquisition/lifecycle rather than pedal mapping or drivetrain sign logic.

## 4. RED -> GREEN falsifier

### RED

Exact `9a4ed881...` added one source-level test only:

- pointer 1 owns held throttle;
- pointer 2 performs `pointerdown -> pointerup` on D/R;
- expected direction changes while throttle ownership remains intact and the held analog value is re-signed.

Canonical focused run failed exactly because current D/R did not react to that pointer sequence. Status: `jv/dr-multitouch-causal = failure` — expected RED.

### Candidate

Exact `3f6acc82...` changes only:

- `src/input/pointer-analog-drive-adapter.ts`;
- `tests/dr-multitouch-acquisition.test.mjs`.

New D/R acquisition contract:

1. supported `pointerdown` acquires one explicit D/R pointer and capture;
2. valid owned `pointerup` toggles D/R;
3. `pointercancel`, lost capture or lifecycle loss releases ownership without toggling;
4. a separate pedal pointer may remain owned while D/R operates;
5. pointer-generated `click` is ignored after pointer handling so it cannot double-toggle;
6. keyboard/assistive synthetic `click` remains a fallback;
7. the existing `#toggleDirection` command path and held-throttle re-sign semantics are preserved.

### GREEN

Exact `3f6acc82...` passed repository-declared toolchain validation with:

- exact clean checkout;
- `npm ci`;
- `npm run typecheck`;
- focused D/R test;
- analog-drive tests;
- mobile viewport lifecycle tests;
- clean-browser analog-drive contract;
- mobile-driving integration contract.

Status: `jv/dr-multitouch-causal = success`.

The temporary causal workflow was retired after recording the result.

## 5. Owner Preview / NOT VALIDATED

Owner Preview V2 pointer selects exact `3f6acc82...` plus the unchanged accepted JSPREV2 layer.

Still NOT VALIDATED by Owner/device evidence:

- hold throttle -> second-finger D -> R;
- keep throttle held -> second-finger R -> D;
- whether throttle remains continuous rather than dropping/reacquiring;
- steering + throttle + D/R coexistence;
- normal single-pointer D/R tap on phone;
- no obvious regression in accepted pedals/steering.

Do not merge the D/R candidate before this real-device checkpoint.

## 6. Pedal tuning remains separate

Absolute-position pedals are accepted in source. Future tuning remains:

- possible lower ~5–10% zero/contact buffer (percentage not frozen);
- smooth transition from contact to actuation;
- final value curve;
- mechanical/visual pedal feedback and industrial design.

Do not mix that work into D/R acquisition.

## 7. Longitudinal handling remains separate

Owner observed small brake input dominating full throttle and broad low vehicle power. This remains future handling/longitudinal work, not a D/R or pedal-input fix.

## 8. Living roadmap

Current recommendation:

1. resolve active D/R candidate from Owner A53 evidence;
2. if accepted, integrate D/R pointer acquisition into `main` with proportional validation;
3. pedal mechanical feedback + neutral/contact-zone tuning;
4. desktop/mobile capability hygiene;
5. portrait-specific composition;
6. steering/pedal industrial-design convergence and later steering tuning;
7. later JURE/rig/handling, including motor/brake balance;
8. performance scaling only from measured need.

No fixed P-stage scheduler.

## 9. Fresh-agent recovery

Resolve live `main`, `work/dr-multitouch-acquisition`, Owner Preview pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Recover:

- steering and absolute-position pedals are accepted foundations in source;
- D/R second-finger failure is Owner-observed and localized to acquisition;
- `9a4ed881...` is the RED reproducer;
- `3f6acc82...` is the focused GREEN candidate selected for Preview;
- Owner device verdict on the D/R candidate remains open;
- pedal neutral-zone/mechanical work and vehicle handling are separate later scopes.

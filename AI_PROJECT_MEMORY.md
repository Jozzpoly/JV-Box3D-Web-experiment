# AI project memory — JV Web

Updated: 2026-08-22
Status: `STEERING + ABSOLUTE PEDALS ACCEPTED IN MAIN / D-R MULTITOUCH CANDIDATE ACTIVE / OWNER DEVICE VERDICT OPEN / PEDAL TUNING OPEN / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted source before active D/R experiment: `77eee609cf317dc135ec3e0fd9b8b107d90917ef`;
- accepted pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- accepted steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- active ordinary lane: `work/dr-multitouch-acquisition`;
- D/R RED anchor: `9a4ed88113eea28ff14a0bc410843122c3bd6dbd`;
- active D/R candidate: `3f6acc821c9db9d4cd77845b8eb81f4625aaaef7`;
- Owner Preview pointer source: `3f6acc821c9db9d4cd77845b8eb81f4625aaaef7`;
- Preview JSPREV2 layer: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/Public: `279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted foundations

Dual-mode steering and absolute-position pedals are accepted source foundations. Steering tuning remains open. Pedal lower zero/contact buffer, value curve and mechanical feedback remain open.

## Active D/R experiment

Owner A53 evidence showed D/R does not switch while throttle is held by another finger.

Root-cause grounding:

- old D/R path stopped `pointerdown` propagation but toggled only on `click`;
- tests dispatched `click()` directly and did not prove second-finger pointer acquisition;
- multi-pointer web semantics make click/compatibility-mouse behavior unsafe as the only non-primary touch contract;
- core sign semantics remain separately valid if a toggle reaches the adapter.

RED `9a4ed881...`: held throttle + second D/R pointerdown/pointerup failed as expected.

GREEN `3f6acc82...`:

- D/R owns one explicit pointer via capture;
- owned pointerup toggles;
- cancel/lost capture/lifecycle loss releases without toggle;
- pedal pointer remains independently owned;
- pointer-generated click cannot double-toggle;
- keyboard/assistive click fallback remains;
- existing held-throttle re-sign function is unchanged.

Exact candidate differs from accepted source only in `src/input/pointer-analog-drive-adapter.ts` and new `tests/dr-multitouch-acquisition.test.mjs`.

Focused validation: exact checkout, repo Node/npm, `npm ci`, typecheck, new D/R tests plus analog-drive, viewport lifecycle, host analog contract and mobile integration tests — PASS; status `jv/dr-multitouch-causal = success`.

Owner Preview selects the candidate; Owner A53 verdict is still open. Do not merge before that evidence.

## Later boundaries

- pedal zero/contact buffer ~5–10% is a hypothesis, not frozen;
- pedal mechanical feedback should distinguish contact from actuation;
- small brake dominating full throttle / low power is later handling work;
- Friends/Public does not auto-advance with source.

## Roadmap

`D/R Owner validation + close -> pedal mechanical feedback + neutral-zone tuning -> desktop/mobile hygiene -> portrait -> control industrial-design convergence -> later JURE/rig/handling`

Performance only from measured need.

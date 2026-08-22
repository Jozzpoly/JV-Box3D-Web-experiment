# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS ACCEPTED / D-R MULTITOUCH CANDIDATE ACTIVE ON PREVIEW / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `work/dr-multitouch-acquisition`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
5. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.

## Accepted boundary

```text
accepted source before D/R experiment:
  77eee609cf317dc135ec3e0fd9b8b107d90917ef

accepted pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active D/R lane:
  work/dr-multitouch-acquisition

RED D/R falsifier:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

GREEN D/R candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` remains source/product authority. Preview is operational. Friends/Public remains separate older artifact authority.

## Accepted controls

- `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` are accepted steering foundation modes; final tuning open.
- Absolute-position pedals are accepted in source: pointer Y maps inside frozen acquisition geometry; immediate acquisition value is retained; final zero/contact buffer and mechanical feedback open.
- Independent pedals, steering+pedal multitouch and fail-closed lifecycle are protected.

## D/R problem and grounding

Owner A53/Chrome evidence: with throttle held by one finger, D/R did not switch under a second finger.

Old adapter path depended on `click`: D/R `pointerdown` only stopped propagation. Existing tests injected `click()` and did not cover second-pointer acquisition. This is an acquisition/lifecycle gap, not evidence that drivetrain sign semantics are wrong.

Source-only RED test `9a4ed881...` modeled held throttle + second pointer `pointerdown/pointerup` on D/R and failed as expected.

Candidate `3f6acc82...` gives D/R a scoped pointer lifecycle:

- pointerdown capture;
- owned pointerup toggles;
- cancel/lost capture/lifecycle loss releases without toggle;
- pointer-generated click cannot double-toggle;
- keyboard/assistive click fallback remains;
- existing held-throttle re-sign path remains unchanged.

Focused validation on exact `3f6acc82...`: exact checkout, repo Node/npm, `npm ci`, typecheck, D/R causal test plus analog/lifecycle/mobile integration suites — PASS, status `jv/dr-multitouch-causal = success`.

Only adapter + new D/R test differ from accepted source. No CSS, pedal mapping, steering, drivetrain or physics changes.

## Owner checkpoint

Owner Preview pointer selects exact `3f6acc82...` + accepted JSPREV2.

Need real A53 judgement:

1. hold throttle, second finger D -> R;
2. keep throttle held, second finger R -> D;
3. verify throttle stays continuous;
4. steering + throttle + D/R coexistence;
5. normal D/R tap still behaves naturally.

Do not integrate from machine evidence alone.

## Separate later work

- pedal lower ~5–10% zero/contact buffer is a future tuning hypothesis, not frozen;
- pedal mechanical feedback should make contact vs actuation legible;
- brake dominance / low vehicle power belongs to later handling;
- Friends/Public promotion remains a separate release decision.

## Next checkpoint

**Obtain Owner real-device verdict on exact `3f6acc82...`. If PASS, structurally close D/R acquisition into accepted source before starting pedal mechanical/neutral-zone polish.**

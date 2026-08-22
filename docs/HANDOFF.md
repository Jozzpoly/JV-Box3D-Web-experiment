# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / STEERING + ABSOLUTE PEDALS + D-R MULTITOUCH ACCEPTED / MOBILE TAP-HIGHLIGHT POLISH ACTIVE ON PREVIEW / OWNER DEVICE VERDICT OPEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live source `main`.
2. Resolve `work/mobile-touch-highlight-polish`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
5. Read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`.

## Exact anchors

```text
accepted D/R integration executable:
  bd8980eba3e62b5a4b48df528be2db275addf7b4

Owner-tested D/R candidate:
  3f6acc821c9db9d4cd77845b8eb81f4625aaaef7

D/R RED falsifier:
  9a4ed88113eea28ff14a0bc410843122c3bd6dbd

accepted pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

accepted steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active touch-highlight lane:
  work/mobile-touch-highlight-polish@a8fb118bb75c3b15fbec20bd2537d4354077a16a

Owner Preview JSPREV2:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/Public:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

## Accepted controls

- dual-mode steering remains accepted with final tuning open;
- absolute-position pedals remain accepted with neutral/contact and mechanical tuning open;
- throttle/brake pointers are independent and coexist with steering;
- D/R now has explicit pointer ownership/lifecycle and can operate while other controls remain held;
- drivetrain sign semantics were not redesigned.

## D/R close evidence

Owner originally reproduced the second-finger D/R failure on A53/Chrome. Old source depended on `click` rather than a true D/R pointer lifecycle.

RED `9a4ed881...` failed the held-throttle + second-pointer sequence as expected.

GREEN `3f6acc82...` added only D/R pointer acquisition/lifecycle plus focused tests. Repo toolchain, `npm ci`, typecheck and causal integration suites passed.

Owner then supplied A53/Chrome recording and explicitly confirmed simultaneous throttle, brake, D/R and steering operation. This accepts capability/reliability, not ergonomic ease of four-finger driving.

Integration candidate `bd8980eb...` preserved exact D/R runtime/test blobs plus current docs and passed `windows-latest`, repo Node/npm, `npm ci`, full `npm run build`; status `jv/dr-integration-close = success`. `main` now contains this foundation.

## Active cyan/tap-highlight polish

The Owner recording also exposes an intermittent cyan/translucent overlay over the throttle touch target around the reported ~13 s point.

The pedal already disables text selection; the artifact covers the touch target as a whole and is visually separate from product pedal fill. Leading hypothesis: browser tap highlight.

Candidate `a8fb118b...` changes only `src/mobile-driving-polish.css`:

```css
.mobile-control,
.mobile-steering-joystick {
  -webkit-tap-highlight-color: transparent;
}
```

This is deliberately narrow. It does not change hit geometry, pointer events, D/R, steering, pedals, physics or our custom focus/active feedback.

Owner Preview selects exact `a8fb118b...`. Need A53 judgement: repeatedly operate pedals/steering/D-R and confirm the cyan browser overlay no longer appears while normal control feedback remains legible.

Do not integrate from source plausibility alone because the property is browser-specific and the regression is visual/device-specific.

## Separate later work

- pedal lower ~5–10% zero/contact buffer is a tuning hypothesis, not frozen;
- mechanical pedal feedback should make contact vs actuation legible;
- brake dominance / low vehicle power belongs to later longitudinal handling;
- desktop/mobile capability hygiene and portrait remain later independent slices;
- Friends/Public promotion is a separate release decision.

## Next checkpoint

**Owner-test exact `a8fb118b...` on A53. If the cyan highlight is gone with no control regression, integrate the CSS-only polish and return to a clean baseline before starting pedal mechanical/contact-zone work.**

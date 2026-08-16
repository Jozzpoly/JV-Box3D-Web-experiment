# JV Web — takeover handoff

Updated: 2026-08-17
Status: `HANDOFF READY / P1 ACCEPTED / MAINTENANCE CLOSED / PRODUCT CONTINUATION NEXT / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry — do this, not archaeology

1. Resolve live private `main` and public `release/friends-r1`.
2. Read `AGENTS.md`.
3. Read `docs/PROJECT_STATE.md`.
4. Read this handoff.
5. Read `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for the Owner's current UI/control intent.
6. Inspect only current mobile UI/layout source and relevant tests for the selected next slice.

Do **not** restart the closed neutral-foundation campaign, old recovery work, Camera/Fullscreen reconstruction, pre-P1 CSS repair or public-overlay repair without new contradictory evidence.

## Live repository state after Owner cleanup

Verified at handoff preparation:

```text
private JV-Web branches: main only
private open PRs/issues: 0 / 0
public open PRs/issues: 0 / 0
public Friends: release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
public Pages: built, HTTPS enforced, source release/friends-r1 /
public control-plane main: 8f6e0e5009379423302c76b74ca189b824ce5cef
JURE accepted main: d971b8bef5dd7c65b78884b6b449e1f5ab0e7425
```

The Owner manually removed the redundant private branches, including the former rollback/checkpoint refs. Historical commit `f8eb0908f5934aed2d504f34ce483a02754039ec` still exists in current-main ancestry and remains historical evidence, not a live branch.

Public cleanup is incomplete: eight old `checkpoint/*` branches still exist. They are non-authoritative historical refs. Keep `main`, `release/friends-r1` and immutable `release/r0`.

## Accepted product baseline

Preserve unless the selected product slice explicitly changes it:

- desktop + Galaxy A53 / Chrome Friends foundation;
- Plac E2R, Offroad and approved JSPREV2;
- owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- current X-only analog steering `POSITION` behavior as the working reference;
- analog pedal foundation;
- independent pedal ownership/multitouch/lifecycle/D-R semantics;
- accepted A53 render-1x performance boundary.

P1 is not final HUD, pedal mechanics, pedal mapping, steering visuals/gesture, portrait composition, final rig geometry or handling.

## Latest Owner feedback — preserve this intent

The Owner's last direct product verdict after P1 was positive about the driving controls but explicit about the next problem:

- pedals work and are substantially better than the previous binary buttons;
- substantial multi-stage polishing is expected;
- the UI has become chaotic;
- in rotated/short landscape states part of the screen/interface can disappear or become poorly usable;
- pedals can cover useful interface;
- the UI must be recomposed as a coordinated system before deeper pedal/steering redesign.

This is why **P1.2 coordinated HUD composition is next**. Do not jump straight to P2 pedal mapping merely because its desired semantics are already documented.

## Neutral foundation — closed evidence

Exact Owner-side Windows PASS anchor:

`3606e59368cac47d2fa7c505dbe4b5875a6a6c48`

V5 proved: canonical clone/origin, Node 24.16.0/npm 11.17.0, `npm ci`, TypeScript, 8/8 focused neutral tests, deterministic provenance, wrong-origin + dirty-source falsifiers, 452/452 full tests, docs/third-party checks, production bundle/leak scan and final clean HEAD. Receipt SHA-256:

`a43d079b7803e39bfec42a6c5f15f838ef1f5b5ac5e06d7474d15493b4ed9bf0`

The current handoff/docs commits after that anchor are documentation-only. Exact execution PASS belongs to `3606e593...`; do not transfer it across future source/test/dependency changes.

V1/V2 were harness failures. V4 found one false-positive assertion. They are resolved history, not current defects.

## Security/dependency finding

V5 captured:

- production-only audit: 0 vulnerabilities;
- all dependencies: one high transitive dev-only `nanoid` advisory, GHSA-2v37-7h3g-55p8 / CVE-2026-67213.

Do not blindly `npm audit fix`. Treat it as a future deliberate dependency-maintenance slice, not a blocker for P1.2.

## JURE boundary

JURE stays paused and remains future authored-rig authority. JV stays runtime authority. Never mix exact/JURE hardpoints with incompatible procedural M6 geometry in a partial hybrid.

## Product continuation order

The former Main Promotion Preparation/maintenance prerequisite is satisfied. In the next product conversation, use:

`P1.2 coordinated HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait composition`

### Immediate next slice: P1.2

Goal: turn the accepted but still chaotic mobile overlay into deliberate zones while preserving the working input semantics.

Protect:

- central world/vehicle visibility;
- lower-left steering zone;
- lower-right longitudinal zone;
- Camera/Reset/Debug/fullscreen/location reachability without pedal-drag competition;
- short landscape with browser chrome and true fullscreen as distinct viewport classes;
- portrait as a distinct layout;
- frozen gesture geometry during an owned pointer interaction.

Keep P1.2 layout-only whenever possible. Do not change pedal mapping, steering gesture, vehicle physics or JURE authority in the same slice.

## Known non-blocking debt

- dev-only `nanoid` advisory;
- JS gap in portable network-policy proof;
- eight public historical checkpoint branches;
- no branch protection currently enabled;
- existing Vite `box3d.js` browser-externalization and large-chunk warnings.

Do not turn these into another maintenance campaign unless they block the active product goal.

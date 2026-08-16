# AI project memory — JV Web

Updated: 2026-08-17
Status: `P1 ACCEPTED / MAINTENANCE CLOSED / PUBLIC TAKEOFF COMPLETE / HANDOFF READY / PRODUCT CONTINUATION NEXT / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Authority

- private source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- private branch set after Owner cleanup: **main only**;
- public artifact/Pages authority: `main@f512551dc41196bc8ca053357408c93b4b3725be` of `Jozzpoly/JV-Box3D-Web-Public`;
- public branch set after Owner cleanup: **main only**;
- public Pages: **built**, HTTPS enforced, source `main` `/`;
- public executable source anchor: private `0260c8b39c0bb9594afe423b30d8e3536918f24c`;
- P1 promotion evidence: `2b12a2fa99d49ebe4d748ed851c194825129d38f`;
- Owner-tested P1 source: `c9b5990b226685abe35851fc5e9496323096ecf7`;
- previous accepted public Friends commit: `a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- historical public R0 commit: `c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`;
- historical pre-P1 private anchor: `f8eb0908f5934aed2d504f34ce483a02754039ec`;
- exact neutral-foundation Windows PASS: `3606e59368cac47d2fa7c505dbe4b5875a6a6c48`.

The old public `release/friends-r1`, `release/r0` and checkpoint refs are removed. Their exact commits remain reachable from accepted public `main` history where applicable; branch names are not authority.

Owner manually smoke-tested the new public-main Pages publication on desktop and phone for about five minutes with no observed regression from the accepted P1 behavior. Treat this as publication/behavior smoke acceptance, not as proof that the current HUD, pedals, steering visuals or portrait composition are final.

## Accepted P1

Owner-accepted desktop + Galaxy A53 / Chrome foundation: Plac E2R, Offroad, approved JSPREV2, owner vehicle, Camera Manual Rig V1, Fullscreen V1, current X-only analog steering `POSITION`, analog pedals and established input/lifecycle/D-R behavior.

Do not treat current HUD composition, pedal mapping/design, steering visual/gesture, portrait layout, final rig or handling as accepted final truth.

## Latest Owner product feedback

Pedals work and are a major improvement over old binary buttons, but the current interface is still chaotic. In rotated/short landscape states useful interface can disappear or be obscured; pedals can cover useful UI. The next work must first coordinate the mobile HUD/layout as one system before deeper pedal or steering redesign.

## Maintenance/publication closure

Exact Windows V5 at `3606e593...` passed canonical clone/origin, Node 24.16.0/npm 11.17.0, install/typecheck, 8/8 focused neutral tests, provenance + falsifiers, 452/452 full tests, docs/third-party, production bundle/leak scan and final clean HEAD. Receipt SHA-256:

`a43d079b7803e39bfec42a6c5f15f838ef1f5b5ac5e06d7474d15493b4ed9bf0`

Public takeoff then promoted the reviewed artifact to `JV-Box3D-Web-Public/main@f512551...`. Corrected artifact equivalence passed with zero errors; executable JS/CSS behavior was unchanged apart from exact source-build identity, the approved scan stayed byte-preserved from `a325c279...`, Pages moved to `main` `/`, and the Owner desktop+phone smoke found no regression.

V1/V2 harness failures, the V4 false-positive test and later Windows wrapper failures are resolved process history. Do not restart them without new contradictory evidence. Documentation-only descendants do not move the exact execution or public-executable source anchors.

## Security/dependency boundary

V5: production-only audit 0 vulnerabilities; all-dependency audit has one high transitive dev-only `nanoid` advisory (GHSA-2v37-7h3g-55p8 / CVE-2026-67213). Future dependency-maintenance debt only; no blind `npm audit fix`.

Other non-blocking debt: JS gap in portable network-policy proof, no branch protection, existing Vite `box3d.js` browser-externalization and large-chunk warnings.

## JURE pause

Accepted JURE main remains `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`. JURE is future authored-rig authority; JV is runtime authority. Never splice exact/JURE hardpoints into incompatible procedural M6 geometry.

## Product continuation

Maintenance and public takeoff are closed. In a separate product conversation resume:

`P1.2 HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait`

Immediate target: **P1.2 coordinated mobile HUD composition**, preserving current steering/pedal semantics, Camera/Fullscreen, scan and accepted product behavior.

For takeover read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md -> docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`, resolve live private/public `main` and Pages first, then inspect only source/tests relevant to P1.2.

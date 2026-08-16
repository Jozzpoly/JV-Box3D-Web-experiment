# AI project memory — JV Web

Updated: 2026-08-17
Status: `P1 ACCEPTED / MAINTENANCE CLOSED / HANDOFF READY / PRODUCT CONTINUATION NEXT / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Authority

- private source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- private branch set after Owner cleanup: **main only**;
- P1 promotion evidence: `2b12a2fa99d49ebe4d748ed851c194825129d38f`;
- Owner-tested P1 source: `c9b5990b226685abe35851fc5e9496323096ecf7`;
- public Friends: `release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`;
- historical pre-P1 commit anchor: `f8eb0908f5934aed2d504f34ce483a02754039ec` (former private rollback ref removed);
- exact neutral-foundation Windows PASS: `3606e59368cac47d2fa7c505dbe4b5875a6a6c48`.

Public Pages is built from `release/friends-r1` root with HTTPS. Eight old public `checkpoint/*` refs still exist but are not active authority. Private/public open PRs and issues are 0/0.

## Accepted P1

Owner-accepted desktop + Galaxy A53 / Chrome foundation: Plac E2R, Offroad, approved JSPREV2, owner vehicle, Camera Manual Rig V1, Fullscreen V1, current X-only analog steering `POSITION`, analog pedals and established input/lifecycle/D-R behavior.

Do not treat current HUD composition, pedal mapping/design, steering visual/gesture, portrait layout, final rig or handling as accepted final truth.

## Latest Owner product feedback

Pedals work and are a major improvement over old binary buttons, but the current interface is still chaotic. In rotated/short landscape states useful interface can disappear or be obscured; pedals can cover useful UI. The next work must first coordinate the mobile HUD/layout as one system before deeper pedal or steering redesign.

## Maintenance closure

Exact Windows V5 at `3606e593...` passed canonical clone/origin, Node 24.16.0/npm 11.17.0, install/typecheck, 8/8 focused neutral tests, provenance + falsifiers, 452/452 full tests, docs/third-party, production bundle/leak scan and final clean HEAD. Receipt SHA-256:

`a43d079b7803e39bfec42a6c5f15f838ef1f5b5ac5e06d7474d15493b4ed9bf0`

V1/V2 harness failures and the V4 false-positive test are resolved history. Do not restart them without new evidence. Documentation-only descendants do not move the exact execution anchor.

## Security/dependency boundary

V5: production-only audit 0 vulnerabilities; all-dependency audit has one high transitive dev-only `nanoid` advisory (GHSA-2v37-7h3g-55p8 / CVE-2026-67213). Future dependency-maintenance debt only; no blind `npm audit fix`.

Other non-blocking debt: JS gap in portable network-policy proof, eight public checkpoint refs, no branch protection, existing Vite `box3d.js` browser-externalization and large-chunk warnings.

## JURE pause

Accepted JURE main remains `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`. JURE is future authored-rig authority; JV is runtime authority. Never splice exact/JURE hardpoints into incompatible procedural M6 geometry.

## Product continuation

Maintenance/Main Promotion Preparation is closed. In a separate product conversation resume:

`P1.2 HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait`

Immediate target: **P1.2 coordinated mobile HUD composition**, preserving current steering/pedal semantics, Camera/Fullscreen, scan and accepted product behavior.

For takeover read `AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md -> docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`, then inspect only source/tests relevant to P1.2.

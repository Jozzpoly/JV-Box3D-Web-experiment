# JV Web — current project state

Updated: 2026-08-17
Owner: Jozz
Status: `P1 ACCEPTED / MAINTENANCE FOUNDATION CLOSED / HANDOFF READY / PRODUCT CONTINUATION NEXT / JURE PAUSED`

## 1. Authority and live anchors

Private source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`. Git/current source, actually executed validation and direct Owner observation outrank documentation and branch names.

```text
P1 promoted evidence: 2b12a2fa99d49ebe4d748ed851c194825129d38f
Owner-tested P1 source: c9b5990b226685abe35851fc5e9496323096ecf7
Public Friends: release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
Immutable public fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
Historical pre-P1 private anchor: f8eb0908f5934aed2d504f34ce483a02754039ec
Neutral-foundation exact Windows PASS: 3606e59368cac47d2fa7c505dbe4b5875a6a6c48
```

The former private rollback/checkpoint branch refs have been removed by the Owner. `f8eb0908...` remains an ancestor/evidence commit, not a live branch.

## 2. Repository/publication state at handoff

Verified after Owner cleanup:

- private JV-Web branch set: **`main` only**;
- private JV-Web open PRs: **0**;
- private JV-Web open issues: **0**;
- public JV-Web open PRs: **0**;
- public JV-Web open issues: **0**;
- public Pages status: **built**, HTTPS enforced, source `release/friends-r1` `/`;
- live Friends remains `a325c279...`;
- public control-plane `main` remains `8f6e0e5009379423302c76b74ca189b824ce5cef`;
- JURE accepted `main` remains `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425` and JURE remains paused.

Public branch cleanup is not complete: eight historical `checkpoint/*` refs still exist. They were previously verified as ancestral/redundant evidence and are not active authority. Keep `main`, `release/friends-r1` and `release/r0`; do not confuse checkpoint names with active work.

## 3. Accepted product foundation

P1 is Owner-accepted on desktop and Samsung Galaxy A53 / Chrome. Preserve:

- Plac E2R, Offroad and approved JSPREV2;
- current owner vehicle;
- Camera Manual Rig V1 and Fullscreen V1;
- current X-only analog steering `POSITION` interaction as the working reference;
- analog throttle/brake foundation;
- independent multitouch ownership, fail-closed lifecycle behavior and D/R semantics;
- accepted A53/Chrome render-1x performance boundary.

P1 is a foundation, not final HUD, pedal design/mapping, steering visual language, portrait composition, rig geometry or handling.

## 4. Latest Owner product feedback — next problem to solve

After accepting P1, the Owner explicitly reported that the pedals work and are a major improvement over the old binary buttons, but the interface still needs substantial coordinated polishing:

- the UI has become visually/structurally chaotic;
- in rotated/short landscape states parts of the interface can disappear or become poorly usable;
- pedals can cover useful interface;
- control placement must be reconsidered as one coordinated composition rather than accumulated offsets;
- mechanics, visualization and feedback will be refined iteratively over multiple stages.

The current owner-intent authority is `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`.

## 5. Neutral-rig consumer foundation — CLOSED

JV contains a dormant/read-only engine-neutral consumer seam for the current procedural M6 front-left wishbone. It does not feed Box3D, replace runtime hardpoints or define the future JURE authored format.

Owner-side Windows V5 completed against exact commit `3606e59368cac47d2fa7c505dbe4b5875a6a6c48` with:

- exact clone/origin and canonical Node/npm;
- `npm ci` and strict TypeScript PASS;
- focused neutral tests **8/8 PASS**;
- deterministic receipt/provenance PASS;
- wrong-origin + dirty-source falsifiers PASS;
- full repository suite **452/452 PASS**;
- docs + third-party PASS;
- production bundle + neutral-seam leak scan PASS;
- final exact HEAD clean;
- receipt SHA-256 `a43d079b7803e39bfec42a6c5f15f838ef1f5b5ac5e06d7474d15493b4ed9bf0`.

V1/V2 were harness portability failures; V4 exposed an over-broad test assertion. They are resolved history, not project regressions. Do not restart this campaign without new evidence.

The documentation-only commits after `3606e593...` do not move the execution-evidence anchor. Never transfer that exact PASS across later source/test/dependency changes.

## 6. Security/dependency boundary

V5 audit evidence:

- production-only (`npm audit --omit=dev`): **0 vulnerabilities**;
- all dependencies: one high transitive dev-only `nanoid` advisory, GHSA-2v37-7h3g-55p8 / CVE-2026-67213.

This is dev/build-tooling debt, not demonstrated public-runtime exposure. Do not run blind `npm audit fix`; handle it during a deliberate dependency refresh and revalidate the resulting lockfile/toolchain.

## 7. Non-blocking debt

Known but non-blocking for the next product slice:

1. dev-only `nanoid` advisory above;
2. portable network-policy validation formally covers HTML/CSS, not general JavaScript network behavior;
3. eight redundant public checkpoint refs remain;
4. current private/public branch protection is not enabled;
5. Vite reports the existing `box3d.js` `node:module` browser-externalization warning and a >500 kB main-chunk warning.

Do not turn these into an open-ended cleanup campaign unless they impede the selected product goal.

## 8. JURE boundary

JURE remains future Owner-authored rig authority; JV remains runtime physics/controls/rendering authority.

Durable rule: procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never build a partial hybrid. First coherent future replacement target remains chassis reference + upper/lower arms + carrier reference + 2 inboard revolutes + 2 outboard spherical relations.

## 9. Product continuation — READY

The former Main Promotion Preparation / maintenance prerequisite is now closed. In a **new product conversation**, resume from P1.2 rather than restarting maintenance:

`P1.2 coordinated HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait composition`

First target: **P1.2 coordinated mobile HUD composition**. Preserve the working steering/pedal input foundations while solving zones, overlap, action reachability, central world visibility and short-landscape/portrait composition. Do not mix P1.2 with pedal semantic redesign or vehicle physics changes.

## 10. Fresh-agent takeover

For the next conversation:

1. resolve live private `main` and public `release/friends-r1`;
2. read `AGENTS.md`;
3. read this file;
4. read `docs/HANDOFF.md`;
5. read `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for owner-intent authority;
6. inspect only the current mobile UI/layout source and smallest relevant tests before proposing/implementing P1.2.

Do not restart recovery archaeology, neutral-gate debugging, old Camera/Fullscreen reconstruction, P1 CSS repair, old Friends-overlay repair, accepted-A53 micro-optimization or speculative JURE runtime substitution without new evidence.

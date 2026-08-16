# JV Web — current project state

Updated: 2026-08-17
Owner: Jozz
Status: `P1 ACCEPTED / MAINTENANCE FOUNDATION CLOSED / PUBLIC TAKEOFF COMPLETE / HANDOFF READY / PRODUCT CONTINUATION NEXT / JURE PAUSED`

## 1. Authority and live anchors

Private source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`. Git/current source, actually executed validation and direct Owner observation outrank documentation and branch names.

```text
Public main / Pages artifact: f512551dc41196bc8ca053357408c93b4b3725be
Public artifact executable source: 0260c8b39c0bb9594afe423b30d8e3536918f24c
P1 promoted evidence: 2b12a2fa99d49ebe4d748ed851c194825129d38f
Owner-tested P1 source: c9b5990b226685abe35851fc5e9496323096ecf7
Previous accepted Friends commit: a325c279cfe63a0607dba33c3c635a1716e09f8f
Historical public R0 commit: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
Historical pre-P1 private anchor: f8eb0908f5934aed2d504f34ce483a02754039ec
Neutral-foundation exact Windows PASS: 3606e59368cac47d2fa7c505dbe4b5875a6a6c48
```

The current private handoff commit after this document update is documentation-only. It does not replace `0260c8b39...` as the public executable-source anchor and does not inherit the exact Windows execution claim anchored to `3606e593...`.

## 2. Repository/publication state at handoff

Verified after Owner cleanup and public-main takeoff:

- private JV-Web branch set: **`main` only**;
- public JV-Web branch set: **`main` only**;
- public default/artifact branch: `main@f512551dc41196bc8ca053357408c93b4b3725be`;
- GitHub Pages: **built**, HTTPS enforced, source `main` `/`;
- public `LIVE_BUILD.json`: executable source `0260c8b39...`, preserved approved scan from `a325c279...`, no public runtime overlay carry-forward;
- previous Friends `a325c279...` and historical R0 `c3e33e3...` remain exact history/evidence anchors after their branch refs were removed;
- private/public historical checkpoint branch refs have been removed;
- JURE accepted `main` remains `d971b8bef5dd7c65b78884b6b449e1f5ab0e7425` and JURE remains paused.

The Owner manually exercised the new public-main Pages publication for about five minutes on desktop and phone and observed no regression from the accepted P1 behavior. This is the final Owner smoke gate for publication takeoff; it is not a claim that the current mobile UI/control design is finished.

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

## 6. Public-main takeoff — CLOSED

The reviewed public candidate was rebuilt from private source `0260c8b39c0bb9594afe423b30d8e3536918f24c`, with the approved JSPREV2 payload preserved from accepted public commit `a325c279...` under exact byte/provenance checks.

Final evidence before publication included:

- `check:friends-r1` PASS against the 62-file static candidate;
- build identity exact to `0260c8b39...`;
- corrected artifact equivalence **PASS / errors: []**;
- helper JS and CSS byte-identical to accepted Friends;
- entry JS exact-equivalent after replacing only old/new private source SHA;
- `index.html` exact-equivalent after replacing only the hashed entry filename;
- public promotion by normal Git ancestry, not force-push;
- public commit `f512551...` with parents old public `main@8f6e0e5...` and accepted Friends `a325c279...`;
- Pages switched to `main` `/`, status built, HTTPS enforced;
- Owner desktop + phone smoke: no observed regression over about five minutes;
- final public branch set: **main only**.

The failed V1/FIX1/FIX2/FIX3 wrapper attempts were release-harness/process failures. They did not expose a product regression and must not be restarted unless new evidence contradicts the final accepted state.

## 7. Security/dependency boundary

V5 audit evidence:

- production-only (`npm audit --omit=dev`): **0 vulnerabilities**;
- all dependencies: one high transitive dev-only `nanoid` advisory, GHSA-2v37-7h3g-55p8 / CVE-2026-67213.

This is dev/build-tooling debt, not demonstrated public-runtime exposure. Do not run blind `npm audit fix`; handle it during a deliberate dependency refresh and revalidate the resulting lockfile/toolchain.

## 8. Non-blocking debt

Known but non-blocking for the next product slice:

1. dev-only `nanoid` advisory above;
2. portable network-policy validation formally covers HTML/CSS, not general JavaScript network behavior;
3. current private/public branch protection is not enabled;
4. Vite reports the existing `box3d.js` `node:module` browser-externalization warning and a >500 kB main-chunk warning.

Do not turn these into an open-ended cleanup campaign unless they impede the selected product goal.

## 9. JURE boundary

JURE remains future Owner-authored rig authority; JV remains runtime physics/controls/rendering authority.

Durable rule: procedural M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never build a partial hybrid. First coherent future replacement target remains chassis reference + upper/lower arms + carrier reference + 2 inboard revolutes + 2 outboard spherical relations.

## 10. Product continuation — READY

Maintenance foundation and public takeoff are closed. In a **new product conversation**, resume from P1.2 rather than restarting maintenance:

`P1.2 coordinated HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 intentional portrait composition`

First target: **P1.2 coordinated mobile HUD composition**. Preserve the working steering/pedal input foundations while solving zones, overlap, action reachability, central world visibility and short-landscape/portrait composition. Do not mix P1.2 with pedal semantic redesign or vehicle physics changes.

## 11. Fresh-agent takeover

For the next conversation:

1. resolve live private `main`, public `main`, and GitHub Pages source/status;
2. read `AGENTS.md`;
3. read this file;
4. read `docs/HANDOFF.md`;
5. read `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for owner-intent authority;
6. inspect only the current mobile UI/layout source and smallest relevant tests before proposing/implementing P1.2.

Do not restart recovery archaeology, neutral-gate debugging, old Camera/Fullscreen reconstruction, P1 CSS repair, old Friends-overlay repair, accepted-A53 micro-optimization, public-main takeoff machinery or speculative JURE runtime substitution without new contradictory evidence.

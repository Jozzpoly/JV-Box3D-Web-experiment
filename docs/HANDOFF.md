# JV Web — takeover handoff

Updated: 2026-08-16
Status: `POST-PROMOTION GROUNDING / FRESH-CONVERSATION HANDOFF`

This file is a **takeover snapshot**, not a second project-state authority. If it disagrees with live Git or `docs/PROJECT_STATE.md`, resolve live state and update/remove the stale handoff statement.

Do not grow this file into another historical campaign log.

## 1. Fresh-agent entry

Start cold. Do not assume old chat state is current truth.

Read in this order:

1. live private `main` ref;
2. `AGENTS.md` from that live `main`;
3. `docs/PROJECT_STATE.md`;
4. this file;
5. `docs/ARCHITECTURE.md` only for the subsystem being touched;
6. `docs/OWNER_CHECKPOINTS.md` only when owner acceptance matters;
7. source/tests only after the task boundary is understood.

Also resolve live public Friends only when public/product state matters.

## 2. Exact handoff foundation

At grounding time the accepted/promoted private evidence boundary is:

`2b12a2fa99d49ebe4d748ed851c194825129d38f`

This was the exact candidate that passed the final Main Promotion Gate and was fast-forwarded to `main`.

The exact runtime source the Owner directly drove during the P1 device gate is:

`c9b5990b226685abe35851fc5e9496323096ecf7`

Main-promotion preparation proved no runtime-bearing product changes between that owner-tested source and the promoted candidate. The grounding commit after promotion is documentation-only; it does not claim a new owner runtime test.

Public Friends at grounding:

`Jozzpoly/JV-Box3D-Web-Public release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f`

Private old-main rollback:

`rollback/main-before-p1-foundation-2026-08-16 -> f8eb0908f5934aed2d504f34ce483a02754039ec`

Always re-resolve all moving refs live.

## 3. Why the current main is trusted

Final Main Promotion Gate for exact `2b12a2fa...` established:

- full repository `npm run check`: **444 PASS / 0 FAIL**;
- TypeScript/docs/third-party checks: PASS;
- portable production build + validators: PASS;
- build identity: exact candidate PASS;
- clean source throughout: PASS;
- runtime equivalence to owner-tested `c9b5990b...`: PASS;
- `npm audit --omit=dev`: 0 production vulnerabilities.

One `nanoid` full-audit entry was classified as development/build-tooling-only. Do not change dependencies merely to clear an audit badge; re-triage exact advisory/reachability if maintenance revisits it.

## 4. Owner-accepted product state

The current Friends/P1 foundation was directly used by the Owner on desktop and Samsung Galaxy A53 / Chrome.

Preserve as accepted foundation:

- Plac E2R;
- Offroad;
- approved full JSPREV2 scan;
- current owner vehicle rendering/driving;
- accepted A53 render-1x performance foundation for the tested scan case;
- Camera Manual Rig V1;
- Fullscreen V1;
- X-only analog steering `POSITION` behavior as current working reference;
- analog pedals as current functional foundation;
- correct fail-closed input ownership/lifecycle architecture;
- P1 CSS ownership and short-viewport fixes;
- source-owned public runtime with old public executable overlay removed.

Owner explicitly did **not** accept as final:

- pedal mapping/interaction/mechanical design;
- final HUD composition/spacing;
- final steering visual language;
- rotational steering;
- final authored suspension/steering geometry;
- Ackermann/tie rods;
- final handling.

## 5. Mobile polish continuation

If the Owner chooses mobile polish in the fresh conversation, resume from:

1. P1.2 coordinated mobile HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals;
6. P3 mechanical pedal depression;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B against X-only reference;
9. P6 joint wheel/pedal industrial design and feel;
10. P7 intentional portrait composition.

Do not restart P1.0 CSS authority or the historical `420px` root-floor investigation unless new evidence shows regression.

Pedal target already agreed for P2:

- absolute frozen-geometry Y mapping;
- touch low/bottom = low demand;
- touch high/top = high demand;
- pointerdown immediately emits the touched value;
- moving up increases, moving down decreases;
- preserve independent pedal ownership, multitouch, lifecycle release, D/R semantics.

## 6. JURE coordination — important

JURE is moving in parallel and is the authority for authored neutral rig truth. Do not reconstruct its state from this handoff alone.

At grounding review:

```text
repo: Jozzpoly/Jozz-Universal-Rig-Editor
accepted JURE main: d971b8bef5dd7c65b78884b6b449e1f5ab0e7425
clean foundation candidate / draft PR #3: 4db04eee4da0216f6bd3df6b6b0c82aa20afab5a
active real-JV branch / draft PR #4: work/real-jv-rig-elements@7b385e8e591d13c3ccab06647390d9d28e06a1d4
```

PR #4 already carries a critical consumer falsifier:

- implicit identity placement was rejected;
- procedural JV-Web M6 wishbone and exact/JURE wishbone are not rigid-congruent;
- a partial single-hardpoint JURE substitution would create an incoherent hybrid;
- no M6 runtime hardpoint override is accepted;
- JURE is developing a coherent double-wishbone neutral shape and still needs to finish Owner-operability / freeze the multi-relation consumer fragment.

Therefore the fresh JV-Web agent must **not** pre-build a guessed JURE adapter/schema.

Read `docs/contracts/JURE_CONSUMER_BOUNDARY.md` before any cross-project work.

When JURE is ready, the first JV-Web consumer experiment uses one isolated `jure/<specific-purpose>` branch and remains private until strict parse/placement/coherence tests pass.

## 7. Current M6 interpretation

Current procedural hardpoints/steering/rack code is real working product code but remains provisional consumer geometry.

Do not upgrade it into authored mechanical truth because it is on `main`.

Do not replace one procedural hardpoint with JURE data while leaving an incompatible procedural wishbone around it.

Consumer dynamics remain JV-Web responsibility even after JURE neutral geometry arrives.

## 8. Branch/repository state

Desired steady state is a small branch namespace centered on `main`.

A broad cleanup on 2026-08-16 removed obsolete refs after preserving divergent tips with tags. During an interrupted panic-recovery immediately after cleanup, three historical branch refs were recreated accidentally:

- `archive/pre-cleanup-2026-08-10`;
- `candidate/jv-web-owner-vehicle-visual-r1`;
- `candidate/jv-web-render-host-r1`.

They are not authority and their exact divergent tips already have archive tags. Remove these three redundant refs before final handoff if they still exist. Do not restore any other old branches.

Future branch rules:

- ordinary JV-Web: at most one concrete work lane;
- JURE cross-repo: `jure/<specific-purpose>`;
- no per-conversation/per-agent/per-test branches.

## 9. Do not restart

Unless new evidence directly requires it, do not restart:

- source recovery/takeover archaeology;
- old Camera reconstruction;
- old fullscreen reconstruction;
- historical V1/V2 mobile control campaign;
- old public runtime-overlay repair;
- endless optimization of the already accepted A53 render-1x JSPREV2 case;
- old branch-name authority debates;
- donor `8736a2...` wholesale restoration;
- compiled `main.js` patching/text surgery;
- private GitHub Actions workaround machinery.

## 10. First actions in the fresh conversation

The new orchestrator should perform a narrow cold verification, not a full historical reconstruction:

1. resolve live JV-Web `main`;
2. resolve live public `release/friends-r1`;
3. confirm the current branch namespace is sane;
4. read `AGENTS.md`, `PROJECT_STATE.md`, this handoff;
5. if JURE-relevant, independently resolve live JURE `main`, PR #3 and PR #4;
6. state the exact chosen next lane and why;
7. create a work branch only when implementation actually begins;
8. continue with small evidence-driven slices and rapid owner-visible validation.

The Owner intends the next real development to happen in a **new conversation after this handoff**, not during the grounding conversation.

## 11. Handoff completion criterion

This handoff is complete when:

- promoted `main` documentation tells current truth;
- JURE consumer boundary is explicit without speculative schema;
- obsolete accidental branch refs are removed or clearly identified as non-authoritative;
- live public/private refs are rechecked;
- a fresh conversation can reconstruct the active state from `AGENTS.md -> PROJECT_STATE.md -> HANDOFF.md` without reading old chats.

After successful takeover, keep this file concise. Update/retire stale snapshot data rather than appending another campaign history.
# JV Web — takeover handoff

Updated: 2026-08-16
Status: `P1 ACCEPTED / HANDOFF COMPLETE / JURE PAUSED / READY FOR NEXT PRODUCT SLICE`

This is a takeover snapshot, not source authority. If it disagrees with live Git or `docs/PROJECT_STATE.md`, resolve live state and update/remove the stale statement.

## 1. Fresh entry

For ordinary continuation:

1. resolve live private `main`;
2. read `AGENTS.md`;
3. read `docs/PROJECT_STATE.md`;
4. read this file only when takeover context is useful;
5. inspect subsystem source/tests only after choosing the next task.

Do not reconstruct old campaigns or branch archaeology unless a current fact cannot otherwise be established.

## 2. Accepted JV foundation

Durable evidence anchors:

```text
P1 main-promotion candidate:
  2b12a2fa99d49ebe4d748ed851c194825129d38f

Owner-tested P1 runtime source:
  c9b5990b226685abe35851fc5e9496323096ecf7

Public Friends:
  Jozzpoly/JV-Box3D-Web-Public
  release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
```

The P1 source passed 48/48 focused checks, TypeScript and normal production build. The promoted candidate passed 444/444 complete repository tests, portable/build identity validation and 0 production dependency vulnerabilities. The Owner directly used the P1 Friends build on desktop and Galaxy A53 / Chrome.

Preserve Plac E2R, Offroad, the approved JSPREV2 scan, owner vehicle, Camera Manual Rig V1, Fullscreen V1, fixed-step/timestamped inputs, independent throttle/brake ownership and current X-only steering `POSITION` behavior unless a scoped task intentionally changes them.

## 3. Open Owner-visible mobile work

P1 deliberately did not finalize:

- HUD layout/spacing;
- portrait composition;
- pedal mapping/mechanical visual feedback;
- steering visual design;
- rotational steering;
- final rig/steering/handling.

Current pedal target for the later P2 slice remains:

- absolute frozen-geometry Y mapping;
- low/bottom touch = low demand;
- high/top touch = high demand;
- pointerdown immediately emits touched demand;
- moving vertically changes demand continuously;
- independent pedal ownership, multitouch, lifecycle release and D/R semantics remain preserved.

Default sequence if mobile polish is chosen:

`P1.2 coordinated HUD -> P1.3 action/navigation policy -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 final portrait composition`

The next implementation should begin with the smallest visible slice that reduces UI obstruction/chaos. Do not redesign every control at once.

## 4. JURE pause boundary

JURE is intentionally not an active parallel project lane now.

Accepted JURE `main` remains:

`d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Preserved, closed-without-merge boundaries:

```text
JURE PR #3 — clean validated foundation candidate:
  promotion/foundation-ready-squash-2026-08-16
  @4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

JURE PR #4 — paused real-JV authoring line:
  checkpoint/paused-jv-authoring-2026-08-16
  @f0f8cd91aca583610dc2dedd34e537a145a01b61

JV PR #25 — paused neutral receipt seam:
  checkpoint/jure-neutral-receipt-paused-2026-08-16
  @7ff1c73ac74c46bce29bd4a4bd68d672dc662ef1
```

No paused PR was merged. No accepted `main` was moved as part of the pause.

The JV neutral seam exact `fd84fcf4...` passed the earlier canonical Windows gate, but later `7ff1c73...` has additional hardening and **does not inherit that PASS claim**. Its exact final gate is still pending and only matters if this seam is resumed.

## 5. Durable cross-project result

When JURE is eventually needed again:

- JURE remains authored neutral rig / Owner authoring authority;
- JV remains runtime physics/controls/rendering authority;
- procedural M6 and exact/JURE wishbone geometry are not rigid-congruent;
- never splice one authored hardpoint/relation into the incompatible procedural shape;
- first coherent future target is chassis ref + upper/lower arms + carrier ref + 2 revolute + 2 spherical relations;
- validate strict format/provenance/units/basis/placement and coherent neutral geometry before any Box3D substitution;
- keep the first integration private and separate from Friends publication.

Read `docs/contracts/JURE_CONSUMER_BOUNDARY.md` before resuming cross-project work.

## 6. Repository hygiene

The obsolete accidental branch refs from the prior recovery are confirmed absent. Do not restore the old branch forest.

At ordinary steady state keep `main` plus at most one real work lane. Paused/checkpoint JURE refs exist only for recovery/evidence and are not active work.

## 7. What not to restart

Without new evidence, do not restart:

- source recovery/takeover archaeology;
- old Camera or Fullscreen reconstruction;
- historical V1/V2 mobile control campaigns;
- P1 CSS authority/root-floor work;
- old Friends executable-overlay repair;
- endless optimization of the accepted A53 render-1x case;
- compiled-runtime text surgery;
- private GitHub Actions workaround machinery;
- speculative JURE adapter/runtime substitution.

## 8. Handoff result

The grounding/handoff stage is complete. The repository is ready for normal JV product development from live `main`.

No new branch should be created merely because a new conversation starts. Create one only when the Owner chooses a concrete implementation slice.
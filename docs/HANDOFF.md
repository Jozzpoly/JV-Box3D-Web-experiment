# JV Web — takeover handoff

Updated: 2026-08-16
Status: `P1 ACCEPTED / MAIN ACTIVE / NEUTRAL RIG FOUNDATION IN MAIN / JURE PAUSED`

This is a takeover snapshot, not source authority. If it disagrees with live Git or `docs/PROJECT_STATE.md`, resolve live state first.

## 1. Fresh entry

For ordinary continuation:

1. resolve live private `main`;
2. read `AGENTS.md`;
3. read `docs/PROJECT_STATE.md`;
4. read this file only when takeover context is useful;
5. inspect subsystem source/tests only after choosing the next task.

Do not reconstruct old campaigns or branch archaeology unless a current fact cannot otherwise be established.

## 2. Accepted JV foundation

Durable anchors:

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

Preserve Plac E2R, Offroad, approved JSPREV2, owner vehicle, Camera Manual Rig V1, Fullscreen V1, fixed-step/timestamped inputs, independent throttle/brake ownership and current X-only steering `POSITION` behavior unless a scoped task intentionally changes them.

## 3. JV neutral rig foundation

Useful work from the former isolated JURE-preparation lane is now JV `main` foundation rather than branch authority.

The seam provides:

- engine-neutral body/frame/relation representation;
- explicit `jv-rig-space/v1` convention;
- read-only projection of the current procedural front-left M6 double wishbone;
- deterministic diagnostic receipt export;
- exact producer repository+commit and factory-receipt blob/SHA-256 provenance;
- fail-closed dirty-source and wrong-origin protection;
- geometry equivalence checks against the current FL suspension input;
- no Box3D/runtime substitution.

Use `npm run export:jure-neutral-geometry` only as diagnostic/cross-project evidence. Its output is JV consumer truth, not the future JURE authored file format.

This foundation exists so that when the Owner and agent resume JURE, a completed authored rig can be compared against the exact current JV mechanical assumptions rather than guessed from runtime code.

## 4. JURE pause boundary

JURE is intentionally not an active parallel lane now.

Accepted JURE `main` remains:

`d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`

Preserved boundaries:

```text
clean validated foundation candidate / closed PR #3:
  4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

paused real-JV authoring checkpoint / closed PR #4:
  checkpoint/paused-jv-authoring-2026-08-16
  @f0f8cd91aca583610dc2dedd34e537a145a01b61
```

Closed PR #2 retains full recovery/foundation evidence. None of these lines was merged into JURE `main` during the pause.

## 5. Durable cross-project result

When JURE is needed again:

- JURE remains authored neutral rig / Owner authoring authority;
- JV remains runtime physics/controls/rendering authority;
- procedural M6 and exact/JURE wishbone geometry are not rigid-congruent;
- never splice one authored hardpoint/relation into the incompatible procedural shape;
- first coherent future target is chassis ref + upper/lower arms + carrier ref + 2 revolute + 2 spherical relations;
- validate strict schema/provenance/units/basis/placement and coherent neutral geometry before any Box3D substitution;
- keep first runtime integration private and separate from Friends publication.

Read `docs/contracts/JURE_CONSUMER_BOUNDARY.md` before resuming cross-project work.

## 6. Branch hygiene

JV steady state is **main-only**. Old work/checkpoint refs are not authority and should not remain after their useful content is preserved.

A future temporary branch is justified only by a concrete risky implementation or rollback need. Do not create branches per agent, conversation or test.

## 7. Open Owner-visible mobile work

P1 deliberately did not finalize HUD layout/spacing, portrait composition, pedal mapping/mechanical visual feedback, steering visual design, rotational steering, final rig/steering geometry or final handling.

Default sequence if mobile polish is chosen:

`P1.2 coordinated HUD -> P1.3 action/navigation -> P1.4 driving-zone sizing -> P1.5 portrait sanity -> P2 absolute pedals -> P3 mechanical depression -> P4 steering visuals -> P5 rotational A/B -> P6 joint industrial design -> P7 final portrait composition`

Current pedal target for P2 remains absolute frozen-geometry Y mapping with immediate pointerdown demand; low/bottom = low, high/top = high; preserve independent pedal ownership, multitouch, lifecycle release and D/R semantics.

## 8. What not to restart

Without new evidence, do not restart source recovery/takeover archaeology, old Camera/Fullscreen reconstruction, historical V1/V2 mobile controls, P1 CSS/root-floor work, old Friends executable-overlay repair, endless accepted-A53 optimization, compiled-runtime text surgery, private Actions workaround machinery or speculative JURE runtime substitution.

The project is ready for ordinary JV product work from live `main`; authored-rig work can resume later from the preserved JURE checkpoints using the neutral JV foundation already present in `main`.

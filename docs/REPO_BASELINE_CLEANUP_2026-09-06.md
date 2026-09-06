# JV-Web — baseline cleanup manifest

Date: 2026-09-06
Owner: Jozz
Status: `PREPARED / NO REMOTE BRANCH DELETION EXECUTED YET`

This document is a one-time maintenance receipt for the repository reset before the next substantial JV-Web R&D stage. It is not a second current-state authority. Live routing belongs in `docs/PROJECT_STATE.md`.

## 1. Safety boundary

Pre-cleanup canonical source head:

`main@42bc652c9051edb1581b5d539f012ac78d165a66`

Maintenance lane:

`maintenance/repo-baseline-hardening-2026-09-06`

Accepted executable product snapshot remains:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Owner Preview control lane remains:

`preview/owner-control@afcde29ae3dbc6c490390eb56fa906eab7a428eb`

No cleanup operation may reinterpret an experimental branch as accepted product truth, rewrite historical commits, modify GitHub Actions, or remove a remote branch carrying unique evidence before an immutable archive ref exists.

## 2. Target branch model

After maintenance is validated, promoted and its own temporary branch removed, the idle repository should require only:

- `main` — accepted source/documentation authority;
- `preview/owner-control` — exact-source Owner Preview composition infrastructure.

A new `work/*` or `research/*` branch should exist only while that line is genuinely active. Historical work belongs behind exact commits, evidence documents and archive tags rather than permanent branch refs.

## 3. Archive refs to create before branch deletion

Use the existing repository precedent `archive/jv-web-branch-cleanup-2026-08-16/...`.

Planned immutable archive tags:

| Archive tag suffix | Exact commit | Reason |
| --- | --- | --- |
| `research/wheel-mode5-rq2c-hold` | `c26e6c610815a0286a0139c2ff50a0a03b040e02` | complete retained wheel-mode5 research corpus; RQ2C closed at truthful HOLD |
| `preview/wheel-mode5-abcd` | `d52aa3776e022649af21cddc6d9dcfae3bac42f9` | exact source currently pinned by Owner Preview wheel A/B/C/D |
| `experiment/spawn-landmark-calibration-mobile-ui` | `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b` | exact latest spawn A/B/C source pinned by Owner Preview; PARTIAL / unpromoted |
| `experiment/visual-wheel-profile-owner` | `08b43ac0a40be79be5f89a58582d7107e9e5ae06` | exact visual-wheel A/B/C source pinned by Owner Preview; unpromoted |
| `donor/pedal-contact-mechanics` | `6312906d5ad3c6781605859cd1d9613d7f2e220a` | seven unique unpromoted pedal contact/mechanical commits retained as donor material |
| `checkpoint/p1-3-1-handoff` | `e04d5d51f53350aa0df9248a3e7f123dbb94bc54` | one unique historical documentation checkpoint |
| `historical/wheel-mode5-recovery-checkpoint` | `724f1052e1ac45ab8f0acf896431dcb4f44bcd92` | interrupted E1d/E1e forensic history; later E1d2 independently recovered the required seam and evidence |
| `historical/wheel-mode5-registration-diagnostic` | `ea2ec13cd1578ba5aae2764788a8fa14ff06e7fb` | four unique historical one-off validation-workflow commits; no unique product physics source |

Use prefix:

`archive/jv-web-repo-cleanup-2026-09-06/`

The accepted executable `529ae7d...` does not require a cleanup archive tag because it remains reachable from `main` and is explicitly pinned by `preview/owner.json`. The cleanup script must nevertheless verify that exact commit before deletion.

## 4. Branches whose heads are already retained by canonical/later history

These refs carry no unique commit beyond an explicitly retained descendant and therefore do not need individual archive tags.

### Already ancestors of `main`

- `DO_NOT_USE`
- `DO_NOT_USE_2`
- `DO_NOT_USE_3`
- `DO_NOT_USE_4`
- `PLEASE_IGNORE`
- `noop2`
- `noop3`
- `__tmp_noop`
- `work/desktop-hud-header-cleanup`
- `work/desktop-mobile-capability-hygiene`
- `work/direct-rotation-steering`
- `work/dr-multitouch-acquisition`
- `work/mobile-touch-highlight-polish`
- `work/p1-2-hud-composition`
- `work/p1-3-1-drawer-polish`
- `work/p1-3-utility-drawer`
- `work/pedal-absolute-position`
- `work/steering-release-range`

The `DO_NOT_USE*` / `PLEASE_IGNORE` / `noop*` / `__tmp_noop` refs all point to `2035c8cf9d7a99aef947cdcfddd4dfedd8343d39`, which is a direct ancestor of current `main`.

### Redundant aliases pointing exactly at pre-cleanup `main`

- `work/visual-wheel-profile-owner-2026-09-05-final`
- `work/visual-wheel-profile-owner-2026-09-05-impl`
- `work/visual-wheel-profile-owner-2026-09-05-real`
- `work/visual-wheel-profile-owner-2026-09-05-scratch-do-not-use`
- `work/visual-wheel-profile-owner-2026-09-05-use-this`

### Retained by a later exact experiment head

- `preview/spawn-calibration-control` — superseded by current `preview/owner-control` composition history;
- `work/spawn-landmark-calibration-2026-09-05` — ancestor of the archived latest spawn head `77fcd0b...`;
- `work/wheel-mode5-runtime-spike-2026-09-01` — ancestor of archived research closure `c26e6c...`;
- `work/wheel-mode5-d-pathology-2026-09-03` — ancestor of `c26e6c...`;
- `work/wheel-mode5-e1d-recovery-2026-09-03` — ancestor of `c26e6c...`;
- `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03` — ancestor of `c26e6c...`.

## 5. Branches to archive, then delete

After the tags in section 3 have been created and verified:

- `checkpoint/p1-3-1-handoff-2026-08-18`
- `work/pedal-contact-mechanics`
- `work/spawn-landmark-calibration-mobile-ui-2026-09-05`
- `work/visual-wheel-profile-owner-2026-09-05`
- `research/wheel-mode5-rq2c-orientation-2026-09-05`
- `work/wheel-mode5-recovery-checkpoint-2026-09-03`
- `work/wheel-mode5-registration-diagnostic-2026-09-02`

The exact wheel A/B/C/D Preview source `d52aa377...` is not a current branch head, so its dedicated archive tag is created solely to preserve the exact Preview checkout source independently of branch cleanup.

## 6. Owner Preview reachability contract

Current `preview/owner-control@afcde29...` pins:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C: `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b`;
- visual wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Remote branch deletion is forbidden until all non-main experiment sources above resolve through the planned archive tags and `preview/owner-control` itself still resolves to `afcde29...` (or a later intentionally reviewed head).

## 7. Baseline test reconciliation

The 2026-09-05 spawn validation run executed 523 tests: 516 passed and 7 failed. Full logs establish the seven failures as stale or formatting-brittle assertions against the accepted Steering I1 semantics rather than evidence of a spawn/runtime regression:

- two assertions retained the old 120-degree lock expectation (`90/120 = 0.75`) although accepted Steering I1 defaults to 900 degrees total / +/-450 degrees, making a quarter-turn `0.2` of lock;
- two pointer lifecycle assertions still expected artificial return-to-zero instead of semantic `RELEASE`;
- one fullscreen lifecycle assertion still expected `POSITION 0` instead of `RELEASE`;
- one range contract searched `product-controls.ts` for hard-coded labels although the canonical values now live in `JV_STEERING_WHEEL_RANGE_DEGREES`;
- one mobile media-query assertion depended on single-line call formatting although the media-query value was unchanged.

Maintenance changes reconcile those tests only. No accepted runtime source is changed.

A fresh exact-head execution is still required before calling the baseline green or promoting maintenance to `main`.

## 8. Dependency posture

`box3d.js@0.0.2` is deliberately retained as the accepted reproducibility baseline. Upstream 0.1.x contains breaking binding/API changes and is not housekeeping. Any migration belongs in a separate compatibility investigation.

The current lock also contains dev-only `nanoid@3.3.17` through the build toolchain and the last clean install reported one HIGH advisory. The minimum intended maintenance is a deterministic move to patched 3.x (`3.3.18`) without broad dependency upgrades or `npm audit fix --force`. Because package-lock integrity must be generated by the pinned npm toolchain, this dependency change must be executed and validated in a real checkout rather than fabricated through repository editing.

## 9. Final deletion gate

The final local cleanup command must fail closed unless all of the following are true:

1. local working tree is clean;
2. `origin/main` and `origin/preview/owner-control` resolve and are freshly fetched;
3. expected branch heads still equal the SHAs recorded by this manifest, or any change has been explicitly re-audited;
4. maintenance has passed fresh `npm ci`, test/check and portable build validation before promotion;
5. all archive tags are created locally at exact expected commits and pushed successfully;
6. the pushed tags resolve back from `origin` to the intended commits;
7. accepted and Preview exact source commits remain reachable;
8. only then are obsolete remote branch refs deleted;
9. a final fetch/prune confirms the intended remote branch set and all archive tags.

If any assertion fails, stop. Do not partially improvise the remaining cleanup.

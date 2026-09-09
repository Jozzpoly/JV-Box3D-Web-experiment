# JV-Web — baseline cleanup manifest

Prepared: 2026-09-06
Re-audited: 2026-09-09
Owner: Jozz
Status: `PREPARED / GATE 1 PENDING / NO REMOTE BRANCH DELETION EXECUTED`

This is a one-time maintenance receipt for the repository reset. It is not a second current-state authority; live routing belongs in `docs/PROJECT_STATE.md`.

## 1. Safety boundary

Pre-cleanup canonical source head:

`main@42bc652c9051edb1581b5d539f012ac78d165a66`

Maintenance lane:

`maintenance/repo-baseline-hardening-2026-09-06`

Accepted executable product snapshot:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Current Owner Preview control lane:

`preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333`

Current spawn Preview specimen:

`work/spawn-landmark-capture-2026-09-06@c2481f911af45c73489f5b77f022206a9cf4a8cd`

The spawn specimen has not advanced since 2026-09-06 11:51Z and Owner Preview now pins that exact source. It is therefore a retained, exact-SHA guarded ref during cleanup: do not move or delete it. Any head drift invalidates the current cleanup manifest and requires re-audit.

No cleanup operation may reinterpret an experimental branch as accepted product truth, rewrite historical commits, modify GitHub Actions, or remove a branch carrying unique evidence before an immutable archive ref exists.

## 2. Target branch model

After maintenance is validated, preserved, promoted and its temporary branch removed, the expected known live branch set is:

- `main` — accepted source/documentation authority;
- `preview/owner-control` — exact-source Owner Preview composition infrastructure;
- `work/spawn-landmark-capture-2026-09-06` — stable unpromoted Owner Preview specimen.

Branch count is not itself authority. A new branch that appears after this audit must be left untouched and reported as `NEW / NOT AUDITED`, not deleted merely to reach three refs.

Historical work belongs behind exact commits, evidence and archive tags rather than permanent work refs.

## 3. Immutable refs required before destructive cleanup

Use prefix:

`archive/jv-web-repo-cleanup-2026-09-06/`

Planned archive tags:

| Archive tag suffix | Exact commit | Reason |
| --- | --- | --- |
| `research/wheel-mode5-rq2c-hold` | `c26e6c610815a0286a0139c2ff50a0a03b040e02` | complete retained wheel-mode5 research corpus; truthful RQ2C HOLD |
| `preview/wheel-mode5-abcd` | `d52aa3776e022649af21cddc6d9dcfae3bac42f9` | exact Owner Preview wheel A/B/C/D source |
| `preview/spawn-landmark-capture` | `c2481f911af45c73489f5b77f022206a9cf4a8cd` | exact current Owner Preview spawn + read-only landmark-capture specimen |
| `experiment/spawn-landmark-calibration-mobile-ui` | `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b` | sealed predecessor/base of current spawn specimen |
| `experiment/visual-wheel-profile-owner` | `08b43ac0a40be79be5f89a58582d7107e9e5ae06` | exact visual-wheel A/B/C source pinned by Preview |
| `donor/pedal-contact-mechanics` | `6312906d5ad3c6781605859cd1d9613d7f2e220a` | seven unique unpromoted pedal commits retained as donor material |
| `checkpoint/p1-3-1-handoff` | `e04d5d51f53350aa0df9248a3e7f123dbb94bc54` | one unique historical documentation checkpoint |
| `historical/wheel-mode5-recovery-checkpoint` | `724f1052e1ac45ab8f0acf896431dcb4f44bcd92` | unique interrupted E1d/E1e forensic history |
| `historical/wheel-mode5-registration-diagnostic` | `ea2ec13cd1578ba5aae2764788a8fa14ff06e7fb` | four unique historical validation/workflow commits |

Rollback anchor:

`rollback/main-before-repo-baseline-cleanup-2026-09-06` -> `42bc652c9051edb1581b5d539f012ac78d165a66`

The accepted executable `529ae7d...` remains explicitly pinned and reachable, but must still resolve before destructive cleanup.

## 4. Delete classification

### A. Direct ancestors / redundant refs — delete after preservation gate

These refs have no unique history that requires their own cleanup tag:

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

The eight obvious garbage refs all point to `2035c8cf9d7a99aef947cdcfddd4dfedd8343d39`, a direct ancestor of current `main`.

### B. Exact aliases of pre-cleanup main — delete

All five point exactly to `main@42bc652c...`:

- `work/visual-wheel-profile-owner-2026-09-05-final`
- `work/visual-wheel-profile-owner-2026-09-05-impl`
- `work/visual-wheel-profile-owner-2026-09-05-real`
- `work/visual-wheel-profile-owner-2026-09-05-scratch-do-not-use`
- `work/visual-wheel-profile-owner-2026-09-05-use-this`

### C. Superseded by retained descendants — delete

- `preview/spawn-calibration-control` — direct ancestor of current `preview/owner-control`;
- `work/spawn-landmark-calibration-2026-09-05` — predecessor of sealed/current spawn lines;
- `work/spawn-landmark-calibration-mobile-ui-2026-09-05` — exact predecessor `77fcd0b...` and parent of current `c2481f91...`;
- `work/wheel-mode5-runtime-spike-2026-09-01` — retained by later wheel research corpus;
- `work/wheel-mode5-d-pathology-2026-09-03` — retained by later wheel research corpus;
- `work/wheel-mode5-e1d-recovery-2026-09-03` — retained by later wheel research corpus;
- `work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03` — retained by later wheel research corpus.

### D. Unique history — archive exact head, verify remote tag, then delete branch

- `checkpoint/p1-3-1-handoff-2026-08-18` -> `e04d5d51...`;
- `work/pedal-contact-mechanics` -> `6312906d...`;
- `work/visual-wheel-profile-owner-2026-09-05` -> `08b43ac0...`;
- `research/wheel-mode5-rq2c-orientation-2026-09-05` -> `c26e6c61...`;
- `work/wheel-mode5-recovery-checkpoint-2026-09-03` -> `724f1052...`;
- `work/wheel-mode5-registration-diagnostic-2026-09-02` -> `ea2ec13c...`.

### E. Maintenance lane — delete last

`maintenance/repo-baseline-hardening-2026-09-06` is deleted only after its final validated candidate is pushed, preserved and fast-forwarded into `main`.

Total intended obsolete branch refs under the currently known topology: **37**.

Explicitly retained:

- `main`;
- `preview/owner-control`;
- `work/spawn-landmark-capture-2026-09-06`.

Any newly appearing branch is outside this delete set and must remain untouched.

## 5. Owner Preview reachability contract

Current `preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333` pins:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C + read-only capture: `c2481f911af45c73489f5b77f022206a9cf4a8cd`;
- visual wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Owner Preview workflow run `34031462564` completed successfully on this exact Preview head. Branch deletion is forbidden until the non-main exact sources above resolve through the planned archive tags and Preview itself still resolves to the audited head.

## 6. Baseline test reconciliation

The historical broad run executed 523 tests: 516 passed and 7 failed. Re-audit on 2026-09-09 confirmed that the five maintenance test-file patches do not weaken the behavioral contract:

- 900-degree accepted range maps 90 degrees to `0.2` lock;
- pointer cancel/lost-capture/fullscreen still assert exact capture release and semantic `RELEASE` rather than artificial centering;
- range UI is checked against its canonical source array rather than duplicated literal labels;
- mobile media-query matching only becomes formatting-tolerant while retaining the same query and lifecycle requirements.

No accepted runtime `src/` file is changed by this reconciliation.

Fresh exact-head execution is still mandatory before promotion.

## 7. Dependency posture and Gate 1

`box3d.js@0.0.2` remains frozen.

The lock contains dev-only `nanoid@3.3.17`. Re-audit also found root lock metadata older than current `package.json` engine/toolchain constraints. Therefore **manual three-line nanoid editing is prohibited**.

Gate 1 must use the pinned npm toolchain to reconcile the lock, then semantically verify:

- `package.json` is byte-identical;
- direct dependencies are unchanged;
- `box3d.js` remains exactly `0.0.2`;
- no unrelated transitive package version changes;
- `node_modules/nanoid` moves exactly from `3.3.17` to `3.3.18`;
- root lock metadata may change only to truthfully mirror current `package.json`;
- tracked diff contains only the already-audited maintenance files plus `package-lock.json`;
- fresh `npm ci`, `npm audit --audit-level=high` and `npm run build` all pass;
- tracked tree is clean at the exact locally committed candidate head.

Gate 1 performs **no remote mutation**.

## 8. Three-gate execution model

### Gate 1 — local prepare + validate

Fresh temporary clone, exact critical-ref check, npm-owned lock reconciliation, semantic diff audit, local candidate commit, full clean validation. No push, tags or deletes.

### Gate 2 — preserve + promote

Only after independent review of Gate 1 output:

1. re-fetch and re-check critical refs;
2. push the exact validated candidate to maintenance using an explicit lease;
3. create/push archive and rollback tags;
4. independently verify every remote tag target;
5. fast-forward `main` to the validated candidate;
6. verify live `main` and Preview.

No historical branch deletion in Gate 2.

### Gate 3 — cleanup refs only

Only after Gate 2 is verified:

1. re-fetch all remote heads;
2. every branch in the delete set must still equal its audited expected SHA;
3. retained Preview/spawn refs must still equal their guarded SHA;
4. new/unreviewed branches are excluded and left untouched;
5. delete the audited obsolete refs in one `git push --atomic` transaction with explicit `--force-with-lease=<ref>:<expected-SHA>` guards;
6. verify that every intended delete ref is absent and all retained refs/tags still resolve.

Final verification must **not** fail merely because an unrelated new branch was created concurrently; such a branch is reported and preserved.

If any required assertion fails, stop. Do not partially improvise the remaining cleanup.

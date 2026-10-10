# JV-Web — baseline cleanup execution receipt

Prepared: 2026-09-06
Re-audited and executed: 2026-09-09
Owner: Jozz
Status: `CLOSED / EXECUTED / INDEPENDENTLY VERIFIED`

This is the one-time execution receipt for the 2026-09-06 repository/baseline hardening campaign. It records what was preserved, promoted, deleted and validated. It is **not** a second current-state authority; live routing belongs in `docs/PROJECT_STATE.md`.

## 1. Closure summary

Pre-cleanup canonical source:

`main@42bc652c9051edb1581b5d539f012ac78d165a66`

Validated technical baseline produced by Gate 1 and promoted through Gate 2:

`02ef5d6b4f2b1b62cfc87c7f122c492b0a7dde36`

Accepted executable/current-best product snapshot remained unchanged throughout cleanup:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Retained Owner Preview infrastructure:

`preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333`

Retained unpromoted spawn Preview specimen:

`work/spawn-landmark-capture-2026-09-06@c2481f911af45c73489f5b77f022206a9cf4a8cd`

Final independently verified live branch topology after Gate 3:

- `main`;
- `preview/owner-control`;
- `work/spawn-landmark-capture-2026-09-06`.

Gate 3 reported and independent GitHub readback confirmed:

- `37/37` audited obsolete branch refs deleted;
- `3/3` retained branch refs unchanged;
- no additional/unknown branch refs present at final readback.

No GitHub Actions workflows were created or modified by this campaign.

## 2. Gate 1 — local preparation and exact validation

Gate 1 was executed from a fresh temporary clone. Early runner versions exposed tooling defects and were retired; the final validated flow used a Node-based runner with self-tests rather than PowerShell as the execution engine.

The final Gate 1 candidate was:

`02ef5d6b4f2b1b62cfc87c7f122c492b0a7dde36`

The candidate changed only:

- `package-lock.json`;
- `tests/clean-browser-host-joystick.test.mjs`;
- `tests/mobile-ui-contract.test.mjs`;
- `tests/toolchain-contract.test.mjs`.

No `src/`, asset, Preview or GitHub Actions file was changed by the final candidate commit.

Executed validation evidence:

- focused regression set: `17/17 PASS`;
- full test suite: `522/522 PASS`;
- `npm ci`: PASS;
- `npm audit --audit-level=high`: `0 vulnerabilities`;
- `npm run build`: PASS;
- typecheck: PASS;
- docs link audit: PASS;
- third-party/license audit: PASS;
- portable build/static/runtime-assets/vehicle-visual/vehicle-path/privacy/network/http checks: PASS;
- working tree clean at the exact candidate head after validation.

Toolchain observed in the executed run:

- Node `24.16.0`;
- npm `11.17.0`, valid under repository contract `>=11.13.0 <12`;
- `box3d.js@0.0.2` unchanged.

The npm-owned lock reconciliation:

- synchronized root lock engine metadata to current `package.json`;
- moved dev-only `nanoid` from `3.3.17` to `3.3.18`;
- changed no direct dependency version;
- preserved `box3d.js@0.0.2`;
- retained a hard SHA-256 lock identity assertion.

Canonical normalized lock SHA-256 after reconciliation:

`2aa86f3dac1f2c1e7582fc05e6603b12065377fab0dfdbfcf0720e12a0ed25a2`

## 3. Gate 2A — remote preservation of the validated candidate

Gate 2A performed exactly one remote mutation:

`maintenance/repo-baseline-hardening-2026-09-06`

was fast-forwarded under an exact lease from:

`cd9365e82e5c67caebe280a58b7318f2420f7fcd`

to:

`02ef5d6b4f2b1b62cfc87c7f122c492b0a7dde36`

Post-write readback verified that `main`, Preview and the retained spawn specimen remained unchanged.

This step converted the fragile locally validated candidate into durable remote evidence before any archive creation, main promotion or deletion.

## 4. Gate 2B — immutable preservation and main promotion

Before promotion, exact archive and rollback refs were created and verified remotely.

Archive prefix:

`archive/jv-web-repo-cleanup-2026-09-06/`

| Archive tag suffix | Peeled exact commit | Purpose |
| --- | --- | --- |
| `research/wheel-mode5-rq2c-hold` | `c26e6c610815a0286a0139c2ff50a0a03b040e02` | retained wheel-mode5 research corpus; truthful RQ2C HOLD |
| `preview/wheel-mode5-abcd` | `d52aa3776e022649af21cddc6d9dcfae3bac42f9` | exact Owner Preview wheel A/B/C/D source |
| `preview/spawn-landmark-capture` | `c2481f911af45c73489f5b77f022206a9cf4a8cd` | exact current Owner Preview spawn + read-only capture specimen |
| `experiment/spawn-landmark-calibration-mobile-ui` | `77fcd0b5aec2cb1cb1acc92a616f611d18a3b38b` | sealed spawn predecessor/base |
| `experiment/visual-wheel-profile-owner` | `08b43ac0a40be79be5f89a58582d7107e9e5ae06` | exact visual-wheel A/B/C source |
| `donor/pedal-contact-mechanics` | `6312906d5ad3c6781605859cd1d9613d7f2e220a` | unique unpromoted pedal donor history |
| `checkpoint/p1-3-1-handoff` | `e04d5d51f53350aa0df9248a3e7f123dbb94bc54` | unique historical handoff checkpoint |
| `historical/wheel-mode5-recovery-checkpoint` | `724f1052e1ac45ab8f0acf896431dcb4f44bcd92` | interrupted/recovery wheel history |
| `historical/wheel-mode5-registration-diagnostic` | `ea2ec13cd1578ba5aae2764788a8fa14ff06e7fb` | unique historical diagnostic/workflow history |

Rollback anchor:

`rollback/main-before-repo-baseline-cleanup-2026-09-06`

peeled to:

`42bc652c9051edb1581b5d539f012ac78d165a66`

All preservation refs were created as annotated tags and independently peeled to the exact audited commits before branch deletion.

After preservation verification, `main` was fast-forwarded from `42bc652c...` to validated baseline `02ef5d6...` under an exact lease.

## 5. Owner Preview reachability preserved

The retained Preview head stayed:

`preview/owner-control@a87cca7c9b933a8e7174ef1add5d3d9073294333`

Its exact consumer pins remained:

- accepted root: `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`;
- wheel A/B/C/D: `d52aa3776e022649af21cddc6d9dcfae3bac42f9`;
- spawn A/B/C + read-only capture: `c2481f911af45c73489f5b77f022206a9cf4a8cd`;
- visual wheel A/B/C: `08b43ac0a40be79be5f89a58582d7107e9e5ae06`;
- accepted JSPREV2: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

Cleanup never treated these Preview sources as accepted product truth merely because they were preserved or composed.

## 6. Gate 3 — audited atomic branch prune

Gate 3 used a machine-readable prune plan with:

- `3` exact `KEEP` refs;
- `37` exact `DELETE` refs;
- `10` required preservation/rollback tags;
- a declared deletion class for every obsolete branch.

Deletion classes were mechanically re-proved before mutation:

- `ancestor_of_main`;
- `alias_rollback`;
- `superseded_by`;
- `archived_exact`;
- `alias_main`.

The runner required:

- a fresh clone and live remote snapshot;
- exact SHA agreement for every keep/delete ref;
- preservation tag peel verification;
- live Owner Preview consumer-pin verification;
- Git ancestry/equivalence proof appropriate to each deletion class;
- atomic dry-run;
- an immediate last-moment read-gate;
- explicit exact `--force-with-lease` guards for every deleted branch;
- `main`, Preview and retained spawn as exact no-op witness refs inside the same atomic transaction.

The final production runner self-test passed `9/9` before execution.

The real transaction then completed successfully:

- `37/37` audited delete refs removed in one atomic push;
- `3/3` retained witness refs unchanged;
- preservation tags still exact after deletion;
- no unknown/new refs present.

Independent GitHub post-audit confirmed the final three-branch topology.

## 7. Final retained branch model

At campaign closure:

`branch = active/reviewable workspace`

`archive tag + exact SHA + evidence = historical retention`

Known retained branches:

- `main` — source/product + canonical documentation authority;
- `preview/owner-control` — operational exact-source Preview infrastructure;
- `work/spawn-landmark-capture-2026-09-06` — stable unpromoted Owner specimen still useful for Owner judgement.

A future legitimate active branch is not a cleanup regression. Branch count is not itself an authority signal.

The retained spawn branch may be removed later only after an explicit closure/promotion decision and preservation of any unique remaining evidence.

## 8. What cleanup did not prove

Repository cleanliness does not imply vehicle/mechanical completeness.

The campaign did not:

- finish natural physical steering self-return;
- accept the spawn specimen;
- accept visual wheel width variants;
- reopen or solve RQ2C orientation;
- prove parity of every historical backend/representation;
- upgrade Box3D;
- change accepted runtime steering semantics;
- create new GitHub Actions infrastructure.

Those remain separate product/R&D questions.

## 9. Process lessons retained for future repository cleanups

The JV-Web campaign established several reusable constraints:

1. **Live Git outranks conversation state.** Every write-gate starts with a fresh read-gate.
2. **Owner must not be the runner test harness.** Mutation tooling must self-test on throwaway repositories before Owner execution.
3. **Preserve before promote; promote before prune.** The first remote write after local validation should increase recoverability, not reduce it.
4. **Destructive operations need typed justification.** Every branch deletion should have a machine-checkable class/relation, not only a human label such as “old”.
5. **Unknown refs are preserved by default.** A new branch is `NEW / NOT AUDITED`, never collateral cleanup.
6. **Atomic deletion should guard retained authority too.** No-op exact-leased witness refs can make races on `main`/Preview block the entire prune transaction.
7. **Failure modes should bias toward extra preservation.** A partial process should leave more recoverability, not less.
8. **Finalization is a separate gate.** Documentation must describe the cleanup after it actually happened rather than predict success beforehand.
9. **Revalidation should follow changed inputs.** A docs-only closure should prove docs-only identity and validate the documentation layer rather than blindly rerun expensive unrelated runtime evidence.

These are lessons from this repository, not a universal delete list. Any other project must rediscover its own authority model, active refs, unique history, validation contract and preservation policy before reusing the execution pattern.

## 10. Closure

The repository/baseline hardening campaign is complete.

For current continuation, use:

`docs/PROJECT_STATE.md`

Do not restart this cleanup campaign unless live repository evidence shows a new repository-maintenance problem that actually warrants it.

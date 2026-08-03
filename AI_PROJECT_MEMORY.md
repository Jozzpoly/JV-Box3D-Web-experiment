# AI project memory — JV Box3D Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`

Detailed session handoff:

```text
docs/HANDOFF_2026_08_04_PL.md
```

Read that file immediately after this one. It contains exact receipts, branch SHAs, the quarantined F3 failure and the F5 mechanics. Where its old WIP counters differ, this newer memory and PR #13 have precedence.

## 1. Purpose

Build a serious browser version of the current Jozz Vehicle research/runtime slice using Box3D WebAssembly without changing the soul of JV:

- no hidden artificial vehicle mechanics;
- behavior traceable to native JV or a named experiment;
- owner feel and visual verdicts belong to Jozz;
- desktop/mobile hosts must not silently change the physics profile;
- current work begins with M6/M7+, never historical M5.

## 2. Mandatory rules

`Git Diff Patcher Bridge` is categorically forbidden.

Use the GitHub connector and ordinary Git only. Do not shift routine repository work onto Jozz. Ask for local commands only when a real owner/browser test or local-only source is required.

No merge, ready-for-review transition or product-default approval without Jozz.

No self-modifying workflows, automatic commits, cross-repository commit loops or repeated Actions debugging.

## 3. Source authority and local paths

Native baseline:

```text
Jozzpoly/Box3d_FunProject
main@959aefb78587ce60cf2b8eb03ff82797a4165142
```

Wheel research snapshot used by the audit:

```text
jozz-scan-terrain-f0@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

Local native path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\box3d
```

Local web path:

```text
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

GitHub does not prove local uncommitted state.

## 4. Document precedence

1. latest direct decision from Jozz;
2. this file;
3. PR #13 and issue #12 for current F5 state;
4. `docs/HANDOFF_2026_08_04_PL.md`;
5. `docs/PROJECT_STATE.md`;
6. `docs/AUDIT_ERRATA_2026_08_03_PL.md`;
7. focused receipts/ADRs/subsystem docs;
8. broad audits;
9. PR #1 historical documentation.

## 5. Non-negotiable mechanics policy

Default realistic steering:

```text
rackCenteringHertz = 0
uprightAssist = false
```

RELEASE means:

- hands-on spring/servo OFF in the first fixed step;
- no target toward zero;
- no centre timer or centre hold;
- physical rack friction remains;
- physical caster/contact/linkage/inertia may move the rack while rolling;
- wheels may stay turned at standstill.

Optional assists may exist later only explicitly, default OFF and owner-approved.

## 6. Input contract

```text
SteeringCommand = RELEASE | POSITION | RATE
```

F1 timestamped timeline integrates sub-frame digital taps proportionally:

```text
RATE value = signed active time / fixed-step time
```

Do not restore the rejected PR #1 return-to-zero filter.

RATE experiment rules:

- physical rack-space m/s;
- rebase to live rack on engage and reversal;
- immediate RELEASE;
- bounded target lead;
- no yaw/slip/speed feedback in the mapper;
- keyboard and future touch share the same semantic timeline.

## 7. Current branch stack

```text
foundation: agent/fundamental-audit-rebuild@2831d533
F1: agent/clean-browser-core@484c865
F2: agent/typed-box3d-boundary@2c208809
F3: agent/native-factory-receipt / PR #9
F4: agent/current-m6-topology@1653e982 / PR #11
F5 active: agent/physical-rate-steering / PR #13
```

All PRs remain stacked drafts and unmerged.

Historical prototype:

```text
agent/bootstrap-web-poc / PR #1
QUARANTINED / DO NOT MERGE
```

Failed first F3 attempt:

```text
agent/f3-regression-snapshot-2026-08-03@d583d3f
PR #8 closed, quarantined
```

Never resume its self-modifying workflow/cross-repo commit loop.

## 8. Completed evidence

### F1

- deterministic host/input/lifecycle;
- Node 24.16.0, npm 11.17.0;
- 19/19 tests;
- `npm ci`, typecheck, build and browser dev host PASS.

### F2

- typed `box3d.js@0.0.2` boundary;
- shared WASM module;
- B0–B5 real contact/manifold and lifecycle;
- 26/26 tests;
- two browser world generations PASS;
- receipts under `docs/receipts/F2_*`.

### F3

- exact static native receipt;
- source `a740dec7`, artifact `78b0be92`, blob `6a5cb337`;
- schema v1, 76 descriptor fields, SHA-256, topology/assist/fallback guards;
- Box3D startup blocked on rejected receipt;
- run `30855702375`, 37/37 tests, build and Chrome PASS.

### F4

- current minimal M6 graph: 18 vehicle bodies / 29 joints / 9 shapes;
- unique negative collision group per instance;
- temporary `legacy_m6_split_sphere_sidewall` backend;
- one controller and full per-step trace;
- POSITION baseline;
- RELEASE disables spring/servo and keeps load-dependent physical friction;
- run `30858244976`, 46/46 tests, build and Chrome PASS;
- generation 1 and 2 each settled with four wheel contacts.

These are machine/infrastructure results, not owner feel or full parity.

## 9. Active F5 state

Issue and PR:

```text
#12 Physical rack-space RATE steering experiment
#13 draft / NOT YET EXECUTED / DO NOT MERGE
source/test checkpoint: 9960338d45b1ff5c9836bc88566199e53614c128
later branch commits only synchronize canonical project documentation
```

Current candidate profiles:

```text
0.06 / 0.12 / 0.21 / 0.36 m/s
maxTargetLeadMeters = 0.008
```

Every profile has `productDefaultApproved: false`.

`0.21 m/s` is only the initial historical-reference UI selection.

Current K2b implementation:

- engage/reversal rebases commanded rack to live rack;
- per-step delta = command value × profile m/s × fixedDt;
- target clamped to rack travel and live rack ± lead cap;
- spring/motor active only hands-on;
- RELEASE clears commanded target, disables spring, sets motor speed 0 and uses friction cap only;
- trace exposes profile, edge, commanded/live rack, target error, spring, motor request/force and friction terms;
- browser UI exposes all profiles and trace;
- profile change performs a transactional host rebuild.

Recovery work after the interrupted conversation:

- verified that clean F3 and complete F4 already existed;
- recovered the canonical handoff and exact branch stack;
- removed one dangling required trace field that no controller path produced;
- added `tests/f5-rate-steering.test.mjs`;
- created draft PR #13;
- recorded the checkpoint on issue #12;
- started no workflow and performed no merge.

The new F5 matrix covers:

- 0.5/1/2/3/6-step-equivalent taps across all four profiles;
- monotonic commanded deltas;
- exact F1 signed-time sub-frame mapping;
- immediate release;
- engage/reversal rebase;
- left/right symmetry;
- rack travel clamp;
- frozen/blocked-rack lead-cap behavior;
- 15/30/60/120 FPS equivalence;
- irregular cadence and dropped gaps;
- profile switch and destroy/rebuild lifecycle.

F5 is **not complete**. The current branch has not received a real dependency install, TypeScript check, WASM test run, production build or browser smoke receipt.

## 10. Required F5 completion gate

Do not change workflows to obtain the result. Do not start repeated Actions runs.

After final source review, exactly one justified read-only validation:

```text
npm ci
npm run check
npm run build
one browser smoke
```

Required interpretation:

- failures are evidence to fix locally/source-first, not a reason to mutate workflow triggers;
- a green machine gate is not owner feel approval;
- no RATE profile becomes a product default automatically.

## 11. Wheel direction

Legacy canonical regression ID:

```text
legacy_m6_split_sphere_sidewall
```

It is not the future tire architecture.

Durable future seam only:

```text
W1 WheelSpecSnapshot + explicit mass/inertia
W2 replaceable WheelContactBackend
neutral WheelContactObserver / WheelContactSet
W4 visual binding independent from W2
W3 absent until justified
```

No backend winner is selected.

## 12. Mobile direction

Mobile uses the same physics profile with a different input/render host.

Allowed: touch adapter, pointer ownership, lower visual cost, smaller test world.

Not silently allowed: fewer substeps, different tuning/backend/mass or device-dependent artificial steering.

F6 starts only after F5 machine pass and owner steering verdict.

## 13. Do not reintroduce

- automatic steering return-to-zero;
- 0.35 s centre hold;
- standstill centre-capture tests;
- render-frame input polling reused for catch-up steps;
- divergent controllers;
- invalid-session fallback to another vehicle;
- browser-only steering sanitizer;
- hardcoded wheel dimensions as authored truth;
- startup probe suite;
- moving asset refs without content provenance;
- shared fixed collision group;
- browser/build smoke described as parity or owner approval.

## 14. Evidence vocabulary

```text
SOURCE_FACT
MEASURED_FACT
MECHANISM_FALSIFICATION
INTERNAL_CONSISTENCY
LIVENESS_SMOKE
SCENARIO_EQUIVALENCE
VISUAL_OBSERVATION
OWNER_VALIDATED
```

Do not flatten them into one PASS.

## 15. Work discipline

- read this file and the handoff first;
- inspect exact branch/ref before work;
- one active stage at a time;
- source/test work before CI;
- small meaningful commits;
- brief progress checkpoints, not tool-call narration;
- no local-success claim without a real receipt;
- no owner-feel claim without Jozz;
- update memory/state after meaningful changes;
- no merge without Jozz.

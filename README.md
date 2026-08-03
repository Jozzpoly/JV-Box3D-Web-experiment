# JV Box3D Web Experiment

Browser research and development line for bringing the current Jozz Vehicle architecture to WebAssembly without replacing physical behavior with hidden host-side assists.

## Read first

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md)
3. [`docs/DOCUMENT_INDEX.md`](docs/DOCUMENT_INDEX.md)
4. [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md)
5. [`docs/AUDIT_ERRATA_2026_08_03_PL.md`](docs/AUDIT_ERRATA_2026_08_03_PL.md)

## Branches

### `agent/bootstrap-web-poc`

Historical runnable prototype, draft PR #1.

```text
QUARANTINED IMPLEMENTATION EVIDENCE
```

It proved browser/WASM viability and contains some recoverable experiments, but also rejected behavior such as automatic steering return-to-zero and centre hold. Do not continue it as the product foundation and do not merge it wholesale.

### `agent/fundamental-audit-rebuild`

Audit, source receipts, architecture contracts and errata, draft PR #2.

```text
FOUNDATION DOCUMENTATION
NO PRODUCT RUNTIME
```

### `agent/clean-browser-core`

Active clean implementation destination.

```text
DEVELOP NEW CODE HERE
```

It starts from the consolidated foundation rather than from PR #1.

## Active work

Current implementation issue:

```text
#3 — F1 Clean host and deterministic input timeline
```

Current draft implementation review:

```text
#4 — F1 deterministic browser host and semantic steering timeline
```

Current clean checkpoint:

```text
commit a73540e863c9f1dc878964fa3d32786a86d7677b
```

Implemented at this checkpoint:

- strict TypeScript project shell;
- transactional resource ownership and startup rollback;
- bounded fixed-step clock with explicit dropped-time intervals;
- timestamped input timeline;
- semantic steering commands `RELEASE | POSITION | RATE`;
- proportional preservation of sub-frame taps;
- disposable keyboard/focus lifecycle;
- restartable browser host without page reload;
- deterministic unit tests independent of render cadence.

Deliberately absent:

- Box3D;
- vehicle topology or controller;
- Three.js and real assets;
- touch controls;
- campus and scan;
- startup physics probes.

The active issue is the operational progress log. Broad audit documents are not used as day-to-day TODO lists.

## Current F1 gate

The source has passed isolated strict compilation and 16 deterministic tests with the available local validation toolchain. F1 is not complete yet because the clean branch still needs:

1. a generated and committed `package-lock.json` from the exact declared versions;
2. `npm ci`, `npm run check` and `npm run build` on the target Node 24 environment;
3. a real browser smoke of the host and keyboard lifecycle.

No GitHub Actions workflow is used automatically for this work.

## Current first milestone

`Clean Browser Core M0`:

- deterministic fixed-step host;
- timestamped input event timeline;
- semantic steering commands `RELEASE | POSITION | RATE`;
- transactional lifecycle;
- pinned Box3D/WASM boundary;
- native-generated config/factory receipt;
- minimal current M6 topology with one controller;
- no artificial steering centering;
- desktop short-tap steering experiment;
- primitive diagnostics before real visual assets.

Full campus, scans, real suspension assets, touch UI and a new tire backend are deliberately later stages.

## Core owner rules

- Current architecture begins with M6/M7+, not historical M5.
- Default realistic mechanics contain no hidden artificial stabilization.
- Steering release means immediate hands-off; physical caster/contact may move the rack while rolling.
- Small digital steering taps are valuable and are recovered through a bounded `RATE` command, not automatic return-to-zero.
- Legacy sphere/split wheel is only a regression fixture, not the future tire architecture.
- Mobile uses the same physics profile with a different input and render host.
- Feel and visual verdicts belong to Jozz.
- Git Diff Patcher Bridge is forbidden for this project.

## Native source snapshots used by the current foundation

```text
Jozzpoly/Box3d_FunProject
main@959aefb78587ce60cf2b8eb03ff82797a4165142

current wheel research snapshot:
jozz-scan-terrain-f0@761bd3ef60992f7dec3bcdddf1945fdbc1cb0825
```

GitHub snapshots do not prove Jozz's local uncommitted working tree.

## Tool and evidence policy

- GitHub connector for repository work;
- ordinary local Git commands only when local state must be changed;
- no Git Diff Patcher Bridge;
- no automatic forensic workflows;
- no GitHub Actions run merely to generate files or repeat known evidence;
- local/Node tests before browser tests;
- browser smoke before Box3D integration;
- every claim names its evidence level.

The three forensic workflows in the repository are manual-only:

```yaml
on:
  workflow_dispatch:
```

They are not ordinary product CI.

## Status

The foundation is consolidated and the first clean implementation layer now exists. It is not yet F1-complete, physics-capable or parity-proven. Development proceeds on `agent/clean-browser-core` according to issue #3 and the gated roadmap.

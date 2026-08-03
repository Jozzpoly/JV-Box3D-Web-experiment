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
- Small digital steering taps are valuable and will be recovered through a bounded `RATE` command, not automatic return-to-zero.
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

## Forensic workflows

The repository contains three evidence workflows for dependency, engine-delta and repository inventory receipts. They are manual-only:

```yaml
on:
  workflow_dispatch:
```

They are not ordinary product CI and must not be rerun without an exact evidence need.

## Status

The project foundation is consolidated. Clean product implementation is not yet claimed as complete or parity-proven. Development proceeds on `agent/clean-browser-core` according to the gated roadmap.
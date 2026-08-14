# JV Web — branch roles

Updated: 2026-08-14

Branch names are workflow pointers, not project memory or mechanical authority.

## Private source repo

### `main`

Accepted/integrated private product authority. After the Friends foundation normalization it contains the current accepted source baseline. New ordinary work should start from current `main` unless isolation has a concrete reason.

### `work/friends-pages-r1`

Completed Friends publication transaction/source line. It produced the accepted live Friends R1 baseline and is integrated/retired after `main` is fast-forwarded. Do not keep using it as parallel authority.

### `checkpoint/r1-drive-bridge-01-audited`

Preserved exact audited temporary driving-bridge checkpoint. Read only unless a named regression/rollback question requires it.

### Cold historical refs

The remaining `archive/*`, `candidate/*`, old `work/*`, `product/*`, `repair/*` and accidental `noop-*` branches are historical/salvage evidence only. They are not default research inputs and must not be used as development bases merely because they contain more history.

The repository still has more remote refs than desired because delete-ref tooling is not available in the current connector. Do not create more branches just to compensate for that debt.

## Public artifact repo

### `release/r0`

Immutable rollback/history.

### `release/friends-r1`

Current live GitHub Pages Friends line. It may receive normal fast-forward Friends hotfix/release commits after validated private source changes.

## Rule for new branches

Create a temporary branch only when isolation materially protects current accepted work or enables a genuinely independent experiment.

No per-agent/per-conversation branches. Every temporary branch should have one purpose and an obvious integration/rejection point.

# R0-B disposable exact-toolchain operator

Status: `OPERATOR ACCEPTED / EXACT WINDOWS BASELINE PASS AT f1c0ffe...`

## Purpose

`tools/repair/run-r0b-toolchain-gate-entry.mjs` is the required entrypoint for one exact toolchain candidate in a disposable detached checkout. It collapses duplicate `PATH`/`Path` keys, puts the exact current Node directory first, pins `NODE` and `npm_node_execpath`, then delegates to the internal gate runner. The operator writes all evidence outside the repository and refuses to delete, reset or clean existing state.

Do not invoke `run-r0b-toolchain-gate.mjs` directly for a canonical candidate; it is the internal implementation behind the guarded entrypoint.

It is not a downloader or environment manager. Node and npm must already be installed from independently verified distributions.

## Required checkout

The operator requires:

- exact repository origin;
- detached HEAD at the explicitly supplied 40-character commit;
- exact supplied Git tree;
- clean source status;
- no existing `node_modules`;
- no existing `dist`;
- an absolute receipt directory outside the checkout.

A normal development checkout is not an acceptable target.

## First candidate

```text
Node:       24.16.0
npm:        11.13.0 (bundled with official Node 24.16.0)
TypeScript: 7.0.2
Vite:       8.1.5
```

This exact toolchain is now the canonical R0 candidate. Another npm or mandatory platform is introduced only to diagnose a concrete failure or by separate owner decision.

## Invocation

Run with the current exact repair commit and tree, not the abbreviated examples below:

```text
node tools/repair/run-r0b-toolchain-gate-entry.mjs \
  --repo <disposable-checkout> \
  --expected-repository Jozzpoly/JV-Box3D-Web-experiment \
  --expected-commit <40-char-repair-commit> \
  --expected-tree <40-char-repair-tree> \
  --expected-node 24.16.0 \
  --expected-npm 11.13.0 \
  --expected-typescript 7.0.2 \
  --expected-vite 8.1.5 \
  --receipt-root <absolute-path-outside-checkout>
```

Pass `--npm-cli <absolute npm-cli.js>` only when it identifies an independently verified npm 11.13.0 CLI; otherwise use the npm bundled with the verified Node archive.

`--preflight-only` stops after identity, exact Node/npm and lock hashing. Its receipt is explicitly non-canonical.

## Full gate

The full run performs:

1. identity and disposable-checkout checks;
2. exact Node/npm preflight;
3. lock/package hashing;
4. `npm ci`;
5. exact installed TypeScript/Vite verification;
6. `npm run check`;
7. `npm run build:portable`;
8. clean-after and immutable commit/tree/lock checks;
9. independent hash table for the complete `dist` directory;
10. external JSON receipt plus per-command stdout/stderr logs.

Only the final result `PASS` has `canonical: true`. `PREFLIGHT_ONLY_PASS` and `BLOCKED` are never canonical.

For the required two-run same-OS comparison, use [`R0B_SAME_OS_CANDIDATE.md`](R0B_SAME_OS_CANDIDATE.md) and `tools/repair/run-r0b-same-os-candidate.mjs`. Do not manually compare partial console output.

## Canonical Windows comparison

Run two independent disposable checkouts on Windows 11 x64. Their source identity, lock cleanliness, logical package versions, expected Windows native bindings and complete artifact file tables must agree; artifact bytes must be identical.

Linux is outside the R0 release guarantee and is not a release gate. Do not copy or compare raw `node_modules` directories across machines or operating systems.

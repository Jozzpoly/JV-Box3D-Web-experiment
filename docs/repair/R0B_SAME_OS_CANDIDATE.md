# R0-B same-OS reproducibility candidate

Status: `OPERATOR ACCEPTED / WINDOWS BASELINE PASS AT f1c0ffe... / POST-PIN REVALIDATION REQUIRED`

## Purpose

`tools/repair/run-r0b-same-os-candidate.mjs` creates two independent detached worktrees at the exact same commit and tree, runs the guarded R0-B gate in both, and compares their receipts.

It does not build inside the operator checkout used to launch it. It never runs `git reset`, `git clean`, force-removes a worktree, rewrites history, activates Actions, or publishes Pages.

## Canonical candidate

```text
Node:       24.16.0
npm:        11.13.0
TypeScript: 7.0.2
Vite:       8.1.5
```

The command must itself be launched by the exact Node candidate. The script creates all evidence and disposable worktrees under an absolute directory outside the repository.

## Platform scope

Windows 11 x64 is the canonical R0 release-engineering platform. The accepted `f1c0ffe...` campaign completed two byte-identical full runs and a 119-check evidence audit. Linux is not an R0 release gate. A PASS applies only to the exact commit/tree in its receipt; the toolchain-pinning commit must be run again.

## Invocation

```text
node tools/repair/run-r0b-same-os-candidate.mjs \
  --repo <any-local-worktree-of-this-repository> \
  --expected-repository Jozzpoly/JV-Box3D-Web-experiment \
  --expected-commit <40-char-repair-commit> \
  --expected-tree <40-char-repair-tree> \
  --expected-node 24.16.0 \
  --expected-npm 11.13.0 \
  --expected-typescript 7.0.2 \
  --expected-vite 8.1.5 \
  --receipt-root <absolute-path-outside-repository>
```

`--preflight-only` performs both detached worktree identity checks and both exact Node/npm/lock preflights without `npm ci`. Its result is always non-canonical.

## Acceptance

A full same-OS result is canonical only when:

- both child gates return `PASS` and `canonical: true`;
- both use the same repository, commit, tree, Node, npm, TypeScript, Vite, lock and package bytes;
- both complete artifact file tables are byte-identical;
- both manifest SHA-256 values are identical;
- the orchestrator records `PASS` and `canonical: true`.

A failed or mismatched run leaves its worktrees in place and records their paths. A complete matching run becomes `PASS` only after both disposable worktrees are removed normally without force. The receipt directory must remain outside every registered worktree and outside the repository common Git directory. The comparison includes the normalized command plan in addition to identity, toolchain, dependency and artifact evidence.

# R0-B canonical Windows evidence — 2026-08-07

Status: `ACCEPTED BASELINE EVIDENCE FOR f1c0ffe...`

This document is a repository index of externally retained evidence. It does not embed local paths, usernames, the evidence archive, generated artifacts or private source copies.

## Source identity

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
commit:     f1c0ffe5ebc6b22cd6e3f435bab8529ca50fb67f
tree:       080288d4362e2b58799e6f119998687282377c69
platform:   Windows 11 x64
```

## Exact toolchain

```text
Node:       24.16.0
npm:        11.13.0
TypeScript: 7.0.2
Vite:       8.1.5
```

The Node archive was downloaded from the official Node.js release host and verified against the recorded official SHA-256 before execution.

## Accepted result

Two independent detached worktrees performed fresh full gates. The evidence audit confirmed:

```text
source tests:                 281/281 PASS in run A
source tests:                 281/281 PASS in run B
npm dependency tree:          identical
package-lock before/after:    unchanged
source before/after:          clean
portable artifact file count: 14
same-OS artifact table:       byte-identical
worktree cleanup:             complete
independent evidence audit:   119/119 checks PASS
```

Evidence archive SHA-256:

```text
ba65d40bcea76c2981cf9a69f8bf8ce85662fd88619c3f86cadfd159124d934b
```

## Scope decision

Jozz selected Windows as the canonical R0 release-engineering platform. Linux is not an R0 release gate and is neither claimed supported nor claimed broken. Adding another mandatory build platform requires a separate owner decision.

The accepted PASS is tied only to the exact commit and tree above. Any later commit, including documentation or toolchain pinning, requires a new Windows gate before it can inherit SOURCE-GATE or ARTIFACT-GATE status.

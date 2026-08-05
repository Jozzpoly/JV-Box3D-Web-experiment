# Local evidence bundle

Every R1 or R2 run produces one immutable-by-convention evidence directory plus a ZIP archive.

## Required records

```text
environment.json
harness-identity.json
target-commit.txt
source-identity.json
git-status-before.txt
gate.log
git-status-after.txt
git-diff-after.patch
RESULT.json
SHA256SUMS.txt
```

Sibling transport records:

```text
<run>.zip
<run>.zip.sha256
```

Conditional records:

```text
worktree-add.log
artifact-manifest.json
artifacts/dist/**
harness-error.txt
worktree-retained.txt
```

## Meaning

### `environment.json`

Records:

- repository root and origin;
- control-plane HEAD at invocation;
- exact target commit;
- Git, Node, npm and PowerShell versions;
- active repository cleanliness.

### `harness-identity.json`

Hashes the exact tracked harness script, target registry and result schema. The harness refuses to run when any of these files differs from the active Git `HEAD`.

### `target-commit.txt`

Captures the exact commit metadata and decoration observed inside the detached worktree.

### `source-identity.json`

Hashes the target's:

- `package.json`;
- `package-lock.json`;
- historical gate script.

This prevents a passing log from being detached from the exact dependency and gate definitions that produced it.

### Raw logs

`gate.log` contains the exact invoked command, working directory, UTC start and finish times, merged stdout/stderr and exit code.

### `RESULT.json`

The result is machine-readable and follows [`../../tools/local-validation/result.schema.json`](../../tools/local-validation/result.schema.json).

The classification is generated only after checking:

- gate exit code;
- exact HEAD before and after;
- clean source tree before and after.

### Artifact evidence

When `dist/` exists, it is copied into the evidence directory and hashed recursively. Missing `dist/` is recorded through `artifactsCaptured: false`; it is not silently treated as success.

### `SHA256SUMS.txt`

Hashes every captured evidence file except itself. The sibling ZIP is transport packaging and is not part of its own checksum set.

## Interpretation rules

- A harness or toolchain preflight failure is not a product failure.
- A non-zero gate result is neutral evidence, not an automatic regression verdict and not permission to patch the same worktree.
- R1 can become `BASELINE_REPRODUCED` only with an exact toolchain, clean exact commit and passing gate.
- R2 passing does not make the historical implementation canonical.
- Owner visual validation remains a separate E4 record.
- Evidence from one commit, lockfile or asset set cannot certify another.

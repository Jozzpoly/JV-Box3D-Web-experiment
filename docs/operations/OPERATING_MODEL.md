# JV Web operating model

## Objective

Keep JV Web continuously runnable while improving architecture, assets and native-JV integration through small, attributable and reversible changes.

The operating system must optimize for four things at once:

1. a playable owner-facing runtime;
2. strong technical foundations;
3. evidence proportional to every claim;
4. low operator friction and no terminal retry loops.

## Canonical roles

### Frozen playable baseline

```text
agent/jv-web-playable-runtime
d6aa218064c2653f918cf7956d2fcd20a940caf3
```

This commit is a recovery reference. It is not a development branch and must not be patched.

### Control plane

```text
agent/jv-refoundation-control-plane
```

Contains operating rules, evidence records and safe local operators. It must not become a second product implementation.

### Product candidates

Every product change starts from an explicitly selected validated base on a dedicated branch. A candidate branch contains one bounded development slice. It is accepted only after automated validation and separate owner observation.

Historical branches remain source material. They are never promoted wholesale merely because they contain valuable work.

## Stable operator surface

Only three owner-facing entry points are canonical:

### First recovery or deliberate revalidation

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Launch-JvWebPlayable.ps1
```

This prepares the exact worktree, runs the full historical gate, records a receipt and starts the server.

### Normal repeated launch

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\playable-recovery\Run-JvWebPlayable.ps1
```

This requires an existing successful receipt and exact clean checkpoint, then starts Vite without repeating `npm ci`, tests or production build.

### Control-plane validation after operator changes

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebPowerShellSyntax.ps1
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\local-validation\Test-JvWebControlPlane.ps1
```

Internal helper scripts are not alternative owner workflows.

## Change unit

One development slice should answer one technical question and normally affect one subsystem.

Each slice records:

- exact base and candidate commit;
- intended behavioral change;
- explicit non-scope;
- source commits for salvaged historical work;
- automated acceptance criteria;
- owner-visible acceptance criteria;
- rollback point.

Do not combine an architecture migration, asset import, physics change and UI redesign in one candidate.

## Acceptance ladder

A candidate advances through six separate layers:

```text
1. IDENTITY
   exact repository, branch, commit, toolchain and dependency lock

2. SOURCE
   typecheck, unit/contract tests, documentation and notices

3. PACKAGE
   production build, portable paths, runtime assets and network/privacy policy

4. RUNTIME
   browser startup, no fatal console error, lifecycle and rebuild

5. OWNER
   Jozz observes the exact requested behavior on the intended device

6. PROMOTION
   evidence is recorded and the candidate is accepted as the next base
```

Passing one layer never implies the later layers.

## Terminal-loop prevention

- Never repeat an unchanged failed command.
- Every rerun requires either a code/configuration change or genuinely new evidence.
- Stop at the first unattributed failure instead of issuing exploratory command chains.
- One operator command owns one phase and records complete output.
- A failure must expose the failing command, exit code, exact source identity and log location.
- Do not ask Jozz to inspect many arbitrary files. Identify the single relevant log first.
- Do not make the owner manually clean, reset or reconstruct worktrees created by an operator.
- Recovery and normal launch are separate commands; routine play must not repeat the full gate.

## Evidence vocabulary

Use only scoped statements:

- `SOURCE PASS` — source-level checks passed;
- `PACKAGE PASS` — the portable package passed its validators;
- `RUNTIME OBSERVED` — the browser reached the stated runtime condition;
- `OWNER ACCEPTED` — Jozz accepted the stated behavior;
- `BASELINE PROMOTED` — all required layers for that baseline passed.

Avoid unqualified `GREEN`, `DONE`, `PARITY` or `PRODUCTION-READY`.

## Git and workspace safety

- no `git reset --hard`;
- no `git clean`;
- no force-push;
- no forced worktree removal;
- no product work in the frozen playable worktree;
- no silent mutation of user files;
- no whole-history merge into the product line;
- external worktrees for validation and recovery;
- exact fast-forward updates for control branches;
- GitHub Actions remain disabled unless Jozz explicitly approves their cost and purpose.

## Development recovery order

Recover later work onto a validated product candidate in this order:

1. renderer ownership and lifecycle protections;
2. failure isolation and context-loss handling;
3. tiny deterministic visual proof;
4. real owner-authored vehicle geometry;
5. materials and textures;
6. scene and scan rendering;
7. native JV Core WASM integration and parity work.

Every layer must leave the project runnable before the next begins.

## Review cadence

At each meaningful checkpoint, report:

```text
WHAT CHANGED
WHAT IS PROVEN
WHAT IS NOT PROVEN
CURRENT EXACT COMMIT
NEXT SINGLE DECISION
```

Long technical work should produce concise progress checkpoints rather than a long silent interval.

# Evidence standard

## Principle

A status describes evidence, not confidence or effort. Never promote a claim by repeating it in more documents.

## Evidence classes

### E0 — declaration

Examples:

- plan;
- PR description;
- AI memory;
- architectural intention;
- agent statement.

Allowed wording: `PLANNED`, `DECLARED`, `UNVERIFIED`.

### E1 — source inspection

The exact source commit was inspected and the claimed code path exists.

Allowed wording: `SOURCE-CONFIRMED`.

Not sufficient for: `PASS`, browser behavior, performance, parity or user-visible correctness.

### E2 — synthetic executable evidence

Unit, contract, fixture or headless logic tests pass on an exact commit.

Required record:

- source commit;
- toolchain versions;
- dependency lock hash;
- exact commands;
- exit codes;
- raw logs;
- generated artifact hashes.

Allowed wording: `SYNTHETIC PASS`.

### E3 — real runtime evidence

The built application runs against the intended browser/runtime and real relevant assets or data.

Required in addition to E2:

- browser and OS/device identity;
- build artifact hash;
- native commit and asset hashes;
- console capture;
- scenario and expected result;
- screenshots or recording where visual behavior matters.

Allowed wording: `RUNTIME PASS`.

### E4 — owner validation

Jozz manually observes or drives the exact build and records what was accepted.

Required:

- exact build/source identity;
- device;
- scenario;
- accepted observations;
- remaining concerns.

Allowed wording: `OWNER-VALIDATED`.

### E5 — parity or release evidence

Reserved for claims such as native/WASM parity, release readiness or production support. Requires a purpose-built comparison corpus, acceptance thresholds and owner approval.

## Exact-head rule

An E2–E5 claim is valid only for its recorded identity tuple:

```text
web source commit
dependency lock hash
toolchain versions
native JV commit
relevant asset hashes
build configuration
generated artifact hash
```

Changing any relevant element expires the exact claim. A descendant does not inherit a green status automatically.

## Required evidence bundle

```text
evidence/<date>-<workstream>-<short-sha>/
  manifest.json
  commands.txt
  environment.txt
  git-status.txt
  raw/
    *.log
  artifacts/
    checksums.sha256
  browser/
    console.txt
    screenshots-or-recording
  owner/
    observation.md
```

`manifest.json` must distinguish:

- declared;
- source-confirmed;
- synthetic;
- real runtime;
- owner validation;
- not tested;
- known failures.

## Forbidden shortcuts

- Parsing source text to prove behavior when a behavioral test is possible.
- Calling a fixture a real asset.
- Calling a successful build a browser pass.
- Calling headless Chrome a phone pass.
- Calling matching final values parity without trajectory and mechanism telemetry.
- Calling a historical PR reproducible when dependencies, native ref or assets are mutable.

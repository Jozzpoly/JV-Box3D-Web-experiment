# Contributing to JV Web

## Current status

JV Web is an owner-directed experimental repository. Public visibility, when approved, will not mean that the project is accepting every issue, feature request or pull request.

Jozz owns product direction, driving feel, visual acceptance, publication decisions and product-default selection.

Before contributing, read:

1. `README.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/PUBLIC_COLLABORATION_HISTORY.md`
5. the relevant ADR or subsystem contract

Historical pull requests are evidence, not a menu of unfinished features to resume.

## Before opening an issue

Search existing issues and pull requests first.

A useful issue includes:

- exact commit/build identity;
- browser, OS and device;
- clear expected and observed behavior;
- minimal reproduction;
- whether the result is source, Node test, browser, phone or owner-observation evidence;
- logs with secrets and private paths removed.

Do not post security-sensitive details publicly. Follow `SECURITY.md`.

Do not treat a physics-feel preference as a confirmed defect without a reproducible scenario and exact configuration.

## Before opening a pull request

Discuss substantial architecture, physics, mobile-control, scene-format or publication changes before implementation.

A pull request must:

- state its exact base and head scope;
- identify the claim being tested;
- include a counterexample or negative test where practical;
- preserve deterministic fixed-step and lifecycle contracts;
- keep renderer/UI code unable to mutate physics directly;
- update receipts or documentation when evidence changes;
- remain truthful about what was not tested;
- avoid custom GitHub Actions unless the owner explicitly approves a narrowly justified exception;
- never publish, change visibility or modify Pages settings.

## Physics boundary

The current TypeScript backend is:

```text
legacy_ts_m6
REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Do not add new product drivetrain, suspension, steering, aero, contact or tire mechanics to that backend.

Product physics belongs to the native JV Core + Box3D WASM track after exact source receipts and parity scenarios exist.

## Steering semantics

```text
RELEASE = hands off in the first fixed step
```

Do not add hidden return-to-centre, centre hold, speed-sensitive steering, upright stabilization or other automatic control under a neutral/default name.

Optional assists require:

- explicit names;
- explicit off state;
- separate configuration identity;
- focused tests;
- owner approval.

## Assets and scans

Do not submit:

- assets without proven redistribution rights;
- private scans or source photographs;
- GPS/location-sensitive metadata;
- fonts without a redistributable license;
- generated files that embed local paths;
- raw photogrammetry meshes as default collision;
- third-party game assets copied from another project.

Every public asset requires provenance, rights classification and a release-role declaration. See the asset policy in `docs/PUBLIC_ASSET_RIGHTS_POLICY.md`.

## Dependencies

New runtime dependencies require:

- exact package/version;
- license and provenance review;
- bundle and mobile-cost measurement;
- justification against a dependency-free implementation;
- update to `THIRD_PARTY_NOTICES.md`;
- updated package validation.

Do not add dependency ranges that weaken the locked build identity.

## Validation

The ordinary source gate is:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

A green test suite is not automatically:

- native parity;
- browser PASS;
- phone PASS;
- owner feel approval;
- source-public readiness;
- Pages publication readiness.

Use the evidence levels defined in `docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md`.

## Commit and documentation discipline

Prefer small, reversible commits.

Do not:

- rewrite historical receipts to look cleaner;
- delete unique evidence without a recovery index;
- add broad session handoff documents;
- duplicate canonical state across many files;
- commit local audit reports before findings are classified and redacted;
- commit `dist/`, dependency folders or local scan workspaces.

## Acceptance

Submission does not guarantee review, merge, inclusion or support. The owner may preserve a useful experiment as evidence without adopting it as product behavior.

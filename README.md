# JV Web Demonstrator

JV Web is a browser host and research surface for Jozz Vehicle. The immediate goal is a serious demonstrational build that can run on desktop and phone, then drive over a prepared scan of a real environment.

The repository is still private and GitHub Pages is disabled. Making the source public and publishing the playable site are separate owner decisions with separate gates.

## Current truth

The current browser reference runtime demonstrates:

- deterministic fixed-step ownership;
- timestamped steering and longitudinal input;
- real Box3D WebAssembly worlds and contacts;
- a receipt-derived multi-body M6 reference vehicle;
- physical rack steering with `RELEASE | POSITION | RATE`;
- a read-only WebGL observer;
- wheel-joint drive, reverse, coast and braking;
- guarded rebuild and disposal without page reload;
- a portable static-site build intended for localhost, LAN and a future GitHub Pages project path.

The latest locally executed demonstrator-foundation gate used:

```text
commit 2f14d109980c99b844d80b80a080327e1fb4d900
Node 24.16.0
npm 11.17.0
receipt byte-exact
npm ci PASS
0 vulnerabilities
documentation links PASS
TypeScript PASS
109 tests: 108 PASS / 1 FAIL
```

The only failure was adversarial public-report sanitization: an e-mail address embedded in a sensitive path was correctly classified but remained in one serialized report field. The gate stopped before bundle/package validation. No physics or browser-runtime test failed.

A minimal recursive-sanitizer correction is now present on a newer head. That head still requires a fresh local gate before any green package claim.

An earlier gate also correctly rejected a root-absolute receipt URL that would have worked at a domain root but failed under a GitHub Pages repository path. That source URL and its regression test are already corrected.

## Critical non-claim

The current vehicle backend is:

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

It is drivable and deterministic, but it is not a faithful native JV port. A critical audit proved that the current TypeScript drive path interprets native `maxDriveSpeed = 40` as a linear target in metres per second, while native JV defines it as a wheel rev limit in radians per second and scales available torque rather than target speed with throttle.

No new product drivetrain, suspension, steering, aero or tire mechanics should be added to this TypeScript backend.

## Product architecture

The intended physics authority is:

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
        TypeScript input/render/UI host
```

Development proceeds on two synchronized tracks:

```text
Track A: demonstrator shell, mobile input, scene seam and distribution
Track B: native JV Core + Box3D WASM parity
```

Track A may use the frozen reference backend to validate browser and phone interaction. Public claims of faithful JV behavior wait for Track B evidence.

## Portable artifact

The product artifact is a multi-file static site rather than one giant HTML file:

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

The manifest records the exact source commit, clean-source status, fingerprinted source ref, backend identity, runtime assets, compliance files and SHA-256 of every payload file. It cannot expose the branch name, grant itself source-public readiness, claim native parity or approve Pages.

Build locally from a clean checkout:

```powershell
npm ci
npm run check
npm run build:portable
npm run preview
```

The guarded Windows gate is:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\run-demonstrator-foundation-gate.ps1"
```

It validates the source and artifact but never changes repository visibility, Pages settings, firewall rules or publishing branches.

## Sharing gates

```text
SOURCE-PUBLIC-READY PASS
→ explicit owner approval
→ repository may become public

DEMONSTRATOR-PACKAGE-READY PASS
+ real phone/LAN validation
+ explicit owner approval
→ PAGES-PUBLISH-READY PASS
→ GitHub Pages may be enabled manually
```

`SOURCE-PUBLIC-READY` covers license, current/default branch, Git history, GitHub cloud surfaces, public documentation and private-asset classification. It does not pretend that the phone build is finished.

`PAGES-PUBLISH-READY` covers the exact portable package, browser/mobile behavior and release-only publishing branch.

No custom cloud build/test/deploy workflow is planned. The generated publishing branch will eventually contain only an already locally validated static artifact.

## Mobile and scan direction

The mobile host must preserve the same semantic controls as desktop:

- pointer identifiers have exclusive ownership until release;
- steering release means physical `RELEASE`, not hidden return-to-centre;
- throttle, brake/reverse and camera gestures do not steal one another's pointers;
- background, visibility loss and page exit release active controls;
- landscape is the first supported layout.

A future scan is not used raw as both graphics and collision. The scene package separates:

```text
source scan
render mesh / LOD assets
simplified collision mesh
scene manifest and spawn metadata
```

## Read first

1. [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md)
2. [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md)
3. [`docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md`](docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md)
4. [`docs/decisions/ADR-0003-native-jv-core-wasm.md`](docs/decisions/ADR-0003-native-jv-core-wasm.md)
5. [`docs/decisions/ADR-0004-pages-ready-demonstrator.md`](docs/decisions/ADR-0004-pages-ready-demonstrator.md)
6. [`docs/contracts/MOBILE_HOST_CONTRACT_PL.md`](docs/contracts/MOBILE_HOST_CONTRACT_PL.md)
7. [`docs/contracts/SCENE_PACKAGE_CONTRACT_PL.md`](docs/contracts/SCENE_PACKAGE_CONTRACT_PL.md)
8. [`docs/PUBLIC_COLLABORATION_HISTORY.md`](docs/PUBLIC_COLLABORATION_HISTORY.md)

Historical audits, issues and stacked pull requests remain evidence, not current instructions. The collaboration-history map classifies all thirteen pull requests and records which documents have precedence.

## Ownership and licensing status

Jozz owns product direction, driving feel, visual acceptance, publication and default-selection decisions.

Third-party runtime and tool notices are recorded in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). A project license for JV Web itself has not yet been selected. Do not infer that third-party MIT notices license JV Web code, native JV code, models, scans, textures or scenes.

The repository must not become public until an explicit root project `LICENSE`, history/privacy/cloud audit, intended default branch and owner approval exist.

## Project rules

- no hidden steering centering or other artificial default mechanics;
- `RELEASE` means hands off in the first fixed step;
- the legacy split sphere/sidewall wheel is a regression baseline, not the future tire;
- no native-parity claim from internal green tests;
- no merge, ready-for-review, visibility or Pages transition without Jozz;
- no automatic workflow loops, self-modifying CI or Git Diff Patcher Bridge.

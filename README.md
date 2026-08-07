# JV Web

JV Web is the desktop/mobile browser demonstrator for Jozz Vehicle. The preserved product combines a real Box3D WebAssembly M6 reference vehicle, E2R/offroad terrain, an optional local JSPREV2 scan, desktop/mobile input and a dependency-free WebGL observer.

## Current status

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
preserved product branch: product/jv-web-car-map-scan
preserved product commit: c8e0bf24748b0a790a1c0039b1be801eef266580
preserved product tree:   3e241761784edd2a2fb6ab18095c25ea0e737185
controlled repair branch: repair/jv-web-release-r0
public release:           NOT PROVEN / NOT PUBLISHED
```

The current repair campaign starts from the exact preserved product tree. It does not use the minimal `main` branch or the owner-vehicle candidate as a base.

Read [`AGENTS.md`](AGENTS.md), [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md) and [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) before changing anything.

## Preserved product behavior

Source inspection confirms that the product line contains:

- deterministic fixed-step simulation;
- real `box3d.js` WebAssembly physics and contacts;
- an 18-body M6 reference vehicle with physical rack steering;
- drive, reverse, coast and braking;
- keyboard and simultaneous mobile touch controls;
- orbit/zoom camera and transactional destroy/rebuild;
- E2R/offroad terrain, stones and bumpers;
- optional local JSPREV2 render and collision data;
- `Piksele`/`Wygładzanie` texture filtering;
- grid disabled by default and toggleable;
- a relative-path portable build foundation.

Jozz's recorded owner observation for the exact product line states that the scan displayed correctly, pixel smoothing was off but toggleable, the grid was off but toggleable and vehicle collision worked correctly. This is owner observation, not a replacement for an exact clean build and browser receipt.

## Evidence boundary

The exact `f1c0ffe...` baseline passed two clean Windows gates with Node 24.16.0, npm 11.13.0, TypeScript 7.0.2 and Vite 8.1.5. Both 14-file artifacts were byte-identical and the retained evidence passed an independent 119-check audit. That PASS is tied only to `f1c0ffe...`; the current toolchain-pinning commit must be revalidated before runtime work inherits it.

The following remain unproven:

- the exact post-pin repair commit under the same two-run Windows gate;
- a structural public mode with zero scan imports, requests and private scan bytes;
- desktop browser console/network evidence for the exact artifact;
- real-phone touch, rotation, rebuild and stability evidence;
- GitHub Pages publication and rollback.

Do not use `PASS`, `READY`, `RELEASE` or `PUBLISHED` without matching exact evidence.

## Current campaign order

```text
R0-A repository authority and truthful documentation
R0-B exact canonical Windows toolchain pin and revalidation
R0-C structural local-full and MAP_ONLY_R0 product profiles
R0-D reproducible portable public artifact and adversarial gates
R0-E desktop and real-phone validation
R0-F owner decision and GitHub Pages publication
R0-G default-branch normalization
R1   real chassis and four wheels
```

R0 freezes physics, controls, camera, map, terrain, scan parsing/collision and owner-vehicle work.

## Local development

The canonical R0 release toolchain is Node 24.16.0 with npm 11.13.0. The package metadata fails closed on another Node/npm pair. Do not copy `node_modules` between machines or operating systems.

```powershell
npm ci
npm run dev -- --host 0.0.0.0
```

Existing source and portable checks:

```powershell
npm run check
npm run build:portable
```

A result is canonical only when the exact environment, commit, commands, exit codes and clean-before/clean-after state are recorded.

## Controls

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse/free-area drag     orbit camera
mouse wheel              zoom
mobile buttons           multi-touch vehicle controls
```

## Physics boundary

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
product physics authority: false
native JV parity: NOT_PROVEN
```

The TypeScript vehicle supports browser and release work but is not a proven native JV port. R0 must not add or retune drivetrain, suspension, tire, aero or steering mechanics.

## Source/runtime boundary

The repository also contains a larger GLB/vehicle-visual foundation. A static import audit of the exact product tree found 72 TypeScript files: 51 reachable from `src/product-main.ts` and 21 not reachable from that entrypoint. Those 21 files are `SOURCE-PRESENT / TESTED IN ISOLATION / NOT PRODUCT-REACHABLE`, not active product functionality.

See [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) for the exact list and [`docs/BRANCH_ROLES.md`](docs/BRANCH_ROLES.md) for branch classification.

## Publication direction

The selected target is the separate public artifact repository `Jozzpoly/JV-Box3D-Web-Public`. Its `main` branch is the publication control plane and `release/r0` is reserved for already validated static bytes. GitHub Pages is not enabled yet.

A public artifact must contain only the approved `MAP_ONLY_R0` payload, full SHA-256 provenance, third-party notices and no private scan data or hidden external network dependency. See [`docs/repair/R0C_MAP_ONLY_ARCHITECTURE.md`](docs/repair/R0C_MAP_ONLY_ARCHITECTURE.md).

## License and ownership

Third-party notices are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). JV Web currently grants no general public reuse license. Source code, models, scans, textures and photographs require separate owner decisions before publication.

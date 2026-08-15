# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `ANALOG STEERING V1 DEVICE GATE / OWNER VALIDATION PENDING`

## Authority and active lane

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
Camera Manual Rig V1 source absorption: 997c9a34ea429220dbdb4f5408a0ac37200bd712
fullscreen source checkpoint: checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143
analog steering V1 source candidate: d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2
analog steering POSITION timeline foundation: 30a00ab861f9c93150f426d5d06a01e7b86dda46
analog pointer joystick adapter: 2fc8babbf22f239e27e625e5d174fae18d7ce616
closed performance checkpoint: checkpoint/perf-foundation-v1-closed-2026-08-15
owner-tested performance code: checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c
public A53 proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public Camera 1B owner-device proof: release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d
public fullscreen owner-device proof: checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba
public analog steering device-gate candidate: release/friends-r1@b6b91cad54966944af47f31d11721d2695066992
public known-good rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git, reproducible execution evidence and direct owner observation outrank this file. `main` remains accepted authority until the canonical promotion gate is completed.

`work/friends-r1-usability` is the only ordinary active lane ahead of `main`. Old `work/*`, `candidate/*`, `repair/*` and `checkpoint/*` refs are historical/evidence unless this section explicitly activates them. Derive transient ahead-counts from Git when needed instead of recording them here.

## Working product boundary

Friends currently includes Plac E2R, Offroad, the owner vehicle and the complete JSPREV2 scan on desktop/phone. Manual Camera Rig V1 and explicit fullscreen form part of the owner-validated usability foundation. Analog Steering V1 is implemented in the active private lane and has an isolated public device-gate candidate, but it is **not owner-accepted yet**. The current vehicle's coherent-front bridge remains a temporary product intermediate; final rig, steering feedback/back-drive and handling are open. JURE owns future rig authoring.

Current JSPREV2 stress case:

```text
7 tiles / 25 groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
111,288,484 B published scan payload
```

Physics remains fixed 60 Hz with the existing solver/substeps and vehicle complexity.

## Performance foundation v1 — closed scope

The active source contains the owner-validated low/medium-cost foundation: scan-group culling/state reuse, direct Uint32 upload with safe WebGL1 fallbacks, parser-pass bounds/validation, bounded two-way tile loading, physics/presentation decoupling, deferred rich trace, hidden-debug suppression, startup/runtime telemetry and the lightweight mobile compositor policy.

Owner scope: Galaxy A53, normal Chrome, render scale 1x, DPR about 2.81, culling ON, current full textured JSPREV2.

Settled evidence reached 60 browser RAF/s and 60 scene presents/s at 16.7 ms average / 16.8 ms p95, including a scan view with 19/25 groups visible. This closes lightweight optimization for the present stress case; it does not prove 60 fps at 2x, universal cold-cache startup, other phones or future larger/multiple worlds.

Do not resume current-JSPREV2 micro-optimization by default. Future scaling work should be triggered by evidence and should prefer separate collision representation, texture scheduling/residency, safe world-data lifetime reduction and a better VAW/JSPREV3 asset representation before LOD/world partitioning.

## Camera Manual Rig V1 — closed scope

Camera 1A established responsive framing/reset, a 0.35–2000 m manual distance range and distance-aware near/far clipping. Camera 1B added the accepted manual interaction layer and has now been absorbed into private `work/friends-r1-usability`.

Current manual camera behavior:

- one pointer / normal mouse drag: orbit;
- two-touch gesture: pinch zoom plus centroid pan;
- desktop Shift+left-drag or middle-drag: pan;
- wheel: zoom;
- manual focus offset is stored in the vehicle-local frame and follows the vehicle;
- reset clears manual orbit/pan/zoom and returns to the responsive viewport default;
- automatic camera assists are not implemented and must remain additive to manual calibration when introduced later.

Owner-visible validation on 2026-08-15 demonstrated the intended wide manual range: close and inside/under-vehicle inspection, far/aerial scan views, portrait and landscape phone use, normal Chrome phone use and desktop use. Messenger in-app WebView evidence is supplemental. The owner explicitly judged that the stage had largely achieved the intended result.

Exact device-gate evidence:

```text
Camera 1A private base: dc8eab1ef3a24dcaab4b8fdff61da020c2518d5e
Camera 1B private absorption: 997c9a34ea429220dbdb4f5408a0ac37200bd712
public owner-device gate: 4768abedaa67b7505ca963a0836879e42590b67d
camera runtime patch SHA-256: fcc82118d607bed941b487d1f8222d291882c8f5ea51b600ade5b8ee04f1be78
runtime modules in patch: 3
```

Source provenance was re-established before absorption: the local Camera 1A parent matched the three relevant remote blobs exactly, and the reconstructed Camera 1B TypeScript emitted byte-identical tested `m6-chase-camera.js` and `m6-world-renderer.js` modules after the deterministic device-payload import rewrite. Scoped Camera tests passed 17/17. This is strong source/device evidence, not a canonical Node24/TS7/Vite build.

Not accepted by this closure:

- camera persistence/presets;
- automatic speed/turn/slope/terrain/obstacle assists;
- final HUD/settings/input/mobile steering UX;
- canonical Friends packaging or promotion to `main`;
- any new authority over vehicle mechanics.

## Fullscreen V1 — closed scope

Private source commit `db55501342feacfb0f82099d7f47afe3a9756143` adds an explicit standard Fullscreen API capability without changing camera, renderer, physics or CSS. Unsupported contexts omit the control and rejected requests fail closed with a product-level message.

The owner validated the isolated Pages gate on 2026-08-15 in mobile Chrome portrait/landscape and on desktop. Enter/exit state worked correctly and several minutes of driving after fullscreen transitions revealed no observed camera/control regression. The supplied screenshots visibly show the active fullscreen state with the scan, vehicle and mobile controls rendered.

Exact proof boundary:

```text
private checkpoint: checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143
public checkpoint: checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba
public gate base: Camera 1B proof 4768abedaa67b7505ca963a0836879e42590b67d
```

The public fullscreen gate is noncanonical owner-device evidence layered over Camera 1B. It is not a canonical Node24/npm11/TypeScript7/Vite Friends build and does not by itself promote `main` or bless other browser fullscreen implementations.

## Analog Steering V1 — device gate pending

The active private lane now contains a deliberately separated analog-input stack without changing vehicle mechanics:

- `SteeringPositionTimeline` carries normalized timestamped `POSITION [-1,1]` commands through the same fixed-step boundary discipline as existing input;
- pointer joystick ownership is source-scoped, pointer-captured, dead-zoned and fail-safe;
- releasing the joystick commands neutral `POSITION 0`, giving mobile steering an explicit self-centering behavior;
- explicit digital `RATE` input retains priority for a step, so keyboard/binary controls remain usable;
- dropped fixed-step intervals advance digital, analog and longitudinal timelines together;
- the visible mobile LEFT/RIGHT pair is replaced by one analog steering control while DRIVE/BRAKE/REVERSE remain unchanged;
- hidden legacy left/right DOM targets are preserved temporarily as a compatibility boundary rather than forcing an unrelated longitudinal-input rewrite.

Scoped noncanonical development checks completed before publication:

```text
position timeline isolated tests: 6/6 pass
position timeline + joystick adapter isolated tests: 10/10 pass
private UI source candidate: d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2
public device-gate candidate: b6b91cad54966944af47f31d11721d2695066992
Pages publication for candidate: built
```

These checks do **not** equal the canonical repo `npm run check`, do not prove the composed browser patch booted correctly, and do not establish good driving feel. Owner/device validation is the current gate.

The public gate composes the already-tested Camera 1B runtime, accepted fullscreen overlay and the Analog Steering V1 POSITION path. Its loader fails closed if expected runtime transformation points are missing instead of silently falling back to old steering.

Not accepted yet:

- joystick ergonomics, size, dead zone or steering feel;
- analog steering behavior on the real phone/browser runtime;
- final steering geometry, self-aligning/back-drive behavior or handling;
- analog throttle/brake or gamepad input;
- canonical Friends build or promotion to `main`.

## Remaining formal promotion gate

Before advancing `main` / ordinary Friends release, run in the exact repo toolchain:

1. Node 24.16.0 + npm 11.13.x + lockfile dependencies;
2. `npm run check` with real Box3D coverage;
3. `npm run build:friends-r1` and portable checks;
4. rendered browser smoke of the resulting canonical artifact;
5. exact source/artifact/rollback identity verification.

Whether a particular agent environment can execute this gate is session-specific and must be checked at execution time.

## Next product phase

Do not start another feature before the current device gate answers the input question. Current priority is:

1. owner/device validation of Analog Steering V1 on mobile, preferably Offroad first and then the scan;
2. classify any problem as joystick ergonomics/input mapping versus temporary steering/handling mechanics;
3. iterate the smallest proven problem until analog steering is genuinely useful;
4. then choose the next small usability slice from camera persistence/HUD friction or additive dynamic camera assists;
5. broaden analog/gamepad/longitudinal input only after the first steering path proves useful.

Keep vehicle mechanics unchanged unless evidence from the driving gate specifically justifies a mechanics slice. Automatic camera behavior must never silently overwrite manual user calibration.

## Documentation/workflow hygiene

Default context is `AGENTS.md` + this file + current source/tests. Use `ARCHITECTURE.md`, `OWNER_CHECKPOINTS.md`, contracts or baselines only for the specific question they answer.

Do not create per-agent handoffs, branch-role tables, campaign journals or duplicate roadmaps. When current truth changes, edit the existing living document and let Git preserve the previous version.

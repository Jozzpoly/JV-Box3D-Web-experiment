# JV Web

JV Web is the active desktop/mobile browser version of Jozz Vehicle for the current friend-demo campaign. It combines the browser vehicle fixture, E2R/offroad terrain, desktop/mobile controls, WebGL rendering and an optional private LOCAL_FULL JSPREV2 path.

The project is currently being developed as a motivating, increasingly game-like browser experience for Jozz and friends. Native JV is maintained separately and is read-only for this campaign.

## Current status

### Public R0 — closed baseline

```text
private R0 source:
Jozzpoly/JV-Box3D-Web-experiment
5ba6cc406b8c1541e29cd1ae59ffed78a7509284

authorized public artifact:
Jozzpoly/JV-Box3D-Web-Public
release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

live:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R0 passed exact Windows source/artifact validation, byte-identical build comparison, public promotion verification and live GitHub Pages smoke. Jozz additionally validated the live page on desktop and a real smartphone, including driving, steering and braking.

R0 remains frozen as rollback/reference. New work belongs on:

```text
development/jv-web-r1
```

## Current friend-demo direction

The target is no longer merely a technical browser demonstrator. Before this campaign is considered complete, Jozz wants most of:

- his real authored chassis + wheel visuals;
- materially better racing-game chase camera;
- desktop camera orbit/zoom and phone pinch zoom;
- usable JSPREV2 scan + phone assessment;
- fast location/teleport switching;
- vehicle presets/settings;
- FWD/RWD/AWD and a precisely defined drivetrain lock;
- useful QoL;
- rebuilt Web/mobile UI;
- selected newer native `b3Wheel` port if technically sane.

Order is adaptive and may change after real play/feel. Social-media optimization is later and must not slow the friend-demo.

The current cold-takeover hypothesis for the first main owner-visible slice is **REAL CAR V1**: integrate the exact real chassis + four real wheels and their required pixel material/texture behavior while keeping the current physics, world and camera unchanged. Camera work is intentionally separated into the following owner-feel slice so visual and camera feedback remain attributable. See the takeover brief; this is a hypothesis, not a frozen roadmap.

## Current private scan capability

The private root `index.html` launches `src/product-main.ts`, which still configures the LOCAL_FULL path. If an exact local pack is selected with:

```text
JOZZ_SCAN_PREVIEW_PACK
```

the Vite development server exposes the private JSPREV2 data to the runtime.

This is **not** the same thing as public Pages delivery. Public R0 remains scan-free, and a future public scan requires an explicit asset packaging/hosting decision.

Strongest historical desktop scan baseline:

```text
product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580
```

It has exact Windows gate evidence plus owner-observed corrected rendering/filter/grid and working collision. Current R1 still contains much of this scan path, so future work should first revalidate current LOCAL_FULL rather than wholesale-recover the old branch.

## Current vehicle/runtime boundary

The public/current vehicle visual remains procedural, while current R1 already contains a substantial dormant GLB/vehicle-visual stack.

```text
runtime backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
product physics authority: false
native JV parity: NOT_PROVEN
```

The exact owner source assets have been recovered and indexed. The next visual work should start from those known resources instead of broad asset discovery. The deterministic tiny GLB fixture is a diagnostic fallback, not a required milestone.

## Controls in the current build

```text
A / D or Left / Right   steering
W / Up                  forward
S / Down                reverse
Space                   brake
mouse/free-area drag     orbit camera
mouse wheel              zoom
mobile buttons           multi-touch vehicle controls
```

Future camera work should evolve the existing `M6WorldRenderer` camera/input path and preserve touch-driving ownership.

## Start here before changing anything

Keep cold start small:

1. resolve current private/public refs;
2. read `AGENTS.md`;
3. read `docs/handoff/JV_WEB_TAKEOVER_BRIEF_2026-08-08.md`;
4. if a handoff resource ZIP is attached, read its `00_START_HERE.md`, `02_RESOURCE_MAP.md` and `09_COLD_AGENT_TAKEOVER_CHECKLIST.md`;
5. inspect the exact current source/evidence required to challenge the proposed first task.

Use deeper documents only when the question needs them:

```text
AI_PROJECT_MEMORY.md
docs/PROJECT_STATE.md
docs/handoff/JV_WEB_HANDOFF_2026-08-08.md
docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md
```

The resource pack physically contains the important recovered vehicle assets, scan closure/evidence and `b3Wheel` source surface so the next agent does not need broad archaeology.

## Development workflow

Ordinary private R1 work uses focused validation, not the full R0 release ceremony. Jozz should be involved only when real visual/feel/device observation matters. Full reproducibility/artifact/promotion/rollback discipline returns for actual public release candidates.

See `docs/DEVELOPMENT.md`.

## Toolchain

Canonical R0 toolchain:

```text
Node 24.16.0
npm 11.13.0
TypeScript 7.0.2
Vite 8.1.5
```

Common commands:

```powershell
npm ci
npm run check
npm run dev -- --host 0.0.0.0
```

`npm run build:public-r0` remains the frozen R0 public profile; do not treat it as the automatic shape of later friend-demo releases.

Third-party notices are in `THIRD_PARTY_NOTICES.md`. No general public reuse license is granted.
# JV Box3D Web Experiment

A focused proof of concept for running a real slice of **Jozz Vehicle** directly in a browser with Box3D compiled to WebAssembly.

## Scope

The target is deliberately narrow:

- one current JV vehicle rig;
- the JV test board;
- a photogrammetry/3D-scan terrain;
- keyboard driving, chase camera, restart and basic telemetry.

This is not a port of the whole desktop application and it is not intended to be production-ready.

## Important rig decision

The browser vehicle is based on the **M6/M7 multi-body suspension foundation and later updates**. M5 is an old single-joint baseline and is not used as the implementation snapshot.

The bootstrap already represents:

- four double-wishbone corners;
- physical control-arm bodies, knuckles, ball joints and coilovers;
- a physical steering rack and tie rods;
- torque-based drive;
- anti-roll bars and aero drag;
- the split rolling-sphere / true-width sidewall wheel envelope.

See [`docs/PORTING_NOTES.md`](docs/PORTING_NOTES.md) for parity details and deliberate first-pass differences.

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Controls

- `W` / `S` — drive forward / reverse
- `A` / `D` — steer
- `Space` — brake
- `R` — restart the experiment

## Scan assets

The app runs without scan files. To enable the scan island, add:

```text
public/assets/scan/terrain-visual.glb
public/assets/scan/terrain-collision.glb
```

The visual mesh may remain detailed and textured. The collision mesh must be cleaned and strongly reduced. Both must use metres, +Y up and the same origin.

## Source lineage

The authoritative native reference is the `jozz-scan-terrain-f0` branch of `Jozzpoly/Box3d_FunProject`, especially the current M6/M7 suspension rig, geometry, config and lab files. Box3D and `box3d.js` are MIT-licensed projects.

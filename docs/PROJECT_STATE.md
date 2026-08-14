# JV Web — current project state

Updated: 2026-08-14
Owner: Jozz
Status: `FRIENDS R1 LIVE / FOUNDATION NORMALIZATION PASS 1 COMPLETE / USABILITY + MEASURED PERFORMANCE NEXT`

## 1. Current release

Public site: `https://jozzpoly.github.io/JV-Box3D-Web-Public/`

```text
public repo: Jozzpoly/JV-Box3D-Web-Public
live branch: release/friends-r1
live commit: 7161215e47f00573b8c1b5c31e5931c89f9d709a
live tree: 73fe33de5d0ed62953e6e1493a4d47676507c809
public rollback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
private source used by live hotfix: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
```

The live Friends artifact contains 54 files / 114,496,451 bytes and the exact approved JSPREV2 scan. Pages has built the hotfix successfully.

Private accepted source has since advanced only through foundation documentation/workflow normalization; no vehicle/render/scan product behavior was changed by that normalization.

## 2. Owner-validated product baseline

Direct owner testing on 2026-08-14 established:

### Desktop

- normal entry starts at Plac E2R;
- vehicle loads, drives and basic camera/UI work;
- Offroad loads and is driveable over terrain;
- full JSPREV2 scan loads, renders and runs with live physics;
- the Pages/CDN `Content-Length` startup failure is resolved.

### Phone

- Plac E2R and Offroad work;
- full JSPREV2 scan also loads and runs;
- scan performance is noticeably slow/heavy, but driving remains possible at low speed;
- portrait and landscape both render the product;
- camera framing and responsive composition are visibly rough and need a later UX pass.

This is the first accepted end-to-end Friends foundation. Automated PASSes support it but do not replace the owner/device evidence.

## 3. Vehicle boundary

The current symmetric temporary front bridge remains accepted only as an R1 product intermediate:

- straight driving and left/right steering are coherent enough to continue;
- final steering feedback/back-drive/self-align is not accepted;
- residual asymmetry/feel issues remain;
- FL lower wishbone and wishbone<->knuckle mating remain unresolved;
- no current caster/KPI/trail/tie-rod/rack geometry is final authority.

Do not spend the next JV Web phase guessing those details. Authoring of reliable mating points/frames belongs in JURE.

## 4. Scan/runtime boundary

Current approved Friends scan:

```text
preview SHA-256: aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146
COMPLETE.json SHA-256: a0f3bc792f0a273c18fb00117deafdec95959f8f7e9f2a0bb85af34c8c2e29fb
tiles: 7
groups/textures: 25 / 25
vertices: 1,409,687
triangles: 1,775,775
source payload: ~111 MB
```

The browser loader validates decoded tile body bytes and JSPREV2 structure. It intentionally ignores compressed transport `Content-Length` as a logical file-integrity signal.

Current renderer uploads all scan groups and draws all of them every frame. There is no tile/frustum culling, streaming, mipmapped texture pipeline or scan LOD yet. The loader also keeps render geometry and builds a merged collision representation. These are optimization opportunities, not current release blockers.

## 5. Foundation normalization pass 1 — complete

Completed on private `main`:

- accepted Friends source line integrated by normal fast-forward;
- stale front-corner transaction/steering-next-step instructions removed from active authority;
- no active implementer task remains;
- active docs now describe Friends/JURE/current product truth rather than the old recovery campaign;
- ordinary test runner supports focused test files while preserving full-suite behavior with no arguments;
- historical recovery/protocol material is cold evidence rather than required boot context.

The completed `work/friends-pages-r1` transaction is no longer parallel product authority.

## 6. Next foundation/product iterations

### Iteration 2 — release/build observability

Make it trivial to know which build the browser is running and whether a Pages update/cache transition happened. Keep this owner-visible and tiny; do not build a telemetry platform.

### Iteration 3 — mobile camera/framing

Make chase camera composition aspect-aware for portrait and landscape while preserving desktop behavior and vehicle mechanics.

### Iteration 4 — responsive controls

Reduce obstruction and improve reachable layout/safe-area behavior on phone without redesigning the whole UI.

### Iteration 5 — performance observability

Measure frame time/FPS, draw workload, scan group/chunk counts, load timing and useful memory proxies on real desktop/phone paths. Debug-only instrumentation is sufficient.

### Iteration 6 — simple scan wins

Start from measured bottlenecks: remove avoidable memory duplication, preserve/use spatial tile bounds, add visibility/tile culling, reduce draw workload and improve texture sampling behavior. Re-measure after each small change.

### Iteration 7 — LOD decision

Only if simple wins are insufficient, prototype the smallest useful geometric/texture LOD or streaming scheme. Desktop quality remains the reference and full phone scan stays available during experiments.

### Iteration 8 — JURE integration readiness

When JURE stabilizes its authored output contract, define a small JV-Web adapter/fixture. Do not import JURE UI/ontology wholesale and do not create cross-repo runtime coupling.

### Later — rig + driving refinement

Use improved authored rig evidence to repair lower suspension/mating and then revisit physical steering response, self-align/back-drive, handling and feel. Owner driving remains the final gate for feel.

## 7. Explicitly deferred

- old-build archaeology for a remembered driving feel;
- final physical steering experiments against the provisional rig;
- advanced mobile scan LOD before profiling/simple wins;
- large documentation or process frameworks;
- rewriting native JV or JURE from this repo.

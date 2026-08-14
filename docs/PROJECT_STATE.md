# JV Web — current project state

Updated: 2026-08-14
Owner: Jozz
Status: `FRIENDS R1 LIVE / FOUNDATION BASELINE ACCEPTED / CLEANUP + PRODUCTIZATION NEXT`

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

## 5. Current foundation task

The next work is not another vehicle-mechanics expedition. Foundation work should make the accepted product cheap to continue:

1. make private `main` match accepted Friends source truth;
2. remove stale transaction/steering instructions from active docs;
3. keep ordinary dev loops targeted and cheap;
4. keep public release/hotfix identity easy to diagnose;
5. keep JURE as the rig-authoring boundary rather than duplicating it here.

No active implementer research task exists after this cleanup.

## 6. Planned product phases

### Phase A — foundation normalization

Current phase. Documentation/workflow/main integration only; do not change vehicle feel or scan rendering.

### Phase B — Friends usability

Small owner-visible slices:

- visible build/release identity so cache/deploy state is obvious;
- mobile camera/framing;
- responsive control layout and orientation behavior;
- clearer scan loading/startup feedback if needed.

### Phase C — scan performance

Measure before architecture. Start with the cheapest proven bottlenecks: memory copies, visibility/tile culling, draw workload and texture behavior. Only introduce geometric LOD/decimation/streaming when measurement shows simpler steps are insufficient.

Desktop scan quality/performance is the reference. Phone scan remains available throughout optimization rather than being silently disabled.

### Phase D — JURE integration

Consume explicit owner-authored rig/frame data when JURE is ready. Revalidate lower suspension/mating and only then decide what physical steering geometry is justified.

### Phase E — driving/physics refinement

Final steering response, self-align/back-drive, handling and feel come after better rig evidence. Owner driving remains the final gate for feel.

## 7. Explicitly deferred

- old-build archaeology for a remembered driving feel;
- final physical steering experiments against the provisional rig;
- advanced mobile scan LOD before basic profiling/simple wins;
- large documentation or process frameworks;
- rewriting native JV or JURE from this repo.

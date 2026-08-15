# JV Web — current project state

Updated: 2026-08-15
Owner: Jozz
Status: `FRIENDS R1 LIVE / LOW-LEVEL PERF VALIDATED SOURCE BOUNDARY`

## Authority and rollback

```text
private accepted: main@f8eb0908f5934aed2d504f34ce483a02754039ec
private active performance work: work/friends-r1-live-perf
private S1-S3 checkpoint: checkpoint/perf-foundation-s3-2026-08-15@20eca0451c81581649e061c8bc61d45001e32601
private pre-execution checkpoint: checkpoint/perf-lowlevel-preexec-2026-08-15@05b0a6cbc275a9ac0f044c547fb90a277c06cecb
private repaired source checkpoint: checkpoint/perf-lowlevel-repaired-validated-2026-08-15@1ad19c67449fe8c87603b40d8e7c6e9c5cbcd422
public moving Pages lane: release/friends-r1@1297899c6dd25607f7da54a54bed28e8bb991630
public pre-lowlevel checkpoint: checkpoint/pages-friends-r1-pre-lowlevel-2026-08-15@1297899c6dd25607f7da54a54bed28e8bb991630
public known-good checkpoint: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git/ref, reproducible execution evidence and direct owner observation outrank this file. `main` remains untouched accepted authority. `release/friends-r1` remains the moving live-test lane and has not yet been replaced by the low-level candidate.

## Exact validation source

The owner supplied GitHub ZIP `work/friends-r1-live-perf@5eeb7437604817d13f5c08ae959ebf1d745da482`. Its central-directory commit marker matched the live Git ref at takeover. ZIP SHA-256:

`de31bd4fe9eb5fc2db5aa15c5b348ed5842e49f38d0a1f43c7d01a03e780f9a9`

During validation two small strict/tooling test corrections were retained. An accidental renderer commit `8bb65eb...` was detected by recursive review before publication; it changed only `src/render/jv-world-renderer-mobile.ts` but was corrupt. The current tree restores the renderer byte-for-byte from its good parent and preserves the bad commit only as historical evidence. Relative to the supplied 5eeb source, checkpoint `1ad19c...` has only four small net file changes: runtime/build marker syntax, HUD marker syntax, build-identity test alignment and npm-11 toolchain-test alignment.

## Product and stress-case truth

Owner-validated Friends baseline remains intact: Plac E2R, Offroad, driving/touch and full JSPREV2 work on desktop and phone. Mobile performance/loading and mobile camera/control UX remain open.

Current scan:

```text
7 tiles / 25 groups / 25 textures
1,409,687 vertices
5,327,325 indices
1,775,775 triangles
66,419,624 B binary geometry
44,858,270 B source textures
111,288,484 B published scan payload
~104.6 MB estimated JS CPU geometry before GPU/Box3D ownership
```

The historical `~55.8 MB GPU geometry` manifest estimate assumes a Uint16-oriented representation and is not a measured post-fast-path residency figure. Do not use it as evidence of current GPU memory.

Existing A53 Messenger-WebView captures show about 53.4 ms / 19 fps at 2x backing scale, 43.9 ms / 23 fps at 1.5x and 36.4 ms / 27 fps at 1x. Pixel count matters, but a 75% backing-pixel reduction does not remove the majority of the performance problem. Final acceptance remains Galaxy A53 Chrome, not Messenger WebView.

## Low-level source stack under validation

The supplied candidate contains:

- conservative scan-group frustum culling;
- shared scan matrix reuse and logical-group WebGL state batching;
- fixed 60 Hz physics catch-up decoupled from presentation, so required Box3D steps do not cause repeated full renders in one browser frame;
- deferred rich `M6TraceFrame`/visual snapshot materialization for only the final presented catch-up state, while legacy `world.step(N)` semantics remain available;
- direct Uint32 scan-index fast path when WebGL1 exposes `OES_element_index_uint`, with the legacy Uint16 chunk path retained;
- hidden Debug DOM work suppression;
- normal browser caching plus bounded two-way tile fetch/parse pipelining;
- runtime telemetry for browser cadence, executed simulation steps, physics time and presentation time.

No intentional solver, fixed-dt, substep, vehicle-topology or scan-geometry reduction is part of this stack.

## Execution evidence obtained in this session

Canonical Node/npm/Vite/Box3D execution is still unavailable. The sandbox has Node 22.16.0 / npm 10.9.2 and cannot resolve the npm registry; `npm ci` stops on `EAI_AGAIN`. A private GitHub Actions attempt requested exact Node 24.16.0 and npm 11.13.0 but GitHub rejected the job before allocating a runner because account billing/spending limits prevented the run. This is infrastructure evidence, not a source-test failure.

Within that boundary, reproducible noncanonical evidence is now substantially stronger:

- strict TypeScript 5.8 pass for the complete touched renderer/loader/runtime subset;
- 41/41 focused parser/culling/chunker/index-policy/WebGL/HUD/build-identity tests pass in one final run;
- 33/33 host/runtime tests pass with an explicit nonexecuted Box3D module stub, including the catch-up contract `4 physics steps -> 1 final capture/presentation`; this proves scheduling/ownership behavior, not numerical Box3D parity;
- 149/149 `.mjs` files in `tools/` and `tests/` pass `node --check`;
- documentation link audit passes across 13 Markdown files.

There is still **no full canonical `npm run check`, no Vite bundle, no real Box3D numerical regression run and no measured performance gain for this private candidate**. Those claims remain forbidden until the dependency/build gate is cleared.

## Recursive audit corrections

Several initial optimization ideas were deliberately downgraded or rejected after falsification:

- checked-WebGL `getError()` is not a per-draw hot-path problem; checks occur around uploads, so it is not a current runtime target;
- keeping small groups on Uint16 is only a modest memory refinement (~1.41 MiB EBO for the current 12 small groups), not the main direct-index win;
- an attempted selector that rescanned all 5.3M indices to find a maximum was rejected before promotion because it would add startup work;
- the important direct-index win is avoiding legacy remap/chunk/copy work for the 13 groups above the 16-bit vertex range and reducing draw-call multiplication;
- synthetic desktop stress using the real current large-group sizes made the legacy chunk algorithm produce 78 chunks and about 1.0 s aggregate CPU in that synthetic topology; this demonstrates algorithmic scale only, not A53 timing;
- synthetic merge of the current collision-size equivalent creates ~36.5 MiB of additional arrays and took ~36-48 ms on this desktop environment; again this is mechanism evidence, not a device benchmark.

## Strong next low-level candidates

Before LOD/world partitioning, prioritize measured work in this order:

1. **JS/WASM event bridge:** `stepPhysics()` currently drains the full reusable Box3D event buffer every fixed step although the product path currently consumes only contact-begin diagnostics from it. Measure/debug-gate or provide a cheaper count path before removing anything.
2. **World-data lifetime:** Box3D copies mesh input into its own native mesh and WebGL uploads its own buffers, while `product-world`, `F4VehicleHost` and `M6TopologyWorld` retain heavy decoded `JvWorldData`. Design a restart-safe ownership split so large JS arrays can become collectible after GPU/physics installation, rather than mutating live data ad hoc.
3. **One presentation snapshot:** consolidate duplicated JS<->WASM body/joint getters used by rich trace and visual-frame construction, and reduce presentation-time object/freeze allocation while keeping the exact physical state.
4. **Texture startup pressure:** bound decode/upload concurrency instead of allowing 25 image decodes/uploads to converge unpredictably; keep a robust browser fallback.
5. **WebGL binding overhead:** optional `OES_vertex_array_object` fast path with current WebGL1 fallback can remove repeated buffer/attribute setup without changing geometry.
6. **Asset-format pass:** future JSPREV3/VAW-friendly export can precompute bounds/index width and preserve a GPU-friendly interleaved stream, with a separate collision representation. This is an asset-pipeline improvement, not LOD.

Physics-sensitive sleep/wake changes are lower priority and require explicit equivalence testing; do not remove unconditional wakes merely for a theoretical idle win.

## Unpromoted local hardening artifact

A further 10-file local hardening patch was built from the exact 5eeb ZIP and passed the focused evidence above. It includes parser-pass AABB calculation, tested two-worker ordering, a hybrid direct-index selector and cross-group textured scan-pass state reuse. Exact patch SHA-256:

`9bc32817baf597884dcc11fd9e47b9015ebc6aa33642116b47e53a71c8650039`

It is **not repository authority and not a Pages candidate yet** because the full dependency/build gate could not run. Preserve it as review evidence; materialize it only in a normal Git-capable/build-capable environment and re-run canonical checks before promotion.

## Immediate gate

1. obtain a build-capable environment for the current private source (canonical Node 24.16.0 / npm 11.13.x, exact lockfile dependencies);
2. run full `npm ci`, `npm run check`, real Box3D tests and `npm run build:friends-r1`/portable validation;
3. only then materialize or re-evaluate the additional 10-file hardening patch and repeat the full gate;
4. publish the accepted experimental artifact to `release/friends-r1` while retaining the new `checkpoint/pages-friends-r1-pre-lowlevel-2026-08-15` rollback;
5. measure in normal Chrome on the Galaxy A53: settled avg/p95, simulation steps/frame, physics ms, presentation ms, visible scan groups/draws, load time and stability;
6. choose the next bottleneck from evidence before introducing LOD/world partitioning.

## Boundaries

- no reduction of fixed-step physics quality, solver substeps or vehicle complexity for performance;
- no hidden removal of scan content on phone;
- no LOD/world partitioning in this phase;
- no final steering/JURE work in this campaign;
- no measured-gain claims without real build/device evidence;
- public repository remains an artifact/publication surface, not a place to expose private source merely to obtain free CI.

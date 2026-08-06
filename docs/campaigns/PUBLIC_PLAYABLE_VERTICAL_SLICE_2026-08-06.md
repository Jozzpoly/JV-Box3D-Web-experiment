# JV Web — public playable vertical slice

Status: **ACTIVE DIRECTION / PUBLICATION NOT AUTHORIZED**  
Owner: Jozz  
Working base: `product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580`

## Product intent

The near-term product is not a generic rendering framework. It is one playable
browser build that a person can open from a GitHub link on desktop or phone and
immediately drive:

```text
current M6 browser fixture
+ owner vehicle body and wheels
+ E2R board/offroad
+ scanned terrain when its public asset boundary is solved
+ keyboard and multi-touch controls
```

The old/reference wheel and non-final physics are acceptable for this first
playable publication. Native JV parity, the final tyre and the complete visual
suspension are later product stages and must not block the vertical slice.

## Critical correction of direction

The strict visual contracts remain valuable, but the active path had begun to
optimize the complete 26-channel asset pipeline before proving the five parts
that define the product visually: chassis and four wheels. That ordering is now
rejected.

The active visual milestone is:

```text
real owner chassis + four real owner wheels
→ live VehicleVisualFrameV1 transforms
→ debug suspension may remain temporarily
→ owner browser review
```

Do not require real knuckles, arms, rack, coilovers, steering links, Cardan,
textures or final lighting before this milestone can be observed.

## Release lanes

### Local full checkpoint

The accepted local product includes E2R and the private JSPREV2 scan. It remains
the full visual/physics research checkpoint.

### Public map release R0

The first publication artifact is deliberately map-only until the scan receives
an explicit public asset, ownership and size decision. It must:

- contain no private scan bytes or local paths;
- work from a GitHub Pages repository subpath;
- require no custom GitHub Actions workflow;
- preserve desktop and mobile controls;
- be generated as a static `dist-public/` snapshot with `.nojekyll`;
- remain unpublished until the owner authorizes Pages/visibility separately.

### Public full release

The scan joins the public build only after its total bytes, file sizes,
photograph/texture rights and hosting location are explicitly accepted. Local
Vite middleware is not a publication mechanism.

## Ordered work

1. Integrate real owner chassis and four wheels beside the accepted renderer.
2. Keep debug suspension visible only for channels without owner geometry.
3. Validate scale, axes, wheel orientation, steering/spin and mobile budget.
4. Replace reload-based map/scan switching with an in-world vehicle teleport.
5. Build and validate the map-only static public artifact.
6. Perform desktop and real-phone smoke on the exact artifact.
7. Owner decides snapshot repository, visibility and GitHub Pages activation.
8. Add public scan assets only through a separate accepted boundary.

## Hard boundaries

- no GitHub Actions workflow without explicit owner approval;
- no Pages activation, repository visibility change, merge or Ready transition;
- no final mechanics added to `legacy_ts_m6`;
- no M5 code or vehicle substitution;
- no private scan copied into a public artifact;
- no publication claim before exact artifact and real-phone evidence.

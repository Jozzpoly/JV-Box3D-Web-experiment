# JV Web — branch roles and lifecycle

Updated: 2026-08-10

Branch names are workflow pointers, not project memory. Exact commits, current source and baseline documents carry durable history.

## Long-lived authority

### `main`

**ACTIVE PRIVATE SOURCE AUTHORITY AND DEFAULT BRANCH.**

The 2026-08-10 cleanup joins the accepted R1 development lineage into `main` without rewriting history. Fresh agents and ordinary product work start here.

Do not maintain a second permanent development branch merely to separate "real work" from the default branch. Temporary isolation is allowed only when a bounded task actually needs it.

## Frozen archive ref

### `archive/pre-cleanup-2026-08-10`

**FROZEN HISTORY RETENTION — NEVER AN ACTIVE DEVELOPMENT BASE.**

```text
commit: ee77c4760a08a739a712fec5418e3489746ad63d
tree:   37fe95af17cb21836cadc552830d55e6889048c1
```

Its tree is intentionally identical to `main@80a10fb50f9ac8f973139bfa6ccb3dbc24a443e0`. Its extra parents preserve the unique histories of the remote refs removed during cleanup.

Do not inspect this branch during normal takeover or implementation. Open it only when a concrete historical/salvage question cannot be answered from current `main`, a named baseline or an exact commit SHA. Do not create another archive ref merely to preserve branch names.

## Preserved historical evidence/salvage branches

Keep these only because they retain unique historical lineages that are not ordinary current work:

- `product/jv-web-car-map-scan` — strongest preserved c8e0 scan behavior/evidence lineage;
- `repair/jv-web-release-r0` — closed private R0 repair/release lineage;
- `candidate/jv-web-owner-vehicle-visual-r1` — frozen/broken early owner-vehicle tooling source; selective salvage only;
- `candidate/jv-web-render-host-r1` — frozen render-host experiment; selective salvage only.

Do not inspect these by default. A current question must name the reason to load them. When their remaining salvage value is fully absorbed into current source/baselines, they may be removed too.

## Temporary branches

Allowed prefixes when isolation is justified:

```text
work/<bounded-topic>
candidate/<owner-checkpoint-or-release-candidate>
```

Do not create `agent/*` branches. Agent identity is irrelevant to source topology.

Every temporary branch must be deleted after one of:

- fast-forward/integration into `main`;
- explicit rejection with any durable lesson recorded elsewhere;
- replacement by a later candidate that contains all needed current work.

Git history + exact SHAs + baseline/checkpoint documentation are the normal archive. The single pre-cleanup archive ref is an explicit one-time exception created to retain otherwise unreachable histories during this cleanup.

## Branch budget

Operational steady-state retained refs, excluding the frozen archive: **5**.

```text
main
product/jv-web-car-map-scan
repair/jv-web-release-r0
candidate/jv-web-owner-vehicle-visual-r1
candidate/jv-web-render-host-r1
```

With `archive/pre-cleanup-2026-08-10`, the physical steady-state remote branch count is therefore **6**. At most one justified temporary branch should normally be active, giving a practical ceiling of **7 total refs**. More than 8 total refs requires branch triage before new branch creation.

## 2026-08-10 cleanup — completed

The cleanup began with 23 remote branches. Before deleting refs, unique histories that were not already reachable from `main` were retained through the synthetic archive commit `ee77c4760a08a739a712fec5418e3489746ad63d`.

After verification, 18 redundant development/candidate/work/agent refs were removed. Current remote branch count is 6.

Durable rule from this event: **do not confuse retaining a branch name with retaining Git history**. New temporary branches should normally disappear after integration/rejection; future agents should not re-audit archived branches without a concrete reason.

# JV Web — branch roles and lifecycle

Updated: 2026-08-10

Branch names are workflow pointers, not project memory. Exact commits, current source and baseline documents carry durable history.

## Long-lived branches

### `development/jv-web-r1`

**ACTIVE PRIVATE SOURCE AUTHORITY.**

All accepted/current R1 work should converge here. Fresh agents should start here unless an active handoff explicitly names a temporary descendant.

### `main`

Historical/default repository control line. It is not current R1 implementation authority. Do not start product work from it.

## Preserved historical evidence branches

These may remain temporarily because they contain unique historical/salvage lineages not fully reachable from current R1:

- `product/jv-web-car-map-scan` — strongest preserved c8e0 scan behavior/evidence lineage;
- `repair/jv-web-release-r0` — closed private R0 repair/release lineage;
- `candidate/jv-web-owner-vehicle-visual-r1` — frozen/broken early owner-vehicle tooling source; selective salvage only;
- `candidate/jv-web-render-host-r1` — frozen render-host experiment; selective salvage only.

Do not inspect these by default. A current question must name the reason to load them.

## Temporary branches

Allowed prefixes when isolation is justified:

```text
work/<bounded-topic>
candidate/<owner-checkpoint-or-release-candidate>
```

Do not create `agent/*` branches. Agent identity is irrelevant to source topology.

Every temporary branch must be deleted after one of:

- fast-forward/integration into `development/jv-web-r1`;
- explicit rejection with any durable lesson recorded elsewhere;
- replacement by a later candidate that contains all needed history.

## Branch budget

Target private branch count: **6 or fewer**.

If more than 8 branches exist, perform branch triage before creating another. The triage question is not "could this branch ever be interesting?" but "does this branch contain unique evidence/source that is not already preserved by current history or a named baseline?"

## Current cleanup classification

The 2026-08-10 audit found 23 private branches. The following current-line branches are ancestors/redundant once `development/jv-web-r1` is fast-forwarded to the cleaned R1 line and should be removed:

```text
candidate/jv-web-r1-playable-foundation
candidate/jv-web-r1-car-5ch
candidate/jv-web-r1-full-owner-rig
candidate/jv-web-r1-r4-owner-packaging
candidate/jv-web-r1-r3-reference-calibration
work/jv-web-r1-car-5ch
```

All `agent/*` branches are historical working branches and are candidates for removal after the audit records any unique evidence worth preserving. Three playable recovery branches already point to the exact same commit, demonstrating why branch count itself must not be treated as evidence diversity.

Before deleting any branch, re-fetch its exact tip and confirm the cleanup manifest still matches current Git.

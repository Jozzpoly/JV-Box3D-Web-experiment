# JV Web — branch roles and lifecycle

Updated: 2026-08-10

Branch names are workflow pointers, not project memory. Exact commits, current source and baseline documents carry durable history.

## Long-lived authority

### `main`

**ACTIVE PRIVATE SOURCE AUTHORITY AND DEFAULT BRANCH.**

The 2026-08-10 cleanup joins the accepted R1 development lineage into `main` without rewriting history. Fresh agents and ordinary product work start here.

Do not maintain a second permanent development branch merely to separate "real work" from the default branch. Temporary isolation is allowed only when a bounded task actually needs it.

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

Git history + exact SHAs + baseline/checkpoint documentation are the archive. Do not keep branches merely as bookmarks.

## Branch budget

Target private branch count: **5 or fewer**.

If more than 8 branches exist, perform branch triage before creating another. The question is not "could this branch ever be interesting?" but "does it preserve unique source/evidence that current history or a named baseline does not?"

## 2026-08-10 cleanup manifest

After `main` contains the cleaned R1 lineage, remove:

```text
development/jv-web-r1

candidate/jv-web-r1-playable-foundation
candidate/jv-web-r1-car-5ch
candidate/jv-web-r1-full-owner-rig
candidate/jv-web-r1-r4-owner-packaging
candidate/jv-web-r1-r3-reference-calibration
work/jv-web-r1-car-5ch

all agent/* branches
```

The three historical playable recovery branch names already point to the same commit, illustrating why branch count must not be mistaken for evidence diversity.

Before deleting refs, re-fetch their exact tips and confirm no new commits/open PRs appeared after this audit.

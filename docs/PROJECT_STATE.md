# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MAIN PROMOTED / GROUNDING + HANDOFF PREPARATION ACTIVE / PRODUCT WORK FROZEN`

## 1. Current authority

Private source/product authority is the live `main` of:

`Jozzpoly/JV-Box3D-Web-experiment`

The repository was explicitly promoted on 2026-08-16 from the old accepted baseline to the validated P1 line. Resolve `main` live before every write; do not copy a historical SHA from this document into a write command without rechecking GitHub.

Exact promotion/evidence boundary:

```text
promoted main candidate:
  2b12a2fa99d49ebe4d748ed851c194825129d38f

owner-tested P1 runtime source:
  c9b5990b226685abe35851fc5e9496323096ecf7

private rollback tag for old main:
  rollback/main-before-p1-foundation-2026-08-16
  -> f8eb0908f5934aed2d504f34ce483a02754039ec

current public Friends artifact:
  Jozzpoly/JV-Box3D-Web-Public
  release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f

public rollback immediately before P1 foundation:
  7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf

immutable public fallback:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

The promoted candidate is eight commits after the owner-tested `c9b5990b...` product source. Main-promotion preparation proved that those post-owner-test changes did not modify runtime-bearing product source; they were documentation/test-contract preparation. The later grounding/handoff work is documentation-only and does not create a new owner-tested runtime claim.

## 2. Repository state and branch policy

Product work is intentionally frozen during grounding and handoff preparation. There is no ordinary active product lane.

The desired steady-state branch model is:

- `main` — accepted JV-Web authority;
- at most one temporary ordinary work lane when a concrete JV-Web implementation begins;
- `jure/<specific-purpose>` only for an explicitly isolated JURE -> JV-Web consumer experiment.

A branch name is navigation state, not history authority.

A 2026-08-16 cleanup removed the obsolete branch forest after preserving divergent tips with archive/rollback tags. During an interrupted recovery immediately afterward, three historical refs were accidentally recreated:

- `archive/pre-cleanup-2026-08-10`;
- `candidate/jv-web-owner-vehicle-visual-r1`;
- `candidate/jv-web-render-host-r1`.

They are **not active work and not authority**. Their exact divergent tips are already preserved by archive tags created before cleanup. Remove those three redundant branch refs before final handoff if they still exist. Do not restore the old branch forest.

## 3. Accepted P1 product foundation

The current product foundation is real public/browser/device evidence, not a source-only candidate.

Implemented and owner-tested from exact runtime source `c9b5990b...`:

- deterministic CSS entry authority; dynamic JS no longer owns a later competing CSS preload;
- superseded V2 mobile presentation stylesheet removed from the active cascade;
- current mobile CSS is the component presentation owner;
- short mobile viewport can shrink below the historical desktop `420px` floor;
- moving Friends root no longer carries the old executable `jv-live-performance.js` overlay;
- analog steering works as the current X-only `POSITION` reference;
- analog pedals work as the current functional foundation;
- Camera Manual Rig V1 and Fullscreen V1 remain accepted foundations;
- Plac E2R, Offroad, owner vehicle and approved JSPREV2 remain available.

The approved scan carried into the P1 release has exact `__jv_scan__/index.json` identity:

```text
bytes: 7256
SHA-256: 64a2cdf8ef30f245544d90786528e867186f0740c37aac415a5b8b0c4d7b885e
```

## 4. Validation truth

### 4.1 P1 focused source/build gate

Exact product source: `c9b5990b226685abe35851fc5e9496323096ecf7`.

Canonical Windows Node `24.16.0` / npm `11.17.0` evidence:

- focused P1/input/lifecycle suite: **48/48 PASS**;
- TypeScript: PASS;
- normal Vite production bundle: PASS;
- clean-tree checks: PASS;
- all emitted CSS entry-linked: PASS;
- late JS-owned CSS: NONE;
- base -> current mobile cascade: PASS;
- mobile `scene-panel` floor override present: PASS.

### 4.2 Friends release gate

Exact public release: `release/friends-r1@a325c279...`.

- existing Friends candidate validator: PASS;
- exact approved JSPREV2 recovered from Git object bytes;
- final staged public Git tree byte-compared with candidate;
- ordinary non-force fast-forward publication;
- live manifest source = exact `c9b5990b...`;
- live scan index = exact approved bytes;
- historical public runtime overlay = absent.

### 4.3 Owner-device gate

Owner directly tested the P1 Friends build on desktop and Samsung Galaxy A53 / Chrome in portrait, landscape, browser-chrome and fullscreen states.

Accepted for this boundary:

- steering works well;
- pedals work well as the current functional foundation;
- the worst previous clipping/overlay/presentation failures are resolved sufficiently to close P1 foundation;
- current state is suitable as the base for continued development.

Explicitly not final:

- pedal mapping/mechanics/visual design;
- coordinated HUD composition;
- steering visual language;
- rotational steering;
- authored rig geometry;
- Ackermann/tie-rod authority;
- final vehicle handling.

### 4.4 Final Main Promotion Gate

Exact candidate promoted to `main`: `2b12a2fa99d49ebe4d748ed851c194825129d38f`.

Canonical gate evidence:

- complete repository suite: **444 PASS / 0 FAIL**;
- TypeScript/check/docs/third-party gates: PASS;
- portable production build and validators: PASS;
- exact build identity: PASS;
- source clean through the gate: PASS;
- runtime equivalence to owner-tested `c9b5990b...`: PASS;
- production dependency audit (`npm audit --omit=dev`): **0 vulnerabilities**.

The full npm audit reported one `nanoid` development/build-tooling advisory while the lockfile entry is dev-only. This did not justify changing the validated lockfile before promotion. Treat it as maintenance evidence, not a production-runtime vulnerability claim.

## 5. Protected product boundaries

Preserve unless a later evidence-backed task explicitly changes them:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 / Chrome / render-1x performance foundation for the tested scan case;
- Camera Manual Rig V1;
- Fullscreen V1;
- fixed-step/timestamped input architecture;
- independent throttle/brake multitouch ownership;
- D/R state and permissive D<->R-under-throttle behavior;
- fail-closed pointer capture/lifecycle release;
- generation-safe UI presentation / <=1 RAF coalescing;
- current X-only steering `POSITION` behavior as working reference;
- temporary steering/drive bridge as product intermediate only.

Do not reopen solved P1 CSS/release-overlay problems without new evidence.

## 6. JURE coordination snapshot

This section is a coordination snapshot only. JURE is a separate authority; resolve its refs/PRs live before acting.

At the 2026-08-16 grounding review:

```text
JURE repo:
  Jozzpoly/Jozz-Universal-Rig-Editor

accepted JURE baseline:
  main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425

clean foundation candidate / draft PR #3:
  promotion/foundation-ready-squash-2026-08-16
  @4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

active JURE product work / draft PR #4:
  work/real-jv-rig-elements
  @7b385e8e591d13c3ccab06647390d9d28e06a1d4
```

Current cross-project evidence from PR #4 is important:

- JURE has a complete small lower-hinge authoring/Test path and a relation-scoped mechanical fragment direction;
- a private JV consumer falsifier rejected implicit identity placement;
- explicit rigid placement was validated only as an abstraction;
- current procedural M6 wishbone geometry and exact/JURE wishbone geometry were proven **not rigid-congruent**;
- therefore replacing one JURE hardpoint/relation while leaving an incompatible procedural wishbone is invalid;
- no M6 runtime hardpoint substitution is accepted yet;
- JURE has moved toward a coherent double-wishbone neutral shape: upper arm, lower arm, chassis reference, carrier reference, two inboard revolutes and two outboard spherical relations;
- JURE should finish Owner-operability and freeze a multi-relation consumer fragment before JV-Web freezes a concrete import schema.

JV-Web should help by preserving a clean consumer boundary, not by pre-implementing a guessed adapter. See `docs/contracts/JURE_CONSUMER_BOUNDARY.md`.

## 7. JURE -> JV-Web first integration rule

When JURE has an explicit frozen consumer fragment:

1. resolve exact JURE source/checkpoint live;
2. create one isolated JV-Web branch named `jure/<specific-purpose>`;
3. pin the exact fragment/fixture identity;
4. independently strict-parse and validate version/units/basis/provenance/placement;
5. prove neutral geometry coherence without runtime substitution;
6. reject implicit identity or agent-guessed transforms;
7. only then experiment with replacing the coherent procedural runtime unit;
8. keep consumer dynamics/Box3D identities in JV-Web;
9. do not change public Friends in the first consumer slice.

No partial hybrid of JURE-authored neutral geometry and incompatible procedural M6 geometry.

## 8. Product roadmap after handoff

Do not begin this roadmap during grounding/handoff preparation. It is the next product direction once a fresh agent has taken over and the Owner chooses the lane.

Mobile polish direction:

1. P1.2 coordinated mobile HUD zones;
2. P1.3 action/navigation policy;
3. P1.4 driving-zone sizing/spacing;
4. P1.5 portrait sanity;
5. P2 absolute-position pedals using frozen geometry and immediate pointer-down demand;
6. P3 mechanical pedal depression rather than progress-meter authority;
7. P4 steering visual cleanup;
8. P5 isolated rotational-steering A/B experiment against the working X-only reference;
9. P6 joint wheel/pedal industrial design and feel;
10. P7 intentional portrait composition.

JURE consumer work is a separate lane and starts only when JURE has frozen the needed consumer fragment.

## 9. Grounding / handoff boundary

Feature implementation is frozen until the handoff is complete.

A fresh JV-Web agent should:

1. resolve live private `main` and public `release/friends-r1`;
2. read `AGENTS.md`;
3. read this file;
4. read `docs/HANDOFF.md`;
5. inspect `docs/ARCHITECTURE.md` only for the subsystem being touched;
6. resolve JURE live only if the next task actually involves the JURE boundary;
7. create a work branch only when implementation genuinely begins.

Do **not** restart source recovery, branch archaeology, camera reconstruction, old V1/V2 mobile controls, performance micro-optimization of the accepted A53 case, or pre-P1 release repair.

## 10. Exact next action

Finish the docs-only grounding/handoff commit, remove the three accidentally restored historical branch refs if they still exist, independently re-resolve `main`/public/JURE refs, and hand the project to a fresh conversation.

Do not resume product development in this conversation after that boundary.
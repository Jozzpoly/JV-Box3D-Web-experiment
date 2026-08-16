# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MAIN ACCEPTED / ISOLATED JURE PREPARATION ACTIVE / OWNER-VISIBLE PRODUCT RUNTIME FROZEN`

## 1. Current authority

Private source/product authority remains the live `main` of:

`Jozzpoly/JV-Box3D-Web-experiment`

Resolve live refs before every write. Branch names and copied SHAs are not authority by themselves.

Current accepted boundaries at the start of this JURE-preparation lane:

```text
accepted grounded main:
  18b71bf002401543cdc448f48cc7b68a8c1b5aec

validated promotion/evidence boundary:
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

The promoted candidate is eight commits after the owner-tested `c9b5990b...` product source. Main-promotion preparation proved that those post-owner-test changes did not modify runtime-bearing product source. The later `18b71bf...` grounding commit is documentation-only and does not create a new owner runtime-test claim.

## 2. Repository state and active lane

The broad 2026-08-16 cleanup is complete. Before this isolated lane was created, the private repository branch namespace contained only `main`; obsolete branch tips remain recoverable through archive/rollback tags rather than ordinary branches.

The one active isolated lane is:

```text
branch:
  jure/neutral-geometry-receipt

base:
  main@18b71bf002401543cdc448f48cc7b68a8c1b5aec

purpose:
  expose the current legacy front-left M6 double-wishbone neutral geometry as
  a small deterministic engine-neutral projection/receipt so JURE can compare
  authored truth with current JV consumer truth without reverse-engineering
  Box3D runtime construction.
```

This branch does **not** grant authored-rig authority to JV-Web. JURE remains the authority for authored neutral rig truth.

Owner-visible product work remains frozen in this lane:

- no Box3D runtime substitution;
- no steering/handling changes;
- no visual package change;
- no HUD/mobile change;
- no public Friends publication.

Steady-state branch policy remains `main` plus at most one concrete temporary lane. JURE cross-project work uses `jure/<specific-purpose>`.

## 3. Accepted P1 product foundation

The accepted current product foundation is real public/browser/device evidence, not a source-only candidate.

Implemented and owner-tested from exact runtime source `c9b5990b...`:

- deterministic CSS entry authority;
- superseded V2 mobile presentation stylesheet removed from the active cascade;
- current mobile CSS owns component presentation;
- short mobile viewport can shrink below the historical desktop `420px` floor;
- moving Friends root no longer carries the old executable `jv-live-performance.js` overlay;
- current X-only analog steering `POSITION` behavior works as the reference;
- analog pedals work as the current functional foundation;
- Camera Manual Rig V1 and Fullscreen V1 remain accepted foundations;
- Plac E2R, Offroad, owner vehicle and approved JSPREV2 remain available.

Owner explicitly did not accept as final:

- pedal mapping/mechanics/visual design;
- coordinated HUD composition;
- steering visual language;
- rotational steering;
- authored suspension/steering rig geometry;
- Ackermann/tie-rod authority;
- final vehicle handling.

## 4. Validation truth

### P1 focused source/build gate

Exact product source `c9b5990b226685abe35851fc5e9496323096ecf7` on canonical Windows Node `24.16.0` / npm `11.17.0`:

- focused P1/input/lifecycle suite: **48/48 PASS**;
- TypeScript: PASS;
- normal Vite production bundle: PASS;
- clean-tree checks: PASS;
- all emitted CSS entry-linked: PASS;
- late JS-owned CSS: NONE;
- base -> current mobile cascade: PASS;
- mobile scene historical `420px` floor removed from the active short-viewport path: PASS.

### Friends release + Owner-device gate

Exact public Friends `release/friends-r1@a325c279...`:

- approved JSPREV2 carried byte-exact from Git object evidence;
- public candidate validation: PASS;
- ordinary non-force publication;
- historical public executable runtime overlay absent;
- Owner directly tested desktop and Samsung Galaxy A53 / Chrome in portrait, landscape, browser-chrome and fullscreen states;
- steering and pedals accepted as working foundations;
- worst previous clipping/overlay failures resolved sufficiently to close P1 foundation.

### Final Main Promotion Gate

Exact promoted candidate `2b12a2fa99d49ebe4d748ed851c194825129d38f`:

- complete repository suite: **444 PASS / 0 FAIL**;
- TypeScript/check/docs/third-party gates: PASS;
- portable production build and validators: PASS;
- exact build identity: PASS;
- source clean through the gate: PASS;
- runtime equivalence to owner-tested `c9b5990b...`: PASS;
- production dependency audit (`npm audit --omit=dev`): **0 vulnerabilities**.

The full npm audit reported one `nanoid` development/build-tooling advisory in a dev-only lockfile entry. It did not justify mutating the validated dependency graph before promotion.

### Current JURE-preparation lane

**NOT YET CANONICALLY VALIDATED.**

Do not convert source presence, planned tests or a branch commit into a PASS claim. This lane must independently prove its focused geometry/equivalence contract and repository compatibility before promotion or handoff claims are upgraded.

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

JURE is a separate repository and authority. Resolve it live before using this snapshot.

At the start of the current lane:

```text
repo:
  Jozzpoly/Jozz-Universal-Rig-Editor

accepted baseline:
  main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425

clean foundation candidate / draft PR #3:
  promotion/foundation-ready-squash-2026-08-16
  @4db04eee4da0216f6bd3df6b6b0c82aa20afab5a

active product work / draft PR #4:
  work/real-jv-rig-elements
  @7b385e8e591d13c3ccab06647390d9d28e06a1d4

latest coherent neutral-shape checkpoint observed:
  checkpoint/real-jv-double-wishbone-neutral-2026-08-16
  @7b385e8e591d13c3ccab06647390d9d28e06a1d4
```

Current cross-project evidence:

- JURE has a complete lower-hinge authored/TEST/Save/Open loop;
- implicit identity placement was rejected by the first private consumer falsifier;
- explicit rigid placement is valid only when proven from exact evidence;
- current procedural M6 wishbone and exact/JURE-authored wishbone are **not rigid-congruent**;
- no M6 runtime hardpoint substitution is accepted;
- JURE has validated the coherent neutral shape needed for the next step: upper arm, lower arm, chassis reference, carrier reference, two inboard revolutes and two outboard spherical relations;
- JURE still needs Owner-operability and a frozen multi-relation consumer fragment before JV-Web freezes a concrete JURE import schema.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md`.

## 7. Current JURE-preparation architecture

The current lane deliberately does **not** create a second generic authored rig schema.

Target flow:

```text
current legacy M6 config
        |
        v
pure legacy neutral projector
        |
        v
JvNeutralMechanism (small consumer-side lowering representation)
        |
        +--> deterministic neutral-geometry receipt for JURE comparison

future frozen JURE fragment
        |
        v
strict JURE adapter + JV binding
        |
        v
same JvNeutralMechanism seam
        |
        + JV-owned dynamics/runtime policy
        v
Box3D/native runtime assembly
```

The first projection is read-only and scoped only to the current front-left coherent double-wishbone. It must not feed runtime yet.

Canonical JV neutral rig-space target for this receipt:

```text
id: jv-rig-space/v1
units: metres
handedness: right
+X: forward
+Y: up
+Z: right
root: neutral chassis body origin before world spawn
```

Future authored-fragment placement into JV rig space and normal vehicle world spawn are separate transforms. Historical source-specific values such as Blockbench scale/yaw must not become hidden consumer requirements.

The neutral receipt must exclude consumer dynamics and engine identity: no Box3D handles, mass/inertia policy, tires/friction, springs/damping, motors, solver or full simulation trace.

## 8. Validation boundary for this lane

Before this slice can be called ready for JURE use, prove at minimum:

1. the projected FL carrier/upper/lower neutral origins are identical to the current legacy geometry path;
2. both inboard revolute anchors and both outboard spherical anchors reconstruct the same neutral points used by current runtime construction;
3. revolute primary axis convention is explicit;
4. coordinate-space metadata is exact and versioned;
5. serialized receipt is deterministic and round-trips;
6. receipt contains no Box3D identity or vehicle dynamics policy;
7. focused current S2/front-corner behavior remains green;
8. TypeScript and the complete repository check remain green on the canonical toolchain;
9. owner-visible runtime/public Friends are untouched.

A browser/device gate is not required for a source/tool-only projection that is not imported by the product runtime. If the implementation crosses that boundary, stop and reclassify the validation scope.

## 9. Product roadmap after handoff

This lane is preparation for the upcoming rigging/physics-authoring phase, not a replacement for normal product work.

Once a fresh conversation takes over and the Owner selects the next lane, current product directions include mobile HUD/pedal/steering polish and the forthcoming JURE-driven rig repair. Do not mix those campaigns into this neutral-receipt slice.

The first actual JURE -> JV-Web runtime experiment starts only after JURE freezes the multi-relation consumer fragment and JV-Web can strict-parse, place and compare it as one coherent mechanical unit.

## 10. Exact next action

On `jure/neutral-geometry-receipt`:

1. implement the smallest pure FL double-wishbone neutral projection and deterministic receipt exporter;
2. add focused legacy-equivalence/separation tests;
3. validate the exact branch on canonical tooling;
4. if green, record only proven evidence in current docs;
5. provide JURE with the exact receipt/contract state and preparation guidance;
6. return JV-Web to final handoff/takeover preparation without beginning runtime rig substitution in this conversation.

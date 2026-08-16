# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MAIN ACCEPTED / JURE NEUTRAL-RECEIPT HARDENING ACTIVE / OWNER-VISIBLE RUNTIME FROZEN`

## 1. Authority

Private source/product authority remains live `main` of `Jozzpoly/JV-Box3D-Web-experiment`. Resolve moving refs live before every write.

Accepted boundaries at the start of the current JURE lane:

```text
accepted grounded main:
  18b71bf002401543cdc448f48cc7b68a8c1b5aec

validated promotion/evidence boundary:
  2b12a2fa99d49ebe4d748ed851c194825129d38f

owner-tested P1 runtime source:
  c9b5990b226685abe35851fc5e9496323096ecf7

current public Friends artifact:
  Jozzpoly/JV-Box3D-Web-Public
  release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f

private rollback:
  rollback/main-before-p1-foundation-2026-08-16
  -> f8eb0908f5934aed2d504f34ce483a02754039ec

immutable public fallback:
  release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

The current isolated lane is `jure/neutral-geometry-receipt`, based on grounded `main@18b71bf...`. It does not grant authored authority to JV-Web; JURE remains authority for authored neutral rig truth.

Owner-visible product runtime is frozen in this lane: no Box3D substitution, steering/handling change, visual package change, HUD/mobile change or Friends/Public publication.

## 2. Accepted P1 product foundation

The current product foundation is backed by real public/browser/device evidence.

Owner-tested from exact runtime source `c9b5990b...`:

- current X-only analog steering `POSITION` works as the reference;
- analog pedals work as the functional foundation;
- Camera Manual Rig V1 and Fullscreen V1 remain accepted;
- Plac E2R, Offroad, owner vehicle and approved JSPREV2 remain available;
- worst previous mobile clipping/overlay failures were resolved sufficiently to close P1 foundation.

Still explicitly open: pedal mapping/mechanics/visual design, coordinated HUD composition, steering visual language/rotational steering, authored suspension/steering geometry, Ackermann/tie-rod authority and final handling.

Final promotion candidate `2b12a2fa...` passed the complete repository suite **444 PASS / 0 FAIL**, TypeScript/docs/third-party/portable/build identity gates, runtime equivalence to `c9b5990b...`, clean source and production audit with 0 vulnerabilities. The known full-audit `nanoid` finding was dev/build-tooling-only and did not justify mutating the validated dependency graph.

## 3. JURE shared direction

JURE and JV are complementary parts of the same vehicle/mechanism R&D direction.

JURE's primary near-term role is to become the Owner's practical authoring workbench for the mechanical and representation truth that JV needs: exact part placement, interface frames, relations, suspension/steering geometry, coherent replacement mechanisms and representation mappings. The current M6 is the first demanding target; later targets include new vehicle rigs and, when real use requires it, other mechanisms.

**Owner-authoring invariant:** JURE is not an agent-operated preprocessing step. For mechanisms that JURE claims to support, the Owner should be able to perform the complete authoring loop personally:

`load/inspect exact SOURCE -> create/select authored parts -> author/adjust frames and relations -> fit mechanics and representation -> inspect diagnostics -> kinematically test/reset -> correct -> save/reopen -> export deterministic authored result`

The agent may implement tooling, difficult math, automation and diagnostics and help investigate failures. It must not remain a mandatory operator that manually rebuilds coordinates or consumer code whenever the Owner wants to author or correct a rig.

For a damper/spring assembly, JURE should let the Owner directly fit attachment frames, axis/travel geometry and visual representation until the real parts move correctly. JV owns force laws, spring/damping parameters, solver/runtime state and actual current compression/extension; the visual layer animates the JURE-authored representation from that runtime state.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md` for the authority split and fail-closed integration rules.

## 4. Current JURE coordination snapshot

Resolve JURE live before use. Snapshot observed during this lane:

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
```

Cross-project evidence already established:

- implicit identity placement was rejected;
- explicit rigid placement is valid only when proven from exact evidence;
- current procedural M6 wishbone and exact/JURE-authored wishbone are **not rigid-congruent**;
- therefore no single JURE hardpoint/relation may be inserted into the incompatible procedural shape;
- the coherent target shape is upper arm + lower arm + chassis reference + carrier reference + 2 inboard revolutes + 2 outboard spherical relations;
- JURE domain/exact-source code has demonstrated the lower-hinge authored relation/evaluator semantics, but the Owner-facing relation creation and TEST control are still product gaps;
- JURE must finish Owner-operability of the coherent mechanism and freeze a multi-relation consumer fragment before JV-Web freezes a concrete JURE import schema.

## 5. Current neutral-receipt lane

The lane exposes current legacy front-left M6 double-wishbone geometry as a deliberately small engine-neutral consumer projection:

```text
legacy M6 config
      -> pure neutral projector
      -> JvNeutralMechanismV1
      -> deterministic JV diagnostic receipt

future frozen JURE fragment
      -> strict JURE parser/binding
      -> same JvNeutralMechanism seam
      -> JV-owned runtime/dynamics
      -> Box3D/native assembly
```

`JvNeutralMechanismV1` is a consumer-side lowering representation, **not** a second authored JURE schema and not yet a runtime input.

Canonical JV neutral rig space:

```text
jv-rig-space/v1
metres · right-handed
+X forward · +Y up · +Z right
root = neutral chassis body origin before world spawn
```

The receipt excludes Box3D identity and vehicle dynamics. For stand-alone cross-project use it carries exact JV producer repository+commit plus the pinned factory-receipt path, Git blob identity and SHA-256 of canonical Git blob bytes.

The exporter now also fails closed when tracked source differs from `HEAD` before producer identity is read. This prevents a dirty checkout from emitting a receipt that falsely claims clean commit provenance.

Latest code-bearing hardening boundary before the final gate:

```text
faea0c1e2739b909811c0cb36ef6c4f6d88250c6
```

Later descendants in this lane may be documentation-only; resolve the live branch head before validation.

## 6. Validation truth

An Owner-run canonical Windows gate for exact `fd84fcf4bd593ec6903c18ee6121114d09fc15d8` proved:

- focused JURE/S2 checks PASS;
- TypeScript PASS;
- deterministic receipt PASS;
- complete repository **448 PASS / 0 FAIL**;
- normal Vite production bundle PASS;
- product-bundle neutral marker scan PASS;
- clean source PASS.

That evidence is valid for **`fd84fcf4...` only**. It does not validate the later provenance hardening, Box3D-type decoupling or tracked-dirty fail-closed guard.

Therefore the current lane remains **NOT YET CANONICALLY VALIDATED AT ITS CURRENT HEAD**.

The final gate must prove at minimum:

1. current FL neutral geometry remains equivalent to the existing suspension input;
2. engine-neutral projection contains no Box3D source dependency/identity;
3. coordinate-space metadata and relation axis conventions remain exact;
4. receipt provenance identifies the exact producer commit and exact factory-receipt Git blob bytes;
5. exporter rejects tracked source drift from `HEAD`;
6. receipt bytes are deterministic and round-trip;
7. focused S2/front-corner behavior remains green;
8. TypeScript and complete repository check remain green on canonical tooling;
9. normal production bundle remains green;
10. owner-visible runtime and Friends remain untouched.

A browser/device gate is not required for this source/tool/docs-only projection. If product runtime or visible UI becomes involved, stop and reclassify the validation scope.

## 7. Exact next boundary

On the live `jure/neutral-geometry-receipt` head:

1. run one final canonical Windows gate including an explicit dirty-tracked-source exporter falsifier;
2. inspect the generated receipt itself and verify exact producer/config provenance;
3. if green, promote only this proven neutral-projection/tool/docs slice to `main`;
4. ground compact handoff state and retire the temporary JV branch once safely ancestral to `main`;
5. hand JURE the exact current receipt/contract as comparison evidence;
6. continue JURE product work with Owner-facing relation authoring and TEST controls, then the coherent four-relation wishbone and its frozen consumer fragment;
7. only after that begin the first private JURE -> JV runtime substitution experiment.

Mobile control/HUD polish remains a separate future lane. Do not combine it with this integration boundary.

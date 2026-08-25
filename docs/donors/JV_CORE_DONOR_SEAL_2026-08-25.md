# JV_CORE / Native — donor seal receipt

Updated: 2026-08-25
Owner: Jozz
Status: `SEALED DONOR / RESEARCH RECORD / ACTIVE NATIVE DEVELOPMENT STOPPED / WEB INTAKE AUTHORIZED / RUNTIME PORT NOT AUTHORIZED`

This receipt closes JV_CORE / Native as an active product-development line for the current program transition. It does **not** claim that Native is a perfect or final vehicle, and it does not authorize a 1:1 port into JV-Web.

Truth order for this intake:

`Owner product/feel truth -> portable mechanical/semantic truth -> experimentally supported candidate implementation -> legacy code/defaults/docs`

## 1. Exact donor authority

Live authority independently resolved before accepting the handoff:

```text
repository: Jozzpoly/Box3d_FunProject
branch:     recovery/jv-reconstruction
commit:     b0a0082252cb1f3c964f804162233bc82254bc4b
tree:       7bbc805968df6ef416334193bc30eb7a5902eb7e
```

Historical Owner-feel source tag independently resolves to:

```text
refs/tags/checkpoint/owner-feel-source-5b92e9c
-> 5b92e9c349ff2106d154c4b29dcc7a1428f5ae6a
```

Takeover evidence bundle supplied by Owner:

```text
JV_GRIG_N2B_EVIDENCE_b0a008_20260825-192950-4220-762ed28a.zip
SHA-256 a448aa6abadb83f0f2f04d2eda98bef06f3741be39ae7078c2b2b92416c8e0af
```

Its nested manifest was independently rehashed during closure: **25/25 listed files matched, 0 missing, 0 mismatched**. The package itself correctly limits its claim: it validates source/package/build/execution/schema/coverage and does not by itself choose a carrier, relation-local binding, repair or G-RIG seal.

Separately referenced Owner artifacts were not bundled/replayed in this takeover and remain hash-addressed evidence:

```text
JV_CORE_GRIG_SEAL_CANDIDATE_b0a008_READY_v1.zip
SHA-256 8dc431524ad9a305b809d32d4ef0a65e22795c35a77df6406eb3701b27751572

9a9e60aa-1495-4b12-a25d-3353c9dbe2a9.mp4
SHA-256 14600552f5a09483bf9eb772571b27c93b51f68cb4c312d2071afb68216a53e7
```

## 2. G-RIG — sealed donor truth

Classification: `OWNER-SEALED DONOR CANDIDATE / KNOWN REPRESENTATION DEBT`.

Portable truth:

- real M6 wishbone topology has distinct chassis, upper arm, lower arm, knuckle and wheel roles;
- the physical relation graph includes `chassis <-> upperArm <-> knuckle`, `chassis <-> lowerArm <-> knuckle`, `knuckle <-> wheel` and the rack/knuckle steering relation;
- M6 has no additional physical carrier body; convenience `carrier` naming in runtime resolves to an existing knuckle or trailing-arm body;
- spherical relation endpoints have independent owner-local frames; runtime closure is state-dependent and must not be collapsed into one exact shared world hardpoint;
- N2-B rejects the old common lower-arm surrogate as canonical ownership for **both** wishbone visual outboard endpoints;
- upper wishbone outboard ownership follows the upper-arm relation/local frame; lower wishbone outboard ownership follows the lower-arm relation/local frame.

Do **not** inherit as physical authority:

- an invented extra carrier body/frame;
- stale `ridesBody` metadata;
- `ChassisMount_b` lower-arm following as anything more than a Native visual representation choice;
- the claim that every final physical mating coordinate is already solved.

Known debt is intentionally preserved: the legacy visual representation can lose exact mechanical mating under manual/extreme articulation. This is negative evidence for the next architecture, not a reason to restart Native G-RIG research.

## 3. G-FEEL — forensic closure

Classification: `DONOR RECEIPT CLOSED / KNOWN DEFECT PRESERVED / NO TUNING MARATHON`.

Historical best reference is the Owner-feel tag at `5b92e9c...`. Exact session/runtime state is recoverable only as far as evidence permits; incomplete serialization remains **UNKNOWN** rather than being turned into a fabricated Golden Preset.

Portable mechanisms / source-backed direction include:

- double-wishbone M6 geometry with physical caster/KPI behavior;
- torque-based drive rather than a direct speed-servo feel model;
- load-dependent rack friction;
- anti-roll/geometry carrying the vehicle with world-upright assist off by default;
- `rackCenteringHertz = 0` by default: artificial centering is Owner opt-in only, not product truth.

Key historical defaults such as caster `5 deg`, KPI `7 deg`, torque drive `320 N*m`, rack friction `40 + 0.10*load` and artificial centering off remain present at `b0a008`; later forensic work did not silently replace the Owner-feel source with an arcade centering fix.

Known steering/contact defect is now sufficiently closed for donor use:

- full headless M6 reproduces large-angle anti-centering/hold after simultaneous throttle + steering release;
- initial lock: `+/-0.40` returns, `+/-0.50` does not;
- dense source-localization sweep: `+0.44` returns / `+0.45` fails; `-0.41` returns / `-0.42` fails;
- ball-joint twist limit engages after the sustained transition, so it may later hold full lock but does not initiate the boundary instability;
- strongest measured signature runs through `contact -> wheel -> spin-joint -> knuckle`; rack motor and dominant tie rod oppose further steer at the transition;
- the exact causal model remains unresolved: contact geometry/normal, rigid Coulomb behavior, missing lateral compliance or relaxation, asymmetry/solver interaction, or a combination remain candidates.

This is a falsifier/known-debt receipt, **not** a shipping fix. Further Native causal intervention is not decision-critical for the first Web rig-intake stage.

## 4. Wheel/contact — Owner correction over stale default

Owner-selected current best/default donor-product direction:

**mode5 / `JOZZ_M6_ENVELOPE_WHEEL` / analytic real-width `b3Wheel`.**

Live `b0a008` factory config still selects `JOZZ_M6_ENVELOPE_SPLIT_SPHERE_SIDEWALL`. That is now classified as **stale implementation truth / quarantined default**, not product authority.

Sphere, cylinder, phased union, split sphere+sidewall and torus remain historical/diagnostic controls. Torus returning better in one steering-release diagnostic does not make it shipping truth.

Mode5 is also **not final architecture**. Current source explicitly acknowledges that a rigid wheel shape cannot make its contact footprint grow with load; later widening/compliance must be represented explicitly rather than faked by manifold sampling. Steering/contact coupling is a known debt to challenge in Web.

Therefore JV-Web should start future wheel/contact reasoning from mode5 as the current Owner-selected direction while actively trying to exceed or replace its implementation when evidence warrants.

## 5. Cross-project portability decisions

| JV_CORE claim | JV-Web classification |
| --- | --- |
| Real M6 role topology and relation graph | **INHERIT SEMANTIC** |
| Independent relation-local frame ownership | **INHERIT REQUIREMENT** |
| Invented common physical carrier | **REJECT** |
| Exact final outboard mating coordinates | **BLOCKED / OWNER JUDGEMENT REQUIRED** |
| Native visual-parent/ridesBody shortcuts | **REJECT AS AUTHORITY** |
| Physical caster/KPI/back-drivable steering intent, torque drive, ARB, centering-off policy | **INHERIT SEMANTIC / REFERENCE** |
| Historical `5b92e9c` constants/preset state | **REFERENCE**, not immutable target |
| Artificial rack centering as default | **REJECT** |
| mode5 real-width analytic wheel direction | **INHERIT PRODUCT DIRECTION / REFERENCE IMPLEMENTATION** |
| split sphere+sidewall as preferred default | **REJECT** |
| sphere/cylinder/torus alternatives | **REFERENCE / CONTROL** |
| B3WHEEL anti-centering evidence | **INHERIT KNOWN DEBT / FALSIFIER** |
| Full Native implementation/code architecture | **DO NOT PORT 1:1** |

## 6. Takeoff decision

The remaining unresolved Native questions do not block the next JV-Web stage. They are either explicitly preserved uncertainty or belong to later Web wheel/contact/handling work where the architecture is allowed to improve beyond Native.

Program state from this receipt onward:

```text
JV_CORE ACTIVE DEVELOPMENT = STOPPED
JV_CORE ROLE = SEALED DONOR / RESEARCH RECORD
JV_WEB ROLE = HEIR / PRODUCT
```

First fundamental Web stage remains **Rig Truth Intake & Mechanical Foundation** for one coherent front mechanical unit. Accepted controls, UI, Preview/release behavior and unrelated product foundations remain outside its blast radius.

No recovery->main merge, Native cleanup, another G-RIG loop, Golden Preset tuning campaign or fundamental Native tire R&D is required for this seal.

# JV Web — owner checkpoints

Updated: 2026-08-22

Compact ledger of durable Owner-visible acceptance. Git history preserves detailed campaign/test evidence. A passing test is not Owner acceptance; each entry below is limited to what Jozz actually observed or explicitly accepted.

## P0 — browser vehicle foundation

Classification: `OWNER ACCEPTED`

The browser product can load the owner vehicle, drive/steer/brake/reset, use Map/Offroad and use chase/orbit camera/debug controls. Later checkpoints refine this foundation rather than erase it.

## S1 / S2 — focused front suspension semantics

Classification: `OWNER ACCEPTED — NARROW`

Preserve:

- accepted front-left upper placement/articulation within the tested precision/range;
- `Socket_ChassisMount_b` / #6 is suspension-side and must not inherit steering rotation;
- `Socket_WheelCenter` / #8 is a distinct steerable member relative to #6;
- steering occurs around the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin remain distinct DOFs.

Still not accepted as final truth: lower placement, carrier topology, rack/tie-rod law, caster/KPI/trail, final rig or handling.

## R1-DRIVE-BRIDGE-01 — temporary coherent driving baseline

Date: 2026-08-13
Classification: `OWNER ACCEPTED — TEMPORARY PRODUCT INTERMEDIATE`

The temporary symmetric front removed the dominant left/right defect well enough to continue. Owner observed straight driving and materially more coherent steering. Residual asymmetry and final steering/rig/handling remained open.

## FRIENDS-R1-LIVE — public browser foundation

Date: 2026-08-14
Classification: `OWNER ACCEPTED — END-TO-END FRIENDS FOUNDATION`

Historical anchors:

```text
public release: 7161215e47f00573b8c1b5c31e5931c89f9d709a
private live-hotfix source: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
scan preview SHA-256: aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146
```

Owner confirmed Plac E2R, Offroad, full JSPREV2 and the current vehicle on desktop and phone. Phone scan was heavy but usable. Portrait and landscape rendered. This accepted the public browser product foundation, not final mobile UX/performance, rig or handling.

## PERF-FND-A53-01 — mobile performance foundation v1

Date: 2026-08-15
Classification: `OWNER ACCEPTED — PERFORMANCE SCOPE`

Historical anchors:

```text
private checkpoint: f42e16321d9edb26e10f44ab7c9eeda3c646291c
public device proof: a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
Samsung Galaxy A53 / Chrome / render scale 1x / scan culling ON
```

Owner observed the current Offroad and complete textured JSPREV2 stress cases reaching stable ~60 present/s after removal of expensive mobile backdrop effects. This protects the present A53 1x performance foundation from speculative re-optimization without new evidence. It does not establish universal startup time, scale 2x, other devices or larger scans.

## CAMERA-MANUAL-RIG-V1 — manual inspection/navigation foundation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MANUAL CAMERA FOUNDATION`

Historical owner-device proof: `4768abedaa67b7505ca963a0836879e42590b67d`.

Owner accepted orbit/pan/zoom and broad close/far/aerial inspection on desktop and phone as a usable manual-camera foundation. Future automatic assists must remain additive and must not silently overwrite manual user calibration.

## FULLSCREEN-V1 — immersive browser presentation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MOBILE + DESKTOP FULLSCREEN`

Historical owner-device proof: `8fe52a73554273fa710d2be2fdaf3a144d9056ba`.

Owner confirmed fullscreen entry/exit on mobile and desktop, portrait/landscape rendering and continued driving after transitions. This protects fullscreen capability, not universal every-browser behavior or final mobile layout.

## STEERING-CONTROL-V2 — mobile steering foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — MOBILE CONTROL FOUNDATION, DESIGN OPEN`

Historical owner-device proof: `2acd652f68d57497c8ce8886b2875789a70f4be3`.

Owner accepted X-only analog `POSITION` touch steering as materially better than V1 and good enough to continue. Mobile Debug open/close was also accepted. Visual language, rotational steering, final sensitivity/haptics/self-centering and vehicle steering geometry remained open.

## P1-FOUNDATION-01 — mobile driving presentation foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — PRODUCT/PRESENTATION FOUNDATION, DESIGN OPEN`

Historical anchors:

```text
owner-tested private source: c9b5990b226685abe35851fc5e9496323096ecf7
accepted Friends artifact: a325c279cfe63a0607dba33c3c635a1716e09f8f
```

Owner accepted the working steering and analog pedals, recovery from the worst mobile UI/presentation failures, and the short-viewport foundation. This did not accept final coordinated HUD, pedal mapping/mechanics/design, steering visual/gesture, portrait composition, rig or handling.

## P1.2 / P1.3 / P1.3.1 — coordinated mobile surface and clean steady-state

Date: 2026-08-18
Classification: `OWNER ACCEPTED — MOBILE COMPOSITION + UTILITY DRAWER + STEERING SURFACE / PUBLIC STEADY-STATE`

Exact anchors:

```text
owner-approved product source before test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

canonical executable source at product close:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

canonical source tree:
  cc2afeb7902f05d12edd98961b2a43f0706603c8

clean canonical preview artifact:
  fe5ba2c772dbb530848df5bcd55163171b5847bc

accepted public executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

device/browser:
  Samsung Galaxy A53 / Chrome
```

Canonical Windows close ran with Node 24.16.0 / npm 11.17.0, `npm ci`, normal repo `npm run build` and full repository tests **462/462 PASS**. The final test-only commit `cd7f5f89...` added coverage for the already-existing steering-plate setting; product source bytes accepted by Owner remained those from `23fe49c...`.

Owner directly confirmed on the final public surface:

- world and vehicle start correctly;
- steering works;
- throttle and brake work;
- utility drawer opens/closes;
- steering plate defaults OFF and OFF -> ON -> OFF works;
- landscape/browser and fullscreen show no obvious regression;
- JSPREV2 still loads.

Protected meaning:

- P1.2 short-landscape/lower-driving composition is a working baseline;
- P1.3 minimal persistent driving HUD + transient utility drawer is the current chrome model;
- P1.3.1 compact top actions, larger physical-wheel presentation and opt-in steering plate are the present surface foundation;
- X-only `POSITION` remains the accepted historical/reference steering path;
- analog pedals, independent multitouch ownership, fail-closed lifecycle, D/R command semantics, Camera Manual Rig V1, Fullscreen V1, Plac E2R, Offroad, JSPREV2 and owner vehicle remain protected unless a later focused slice explicitly changes them.

Still open at this checkpoint: final pedal mapping/mechanics/industrial design, final steering gesture/industrial design, final portrait-specific composition, final rig geometry and handling.

## STEERING-DUAL-MODE-DIRECTION-01 — retain both Owner-facing steering modes

Date: 2026-08-20
Classification: `OWNER ACCEPTED — EXPERIMENTAL PRODUCT DIRECTION / FINAL STEERING OPEN`

Exact evidence boundary:

```text
owner-tested steering source:
  1b25cf242a007b84f236155e6067539c825876ec

owner-tested steering tree:
  20bf084af97fe0c3b780e621467c53362b779303

Owner Preview control implementation:
  5a57c316a297763c7b6310712b5fd0a9469dcf96

Owner Preview JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

device/browser:
  Samsung Galaxy A53 / Chrome
```

Owner drove `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X` and explicitly judged **both modes currently worth retaining and developing gradually**.

Durable meaning:

- Relative-X passed the first product-value falsifier and is not a disposable comparison mode;
- Direct Rotation remains a retained product direction;
- there is no requirement to force one winner or remove either mode;
- `X_POSITION` remains internal regression/reference, not a third Owner-facing product choice.

Not accepted by this historical checkpoint: final tuning, integration into accepted `main`, steering physics or vehicle handling changes.

## STEERING-DUAL-MODE-FOUNDATION-02 — integrated source foundation

Date: 2026-08-22
Classification: `OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`

Exact integration executable:

```text
4961cee419a88dc54a5f0ee743cc1ee65886a734
```

Evidence:

- merge commit preserves exact steering/test blobs from `1b25cf242a007b84f236155e6067539c825876ec` and current pre-close `main` documentation through separate parents;
- exact integration candidate passed repository-declared Node/npm on `windows-latest`, `npm ci`, and full `npm run build`; recorded status context: `jv/integration-close-windows = success`;
- Owner regression-tested the exact candidate on Samsung Galaxy A53 / Chrome and explicitly returned PASS for `Obrót`, `Przeciąganie`, steering + pedal multitouch, JSPREV2, fullscreen/basic UI and overall preservation of accepted behavior.

Durable meaning:

- both Owner-facing steering modes are accepted as a source-product foundation in `main`;
- the earlier X-only `POSITION` path remains historical/regression reference;
- future steering work should be small tuning/feel/design slices rather than reopening integration.

Still not accepted/frozen: final Direct tuning, final Relative-X gain curve, final full-lock/reversal/edge behavior, final sensitivity/haptics/self-centering/industrial design, steering physics/handling, or Friends/Public promotion of the dual-mode source foundation.

## PEDAL-ABSOLUTE-DIRECTION-01 — absolute-position pedal semantics

Date: 2026-08-22
Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`

Exact Owner-tested candidate:

```text
e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4
```

Machine evidence:

- repository-declared Node 24.16.0 / npm 11.13.0;
- `npm ci`;
- focused `analog-drive`, analog-host-contract and mobile-integration suites;
- **30/30 PASS**;
- status context `jv/pedal-absolute-causal = success`.

Owner real-device evidence on Samsung Galaxy A53 / Chrome:

- low/mid/high initial touch: PASS;
- small up/down correction: PASS;
- full-range sweep/reversal: PASS;
- throttle + brake multitouch: PASS;
- steering + pedal coexistence: PASS;
- overall comparison to relative-from-touch: **better**.

Durable meaning:

- absolute position inside frozen pedal acquisition geometry is the preferred pedal-input direction;
- immediate pointer-down value is valuable and should be preserved unless later evidence contradicts it;
- final integration into `main` remains a separate structural close;
- final dead-zone/value curve and mechanical presentation remain open.

Owner also identified a future tuning need: likely reserve roughly the lower **5–10%** as a zero/contact buffer so the finger can acquire the pedal at exact zero and then roll smoothly into analog actuation. This percentage is not frozen. Future presentation should make contact/buffer versus actual actuation legible.

During the same device smoke, D/R did **not** switch while throttle remained held. Source evidence shows that D/R acquisition relies on `click` and is unchanged by the pedal mapping candidate, so record this separately as an Owner-observed D/R multitouch acquisition gap, not as rejection of absolute pedal semantics. Accepted-main device reproduction is still open.

Owner also observed that very small brake input can dominate full throttle and reiterated broad low vehicle power. That belongs to a later longitudinal/handling stage, not this pedal-input checkpoint.

## Durable method

For future Owner-visible slices, record only the durable verdict and exact evidence boundary. Do not append runner logs or rebuild project chronology here. Prefer small source change -> causal check -> faithful Owner Preview/device evidence -> Owner judgement.

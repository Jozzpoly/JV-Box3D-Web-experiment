# JV Web — owner checkpoints

Updated: 2026-08-20

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
- analog pedals, independent multitouch ownership, fail-closed lifecycle, D/R semantics, Camera Manual Rig V1, Fullscreen V1, Plac E2R, Offroad, JSPREV2 and owner vehicle remain protected unless a later focused slice explicitly changes them.

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

Owner drove both current Owner-facing interactions:

- `Obrót` / `DIRECT_ROTATION`;
- `Przeciąganie` / `RELATIVE_X`.

Owner explicitly judged **both modes currently worth retaining and developing gradually**.

Durable meaning:

- Relative-X has passed the first product-value falsifier; it is not a disposable comparison mode;
- Direct Rotation also remains a retained product direction;
- there is no current requirement to force one winner or remove either mode;
- `X_POSITION` remains internal regression/reference, not a third Owner-facing product choice.

Not accepted by this checkpoint:

- final Direct tuning;
- final Relative-X gain curve or current `1 -> 4` progression;
- final full-lock/reversal/edge/micro-correction behavior;
- final sensitivity, haptics/self-centering or industrial design;
- integration into accepted `main`;
- steering physics or vehicle handling changes.

This checkpoint accepts the **dual-mode direction**, not final steering completion.

## Durable method

For future Owner-visible slices, record only the durable verdict and exact evidence boundary. Do not append runner logs or rebuild project chronology here. Prefer small source change -> causal check -> faithful Owner Preview/device evidence -> Owner judgement.

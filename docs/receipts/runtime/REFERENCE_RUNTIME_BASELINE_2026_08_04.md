# JV Web reference runtime baseline — 2026-08-04

Status: `LOCAL_GATE_PASS / BROWSER_LIVENESS_PASS / NATIVE_DRIVE_PARITY_FAILS SEMANTIC REVIEW`

## Source identity

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
branch: agent/f5-dynamic-steering-validation
commit: 0d938e402f618ae34e0d959a9862d97c2f88a926
runtime backend classification after audit: legacy_ts_m6
```

## Owner-local environment

```text
OS: Windows
Node: v24.16.0
npm: 11.17.0
```

## Completed local gate

```text
npm ci: PASS
TypeScript: PASS
tests: 75/75 PASS
Vite production build: PASS
browser startup: PASS
physical world generation: PASS
visible WebGL observer: PASS
keyboard steering/drive interaction: PASS
```

No GitHub Actions run produced this receipt.

## Runtime observations

The browser showed:

- the live M6 reference fixture rather than the earlier telemetry-only screen;
- a read-only WebGL observer;
- chassis, four wheels and steering observer geometry;
- W/S forward/reverse;
- A/D RATE steering;
- Space brake;
- live rack, speed, displacement, contacts and fixed-step telemetry;
- generation and lifecycle rebuild controls.

This is a liveness and browser-integration result, not an owner-feel approval of the complete vehicle.

## Dynamic rack-excursion matrix

Measured on real `box3d.js` WASM with four terrain contacts preserved:

```text
stationary held RATE peak excess beyond configured rack travel: 0.000 mm
driving held RATE peak excess:                              <= 0.284 mm
post-RELEASE peak excess:                                    2.541–2.817 mm
minimum terrain contacts:                                    4
```

Interpretation:

```text
commanded RATE clamp: PASS
active held limit behavior: small measured compliance
post-RELEASE transient/residual: measured, mechanism not isolated
force-clamp correction: not justified without native comparison
```

## Semantic audit performed after the green gate

Native JV defines:

```text
maxDriveSpeed = wheel motor rev limit in rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin drives torque taper
```

The validated TypeScript reference backend implements:

```text
maxDriveSpeed interpreted as chassis target in m/s
throttle scales target linear speed
wheel target = target linear speed / radius
chassis speed drives torque taper
```

With the pinned receipt:

```text
maxDriveSpeed = 40
wheelRadius = 0.514062464 m
native full-throttle wheel target ≈ 40 rad/s
legacy TypeScript full-throttle wheel target ≈ 77.8 rad/s
```

Therefore:

```text
drive direction/liveness/determinism: PASS
native drive semantic parity: FAIL / NOT PRODUCT AUTHORITY
```

The green gate remains valid evidence for browser host, input, lifecycle, real-WASM operation and the behavior of the named `legacy_ts_m6` fixture. It must not be cited as complete JV parity.

## Product authority

```text
backend: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

The accepted follow-up is ADR-0003: compile portable native JV Core and Box3D into one WASM module and compare native/WASM scenario traces before backend replacement.
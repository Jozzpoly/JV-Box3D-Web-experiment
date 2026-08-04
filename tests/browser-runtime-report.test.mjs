import test from "node:test";
import assert from "node:assert/strict";
import {
  formatBrowserRuntimeReport,
  inspectBrowserRuntime,
} from "../.test-dist/runtime/browser-runtime-report.js";

function environment(overrides = {}) {
  return {
    protocol: "http:",
    hostname: "192.168.1.142",
    secureContext: false,
    cryptoLike: {},
    pointerEventLike: class PointerEvent {},
    maxTouchPoints: 5,
    coarsePointer: true,
    viewportWidth: 412,
    viewportHeight: 915,
    devicePixelRatio: 2.625,
    createCanvas: () => ({
      getContext: () => ({ renderer: "fixture" }),
    }),
    ...overrides,
  };
}

test("LAN HTTP reports software digest fallback without becoming a runtime fault", () => {
  const report = inspectBrowserRuntime(environment());
  assert.deepEqual(report, {
    transport: "LAN_HTTP",
    secureContext: false,
    webCryptoDigest: false,
    softwareDigestFallback: true,
    webgl: true,
    pointerEvents: true,
    maxTouchPoints: 5,
    coarsePointer: true,
    viewportWidth: 412,
    viewportHeight: 915,
    devicePixelRatio: 2.625,
  });
  assert.match(formatBrowserRuntimeReport(report), /software SHA fallback/);
  assert.match(formatBrowserRuntimeReport(report), /LAN_HTTP/);
});

test("secure contexts report WebCrypto when digest is callable", () => {
  const report = inspectBrowserRuntime(
    environment({
      protocol: "https:",
      hostname: "example.test",
      secureContext: true,
      cryptoLike: {
        subtle: {
          digest() {},
        },
      },
      coarsePointer: false,
      maxTouchPoints: 0,
    }),
  );
  assert.equal(report.transport, "SECURE_CONTEXT");
  assert.equal(report.webCryptoDigest, true);
  assert.match(formatBrowserRuntimeReport(report), /WebCrypto/);
});

test("loopback HTTP is classified separately from LAN HTTP", () => {
  const report = inspectBrowserRuntime(
    environment({ hostname: "localhost" }),
  );
  assert.equal(report.transport, "LOOPBACK_HTTP");
});

test("diagnostic WebGL probing fails closed instead of crashing startup", () => {
  const report = inspectBrowserRuntime(
    environment({
      createCanvas() {
        throw new Error("canvas unavailable");
      },
    }),
  );
  assert.equal(report.webgl, false);
});

test("invalid numeric capability values are normalized for telemetry", () => {
  const report = inspectBrowserRuntime(
    environment({
      maxTouchPoints: Number.NaN,
      viewportWidth: -10,
      viewportHeight: Number.POSITIVE_INFINITY,
      devicePixelRatio: 0,
    }),
  );
  assert.equal(report.maxTouchPoints, 0);
  assert.equal(report.viewportWidth, 0);
  assert.equal(report.viewportHeight, 0);
  assert.equal(report.devicePixelRatio, 1);
});

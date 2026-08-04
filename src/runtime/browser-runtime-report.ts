export type BrowserTransportClass =
  | "SECURE_CONTEXT"
  | "LOOPBACK_HTTP"
  | "LAN_HTTP"
  | "OTHER";

export interface BrowserRuntimeReport {
  readonly transport: BrowserTransportClass;
  readonly secureContext: boolean;
  readonly webCryptoDigest: boolean;
  readonly softwareDigestFallback: true;
  readonly webgl: boolean;
  readonly pointerEvents: boolean;
  readonly maxTouchPoints: number;
  readonly coarsePointer: boolean;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly devicePixelRatio: number;
}

export interface BrowserRuntimeProbeEnvironment {
  readonly protocol: string;
  readonly hostname: string;
  readonly secureContext: boolean;
  readonly cryptoLike: unknown;
  readonly pointerEventLike: unknown;
  readonly maxTouchPoints: number;
  readonly coarsePointer: boolean;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly devicePixelRatio: number;
  readonly createCanvas: () => {
    getContext(kind: "webgl"): unknown;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasWebCryptoDigest(cryptoLike: unknown): boolean {
  if (!isRecord(cryptoLike)) {
    return false;
  }
  const subtle = cryptoLike["subtle"];
  return isRecord(subtle) && typeof subtle["digest"] === "function";
}

function classifyTransport(
  protocol: string,
  hostname: string,
  secureContext: boolean,
): BrowserTransportClass {
  if (secureContext) {
    return "SECURE_CONTEXT";
  }
  if (protocol === "http:") {
    const normalizedHost = hostname.toLowerCase();
    if (
      normalizedHost === "localhost" ||
      normalizedHost === "127.0.0.1" ||
      normalizedHost === "[::1]" ||
      normalizedHost === "::1"
    ) {
      return "LOOPBACK_HTTP";
    }
    return "LAN_HTTP";
  }
  return "OTHER";
}

function probeWebgl(
  createCanvas: BrowserRuntimeProbeEnvironment["createCanvas"],
): boolean {
  try {
    return createCanvas().getContext("webgl") !== null;
  } catch {
    return false;
  }
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function inspectBrowserRuntime(
  environment: BrowserRuntimeProbeEnvironment,
): BrowserRuntimeReport {
  return Object.freeze({
    transport: classifyTransport(
      environment.protocol,
      environment.hostname,
      environment.secureContext,
    ),
    secureContext: environment.secureContext,
    webCryptoDigest: hasWebCryptoDigest(environment.cryptoLike),
    softwareDigestFallback: true,
    webgl: probeWebgl(environment.createCanvas),
    pointerEvents:
      typeof environment.pointerEventLike === "function",
    maxTouchPoints: Math.trunc(
      finiteNonNegative(environment.maxTouchPoints),
    ),
    coarsePointer: environment.coarsePointer,
    viewportWidth: finiteNonNegative(environment.viewportWidth),
    viewportHeight: finiteNonNegative(environment.viewportHeight),
    devicePixelRatio: Math.max(
      1,
      finiteNonNegative(environment.devicePixelRatio),
    ),
  });
}

export function inspectCurrentBrowserRuntime(): BrowserRuntimeReport {
  return inspectBrowserRuntime({
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    secureContext: globalThis.isSecureContext,
    cryptoLike: globalThis.crypto,
    pointerEventLike: globalThis.PointerEvent,
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    createCanvas: () => document.createElement("canvas"),
  });
}

export function formatBrowserRuntimeReport(
  report: BrowserRuntimeReport,
): string {
  const digest = report.webCryptoDigest
    ? "WebCrypto"
    : "software SHA fallback";
  return [
    report.transport,
    `WebGL ${report.webgl ? "ON" : "OFF"}`,
    `Pointer ${report.pointerEvents ? "ON" : "OFF"}`,
    `touch ${report.maxTouchPoints}`,
    digest,
    `${Math.round(report.viewportWidth)}×${Math.round(report.viewportHeight)}`,
    `DPR ${report.devicePixelRatio.toFixed(2)}`,
  ].join(" · ");
}

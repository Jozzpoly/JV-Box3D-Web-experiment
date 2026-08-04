import { createHash } from "node:crypto";
import { auditPublicReadiness as auditRawPublicReadiness } from "./public-readiness-lib.mjs";

const REDACT_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/,
  /https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/,
  /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*[^\s]+/,
  /\b[A-Za-z]:\\Users\\[^\\\r\n]+/,
  /(?:^|[\s"'`])\/home\/[^/\s"'`]+/,
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password)\b\s*[:=]\s*["'][^"'\r\n]{12,}["']/i,
];

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function sanitizeString(value) {
  if (!REDACT_PATTERNS.some((pattern) => pattern.test(value))) {
    return value;
  }
  return `[redacted value ${fingerprint(value)}]`;
}

function sanitizeValue(value) {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)]),
    );
  }
  return value;
}

export async function auditPublicReadiness(options) {
  const rawReport = await auditRawPublicReadiness(options);
  const safeReport = sanitizeValue(rawReport);

  const serialized = JSON.stringify(safeReport);
  for (const pattern of REDACT_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(
        "Public-readiness report sanitization failed: a sensitive-looking value remained in the report.",
      );
    }
  }

  return safeReport;
}

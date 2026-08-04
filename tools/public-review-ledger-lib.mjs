import { createHash } from "node:crypto";

const ALLOWED_DISPOSITIONS = new Set(["PENDING", "ACCEPTED", "REMEDIATE"]);
const SENSITIVE_RATIONALE_PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{20,255})\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/,
  /\b[A-Za-z]:\\Users\\[^\\\r\n]+/,
  /\b[A-Za-z]:\\(?:[^\r\n"'`]+\\)+[^\r\n"'`]*/,
  /(?:^|[\s"'`])\/home\/[^/\s"'`]+/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

function stableFindingShape(finding) {
  return {
    kind: finding?.kind ?? null,
    signature: finding?.signature ?? null,
    scope: finding?.scope ?? null,
    path: finding?.path ?? null,
    line: finding?.line ?? null,
    objectSha: finding?.objectSha ?? null,
    bytes: finding?.bytes ?? null,
    fingerprint: finding?.fingerprint ?? null,
    reason: finding?.reason ?? null,
  };
}

function stableFindingJson(finding) {
  return JSON.stringify(stableFindingShape(finding));
}

export function publicReviewFindingId(finding) {
  return createHash("sha256")
    .update(stableFindingJson(finding))
    .digest("hex")
    .slice(0, 20);
}

function previousEntriesById(previousLedger) {
  const result = new Map();
  if (!Array.isArray(previousLedger?.entries)) {
    return result;
  }
  for (const entry of previousLedger.entries) {
    if (typeof entry?.findingId === "string" && !result.has(entry.findingId)) {
      result.set(entry.findingId, entry);
    }
  }
  return result;
}

export function createPublicReviewLedger(report, previousLedger = null) {
  if (!Array.isArray(report?.reviewFindings)) {
    throw new Error("Public-readiness report has no reviewFindings array.");
  }
  if (typeof report.sourceCommit !== "string") {
    throw new Error("Public-readiness report has no sourceCommit.");
  }

  const previous = previousEntriesById(previousLedger);
  const entries = report.reviewFindings
    .map((finding) => {
      const findingId = publicReviewFindingId(finding);
      const old = previous.get(findingId);
      return {
        findingId,
        finding: stableFindingShape(finding),
        disposition:
          old?.disposition === "ACCEPTED" || old?.disposition === "REMEDIATE"
            ? old.disposition
            : "PENDING",
        rationale: typeof old?.rationale === "string" ? old.rationale : "",
        reviewedBy: typeof old?.reviewedBy === "string" ? old.reviewedBy : "",
        reviewedAtUtc:
          typeof old?.reviewedAtUtc === "string" ? old.reviewedAtUtc : null,
        carriedFromCommit:
          old !== undefined && previousLedger?.sourceCommit !== report.sourceCommit
            ? previousLedger?.sourceCommit ?? null
            : old?.carriedFromCommit ?? null,
      };
    })
    .sort((left, right) => left.findingId.localeCompare(right.findingId));

  return {
    schemaVersion: 1,
    sourceCommit: report.sourceCommit,
    reportStatus: report.status,
    generatedAtUtc: new Date().toISOString(),
    note:
      "This ignored local ledger classifies only sanitized review findings. Never paste a raw credential, private path, personal e-mail or secret value into rationale fields.",
    entries,
  };
}

function isValidUtcTimestamp(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function rationaleLooksSensitive(value) {
  return SENSITIVE_RATIONALE_PATTERNS.some((pattern) => pattern.test(value));
}

export function validatePublicReviewLedger(report, ledger) {
  const errors = [];
  const warnings = [];

  if (ledger?.schemaVersion !== 1) {
    errors.push("Review ledger schemaVersion must be 1.");
  }
  if (ledger?.sourceCommit !== report?.sourceCommit) {
    errors.push(
      `Review ledger sourceCommit differs from the report: ${ledger?.sourceCommit ?? "missing"} != ${report?.sourceCommit ?? "missing"}.`,
    );
  }
  if (!Array.isArray(report?.reviewFindings)) {
    errors.push("Public-readiness report has no reviewFindings array.");
    return { errors, warnings, counts: null };
  }
  if (!Array.isArray(ledger?.entries)) {
    errors.push("Review ledger has no entries array.");
    return { errors, warnings, counts: null };
  }

  const expected = new Map(
    report.reviewFindings.map((finding) => [
      publicReviewFindingId(finding),
      stableFindingShape(finding),
    ]),
  );
  const actual = new Map();

  for (const entry of ledger.entries) {
    if (typeof entry?.findingId !== "string") {
      errors.push("Review ledger contains an entry without findingId.");
      continue;
    }
    if (actual.has(entry.findingId)) {
      errors.push(`Duplicate review-ledger entry: ${entry.findingId}.`);
      continue;
    }
    actual.set(entry.findingId, entry);
  }

  for (const findingId of expected.keys()) {
    if (!actual.has(findingId)) {
      errors.push(`Missing review classification: ${findingId}.`);
    }
  }
  for (const findingId of actual.keys()) {
    if (!expected.has(findingId)) {
      errors.push(`Stale or unknown review classification: ${findingId}.`);
    }
  }

  let pending = 0;
  let accepted = 0;
  let remediate = 0;

  for (const [findingId, entry] of actual) {
    const expectedFinding = expected.get(findingId);
    if (expectedFinding === undefined) {
      continue;
    }
    if (stableFindingJson(entry.finding) !== stableFindingJson(expectedFinding)) {
      errors.push(
        `Review classification ${findingId} contains finding details that differ from the sanitized report.`,
      );
    }
    if (!ALLOWED_DISPOSITIONS.has(entry.disposition)) {
      errors.push(
        `Review classification ${findingId} has unsupported disposition ${entry.disposition}.`,
      );
      continue;
    }

    if (entry.disposition === "PENDING") {
      pending += 1;
      errors.push(`Review classification ${findingId} is still PENDING.`);
      continue;
    }
    if (entry.disposition === "REMEDIATE") {
      remediate += 1;
      errors.push(
        `Review classification ${findingId} requires remediation before source visibility.`,
      );
      continue;
    }

    accepted += 1;
    if (typeof entry.rationale !== "string" || entry.rationale.trim().length < 20) {
      errors.push(
        `Accepted review classification ${findingId} requires a rationale of at least 20 characters.`,
      );
    } else if (rationaleLooksSensitive(entry.rationale)) {
      errors.push(
        `Accepted review classification ${findingId} rationale contains a sensitive-looking identifier.`,
      );
    }
    if (typeof entry.reviewedBy !== "string" || entry.reviewedBy.trim().length < 2) {
      errors.push(
        `Accepted review classification ${findingId} requires reviewedBy.`,
      );
    }
    if (!isValidUtcTimestamp(entry.reviewedAtUtc)) {
      errors.push(
        `Accepted review classification ${findingId} requires an ISO UTC reviewedAtUtc timestamp.`,
      );
    }
    if (entry.carriedFromCommit !== null && entry.carriedFromCommit !== undefined) {
      warnings.push(
        `Accepted review classification ${findingId} was carried from commit ${entry.carriedFromCommit}; confirm that the sanitized finding identity is still semantically equivalent.`,
      );
    }
  }

  return {
    errors,
    warnings,
    counts: {
      expected: expected.size,
      classified: actual.size,
      pending,
      accepted,
      remediate,
    },
  };
}

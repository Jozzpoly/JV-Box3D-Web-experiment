import test from "node:test";
import assert from "node:assert/strict";
import {
  createPublicReviewLedger,
  publicReviewFindingId,
  validatePublicReviewLedger,
} from "../tools/public-review-ledger-lib.mjs";

const SOURCE_COMMIT = "a".repeat(40);

function report(findings = null) {
  return {
    sourceCommit: SOURCE_COMMIT,
    status: "PUBLIC_READY_AUDIT_PASS",
    reviewFindings:
      findings ?? [
        {
          kind: "privacy-review",
          signature: "email-address",
          scope: "reachable-history-metadata",
          path: "[commit 123456789abc]",
          objectSha: "1".repeat(40),
          fingerprint: "123456789abc",
        },
        {
          kind: "large-history-blob",
          signature: "history-blob-over-25MiB",
          scope: "reachable-history",
          path: "historical-scan.bin",
          objectSha: "2".repeat(40),
          bytes: 30 * 1024 * 1024,
        },
      ],
  };
}

function accept(entry, rationale = "Reviewed as expected public metadata with no owner-private content.") {
  entry.disposition = "ACCEPTED";
  entry.rationale = rationale;
  entry.reviewedBy = "Jozz";
  entry.reviewedAtUtc = "2026-08-04T12:00:00Z";
}

test("new review findings always start pending", () => {
  const ledger = createPublicReviewLedger(report());
  assert.equal(ledger.entries.length, 2);
  assert.ok(ledger.entries.every((entry) => entry.disposition === "PENDING"));
  const validation = validatePublicReviewLedger(report(), ledger);
  assert.equal(validation.errors.length, 2);
  assert.equal(validation.counts.pending, 2);
});

test("all exact findings can be accepted with safe review evidence", () => {
  const currentReport = report();
  const ledger = createPublicReviewLedger(currentReport);
  ledger.entries.forEach((entry) => accept(entry));

  const validation = validatePublicReviewLedger(currentReport, ledger);
  assert.deepEqual(validation.errors, []);
  assert.equal(validation.counts.accepted, 2);
  assert.equal(validation.counts.pending, 0);
  assert.equal(validation.counts.remediate, 0);
});

test("remediation and stale classifications prevent review pass", () => {
  const currentReport = report();
  const ledger = createPublicReviewLedger(currentReport);
  accept(ledger.entries[0]);
  ledger.entries[1].disposition = "REMEDIATE";
  ledger.entries.push({
    findingId: "f".repeat(20),
    finding: {},
    disposition: "ACCEPTED",
    rationale: "Old classification that no longer belongs to this exact report.",
    reviewedBy: "Jozz",
    reviewedAtUtc: "2026-08-04T12:00:00Z",
    carriedFromCommit: null,
  });

  const validation = validatePublicReviewLedger(currentReport, ledger);
  assert.ok(
    validation.errors.some((error) => error.includes("requires remediation")),
  );
  assert.ok(
    validation.errors.some((error) => error.includes("Stale or unknown")),
  );
});

test("accepted rationale cannot copy private identifiers", () => {
  const currentReport = report([currentReportFinding()]);
  const ledger = createPublicReviewLedger(currentReport);
  accept(
    ledger.entries[0],
    "Reviewed private path C:\\Users\\Owner\\secret and accepted it.",
  );

  const validation = validatePublicReviewLedger(currentReport, ledger);
  assert.ok(
    validation.errors.some((error) =>
      error.includes("sensitive-looking identifier"),
    ),
  );
});

function currentReportFinding() {
  return {
    kind: "privacy-review",
    signature: "windows-user-path",
    scope: "reachable-history",
    path: "[redacted value 123456789abc]",
    objectSha: "3".repeat(40),
    fingerprint: "123456789abc",
  };
}

test("finding identity changes when evidence changes", () => {
  const finding = currentReportFinding();
  const changed = { ...finding, objectSha: "4".repeat(40) };
  assert.notEqual(publicReviewFindingId(finding), publicReviewFindingId(changed));
});

test("matching classifications can be carried but produce a warning", () => {
  const oldReport = report([currentReportFinding()]);
  const oldLedger = createPublicReviewLedger(oldReport);
  accept(oldLedger.entries[0]);
  oldLedger.sourceCommit = "b".repeat(40);

  const currentLedger = createPublicReviewLedger(oldReport, oldLedger);
  const validation = validatePublicReviewLedger(oldReport, currentLedger);
  assert.deepEqual(validation.errors, []);
  assert.equal(validation.warnings.length, 1);
  assert.match(validation.warnings[0], /carried from commit/);
});

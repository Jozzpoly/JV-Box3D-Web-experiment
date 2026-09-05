import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const expectedMain = '5b28cc03d22264010680deb95a04abd04661bc22';
const closingResearchBranch = 'work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03';
const hardenedContinuationBranch = 'research/wheel-mode5-rq2c-orientation-2026-09-05';
const allowedResearchBranches = new Set([
  closingResearchBranch,
  hardenedContinuationBranch,
]);
const allowedStatuses = new Set([
  'OWNER_ACCEPTED_SCOPED',
  'TRUSTED_EXECUTED_SCOPED',
  'TRUSTED_DIAGNOSTIC',
  'RESEARCH_DECISION',
  'INSTRUMENT_INVALID',
  'APPARATUS_INVALID',
  'HISTORICAL_ONLY',
  'OPEN_NOT_VALIDATED',
]);

const raw = await readFile(ledgerPath, 'utf8');
const ledger = JSON.parse(raw);

assert.equal(ledger.schemaVersion, 1, 'unsupported ledger schema');
assert.equal(ledger.canonicalProductMain, expectedMain, 'canonical product main drifted');
assert.ok(
  allowedResearchBranches.has(ledger.activeResearchBranch),
  `active research branch is not an approved RH0/continuation branch: ${ledger.activeResearchBranch}`,
);
if (process.env.GITHUB_REF_NAME && allowedResearchBranches.has(process.env.GITHUB_REF_NAME)) {
  assert.equal(
    ledger.activeResearchBranch,
    process.env.GITHUB_REF_NAME,
    'ledger active research branch must match the executing research branch',
  );
}
assert.equal(ledger.lastOwnerHandsOn?.status, 'OWNER_ACCEPTED_SCOPED', 'last Owner hands-on status drifted');
assert.equal(ledger.lastOwnerHandsOn?.acceptedMain, expectedMain, 'Owner baseline main does not match canonical main');

// Milestone lifecycle is deliberately explicit. While RH0 is active it must
// block new physics. Once every RH0 gate is closed, that block must be removed
// rather than preserved as a stale process invariant.
const milestone = ledger.currentMilestone;
assert.ok(milestone && typeof milestone === 'object', 'current milestone missing');
if (milestone.id === 'RH0') {
  assert.ok(
    milestone.status === 'ACTIVE' || milestone.status === 'CLOSED_PENDING_BRANCH_CUTOVER',
    `unsupported RH0 lifecycle status: ${milestone.status}`,
  );

  if (milestone.status === 'ACTIVE') {
    assert.equal(milestone.blocksNewPhysics, true, 'RH0 must block new physics while active');
  } else {
    assert.equal(milestone.blocksNewPhysics, false, 'closed RH0 must not retain the new-physics block');
    assert.equal(
      ledger.plannedContinuationBranch,
      hardenedContinuationBranch,
      'RH0 closure must name the hardened continuation branch',
    );
    assert.equal(
      milestone.progress?.['RH0.1_evidenceLedger'],
      'PASS',
      'RH0.1 must pass before closure',
    );
    assert.equal(
      milestone.progress?.['RH0.2_invariantValidation'],
      'PASS',
      'RH0.2 must pass before closure',
    );
    assert.equal(
      milestone.progress?.['RH0.3_explicitHarness'],
      'PASS',
      'RH0.3 must pass before closure',
    );
    assert.equal(
      milestone.progress?.['RH0.4_frozenReplayAndCutover'],
      'PASS',
      'RH0.4 must pass before closure',
    );
    assert.equal(
      milestone.progress?.['RH0.5_challengeDerivedErrorBudget'],
      'PASS',
      'RH0.5 must pass before closure',
    );
    assert.match(
      milestone.progress?.['RH0.6_continuationBranchDecision'] ?? '',
      /^PASS_/,
      'RH0.6 branch decision must pass before closure',
    );
    assert.equal(
      milestone.closureDocument,
      ledger.rh0ClosureDocument,
      'RH0 closure document pointer drifted',
    );
  }
} else if (milestone.id === 'RQ2C_ORIENTATION') {
  assert.equal(
    ledger.activeResearchBranch,
    hardenedContinuationBranch,
    'RQ2C orientation work must live on the hardened continuation branch',
  );
  assert.equal(milestone.blocksNewPhysics, false, 'post-RH0 bounded orientation research must not inherit the RH0 block');
} else {
  assert.fail(`unsupported current milestone id: ${milestone.id}`);
}

assert.deepEqual(new Set(ledger.statusVocabulary), allowedStatuses, 'ledger status vocabulary drifted');
assert.ok(ledger.lanes?.annular_contact_semantics, 'annular contact-semantics lane missing');
assert.ok(ledger.lanes?.donor_outer_carrier_dynamics, 'donor outer-carrier dynamics lane missing');
assert.equal(
  ledger.activeApparatus?.status,
  'CANONICAL_ACTIVE_AFTER_RH0_REPLAY',
  'explicit RH0 apparatus must remain canonical after cutover',
);
assert.equal(
  ledger.activeApparatus?.suite,
  'tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp',
  'active suite pointer drifted',
);

const knownLanes = new Set(Object.keys(ledger.lanes));
const ids = new Set();
const recordsById = new Map();
const documents = new Set([
  ledger.auditDocument,
  ledger.rh0ClosureDocument,
  ledger.lastOwnerHandsOn.document,
].filter(Boolean));

for (const record of ledger.records) {
  assert.equal(typeof record.id, 'string', 'record id must be a string');
  assert.ok(!ids.has(record.id), `duplicate evidence id: ${record.id}`);
  ids.add(record.id);
  recordsById.set(record.id, record);

  assert.ok(knownLanes.has(record.lane), `${record.id}: unknown evidence lane ${record.lane}`);
  assert.ok(allowedStatuses.has(record.status), `${record.id}: invalid status ${record.status}`);
  assert.equal(typeof record.question, 'string', `${record.id}: question missing`);

  if (record.document) {
    documents.add(record.document);
  }

  if (record.status === 'TRUSTED_EXECUTED_SCOPED') {
    assert.match(record.executedSource ?? '', /^[0-9a-f]{40}$/, `${record.id}: trusted executed source missing/invalid`);
    assert.ok(Number.isInteger(record.run), `${record.id}: trusted executed run missing`);
    assert.ok(Number.isInteger(record.job), `${record.id}: trusted executed job missing`);
    assert.equal(record.physicsExecuted, true, `${record.id}: trusted executed physics must be true`);
    assert.ok(record.document, `${record.id}: trusted executed canonical document missing`);
  }

  if (record.status === 'TRUSTED_DIAGNOSTIC') {
    assert.match(record.executedSource ?? '', /^[0-9a-f]{40}$/, `${record.id}: trusted diagnostic source missing/invalid`);
    assert.ok(Number.isInteger(record.run), `${record.id}: trusted diagnostic run missing`);
    assert.ok(record.document, `${record.id}: trusted diagnostic document missing`);
  }

  if (record.status === 'RESEARCH_DECISION') {
    assert.ok(Array.isArray(record.dependsOn) && record.dependsOn.length > 0, `${record.id}: research decision dependencies missing`);
    assert.equal(record.physicsExecuted, false, `${record.id}: research decision is not itself a physics run`);
    assert.ok(record.document, `${record.id}: research decision document missing`);
  }

  if (record.status === 'INSTRUMENT_INVALID') {
    assert.equal(typeof record.invalidMeasurement, 'string', `${record.id}: invalid measurement must be explicit`);
    assert.match(record.executedSource ?? '', /^[0-9a-f]{40}$/, `${record.id}: invalid-instrument source missing/invalid`);
  }

  if (record.status === 'APPARATUS_INVALID') {
    assert.equal(record.physicsExecuted, false, `${record.id}: apparatus-invalid record must not claim physics execution`);
    assert.equal(typeof record.failureStage, 'string', `${record.id}: failure stage missing`);
    assert.equal(typeof record.failure, 'string', `${record.id}: failure reason missing`);
  }
}

for (const record of ledger.records) {
  if (record.dependsOn) {
    for (const dependency of record.dependsOn) {
      assert.ok(recordsById.has(dependency), `${record.id}: missing dependency ${dependency}`);
    }
  }
  if (record.supersededBy) {
    assert.ok(recordsById.has(record.supersededBy), `${record.id}: missing superseding record ${record.supersededBy}`);
  }
}

// Critical anti-overclaim invariants discovered during the retrospective audit.
const rq0 = recordsById.get('RQ0');
const rq2b = recordsById.get('RQ2B');
const rq2c0aV1 = recordsById.get('RQ2C0A_TILT_V1');
const rq2c0a120 = recordsById.get('RQ2C0A_120');
const rq2c0b = recordsById.get('RQ2C0B_240_ATTEMPT');
const q1 = recordsById.get('Q1');
const rh0SuiteReplay = recordsById.get('RH0_CANONICAL_SUITE_REPLAY');
const rh0OrientationDesign = recordsById.get('RH0_5_ORIENTATION_DESIGN');

assert.equal(rq0?.status, 'TRUSTED_EXECUTED_SCOPED', 'RQ0 qualification status drifted');
assert.match(rq0?.open ?? '', /not a representative tilted-wheel mount/i, 'RQ0 mount limitation must stay explicit');
assert.match(q1?.decision ?? '', /bounded laboratory rolling-transition envelope/i, 'Q1 scope narrowing must stay explicit');
assert.match(rq2b?.open ?? '', /sign-asymmetric/i, 'RQ2B sign asymmetry must remain visible');
assert.equal(rq2c0aV1?.status, 'INSTRUMENT_INVALID', 'original RQ2c0a tilt reading must remain invalid');
assert.match(rq2c0a120?.outcome ?? '', /148\.785 microradians/, 'corrected RQ2c0a measured tilt must remain recorded');
assert.match(rq2c0a120?.open ?? '', /not derived from product or next-challenge error budget/i, 'historical 100 microradian gate must not become product truth');
assert.equal(rq2c0b?.status, 'APPARATUS_INVALID', 'RQ2c0b must remain apparatus-invalid until a new executed result exists');
assert.equal(rq2c0b?.physicsExecuted, false, 'RQ2c0b must not claim a 240 Hz physics result');
assert.equal(rq2c0b?.failure, 'RQ2c0b expected function+binding occurrences=2, got 3', 'RQ2c0b failure provenance drifted');

assert.equal(rh0SuiteReplay?.status, 'TRUSTED_DIAGNOSTIC', 'RH0 explicit-suite replay status drifted');
assert.equal(rh0SuiteReplay?.run, 33963938554, 'RH0 explicit-suite replay run drifted');
assert.equal(rh0SuiteReplay?.artifact, 9968834538, 'RH0 explicit-suite replay artifact drifted');
assert.equal(rh0OrientationDesign?.status, 'RESEARCH_DECISION', 'RH0.5 orientation design status drifted');
assert.equal(rh0OrientationDesign?.physicsExecuted, false, 'RH0.5 design must not masquerade as executed physics');
assert.equal(rh0OrientationDesign?.apparatusBudget?.challengeDegrees, 3.5, 'RH0.5 challenge angle drifted');
assert.equal(rh0OrientationDesign?.apparatusBudget?.maxAxisErrorDegrees, 0.035, 'RH0.5 axis-error budget drifted');
assert.equal(rh0OrientationDesign?.apparatusBudget?.maxHeadingErrorDegrees, 0.035, 'RH0.5 heading-error budget drifted');
assert.equal(rh0OrientationDesign?.apparatusBudget?.prior120HzMeasuredAxisErrorMicroradians, 148.785, '120 Hz prior error provenance drifted');

const sentinel = ledger.sentinels?.find((entry) => entry.id === 'RQ2_LONGITUDINAL_SIGN_ASYMMETRY');
assert.ok(sentinel, 'RQ2 longitudinal sign-asymmetry sentinel missing');
assert.deepEqual(sentinel.sourceRecords, ['RQ2A', 'RQ2B'], 'RQ2 sentinel source records drifted');
assert.ok(
  sentinel.reference?.driveBrakeMaxSlipRatio > 20,
  'RQ2 drive/brake asymmetry sentinel must remain materially visible through harness changes',
);

for (const document of documents) {
  assert.equal(typeof document, 'string', 'document path must be a string');
  await access(document);
}

const trustedExecuted = ledger.records.filter((record) => record.status === 'TRUSTED_EXECUTED_SCOPED').length;
const trustedDiagnostics = ledger.records.filter((record) => record.status === 'TRUSTED_DIAGNOSTIC').length;
const invalid = ledger.records.filter((record) => record.status === 'INSTRUMENT_INVALID' || record.status === 'APPARATUS_INVALID').length;

console.log('WHEEL_MODE5_EVIDENCE_LEDGER_SUMMARY', JSON.stringify({
  schemaVersion: ledger.schemaVersion,
  currentMilestone: ledger.currentMilestone.id,
  milestoneStatus: ledger.currentMilestone.status,
  activeResearchBranch: ledger.activeResearchBranch,
  recordCount: ledger.records.length,
  trustedExecuted,
  trustedDiagnostics,
  invalid,
  canonicalProductMain: ledger.canonicalProductMain,
}));
console.log('WHEEL_MODE5_EVIDENCE_LEDGER_OK');

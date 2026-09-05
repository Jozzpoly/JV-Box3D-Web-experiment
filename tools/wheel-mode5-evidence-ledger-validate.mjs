import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const pointerPath = 'docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json';
const expectedMain = '5b28cc03d22264010680deb95a04abd04661bc22';
const closingResearchBranch = 'work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03';
const activeResearchBranch = 'research/wheel-mode5-rq2c-orientation-2026-09-05';
const rh0ClosureHead = 'c596684ea9a4b99e70d730c1b1b6f02f74cdab63';
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

const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
const pointer = JSON.parse(await readFile(pointerPath, 'utf8'));

assert.equal(ledger.schemaVersion, 1, 'unsupported ledger schema');
assert.equal(pointer.schemaVersion, 1, 'unsupported active-pointer schema');
assert.equal(ledger.canonicalProductMain, expectedMain, 'canonical product main drifted');
assert.equal(ledger.activeResearchBranch, closingResearchBranch, 'RH0 closure ledger provenance branch drifted');
assert.equal(ledger.plannedContinuationBranch, activeResearchBranch, 'RH0 continuation branch decision drifted');
assert.equal(pointer.stage, 'RQ2C_ORIENTATION', 'active stage drifted');
assert.equal(pointer.activeResearchBranch, activeResearchBranch, 'active pointer branch drifted');
assert.equal(pointer.ancestryResearchBranch, closingResearchBranch, 'active pointer ancestry drifted');
assert.equal(pointer.rh0ClosureHead, rh0ClosureHead, 'RH0 closure head drifted');
assert.equal(pointer.canonicalEvidenceLedger, ledgerPath, 'active pointer ledger target drifted');
assert.equal(pointer.activationRecord, 'docs/WHEEL_MODE5_RQ2C_ORIENTATION_ACTIVATION_2026-09-05.md', 'activation record pointer drifted');
assert.equal(pointer.nextGate, 'RQ2C0_CONTROL_TRANSLATIONALLY_FREE_0DEG', 'next RQ2C gate drifted');
assert.equal(pointer.challengeDegrees, 3.5, 'RQ2C challenge angle drifted');
assert.equal(pointer.mountHertz, 120, 'RQ2C mount stiffness drifted');
assert.equal(pointer.maxAxisErrorDegrees, 0.035, 'RQ2C axis-error budget drifted');
assert.equal(pointer.maxHeadingErrorDegrees, 0.035, 'RQ2C heading-error budget drifted');

if (process.env.GITHUB_REF_NAME) {
  assert.equal(process.env.GITHUB_REF_NAME, activeResearchBranch, 'post-RH0 validation must execute on active research branch');
}

assert.equal(ledger.lastOwnerHandsOn?.status, 'OWNER_ACCEPTED_SCOPED', 'last Owner hands-on status drifted');
assert.equal(ledger.lastOwnerHandsOn?.acceptedMain, expectedMain, 'Owner baseline main does not match canonical main');

const milestone = ledger.currentMilestone;
assert.equal(milestone?.id, 'RH0', 'closure ledger must retain RH0 milestone identity');
assert.equal(milestone?.status, 'CLOSED_PENDING_BRANCH_CUTOVER', 'RH0 closure lifecycle status drifted');
assert.equal(milestone?.blocksNewPhysics, false, 'closed RH0 must not retain the new-physics block');
assert.equal(milestone?.progress?.['RH0.1_evidenceLedger'], 'PASS', 'RH0.1 must remain PASS');
assert.equal(milestone?.progress?.['RH0.2_invariantValidation'], 'PASS', 'RH0.2 must remain PASS');
assert.equal(milestone?.progress?.['RH0.3_explicitHarness'], 'PASS', 'RH0.3 must remain PASS');
assert.equal(milestone?.progress?.['RH0.4_frozenReplayAndCutover'], 'PASS', 'RH0.4 must remain PASS');
assert.equal(milestone?.progress?.['RH0.5_challengeDerivedErrorBudget'], 'PASS', 'RH0.5 must remain PASS');
assert.match(milestone?.progress?.['RH0.6_continuationBranchDecision'] ?? '', /^PASS_/, 'RH0.6 must remain PASS');
assert.equal(milestone?.closureDocument, ledger.rh0ClosureDocument, 'RH0 closure document pointer drifted');

assert.deepEqual(new Set(ledger.statusVocabulary), allowedStatuses, 'ledger status vocabulary drifted');
assert.ok(ledger.lanes?.annular_contact_semantics, 'annular contact-semantics lane missing');
assert.ok(ledger.lanes?.donor_outer_carrier_dynamics, 'donor outer-carrier dynamics lane missing');
assert.equal(ledger.activeApparatus?.status, 'CANONICAL_ACTIVE_AFTER_RH0_REPLAY', 'explicit RH0 apparatus must remain canonical');
assert.equal(ledger.activeApparatus?.suite, 'tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp', 'active suite pointer drifted');
assert.equal(pointer.activeApparatus?.suite, ledger.activeApparatus?.suite, 'active pointer suite disagrees with closure ledger');
assert.equal(pointer.activeApparatus?.replayContract, ledger.activeApparatus?.replayContract, 'active pointer replay contract disagrees with closure ledger');

const knownLanes = new Set(Object.keys(ledger.lanes));
const ids = new Set();
const recordsById = new Map();
const documents = new Set([
  ledger.auditDocument,
  ledger.rh0ClosureDocument,
  ledger.lastOwnerHandsOn.document,
  pointer.activationRecord,
].filter(Boolean));

for (const record of ledger.records) {
  assert.equal(typeof record.id, 'string', 'record id must be a string');
  assert.ok(!ids.has(record.id), `duplicate evidence id: ${record.id}`);
  ids.add(record.id);
  recordsById.set(record.id, record);
  assert.ok(knownLanes.has(record.lane), `${record.id}: unknown evidence lane ${record.lane}`);
  assert.ok(allowedStatuses.has(record.status), `${record.id}: invalid status ${record.status}`);
  assert.equal(typeof record.question, 'string', `${record.id}: question missing`);
  if (record.document) documents.add(record.document);

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
    assert.equal(record.physicsExecuted, false, `${record.id}: research decision is not itself physics`);
    assert.ok(record.document, `${record.id}: research decision document missing`);
  }
  if (record.status === 'INSTRUMENT_INVALID') {
    assert.equal(typeof record.invalidMeasurement, 'string', `${record.id}: invalid measurement must be explicit`);
  }
  if (record.status === 'APPARATUS_INVALID') {
    assert.equal(record.physicsExecuted, false, `${record.id}: apparatus-invalid record must not claim physics execution`);
    assert.equal(typeof record.failureStage, 'string', `${record.id}: failure stage missing`);
    assert.equal(typeof record.failure, 'string', `${record.id}: failure reason missing`);
  }
}

for (const record of ledger.records) {
  for (const dependency of record.dependsOn ?? []) {
    assert.ok(recordsById.has(dependency), `${record.id}: missing dependency ${dependency}`);
  }
  if (record.supersededBy) assert.ok(recordsById.has(record.supersededBy), `${record.id}: missing superseding record ${record.supersededBy}`);
}

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
assert.match(rq2c0a120?.outcome ?? '', /148\.785 microradians/, 'corrected RQ2c0a tilt must remain recorded');
assert.match(rq2c0a120?.open ?? '', /not derived from product or next-challenge error budget/i, '100 microradian historical gate must not become product truth');
assert.equal(rq2c0b?.status, 'APPARATUS_INVALID', 'RQ2c0b 240 attempt must remain apparatus-invalid');
assert.equal(rq2c0b?.physicsExecuted, false, 'RQ2c0b must not claim a 240 Hz physics result');
assert.equal(rh0SuiteReplay?.status, 'TRUSTED_DIAGNOSTIC', 'RH0 explicit-suite replay status drifted');
assert.equal(rh0SuiteReplay?.run, 33963938554, 'RH0 explicit-suite replay run drifted');
assert.equal(rh0SuiteReplay?.artifact, 9968834538, 'RH0 explicit-suite replay artifact drifted');
assert.equal(rh0OrientationDesign?.status, 'RESEARCH_DECISION', 'RH0.5 orientation design status drifted');
assert.equal(rh0OrientationDesign?.apparatusBudget?.challengeDegrees, pointer.challengeDegrees, 'RH0.5 challenge disagrees with active pointer');
assert.equal(rh0OrientationDesign?.apparatusBudget?.maxAxisErrorDegrees, pointer.maxAxisErrorDegrees, 'RH0.5 axis budget disagrees with active pointer');
assert.equal(rh0OrientationDesign?.apparatusBudget?.maxHeadingErrorDegrees, pointer.maxHeadingErrorDegrees, 'RH0.5 heading budget disagrees with active pointer');
assert.equal(rh0OrientationDesign?.apparatusBudget?.prior120HzMeasuredAxisErrorMicroradians, 148.785, '120 Hz prior error provenance drifted');

const sentinel = ledger.sentinels?.find((entry) => entry.id === 'RQ2_LONGITUDINAL_SIGN_ASYMMETRY');
assert.ok(sentinel, 'RQ2 longitudinal sign-asymmetry sentinel missing');
assert.deepEqual(sentinel.sourceRecords, ['RQ2A', 'RQ2B'], 'RQ2 sentinel source records drifted');
assert.ok(sentinel.reference?.driveBrakeMaxSlipRatio > 20, 'RQ2 asymmetry sentinel must remain materially visible');

for (const document of documents) {
  assert.equal(typeof document, 'string', 'document path must be a string');
  await access(document);
}
await access(pointer.activeApparatus.suite);
await access(pointer.activeApparatus.replayContract);

console.log('WHEEL_MODE5_EVIDENCE_LEDGER_SUMMARY', JSON.stringify({
  schemaVersion: ledger.schemaVersion,
  closureMilestone: milestone.id,
  closureStatus: milestone.status,
  activeStage: pointer.stage,
  activeResearchBranch: pointer.activeResearchBranch,
  rh0ClosureHead: pointer.rh0ClosureHead,
  recordCount: ledger.records.length,
  canonicalProductMain: ledger.canonicalProductMain,
}));
console.log('WHEEL_MODE5_EVIDENCE_LEDGER_OK');

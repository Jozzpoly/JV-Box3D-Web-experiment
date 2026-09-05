import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const expectedMain = '5b28cc03d22264010680deb95a04abd04661bc22';
const expectedBranch = 'work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03';
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
assert.equal(ledger.activeResearchBranch, expectedBranch, 'active research branch drifted');
assert.equal(ledger.lastOwnerHandsOn?.status, 'OWNER_ACCEPTED_SCOPED', 'last Owner hands-on status drifted');
assert.equal(ledger.lastOwnerHandsOn?.acceptedMain, expectedMain, 'Owner baseline main does not match canonical main');
assert.equal(ledger.currentMilestone?.id, 'RH0', 'RH0 must remain active until its exit criteria are deliberately closed');
assert.equal(ledger.currentMilestone?.blocksNewPhysics, true, 'RH0 must block new physics while active');

assert.deepEqual(new Set(ledger.statusVocabulary), allowedStatuses, 'ledger status vocabulary drifted');
assert.ok(ledger.lanes?.annular_contact_semantics, 'annular contact-semantics lane missing');
assert.ok(ledger.lanes?.donor_outer_carrier_dynamics, 'donor outer-carrier dynamics lane missing');

const knownLanes = new Set(Object.keys(ledger.lanes));
const ids = new Set();
const recordsById = new Map();
const documents = new Set([
  ledger.auditDocument,
  ledger.lastOwnerHandsOn.document,
]);

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

const sentinel = ledger.sentinels?.find((entry) => entry.id === 'RQ2_LONGITUDINAL_SIGN_ASYMMETRY');
assert.ok(sentinel, 'RQ2 longitudinal sign-asymmetry sentinel missing');
assert.deepEqual(sentinel.sourceRecords, ['RQ2A', 'RQ2B'], 'RQ2 sentinel source records drifted');

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
  recordCount: ledger.records.length,
  trustedExecuted,
  trustedDiagnostics,
  invalid,
  canonicalProductMain: ledger.canonicalProductMain,
}));
console.log('WHEEL_MODE5_EVIDENCE_LEDGER_OK');

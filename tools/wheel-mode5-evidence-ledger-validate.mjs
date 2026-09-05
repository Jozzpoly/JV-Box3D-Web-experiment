import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const pointerPath = 'docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json';
const expectedMain = '5b28cc03d22264010680deb95a04abd04661bc22';
const ancestryResearchBranch = 'work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03';
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
assert.equal(ledger.activeResearchBranch, activeResearchBranch, 'active ledger branch drifted');
assert.equal(ledger.archivalResearchAncestor, ancestryResearchBranch, 'ledger ancestry branch drifted');
assert.equal(pointer.stage, 'RQ2C_ORIENTATION_HOLD', 'active stage drifted');
assert.equal(pointer.activeResearchBranch, activeResearchBranch, 'active pointer branch drifted');
assert.equal(pointer.ancestryResearchBranch, ancestryResearchBranch, 'active pointer ancestry drifted');
assert.equal(pointer.rh0ClosureHead, rh0ClosureHead, 'RH0 closure head drifted');
assert.equal(pointer.canonicalEvidenceLedger, ledgerPath, 'active pointer ledger target drifted');
assert.equal(pointer.activationRecord, 'docs/WHEEL_MODE5_RQ2C_ORIENTATION_ACTIVATION_2026-09-05.md', 'activation record pointer drifted');
assert.equal(pointer.closureRecord, 'docs/WHEEL_MODE5_RQ2C4F_SOURCE_OWNERSHIP_CLOSURE_2026-09-05.md', 'closure record pointer drifted');
assert.equal(pointer.nextGate, null, 'closed RQ2C line must not expose an automatic next gate');
assert.equal(pointer.challengeDegrees, 3.5, 'RQ2C challenge angle drifted');
assert.equal(pointer.mountHertz, 120, 'RQ2C mount stiffness drifted');
assert.equal(pointer.maxAxisErrorDegrees, 0.035, 'RQ2C axis-error budget drifted');
assert.equal(pointer.maxHeadingErrorDegrees, 0.035, 'RQ2C heading-error budget drifted');

const latest = pointer.latestEvidence;
assert.equal(latest?.id, 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION', 'latest RQ2C evidence id drifted');
assert.equal(latest?.status, 'TRUSTED_DIAGNOSTIC', 'latest RQ2C status drifted');
assert.equal(latest?.physicsExecuted, true, 'RQ2C4F must preserve that physics executed');
assert.equal(latest?.executedSource, 'a7d3389edf6c51664d5615d657e879109b161420', 'RQ2C4F executed source drifted');
assert.equal(latest?.resultHead, '5ffe5e0f206fc4d7f345ae4f66c7c086ab392ebc', 'RQ2C4F result head drifted');
assert.equal(latest?.run, 33973506632, 'RQ2C4F run drifted');
assert.equal(latest?.job, 101326068112, 'RQ2C4F job drifted');
assert.equal(latest?.artifact, 9971633765, 'RQ2C4F artifact drifted');
assert.equal(latest?.classification, 'RQ2C4F_SPIN_RATE_DRIFT_DOMINANT', 'RQ2C4F classification drifted');
assert.equal(latest?.yawPairExecuted, false, 'RQ2C yaw pair must remain unexecuted');
assert.ok(latest?.gateExceedance > 17, '0-degree actual-support gate exceedance must remain visible');
assert.ok(latest?.peakSpinRateContributionMmPerS > latest?.peakComDriftMmPerS, 'spin-rate dominance drifted');

const sourceClosure = pointer.sourceOwnershipClosure;
assert.equal(sourceClosure?.status, 'PARTIAL', 'source ownership must remain partial');
assert.equal(sourceClosure?.classification, 'RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT', 'source ownership classification drifted');
assert.equal(sourceClosure?.directFirstOrderAxialTorquePath, 'contact tangential friction', 'direct first-order torque-path conclusion drifted');
assert.equal(sourceClosure?.exactNumericalBudgetClosed, false, 'exact numerical ownership budget must remain open');
assert.equal(sourceClosure?.solverInstrumentationOpened, false, 'solver ownership instrumentation must remain unopened');

if (process.env.GITHUB_REF_NAME) {
  assert.equal(process.env.GITHUB_REF_NAME, activeResearchBranch, 'RQ2C validation must execute on active research branch');
}

assert.equal(ledger.lastOwnerHandsOn?.status, 'OWNER_ACCEPTED_SCOPED', 'last Owner hands-on status drifted');
assert.equal(ledger.lastOwnerHandsOn?.acceptedMain, expectedMain, 'Owner baseline main does not match canonical main');

const milestone = ledger.currentMilestone;
assert.equal(milestone?.id, 'RQ2C_ORIENTATION', 'current milestone identity drifted');
assert.equal(milestone?.status, 'CLOSED_HOLD_AT_0DEG_SLIP_GATE', 'RQ2C closure status drifted');
assert.equal(milestone?.closed, true, 'RQ2C milestone must remain closed');
assert.equal(milestone?.blocksNewPhysics, true, 'closed HOLD must not silently authorize new physics inside this line');
assert.equal(milestone?.blocksYaw, true, 'failed 0-degree gate must continue blocking yaw');
assert.equal(milestone?.next, null, 'closed RQ2C milestone must not expose a next micro-probe');
assert.equal(milestone?.progress?.RH0_foundation, 'CLOSED_PASS', 'RH0 foundation status drifted');
assert.equal(milestone?.progress?.RQ2C4_hardRelax, 'HEADING_PASS_SLIP_GATE_FAIL', 'RQ2C4 heading/slip classification drifted');
assert.equal(milestone?.progress?.RQ2C4F_closureLocalization, 'TRUSTED_DIAGNOSTIC_SPIN_RATE_DRIFT_DOMINANT', 'RQ2C4F localization progress drifted');
assert.equal(milestone?.progress?.RQ2C4F_sourceOwnership, 'PARTIAL_CONTACT_FRICTION_DIRECT_ROUTINE_FORENSICS_CLOSED', 'RQ2C4F source-ownership closure drifted');
assert.equal(milestone?.frozenChallenge?.maxRollingSlipMmPerS, 0.002, 'frozen rolling-slip gate drifted');
assert.ok(milestone?.currentEvidence?.actualWitnessMaxSlipMmPerS > milestone?.frozenChallenge?.maxRollingSlipMmPerS, 'HOLD must remain grounded in a failed 0-degree slip gate');

assert.deepEqual(new Set(ledger.statusVocabulary), allowedStatuses, 'ledger status vocabulary drifted');
assert.ok(ledger.lanes?.annular_contact_semantics, 'annular contact-semantics lane missing');
assert.ok(ledger.lanes?.donor_outer_carrier_dynamics, 'donor outer-carrier dynamics lane missing');
assert.equal(ledger.activeApparatus?.status, 'CANONICAL_RH0_BASE_WITH_RQ2C4D_E_F_DIAGNOSTIC_EXTENSION', 'active apparatus closure status drifted');
assert.equal(ledger.activeApparatus?.suite, 'tools/wheel-mode5/rh0/wheel-mode5-rq-suite.hpp', 'active suite pointer drifted');
assert.equal(pointer.activeApparatus?.frozenSuite, ledger.activeApparatus?.suite, 'active pointer frozen suite disagrees with ledger');
assert.equal(pointer.activeApparatus?.replayContract, ledger.activeApparatus?.replayContract, 'active pointer replay contract disagrees with ledger');
assert.equal(pointer.activeApparatus?.rq2cSuite, 'tools/wheel-mode5/rq2c/wheel-mode5-rq2c-orientation-suite.hpp', 'RQ2C suite pointer drifted');
assert.equal(pointer.activeApparatus?.rq2c4fClosurePatch, 'tools/wheel-mode5/rq2c4f/patch-rq2c4f-rolling-pair-closure.py', 'RQ2C4F patch pointer drifted');

const knownLanes = new Set(Object.keys(ledger.lanes));
const ids = new Set();
const recordsById = new Map();
const documents = new Set([
  ledger.auditDocument,
  ledger.rh0ClosureDocument,
  ledger.lastOwnerHandsOn.document,
  pointer.activationRecord,
  pointer.closureRecord,
  latest.document,
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
    assert.equal(typeof record.physicsExecuted, 'boolean', `${record.id}: apparatus-invalid physics execution state must be explicit`);
    if (record.physicsExecuted) {
      assert.match(record.executedSource ?? '', /^[0-9a-f]{40}$/, `${record.id}: executed apparatus-invalid source missing/invalid`);
      assert.ok(Number.isInteger(record.run), `${record.id}: executed apparatus-invalid run missing`);
      assert.ok(Number.isInteger(record.job), `${record.id}: executed apparatus-invalid job missing`);
      assert.ok(record.document, `${record.id}: executed apparatus-invalid document missing`);
      assert.ok(typeof record.failure === 'string' || typeof record.outcome === 'string', `${record.id}: executed apparatus-invalid reason/outcome missing`);
    } else {
      assert.ok(typeof record.failure === 'string' || typeof record.outcome === 'string', `${record.id}: non-executed apparatus-invalid failure/outcome missing`);
    }
  }
}

assert.equal(ledger.records.length, 25, 'canonical ledger record count drifted');
assert.equal(ledger.records.at(-2)?.id, 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION', 'RQ2C4F ledger position drifted');
assert.equal(ledger.records.at(-1)?.id, 'RQ2C4F_SOURCE_OWNERSHIP_CLOSURE', 'source-ownership ledger tail drifted');

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
const rq2c4d = recordsById.get('RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT');
const rq2c4e = recordsById.get('RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION');
const rq2c4f = recordsById.get('RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION');
const rq2c4fClosure = recordsById.get('RQ2C4F_SOURCE_OWNERSHIP_CLOSURE');

assert.equal(rq0?.status, 'TRUSTED_EXECUTED_SCOPED', 'RQ0 qualification status drifted');
assert.match(rq0?.open ?? '', /not a representative tilted-wheel mount/i, 'RQ0 mount limitation must stay explicit');
assert.match(q1?.decision ?? '', /bounded laboratory rolling-transition envelope/i, 'Q1 scope narrowing must stay explicit');
assert.match(rq2b?.open ?? '', /sign-asymmetric/i, 'RQ2B sign asymmetry must remain visible');
assert.equal(rq2c0aV1?.status, 'INSTRUMENT_INVALID', 'original RQ2c0a tilt reading must remain invalid');
assert.match(rq2c0a120?.outcome ?? '', /148\.785 microradians/, 'corrected RQ2c0a tilt must remain recorded');
assert.match(rq2c0a120?.open ?? '', /not derived from product or next-challenge error budget/i, 'historical 100 microradian gate must not become product truth');
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
assert.match(rq2c4d?.outcome ?? '', /0\.034093857 mm\/s/, 'RQ2C4D actual-support witness drifted');
assert.match(rq2c4e?.outcome ?? '', /0\.034570694 mm\/s/, 'RQ2C4E rolling-pair peak drifted');
assert.equal(rq2c4f?.executedSource, latest.executedSource, 'ledger/pointer RQ2C4F source disagree');
assert.equal(rq2c4f?.run, latest.run, 'ledger/pointer RQ2C4F run disagree');
assert.equal(rq2c4f?.artifact, latest.artifact, 'ledger/pointer RQ2C4F artifact disagree');
assert.match(rq2c4f?.outcome ?? '', /87\.3%/, 'RQ2C4F spin-rate dominance must remain explicit');
assert.equal(rq2c4fClosure?.status, 'RESEARCH_DECISION', 'RQ2C4F ownership closure must remain a research decision');
assert.match(rq2c4fClosure?.decision ?? '', /PARTIAL \/ STOP/, 'RQ2C4F ownership closure must remain partial/stop');

const sentinel = ledger.sentinels?.find((entry) => entry.id === 'RQ2_LONGITUDINAL_SIGN_ASYMMETRY');
assert.ok(sentinel, 'RQ2 longitudinal sign-asymmetry sentinel missing');
assert.deepEqual(sentinel.sourceRecords, ['RQ2A', 'RQ2B'], 'RQ2 sentinel source records drifted');
assert.ok(sentinel.reference?.driveBrakeMaxSlipRatio > 20, 'RQ2 asymmetry sentinel must remain materially visible');

for (const document of documents) {
  assert.equal(typeof document, 'string', 'document path must be a string');
  await access(document);
}
await access(pointer.activeApparatus.frozenSuite);
await access(pointer.activeApparatus.rq2cSuite);
await access(pointer.activeApparatus.rq2c4fClosurePatch);
await access(pointer.activeApparatus.replayContract);

console.log('WHEEL_MODE5_EVIDENCE_LEDGER_SUMMARY', JSON.stringify({
  schemaVersion: ledger.schemaVersion,
  milestone: milestone.id,
  milestoneStatus: milestone.status,
  activeStage: pointer.stage,
  activeResearchBranch: pointer.activeResearchBranch,
  nextGate: pointer.nextGate,
  latestEvidence: latest.id,
  latestStatus: latest.status,
  sourceOwnership: sourceClosure.classification,
  recordCount: ledger.records.length,
  canonicalProductMain: ledger.canonicalProductMain,
}));
console.log('WHEEL_MODE5_EVIDENCE_LEDGER_OK');

import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));

assert.equal(ledger.schemaVersion, 1, 'unexpected ledger schema');
assert.equal(ledger.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22', 'product authority drifted');
assert.ok(Array.isArray(ledger.records), 'records missing');
assert.ok(ledger.records.some((r) => r.id === 'RH0_5_ORIENTATION_DESIGN'), 'RH0.5 record missing');

const newIds = [
  'RQ2C0_TRANSLATIONALLY_FREE_CONTROL',
  'RQ2C1_LOCAL_TRANSLATIONAL_CARRIER',
  'RQ2C1D_CONSTRAINT_LOCALIZATION',
  'RQ2C2_MAX_NATIVE_CARRIER',
  'RQ2C3_DIRECT_LOCAL_AXIS_GUIDE',
  'RQ2C4_ENGINE_NATIVE_HARD_RELAX',
  'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT',
  'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION',
];
for (const id of newIds) assert.equal(ledger.records.some((r) => r.id === id), false, `${id} already present`);

const records = [
  {
    id: 'RQ2C0_TRANSLATIONALLY_FREE_CONTROL', lane: 'donor_outer_carrier_dynamics', status: 'APPARATUS_INVALID',
    question: 'Can the post-RH0 local-axis mount remove the historical world linear-Z lock and still reproduce RQ0-like straight rolling at 0 degrees before yaw?',
    dependsOn: ['RH0_5_ORIENTATION_DESIGN', 'RH0_CANONICAL_SUITE_REPLAY'], executedSource: '8deae32ff31ed6229b3add1837dae7f6d4ef685f', run: 33965636922, job: 101305157701, artifact: 9969338989,
    document: 'docs/WHEEL_MODE5_RQ2C0_TRANSLATIONALLY_FREE_CONTROL_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Contact/vertical and 120 Hz angular guide remained healthy, but free translation produced max heading error 0.858248 degrees, max cross-heading speed 14.980474 mm/s, max cross-track 3.792284 mm and max slip 0.0268817 mm/s.',
    scope: '0-degree apparatus control only; yaw pair skipped.', routing: 'Add mechanically local translational cross-heading guidance; do not route to higher angular stiffness.'
  },
  {
    id: 'RQ2C1_LOCAL_TRANSLATIONAL_CARRIER', lane: 'donor_outer_carrier_dynamics', status: 'APPARATUS_INVALID',
    question: 'Can a local H-prismatic -> Y-prismatic -> spherical-center helper-body carrier remove cross-heading drift while preserving heading/vertical travel and free wheel spin?',
    dependsOn: ['RQ2C0_TRANSLATIONALLY_FREE_CONTROL'], executedSource: 'f7ef795bedd4a5821556fc32bf953505d681c8d5', run: 33966506853, job: 101307463007, artifact: 9969617033,
    document: 'docs/WHEEL_MODE5_RQ2C1_LOCAL_TRANSLATIONAL_CARRIER_CONTROL_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Contact/vertical and angular guide remained healthy, but carrier failed with max heading error 1.31736 degrees, max cross-heading speed 22.9966 mm/s, max slip 0.0393391 mm/s and max center error 1.48364 mm.',
    scope: '0-degree apparatus control only; yaw pair skipped.'
  },
  {
    id: 'RQ2C1D_CONSTRAINT_LOCALIZATION', lane: 'donor_outer_carrier_dynamics', status: 'TRUSTED_DIAGNOSTIC',
    question: 'Where does forbidden cross-heading error accumulate in the failed RQ2C1 multi-joint carrier?', dependsOn: ['RQ2C1_LOCAL_TRANSLATIONAL_CARRIER'],
    executedSource: '2c54b4960c58cb7ca56d5f1583227ad0ba637958', run: 33966947600, job: 101308634219, artifact: 9969749303,
    document: 'docs/WHEEL_MODE5_RQ2C1D_CONSTRAINT_LOCALIZATION_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'RQ2C1 primary non-drift confirmed. Forbidden cross-heading displacement accumulated across every translational stage; pinned generic joint default softness was localized as a concrete mechanism capable of producing the chain compliance.',
    scope: 'Read-only diagnostic rerun of already-failed RQ2C1 physics.'
  },
  {
    id: 'RQ2C2_MAX_NATIVE_CARRIER', lane: 'donor_outer_carrier_dynamics', status: 'APPARATUS_INVALID',
    question: 'Can the RQ2C1 multi-joint carrier qualify at the strongest effective generic-constraint stiffness natively available in the pinned solver?', dependsOn: ['RQ2C1D_CONSTRAINT_LOCALIZATION'],
    executedSource: 'f3766ecfbaf447bbad7b13ea5014e47a40537cc5', run: 33967366019, job: 101309730438, artifact: 9969876657,
    document: 'docs/WHEEL_MODE5_RQ2C2_MAX_NATIVE_CARRIER_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: '240 Hz generic constraints reduced center/cross-track compliance but worsened heading speed/error and slip. Multi-joint carrier topology falsified for this qualification.',
    scope: '0-degree maximum-native falsifier; yaw pair skipped.', routing: 'Close generic hertz sweep and helper-body carrier; seek one direct local translational constraint.'
  },
  {
    id: 'RQ2C3_DIRECT_LOCAL_AXIS_GUIDE', lane: 'donor_outer_carrier_dynamics', status: 'APPARATUS_INVALID',
    question: 'Can one direct scalar local translational guide replace the falsified helper-body chain while preserving the existing angular guide and rolling freedoms?', dependsOn: ['RQ2C2_MAX_NATIVE_CARRIER'],
    executedSource: '09712c613218f5b6bb40927673f714fd364f2bdf', run: 33968208611, job: 101311971290, artifact: 9970119510,
    artifactDigest: 'sha256:f2886dd200b507b9af384f5e64e5d1c0ccdefbeff089fbb2ad9c0b998785a2c2', document: 'docs/WHEEL_MODE5_RQ2C3_DIRECT_LOCAL_AXIS_GUIDE_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Direct one-axis topology removed material positional wandering, but soft relaxation left max heading error 0.04951397 degrees and max slip 0.03457069 mm/s; 0-degree control failed.',
    scope: 'Direct research-only guide, 0 degrees only; yaw pair skipped.', routing: 'Test engine-native hard-relax semantics without changing topology, parameters or gates.'
  },
  {
    id: 'RQ2C4_ENGINE_NATIVE_HARD_RELAX', lane: 'donor_outer_carrier_dynamics', status: 'TRUSTED_EXECUTED_SCOPED',
    question: 'Does making the direct scalar guide follow pinned hard-equality relaxation semantics remove RQ2C3 residual heading error without changing the physical scenario?', dependsOn: ['RQ2C3_DIRECT_LOCAL_AXIS_GUIDE'],
    executedSource: '13dfe885f8d949a25fa057f0cd47c7d86b95d817', run: 33968699659, job: 101313264377, artifact: 9970270283,
    artifactDigest: 'sha256:3551d0009fee9d1da854dda31006fd279f537b8fa9160e6b3c80df39ff591a74', document: 'docs/WHEEL_MODE5_RQ2C4_ENGINE_NATIVE_HARD_RELAX_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Heading/cross-heading guide became effectively exact while legacy max rolling slip remained 0.034689903 mm/s; 0-degree slip gate still failed.',
    scope: 'Trusted 0-degree control; yaw pair skipped.', routing: 'Audit slip instrument on exact same physics before changing any gate or physics.'
  },
  {
    id: 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT', lane: 'donor_outer_carrier_dynamics', status: 'TRUSTED_DIAGNOSTIC',
    question: 'Is the remaining RQ2C4 slip signature mainly a fixed-radius measurement artifact under small angular compliance?', dependsOn: ['RQ2C4_ENGINE_NATIVE_HARD_RELAX'],
    executedSource: '8a65846ff4e2a41a096221e5908f3899f694461b', run: 33969662893, job: 101315812890, artifact: 9970554522,
    artifactDigest: 'sha256:483fc944f7ef55bf4e6f9ba4c400531cb0ab6137027312c334662d3e21bf949c', document: 'docs/WHEEL_MODE5_RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Exact RQ2C4 primary non-drift passed. Actual support-witness max slip 0.034093857 mm/s retained 98.2818% of legacy max, falsifying fixed-radius artifact as the primary blocker.', scope: 'Read-only telemetry on exact RQ2C4 0-degree physics.'
  },
  {
    id: 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION', lane: 'donor_outer_carrier_dynamics', status: 'TRUSTED_DIAGNOSTIC',
    question: 'Does the real support-witness residual come mainly from rolling-pair closure error or non-spin/nutation angular velocity?', dependsOn: ['RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT_AUDIT'],
    executedSource: '14b500c7f174c7107316fd9b31ef92b74964f501', run: 33971215026, job: 101319952137, artifact: 9970989529,
    artifactDigest: 'sha256:6ed6bdb6d137b575b3136364e55ec988e242a93ef404c9510c780a3863b283c4', document: 'docs/WHEEL_MODE5_RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION_RESULT_2026-09-05.md', physicsExecuted: true,
    outcome: 'Rigid-body reconstruction passed. At peak witness 0.034093857 mm/s, rolling pair contributed +0.034570694 mm/s while non-spin contributed -0.000464480 mm/s. Maximum blocker is rolling-pair dominant.',
    scope: 'Read-only decomposition on exact RQ2C4D 0-degree physics; not contact-solver causality.', routing: 'Do not run a 240 Hz angular comparison now. Next localize rolling-pair closure into COM tangential velocity, axle spin rate and exact support/spin-lever evolution.'
  }
];

for (const record of records) {
  if (record.document) await access(record.document);
  ledger.records.push(record);
}

ledger.activeResearchBranch = 'research/wheel-mode5-rq2c-orientation-2026-09-05';
ledger.archivalResearchAncestor = 'work/wheel-mode5-e2a-outer-ground-dynamic-2026-09-03';
delete ledger.plannedContinuationBranch;
ledger.activeResearchPointer = 'docs/evidence/WHEEL_MODE5_ACTIVE_RESEARCH_POINTER_2026-09-05.json';
ledger.activeApparatus = {
  ...ledger.activeApparatus,
  status: 'CANONICAL_RH0_BASE_WITH_RQ2C4D_E_DIAGNOSTIC_EXTENSION',
  currentExtension: {
    rq2cSuite: 'tools/wheel-mode5/rq2c/wheel-mode5-rq2c-orientation-suite.hpp',
    rq2c3Suite: 'tools/wheel-mode5/rq2c3/wheel-mode5-rq2c3-direct-guide-suite.hpp',
    rq2c3Patch: 'tools/wheel-mode5/rq2c3/patch-rq2c3-parallel-linear-guide.py',
    rq2c4Patch: 'tools/wheel-mode5/rq2c4/patch-rq2c4-parallel-hard-relax.py',
    rq2c4dInstrumentPatch: 'tools/wheel-mode5/rq2c4d/patch-rq2c4d-slip-instrument.py',
    rq2c4eLocalizationPatch: 'tools/wheel-mode5/rq2c4e/patch-rq2c4e-angular-contributions.py'
  },
  rule: 'New donor-carrier research extends the explicit RH0 suite. Historical RQ0/RQ1/RQ2 string-patch chains remain provenance only. RQ2C4D/E are transient read-only diagnostics on exact RQ2C4 physics.'
};
ledger.currentMilestone = {
  id: 'RQ2C_ORIENTATION', name: 'Bounded orientation/mount qualification', status: 'BLOCKED_AT_0DEG_ROLLING_PAIR_LOCALIZATION',
  blocksNewPhysics: true, blocksYaw: true, blocksReadOnlyDiagnostics: false,
  progress: {
    RH0_foundation: 'CLOSED_PASS', RQ2C0_fullyFreeControl: 'APPARATUS_INVALID_TRANSLATIONALLY_FREE_CONTROL', RQ2C1_localCarrier: 'APPARATUS_INVALID',
    RQ2C1D_constraintLocalization: 'TRUSTED_DIAGNOSTIC_CHAIN_COMPLIANCE_LOCALIZED', RQ2C2_maxNativeCarrier: 'APPARATUS_INVALID_MULTI_JOINT_CARRIER_TOPOLOGY_FALSIFIED',
    RQ2C3_directGuide: 'APPARATUS_INVALID_SOFT_EQUALITY_CONTROL_FAIL', RQ2C4_hardRelax: 'HEADING_PASS_SLIP_GATE_FAIL',
    RQ2C4D_actualWitnessAudit: 'FIXED_RADIUS_ARTIFACT_NOT_PRIMARY', RQ2C4E_angularLocalization: 'MAX_WITNESS_RESIDUAL_ROLLING_PAIR_DOMINANT'
  },
  frozenChallenge: { yawDegrees: [0, 3.5, -3.5], maxAxisErrorDegrees: 0.035, maxHeadingErrorDegrees: 0.035, maxRollingSlipMmPerS: 0.002 },
  currentEvidence: { actualWitnessMaxSlipMmPerS: 0.03409385681152344, gateExceedance: 17.04692840576172, peakRollingPairMmPerS: 0.03457069396972656, peakNonSpinMmPerS: -0.0004644800242203928 },
  next: 'Execute one predeclared read-only RQ2C4F rolling-pair closure localization on exact RQ2C4D/E 0-degree physics. Separate COM tangential-velocity drift, axle-spin-rate drift and exact geometric spin-lever drift relative to initialized rolling closure. Preserve RH0 and D/E non-drift barriers. Do not run yaw, tune stiffness, alter contact/solver physics or relax gates.'
};

const ids = ledger.records.map((r) => r.id);
assert.equal(new Set(ids).size, ids.length, 'duplicate record ids');
for (const record of ledger.records) assert.ok(ledger.statusVocabulary.includes(record.status), `unknown status ${record.id}:${record.status}`);
for (const id of newIds) assert.ok(ids.includes(id), `missing ${id}`);
assert.equal(ledger.records.at(-1).id, 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION');
assert.equal(ledger.currentMilestone.id, 'RQ2C_ORIENTATION');
assert.equal(ledger.currentMilestone.blocksYaw, true);

await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log('WHEEL_MODE5_LEDGER_REFRESH_OK', JSON.stringify({ records: ids.length, tail: ids.slice(-8), milestone: ledger.currentMilestone.status }));

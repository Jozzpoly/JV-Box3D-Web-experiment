import assert from 'node:assert/strict';
import { access, readFile, writeFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));

assert.equal(ledger.schemaVersion, 1, 'unexpected ledger schema');
assert.equal(ledger.canonicalProductMain, '5b28cc03d22264010680deb95a04abd04661bc22', 'product authority drifted');
assert.equal(ledger.activeResearchBranch, 'research/wheel-mode5-rq2c-orientation-2026-09-05', 'active research branch drifted');
assert.ok(Array.isArray(ledger.records), 'records missing');
assert.equal(ledger.records.length, 23, `record count drift ${ledger.records.length}`);
assert.equal(ledger.records.at(-1)?.id, 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION', 'ledger tail drifted');
assert.equal(ledger.currentMilestone?.id, 'RQ2C_ORIENTATION', 'milestone id drifted');

const newIds = [
  'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION',
  'RQ2C4F_SOURCE_OWNERSHIP_CLOSURE',
];
for (const id of newIds) {
  assert.equal(ledger.records.some((r) => r.id === id), false, `${id} already present`);
}

const records = [
  {
    id: 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION',
    lane: 'donor_outer_carrier_dynamics',
    status: 'TRUSTED_DIAGNOSTIC',
    question: 'Which initialized-closure term drives the real RQ2C4 rolling-pair residual: COM tangential drift, current-axle spin-rate drift or exact support/spin-lever evolution?',
    dependsOn: ['RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION'],
    executedSource: 'a7d3389edf6c51664d5615d657e879109b161420',
    resultHead: '5ffe5e0f206fc4d7f345ae4f66c7c086ab392ebc',
    run: 33973506632,
    job: 101326068112,
    artifact: 9971633765,
    artifactDigest: 'sha256:e0e32986831498022e0f05ae1bae039d3c6e48e136b335f90a3c4a588ff48c4a',
    document: 'docs/WHEEL_MODE5_RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION_RESULT_2026-09-05.md',
    physicsExecuted: true,
    outcome: 'Initialized rolling pair is exactly closed. At peak rolling-pair residual +0.034570694 mm/s, COM tangential drift contributes +0.004529953 mm/s, axle-spin-rate evolution +0.030174406 mm/s and geometric lever evolution -0.000109348 mm/s. Spin-rate evolution supplies about 87.3% of the peak rolling-pair magnitude.',
    scope: 'Read-only 0-degree kinematic localization on exact RQ2C4D/E physics. Actual-support max slip remains 0.034093857 mm/s, 17.0469x above the frozen 0.002 mm/s gate. This is not contact-solver causality and yaw was not executed.',
    routing: 'Use source review only to identify plausible/direct ownership paths. Do not infer exact per-subsystem solver causality from post-step kinematics.'
  },
  {
    id: 'RQ2C4F_SOURCE_OWNERSHIP_CLOSURE',
    lane: 'donor_outer_carrier_dynamics',
    status: 'RESEARCH_DECISION',
    question: 'Does source inspection close enough ownership of the RQ2C4F spin-rate drift to justify another solver-level diagnostic before ending routine micro-forensics?',
    dependsOn: ['RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION'],
    document: 'docs/WHEEL_MODE5_RQ2C4F_SOURCE_OWNERSHIP_CLOSURE_2026-09-05.md',
    physicsExecuted: false,
    decision: 'PARTIAL / STOP. Contact tangential friction is the unique obvious first-order direct axle-torque path in the exact aligned apparatus, but finite joint/inertia/gyroscopic numerical coupling is not proven identically zero and the exact per-substep Delta-omega budget is not closed.',
    scope: 'Source-grounded ownership boundary only; not a causal solver PASS.',
    reopenTrigger: 'Reopen exact solver ownership only if a later decision depends on salvaging this direct-guide qualification, or representative vehicle evidence makes the residual materially consequential for grip, energy, handling or Owner-observable behavior.'
  }
];

for (const record of records) {
  await access(record.document);
  ledger.records.push(record);
}

ledger.activeApparatus = {
  ...ledger.activeApparatus,
  status: 'CANONICAL_RH0_BASE_WITH_RQ2C4D_E_F_DIAGNOSTIC_EXTENSION',
  currentExtension: {
    ...(ledger.activeApparatus?.currentExtension ?? {}),
    rq2c4fClosurePatch: 'tools/wheel-mode5/rq2c4f/patch-rq2c4f-rolling-pair-closure.py'
  },
  rule: 'The explicit RH0 suite remains the hardened donor-carrier replay base. RQ2C4D/E/F are transient read-only diagnostics on exact RQ2C4 physics. The RQ2C orientation micro-line is closed at zero-degree HOLD; do not extend it automatically.'
};

ledger.currentMilestone = {
  id: 'RQ2C_ORIENTATION',
  name: 'Bounded orientation/mount qualification',
  status: 'CLOSED_HOLD_AT_0DEG_SLIP_GATE',
  closed: true,
  blocksNewPhysics: true,
  blocksYaw: true,
  blocksReadOnlyDiagnostics: false,
  progress: {
    RH0_foundation: 'CLOSED_PASS',
    RQ2C0_fullyFreeControl: 'APPARATUS_INVALID_TRANSLATIONALLY_FREE_CONTROL',
    RQ2C1_localCarrier: 'APPARATUS_INVALID',
    RQ2C1D_constraintLocalization: 'TRUSTED_DIAGNOSTIC_CHAIN_COMPLIANCE_LOCALIZED',
    RQ2C2_maxNativeCarrier: 'APPARATUS_INVALID_MULTI_JOINT_CARRIER_TOPOLOGY_FALSIFIED',
    RQ2C3_directGuide: 'APPARATUS_INVALID_SOFT_EQUALITY_CONTROL_FAIL',
    RQ2C4_hardRelax: 'HEADING_PASS_SLIP_GATE_FAIL',
    RQ2C4D_actualWitnessAudit: 'FIXED_RADIUS_ARTIFACT_NOT_PRIMARY',
    RQ2C4E_angularLocalization: 'MAX_WITNESS_RESIDUAL_ROLLING_PAIR_DOMINANT',
    RQ2C4F_closureLocalization: 'TRUSTED_DIAGNOSTIC_SPIN_RATE_DRIFT_DOMINANT',
    RQ2C4F_sourceOwnership: 'PARTIAL_CONTACT_FRICTION_DIRECT_ROUTINE_FORENSICS_CLOSED'
  },
  frozenChallenge: {
    yawDegrees: [0, 3.5, -3.5],
    maxAxisErrorDegrees: 0.035,
    maxHeadingErrorDegrees: 0.035,
    maxRollingSlipMmPerS: 0.002
  },
  currentEvidence: {
    actualWitnessMaxSlipMmPerS: 0.03409385681152344,
    gateExceedance: 17.04692840576172,
    peakRollingPairMmPerS: 0.03457069396972656,
    peakComDriftMmPerS: 0.004529953,
    peakSpinRateContributionMmPerS: 0.030174406,
    peakLeverContributionMmPerS: -0.000109348,
    sourceOwnershipClassification: 'RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT'
  },
  next: null,
  routing: 'Do not automatically build solver-level ownership instrumentation, run +/-3.5-degree yaw, tune stiffness/contact/solver physics, relax gates or promote wheel-mode5. Re-ground at broader JV-Web level and choose the next work from current Owner priorities.'
};

const ids = ledger.records.map((r) => r.id);
assert.equal(new Set(ids).size, ids.length, 'duplicate record ids');
for (const record of ledger.records) {
  assert.ok(ledger.statusVocabulary.includes(record.status), `unknown status ${record.id}:${record.status}`);
}
for (const id of newIds) assert.ok(ids.includes(id), `missing ${id}`);
assert.equal(ledger.records.length, 25, 'final record count drift');
assert.equal(ledger.records.at(-1).id, 'RQ2C4F_SOURCE_OWNERSHIP_CLOSURE', 'final tail drift');
assert.equal(ledger.currentMilestone.status, 'CLOSED_HOLD_AT_0DEG_SLIP_GATE');
assert.equal(ledger.currentMilestone.closed, true);
assert.equal(ledger.currentMilestone.blocksYaw, true);
assert.equal(ledger.currentMilestone.next, null);

await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
console.log('WHEEL_MODE5_LEDGER_RQ2C4F_HOLD_REFRESH_OK', JSON.stringify({
  records: ids.length,
  tail: ids.slice(-4),
  milestone: ledger.currentMilestone.status,
  next: ledger.currentMilestone.next
}));

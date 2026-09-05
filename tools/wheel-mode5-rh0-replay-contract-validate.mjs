import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledgerPath = 'docs/evidence/WHEEL_MODE5_CANONICAL_EVIDENCE_LEDGER_2026-09-05.json';
const contractPath = 'docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json';

const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
const contract = JSON.parse(await readFile(contractPath, 'utf8'));

assert.equal(contract.schemaVersion, 1, 'unsupported replay contract schema');
assert.equal(contract.dependencies?.canonicalProductMain, ledger.canonicalProductMain, 'replay/product authority drifted');
assert.equal(contract.dependencies?.box3dJs, '2617a0ff763a60c9f17cee57c6ea72aab75a5077', 'pinned box3d.js drifted');
assert.equal(contract.dependencies?.vendorBox3d, '8441b4a06d6d09dcfb0b0f704df4d847d1437b92', 'pinned vendor Box3D drifted');
assert.match(contract.purpose ?? '', /not product acceptance thresholds/i, 'replay contract must remain non-product scope');

const evidenceIds = new Set(ledger.records.map((record) => record.id));
const scenarioIds = new Set();

const validateGate = (scenarioId, gate) => {
  assert.ok(gate && typeof gate === 'object' && !Array.isArray(gate), `${scenarioId}: gate missing`);
  const entries = Object.entries(gate);
  assert.ok(entries.length > 0, `${scenarioId}: empty gate`);

  for (const [metric, rule] of entries) {
    assert.ok(rule && typeof rule === 'object' && !Array.isArray(rule), `${scenarioId}.${metric}: rule must be object`);
    const keys = Object.keys(rule);
    assert.ok(keys.length > 0, `${scenarioId}.${metric}: empty rule`);
    for (const key of keys) {
      assert.ok(['eq', 'min', 'max'].includes(key), `${scenarioId}.${metric}: unsupported rule ${key}`);
      const value = rule[key];
      assert.ok(typeof value === 'number' || typeof value === 'boolean', `${scenarioId}.${metric}.${key}: invalid value type`);
      if (typeof value === 'number') assert.ok(Number.isFinite(value), `${scenarioId}.${metric}.${key}: non-finite value`);
    }
    if ('min' in rule && 'max' in rule) {
      assert.ok(rule.min <= rule.max, `${scenarioId}.${metric}: min > max`);
    }
  }
};

for (const scenario of contract.scenarios) {
  assert.equal(typeof scenario.id, 'string', 'scenario id missing');
  assert.ok(!scenarioIds.has(scenario.id), `duplicate replay scenario ${scenario.id}`);
  scenarioIds.add(scenario.id);
  assert.ok(evidenceIds.has(scenario.sourceRecord), `${scenario.id}: source evidence ${scenario.sourceRecord} missing from ledger`);
  validateGate(scenario.id, scenario.gate);
}

const requiredScenarios = [
  'RQ0_MATCHED',
  'RQ0_ZERO_SPIN_POSITIVE_CONTROL',
  'RQ1C_FLAT_CONTROL',
  'RQ1C_30URAD',
  'RQ2A_BRAKE20',
  'RQ2B_DRIVE20',
];
for (const id of requiredScenarios) {
  assert.ok(scenarioIds.has(id), `required canonical replay scenario missing: ${id}`);
}

const rq1c = contract.scenarios.find((scenario) => scenario.id === 'RQ1C_30URAD');
assert.equal(rq1c.reference?.roadTopPlaneCount, 2, 'RQ1C topology identity drifted');
assert.equal(rq1c.gate?.settledFeatureSetChanges?.eq, 1, 'RQ1C expected feature transition drifted');
assert.ok(rq1c.gate?.postMeanNormalXMicroRad?.min <= -29.9 && rq1c.gate?.postMeanNormalXMicroRad?.max >= -30.1,
  'RQ1C normal-shift gate no longer brackets canonical 30 urad transition');

const brake = contract.scenarios.find((scenario) => scenario.id === 'RQ2A_BRAKE20');
const drive = contract.scenarios.find((scenario) => scenario.id === 'RQ2B_DRIVE20');
assert.ok(brake.reference?.vxDelta < 0, 'RQ2A braking direction drifted');
assert.ok(drive.reference?.vxDelta > 0, 'RQ2B drive direction drifted');
assert.ok(brake.reference?.omegaDelta > 0, 'RQ2A spin response drifted');
assert.ok(drive.reference?.omegaDelta < 0, 'RQ2B spin response drifted');
assert.ok(drive.reference?.pulseMaxAbsSlipMmPerS > brake.reference?.pulseMaxAbsSlipMmPerS * 20,
  'RQ2 sign-asymmetry reference was erased');

const sentinelIds = new Set();
for (const sentinel of contract.crossScenarioSentinels ?? []) {
  assert.equal(typeof sentinel.id, 'string', 'sentinel id missing');
  assert.ok(!sentinelIds.has(sentinel.id), `duplicate sentinel ${sentinel.id}`);
  sentinelIds.add(sentinel.id);
  validateGate(`sentinel:${sentinel.id}`, { value: sentinel.gate });
}
assert.ok(sentinelIds.has('RQ2_DRIVE_BRAKE_MAX_SLIP_RATIO'), 'RQ2 drive/brake slip sentinel missing');

console.log('WHEEL_MODE5_RH0_REPLAY_CONTRACT_SUMMARY', JSON.stringify({
  schemaVersion: contract.schemaVersion,
  scenarioCount: contract.scenarios.length,
  sentinelCount: (contract.crossScenarioSentinels ?? []).length,
  productMain: contract.dependencies.canonicalProductMain,
  box3dJs: contract.dependencies.box3dJs,
  vendorBox3d: contract.dependencies.vendorBox3d,
}));
console.log('WHEEL_MODE5_RH0_REPLAY_CONTRACT_OK');

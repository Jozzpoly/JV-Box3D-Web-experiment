import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const resultPath = process.argv[2] ?? 'rh0-canonical-rq-replay-result.json';
const contractPath = 'docs/evidence/WHEEL_MODE5_RH0_CANONICAL_REPLAY_CONTRACT_2026-09-05.json';

const result = JSON.parse(await readFile(resultPath, 'utf8'));
const contract = JSON.parse(await readFile(contractPath, 'utf8'));

assert.equal(result.schemaVersion, 1, 'unsupported replay result schema');
assert.equal(result.contractSchemaVersion, contract.schemaVersion, 'result/contract schema mismatch');
assert.equal(result.dependencies?.box3dJs, contract.dependencies.box3dJs, 'result box3d.js provenance drifted');
assert.equal(result.dependencies?.vendorBox3d, contract.dependencies.vendorBox3d, 'result vendor Box3D provenance drifted');
assert.ok(result.scenarios && typeof result.scenarios === 'object', 'result scenarios missing');

const failures = [];

const compareRule = (context, observed, rule) => {
  if (typeof observed !== 'number' && typeof observed !== 'boolean') {
    failures.push(`${context}: missing/non-scalar observed value ${JSON.stringify(observed)}`);
    return;
  }
  if (typeof observed === 'number' && !Number.isFinite(observed)) {
    failures.push(`${context}: observed value is non-finite`);
    return;
  }
  if ('eq' in rule && observed !== rule.eq) {
    failures.push(`${context}: observed=${observed} expected eq ${rule.eq}`);
  }
  if ('min' in rule && !(observed >= rule.min)) {
    failures.push(`${context}: observed=${observed} expected >= ${rule.min}`);
  }
  if ('max' in rule && !(observed <= rule.max)) {
    failures.push(`${context}: observed=${observed} expected <= ${rule.max}`);
  }
};

for (const scenarioContract of contract.scenarios) {
  const observedScenario = result.scenarios[scenarioContract.id];
  if (!observedScenario) {
    failures.push(`${scenarioContract.id}: scenario missing from replay result`);
    continue;
  }
  for (const [metric, rule] of Object.entries(scenarioContract.gate)) {
    compareRule(`${scenarioContract.id}.${metric}`, observedScenario[metric], rule);
  }
}

const readScenarioMetricPath = (path) => {
  const dot = path.indexOf('.');
  if (dot < 1) throw new Error(`invalid scenario metric path: ${path}`);
  const scenarioId = path.slice(0, dot);
  const metric = path.slice(dot + 1);
  const scenario = result.scenarios[scenarioId];
  if (!scenario) throw new Error(`sentinel scenario missing: ${scenarioId}`);
  const value = scenario[metric];
  if (!Number.isFinite(value)) throw new Error(`sentinel metric missing/non-finite: ${path}`);
  return value;
};

const sentinelResults = {};
for (const sentinel of contract.crossScenarioSentinels ?? []) {
  try {
    const numerator = readScenarioMetricPath(sentinel.numerator);
    const denominator = readScenarioMetricPath(sentinel.denominator);
    if (Math.abs(denominator) <= 1e-15) {
      failures.push(`${sentinel.id}: denominator is effectively zero`);
      continue;
    }
    const value = numerator / denominator;
    sentinelResults[sentinel.id] = value;
    compareRule(`sentinel:${sentinel.id}`, value, sentinel.gate);
  } catch (error) {
    failures.push(`${sentinel.id}: ${error.message}`);
  }
}

const summary = {
  method: result.method,
  executedSource: result.executedSource ?? null,
  scenarioCount: Object.keys(result.scenarios).length,
  contractedScenarioCount: contract.scenarios.length,
  sentinelResults,
  failureCount: failures.length,
};

console.log('WHEEL_MODE5_RH0_REPLAY_VALIDATION_SUMMARY', JSON.stringify(summary));
if (failures.length > 0) {
  console.error('WHEEL_MODE5_RH0_REPLAY_VALIDATION_FAILURES');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('WHEEL_MODE5_RH0_REPLAY_PASS');
}

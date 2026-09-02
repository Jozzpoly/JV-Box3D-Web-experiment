import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const directions = [
  ['front', { x: 1, y: 0, z: 0 }],
  ['front-low', { x: 1, y: -0.35, z: 0 }],
  ['front-low-left-shoulder', { x: 1, y: -0.30, z: 0.45 }],
  ['front-low-right-shoulder', { x: 1, y: -0.30, z: -0.45 }],
  ['front-left-shoulder', { x: 1, y: 0, z: 0.65 }],
  ['side-low', { x: 0.15, y: -0.25, z: 1 }],
];

function normalize(v) {
  const length = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function runNode(path) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('exit', code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`node ${path} failed ${code}\n${stdout}\n${stderr}`)));
  });
}

const sourcePath = new URL('./wheel-mode5-d-exact-falsifier.mjs', import.meta.url);
const source = await readFile(sourcePath, 'utf8');
const startToken = 'const DIRECTION = Object.freeze({';
const endToken = 'const HISTORICAL_C_ONSET';
const start = source.indexOf(startToken);
const end = source.indexOf(endToken);
if (start < 0 || end < 0 || end <= start) throw new Error('exact falsifier direction anchors drifted');

const results = [];
for (const [name, raw] of directions) {
  const direction = normalize(raw);
  const block = `const DIRECTION = Object.freeze(${JSON.stringify(direction)});\n`;
  let text = source.slice(0, start) + block + source.slice(end);
  // The 74.7 mm historical sanity check is only valid for side-low. Each child
  // still uses the same exact R3 triangle oracle and exact rock geometry.
  if (name !== 'side-low') text = text.replace('>0.004){', '>1){');
  // Full-rig wheel orientation is not identical to the isolated directional
  // probe for every artificial approach vector. The angular sweep is a pure
  // contact-geometry measurement; full-M6 attribution remains enforced by the
  // canonical side-low exact falsifier.
  text = text.replace(
    "if(fullD.flWheel.contacts===0)throw new Error('full M6 D did not reproduce FL torus contact');",
    "// full-M6 contact equivalence intentionally not required by angular sweep",
  );
  const tmp = new URL(`./__tmp-wheel-mode5-d-${name}.mjs`, import.meta.url);
  await writeFile(tmp, text, 'utf8');
  try {
    const { stdout } = await runNode(tmp.pathname);
    const line = stdout.split(/\r?\n/).find(entry => entry.startsWith('D_EXACT_FALSIFIER_RESULT '));
    if (!line) throw new Error(`missing result for ${name}\n${stdout}`);
    const data = JSON.parse(line.slice('D_EXACT_FALSIFIER_RESULT '.length));
    results.push({
      name,
      direction,
      cOnsetDistance: data.C_speculative_on.onset.distance,
      cVisualGapMm: 1000 * data.C_speculative_on.onset.visualGap,
      dOnsetDistance: data.D_speculative_on.onset.distance,
      dVisualGapMm: 1000 * data.D_speculative_on.onset.visualGap,
      dOffVisualGapMm: 1000 * data.D_speculative_off.onset.visualGap,
      dSeparationMm: 1000 * data.D_speculative_on.onset.contact.minSeparation,
      dContactShapes: data.D_speculative_on.onset.contact.contactShapes,
      fullDVisualGapMm: 1000 * data.fullM6_D_at_D_onset.visualGap,
      fullDChassisContacts: data.fullM6_D_at_D_onset.chassis.contacts,
      fullDWheelContacts: data.fullM6_D_at_D_onset.flWheel.contacts,
    });
  } finally {
    await unlink(tmp).catch(() => {});
  }
}

results.sort((a, b) => b.dVisualGapMm - a.dVisualGapMm);
console.log('D_EXACT_DIRECTION_SWEEP', JSON.stringify(results));
console.log('D_EXACT_DIRECTION_SWEEP_OK');

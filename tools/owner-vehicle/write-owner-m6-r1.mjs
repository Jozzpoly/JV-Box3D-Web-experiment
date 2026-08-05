import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { buildOwnerM6RigidPackageR1 } from './blockbench-owner-m6-r1.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1] ?? null;
}

const sourceRootValue = argument('--source-root') ?? process.env.JOZZ_VEHICLE_SOURCE_ROOT ?? null;
if (sourceRootValue === null) {
  throw new Error('Owner vehicle source root is required through --source-root or JOZZ_VEHICLE_SOURCE_ROOT.');
}
const sourceRoot = resolve(sourceRootValue);
const outputRoot = resolve(argument('--output-root') ?? 'public/vehicles/m6-owner-r1');
const chassisPath = join(sourceRoot, 'Nadwozie.gltf');
const wheelPath = join(sourceRoot, 'Offroad_Big_Wheels.gltf');
const [chassisText, wheelText] = await Promise.all([
  readFile(chassisPath, 'utf8'),
  readFile(wheelPath, 'utf8'),
]);
const result = buildOwnerM6RigidPackageR1({ chassisText, wheelText });
const modelDirectory = join(outputRoot, 'models');
await mkdir(modelDirectory, { recursive: true });
await Promise.all([
  writeFile(join(modelDirectory, 'm6-owner-rigid-r1.glb'), result.glb),
  writeFile(join(outputRoot, 'm6-owner-rigid-r1.visual.json'), result.manifestText, 'utf8'),
  writeFile(join(outputRoot, 'm6-owner-rigid-r1.report.json'), `${JSON.stringify(result.report, null, 2)}\n`, 'utf8'),
]);
console.log(`Owner M6 R1 written: ${result.glb.byteLength} bytes · ${result.report.output.sha256}`);
console.log(`Chassis: ${result.report.chassis.vertexCount} vertices · ${result.report.chassis.triangleCount} triangles`);
console.log(`Wheel:   ${result.report.wheel.vertexCount} vertices · ${result.report.wheel.triangleCount} triangles`);
console.log(`Output:  ${outputRoot}`);

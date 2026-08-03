import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import Box3D from 'box3d.js/inline';

const SOURCE_ROOT = path.resolve('src');
const LOCAL_COMPATIBILITY_SHIMS = new Set(['b3MulQuat']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs']);

const module = await Box3D();
const usedFunctions = await collectBox3dCalls(SOURCE_ROOT);
const missing = [];

for (const [name, files] of [...usedFunctions.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (typeof module[name] === 'function' || LOCAL_COMPATIBILITY_SHIMS.has(name)) continue;
  missing.push(`${name} (${[...files].sort().join(', ')})`);
}

if (missing.length > 0) {
  throw new Error(
    `Source code calls Box3D functions that box3d.js does not export:\n- ${missing.join('\n- ')}`,
  );
}

runPhysicsSmokeTest(module);
console.log(
  `[box3d-runtime] OK: ${usedFunctions.size} source calls checked; ` +
  `${LOCAL_COMPATIBILITY_SHIMS.size} explicit compatibility shim; WASM smoke test passed.`,
);

async function collectBox3dCalls(root) {
  const calls = new Map();
  const files = await walk(root);
  const callPattern = /\bb3\.(b3[A-Za-z0-9_]+)\s*\(/g;

  for (const file of files) {
    if (!SOURCE_EXTENSIONS.has(path.extname(file))) continue;
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(callPattern)) {
      const name = match[1];
      if (!name) continue;
      const relative = path.relative(process.cwd(), file).replaceAll('\\', '/');
      const locations = calls.get(name) ?? new Set();
      locations.add(relative);
      calls.set(name, locations);
    }
  }

  return calls;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function runPhysicsSmokeTest(b3) {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: -9.81, z: 0 };
  const worldId = b3.b3CreateWorld(worldDef);

  try {
    const groundDef = b3.b3DefaultBodyDef();
    const groundId = b3.b3CreateBody(worldId, groundDef);
    const groundShapeDef = b3.b3DefaultShapeDef();
    b3.b3CreateBoxShape(groundId, groundShapeDef, 4, 0.25, 4);

    const rockDef = b3.b3DefaultBodyDef();
    rockDef.position = { x: 0, y: 0.5, z: 0 };
    const rockBody = b3.b3CreateBody(worldId, rockDef);
    const rockShapeDef = b3.b3DefaultShapeDef();
    const cubeHull = b3.b3CreateHull(new Float32Array([
      -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    ]));
    if (!cubeHull) throw new Error('WASM smoke test could not create a hull.');

    const qYaw = b3.b3MakeQuatFromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI / 6);
    const qTilt = b3.b3MakeQuatFromAxisAngle({ x: 1, y: 0, z: 0 }, Math.PI / 18);
    const q = multiplyQuaternions(qYaw, qTilt);
    assertUnitQuaternion(q);

    b3.b3CreateTransformedHullShape(
      rockBody,
      rockShapeDef,
      cubeHull,
      { p: { x: 0, y: 0, z: 0 }, q },
      { x: 0.2, y: 0.3, z: 0.25 },
    );
    b3.b3DestroyHull(cubeHull);

    const dynamicDef = b3.b3DefaultBodyDef();
    dynamicDef.type = b3.b3BodyType.b3_dynamicBody;
    dynamicDef.position = { x: 0, y: 2, z: 0 };
    const dynamicId = b3.b3CreateBody(worldId, dynamicDef);
    const sphereDef = b3.b3DefaultShapeDef();
    sphereDef.density = 1;
    b3.b3CreateSphereShape(dynamicId, sphereDef, {
      center: { x: 0, y: 0, z: 0 },
      radius: 0.25,
    });

    for (let i = 0; i < 4; i += 1) b3.b3World_Step(worldId, 1 / 60, 4);
    const counters = b3.b3World_GetCounters(worldId);
    if (counters.bodyCount < 3 || counters.shapeCount < 3) {
      throw new Error(`Unexpected WASM smoke-test counters: ${JSON.stringify(counters)}`);
    }
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

function multiplyQuaternions(q1, q2) {
  const cross = {
    x: q1.v.y * q2.v.z - q1.v.z * q2.v.y,
    y: q1.v.z * q2.v.x - q1.v.x * q2.v.z,
    z: q1.v.x * q2.v.y - q1.v.y * q2.v.x,
  };
  return {
    v: {
      x: cross.x + q1.s * q2.v.x + q2.s * q1.v.x,
      y: cross.y + q1.s * q2.v.y + q2.s * q1.v.y,
      z: cross.z + q1.s * q2.v.z + q2.s * q1.v.z,
    },
    s: q1.s * q2.s - (
      q1.v.x * q2.v.x +
      q1.v.y * q2.v.y +
      q1.v.z * q2.v.z
    ),
  };
}

function assertUnitQuaternion(q) {
  const norm = Math.hypot(q.v.x, q.v.y, q.v.z, q.s);
  if (!Number.isFinite(norm) || Math.abs(norm - 1) > 1e-5) {
    throw new Error(`Quaternion compatibility formula failed: norm=${norm}`);
  }
}

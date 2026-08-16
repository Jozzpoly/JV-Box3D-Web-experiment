import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import Box3D from 'box3d.js/inline';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { M6TopologyWorld } from '../.test-dist/vehicle/m6/m6-topology-world.js';

const b3 = await Box3D();
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile(new URL('../public/receipts/jv_m6_factory_receipt.json', import.meta.url), 'utf8'),
);

function qRotate(q, v) {
  const qv = [q.x, q.y, q.z], s = q.w;
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const add = (a,b) => a.map((x,i) => x+b[i]);
  const mul = (a,k) => a.map((x) => x*k);
  const t = mul(cross(qv, v), 2);
  return add(v, add(mul(t, s), cross(qv, t)));
}
function yawDeg(q) {
  const f = qRotate(q, [1,0,0]);
  return Math.atan2(f[2], f[0]) * 180 / Math.PI;
}
function wrapDeg(value) {
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}
function runTurn(sign) {
  const world = new M6TopologyWorld(b3, receipt, 'reference_0_21');
  const vehicle = world.createVehicle({x:0,y:1.2,z:0}, 1);
  try {
    world.step(300);
    vehicle.setSteering({mode:'RELEASE'});
    vehicle.setDrive({throttle:0.30,brake:0});
    world.step(90);
    const pre = vehicle.lastTrace;
    assert.ok(pre);
    vehicle.setSteering({mode:'RATE',value:sign});
    let minContacts = Infinity;
    let trace = null;
    for (let i=0;i<150;i+=1) {
      trace = world.step(1)[0];
      minContacts = Math.min(minContacts, trace.worldContacts);
    }
    assert.ok(trace);
    return {
      minContacts,
      yaw: wrapDeg(yawDeg(trace.chassisRotation) - yawDeg(pre.chassisRotation)),
      rack: trace.rackTranslation,
      flJointDeg: trace.corners[0].steeringJointAngle * 180 / Math.PI,
      frYawDeg: wrapDeg(yawDeg(trace.corners[1].knuckleRotation) - yawDeg(trace.chassisRotation)),
    };
  } finally {
    world.dispose();
  }
}

test('temporary R1 bridge removes one front physical joint without adding bodies or shapes', () => {
  const world = new M6TopologyWorld(b3, receipt, 'reference_0_21');
  try {
    const vehicle = world.createVehicle({x:0,y:1.2,z:0}, 1);
    assert.deepEqual(vehicle.topologyCounts, { bodies:19, joints:28, shapes:9, corners:4 });
  } finally {
    world.dispose();
  }
});

test('temporary R1 bridge remains nearly straight under neutral RATE input', () => {
  const world = new M6TopologyWorld(b3, receipt, 'reference_0_21');
  const vehicle = world.createVehicle({x:0,y:1.2,z:0}, 1);
  try {
    world.step(300);
    vehicle.setSteering({mode:'RELEASE'});
    vehicle.setDrive({throttle:0.30,brake:0});
    const pre = vehicle.lastTrace;
    assert.ok(pre);
    let trace = null;
    for (let i=0;i<240;i+=1) trace = world.step(1)[0];
    assert.ok(trace);
    const yaw = wrapDeg(yawDeg(trace.chassisRotation) - yawDeg(pre.chassisRotation));
    assert.ok(Math.abs(yaw) < 1.5, `straight drift ${yaw} deg`);
    assert.ok(trace.worldContacts >= 4);
  } finally {
    world.dispose();
  }
});

test('temporary R1 bridge gives coherent left/right active turning without claiming final handling', () => {
  const left = runTurn(1);
  const right = runTurn(-1);
  assert.ok(left.minContacts >= 4 && right.minContacts >= 4);
  assert.ok(left.yaw < -15 && right.yaw > 15, `yaw signs/magnitude ${left.yaw}, ${right.yaw}`);
  assert.ok(Math.abs(left.yaw + right.yaw) < 1.5, `yaw mirror residual ${left.yaw + right.yaw}`);
  assert.ok(left.flJointDeg > 10 && right.flJointDeg < -10);
  assert.ok(left.frYawDeg < -10 && right.frYawDeg > 10);
});

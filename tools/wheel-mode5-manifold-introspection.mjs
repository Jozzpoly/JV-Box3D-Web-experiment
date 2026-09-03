import { createE2rWorld } from '../.test-dist/scene/e2r-world.js';
import { validatePinnedNativeFactoryReceiptText } from '../.test-dist/config/native-factory-receipt.js';
import { loadMode5Box3DModule } from '../.test-dist/physics/mode5-box3d-runtime.js';
import { m6TopologyConfigFromReceipt } from '../.test-dist/vehicle/m6/m6-topology-config.js';
import {
  createMode5WheelForGeometry,
  MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
} from '../.test-dist/vehicle/m6/mode5-wheel-backend.js';
import { readFile } from 'node:fs/promises';

const FULL_MASK = 0xffff_ffff_ffff_ffffn;
const receipt = await validatePinnedNativeFactoryReceiptText(
  await readFile('public/receipts/jv_m6_factory_receipt.json', 'utf8'),
);
const config = m6TopologyConfigFromReceipt(receipt);
const b3 = await loadMode5Box3DModule();
const rocks = createE2rWorld().boxes.slice(9);

function norm(v) {
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
}
function scale(s, v) { return { x: s * v.x, y: s * v.y, z: s * v.z }; }
function createStaticBox(worldId, box) {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.position = { ...box.center };
  bodyDef.rotation = {
    v: { x: box.rotation.x, y: box.rotation.y, z: box.rotation.z },
    s: box.rotation.w,
  };
  const bodyId = b3.b3CreateBody(worldId, bodyDef);
  const shapeDef = b3.b3DefaultShapeDef();
  shapeDef.baseMaterial.friction = box.friction ?? 0.8;
  shapeDef.filter.categoryBits = config.terrainCategoryBits;
  shapeDef.filter.maskBits = FULL_MASK;
  shapeDef.enableContactEvents = true;
  const shapeId = b3.b3CreateBoxShape(
    bodyId,
    shapeDef,
    box.halfExtents.x,
    box.halfExtents.y,
    box.halfExtents.z,
  );
  return { bodyId, shapeId };
}
function inspectShape(shapeId) {
  const contacts = b3.createContactsBuffer();
  try {
    b3.getShapeContactData(contacts, shapeId);
    const out = [];
    for (let i = 0; i < b3.getNumContacts(contacts); i += 1) {
      const contact = b3.getContactAt(b3.createContact(), contacts, i);
      const manifolds = [];
      for (let m = 0; m < contact.manifoldCount; m += 1) {
        const manifold = b3.getManifoldAt(b3.createManifold(), contact, m);
        manifolds.push({
          enumerableKeys: Object.keys(manifold),
          normal: manifold.normal,
          pointCount: manifold.pointCount,
          triangleNormal: manifold.triangleNormal ?? null,
          feature: manifold.feature ?? null,
          points: Array.from({ length: manifold.pointCount }, (_, p) => {
            const point = manifold.points[p];
            return {
              enumerableKeys: Object.keys(point),
              point: point.point ?? null,
              anchorA: point.anchorA ?? null,
              anchorB: point.anchorB ?? null,
              separation: point.separation,
              normalImpulse: point.normalImpulse ?? null,
              totalNormalImpulse: point.totalNormalImpulse ?? null,
              id: point.id ?? null,
              persisted: point.persisted ?? null,
            };
          }),
        });
      }
      out.push({ manifoldCount: contact.manifoldCount, manifolds });
    }
    return out;
  } finally {
    b3.destroyContactsBuffer(contacts);
  }
}
function runCase(label, makeOther) {
  const worldDef = b3.b3DefaultWorldDef();
  worldDef.gravity = { x: 0, y: 0, z: 0 };
  worldDef.enableContinuous = false;
  const worldId = b3.b3CreateWorld(worldDef);
  try {
    const wheel = createMode5WheelForGeometry(
      MODE5_SOLVER_AWARE_PROFILE_GEOMETRY,
      b3,
      worldId,
      config,
      { x: 0, y: 0, z: 0 },
      -8101,
    );
    makeOther(worldId);
    const poseBefore = {
      position: b3.b3Body_GetPosition(wheel.bodyId),
      rotation: b3.b3Body_GetRotation(wheel.bodyId),
    };
    b3.b3World_Step(worldId, 1 / 60, 4);
    const report = {
      label,
      wheelBackendId: wheel.backendId,
      rollingShapeIdValid: b3.b3Shape_IsValid(wheel.rollingShapeId),
      poseBefore,
      poseAfter: {
        position: b3.b3Body_GetPosition(wheel.bodyId),
        rotation: b3.b3Body_GetRotation(wheel.bodyId),
      },
      contacts: inspectShape(wheel.rollingShapeId),
    };
    console.log('M6_MANIFOLD_INTROSPECTION', JSON.stringify(report));
    return report;
  } finally {
    b3.b3DestroyWorld(worldId);
  }
}

const sideLow = norm({ x: 0.15, y: -0.25, z: 1 });
const rock = rocks[357];
if (!rock) throw new Error(`missing real rock 357; rock count=${rocks.length}`);
const phantom = runCase('rock357-side-low', (worldId) => {
  createStaticBox(worldId, { ...rock, center: scale(0.31151123, sideLow) });
});
const ground = runCase('flat-ground', (worldId) => {
  createStaticBox(worldId, {
    center: { x: 0, y: -1.0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    halfExtents: { x: 4, y: 0.5, z: 4 },
    friction: 0.8,
  });
});
if (phantom.contacts.length === 0) throw new Error('known phantom case produced no C contact');
if (ground.contacts.length === 0) throw new Error('flat-ground control produced no C contact');
console.log('M6_MANIFOLD_INTROSPECTION_OK');

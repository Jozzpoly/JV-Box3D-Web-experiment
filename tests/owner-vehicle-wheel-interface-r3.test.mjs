import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspectBlockbenchRigidSourceV1 } from '../tools/owner-vehicle/blockbench-gltf-inspector.mjs';
import { inspectBlockbenchRigidPartsV1 } from '../tools/owner-vehicle/blockbench-gltf-rigid-parts.mjs';
import { parseM6FactoryConfig, cornerRestGeometry, requirePiece } from '../tools/owner-vehicle/owner-m6-full-rig-calibration-r2.mjs';
import { deriveFrontSuspensionReferencesR3, calibrateFrontKnucklePieceR3 } from '../tools/owner-vehicle/owner-m6-reference-calibration-r3.mjs';
import {
  deriveWheelMountInterfaceR3,
  wheelVisualLocalFromSourceR3,
  evaluateWheelMountRestR3,
} from '../tools/owner-vehicle/owner-m6-wheel-interface-calibration-r3.mjs';

const WHEEL='assets/owner-vehicle/source/Offroad_Big_Wheels.gltf';
const FRONT='assets/owner-vehicle/source/OneSided_Steering_Suspension_Rig.gltf';
const RECEIPT='public/receipts/jv_m6_factory_receipt.json';

function close(actual, expected, tolerance=1e-9){assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);}
function primitiveAxisRange(primitives,axis){let min=Infinity,max=-Infinity;for(const primitive of primitives){for(let i=0;i<primitive.positions.length;i+=3){const value=primitive.positions[i+axis];min=Math.min(min,value);max=Math.max(max,value);}}return {min,max};}

test('R3 wheel interface keeps physical wheel center distinct from authored mount plane',async()=>{
  const source=inspectBlockbenchRigidSourceV1(await readFile(WHEEL,'utf8'),'Offroad_Big_Wheels.gltf');
  const config=parseM6FactoryConfig(await readFile(RECEIPT,'utf8'));
  const iface=deriveWheelMountInterfaceR3(source,config.wheelRadius,config.wheelWidth);
  close(iface.mountOffsetMeters,0.13125,1e-12);
  assert.deepEqual(iface.mountLocalPosition,[0,0.13124999999999998,0]);
  assert.equal(iface.provenance.mount,'AUTHORED_NODE:Socket_WheelMount');

  for(const corner of ['fl','fr','rl','rr']){
    const geometry=cornerRestGeometry(config,corner);
    const rest=evaluateWheelMountRestR3(corner,iface,geometry);
    close(rest.mountFromWheelCenterMeters,0.13125,1e-12);
    close(rest.mountToKingpinMeters,0.00875,1e-12);
    const local=wheelVisualLocalFromSourceR3(corner,iface);
    assert.deepEqual(local.position,[0,0,0]);
    assert.deepEqual(local.scale,[1,1,1]);
    assert.deepEqual(local.rotation,(corner==='fl'||corner==='rl')?[0,0,0,1]:[1,0,0,0]);
  }
});

test('R3 wheel mount plane sits next to the calibrated hub face instead of at wheel center',async()=>{
  const wheel=inspectBlockbenchRigidSourceV1(await readFile(WHEEL,'utf8'),'Offroad_Big_Wheels.gltf');
  const front=inspectBlockbenchRigidPartsV1(await readFile(FRONT,'utf8'),'OneSided_Steering_Suspension_Rig.gltf');
  const config=parseM6FactoryConfig(await readFile(RECEIPT,'utf8'));
  const iface=deriveWheelMountInterfaceR3(wheel,config.wheelRadius,config.wheelWidth);
  const refs=deriveFrontSuspensionReferencesR3(front);
  const hubPiece=requirePiece(front,'Socket_WheelCenter','front hub');

  for(const corner of ['fl','fr']){
    const geometry=cornerRestGeometry(config,corner);
    const hub=calibrateFrontKnucklePieceR3(hubPiece,refs,geometry);
    const range=primitiveAxisRange(hub.primitives,2);
    const inward=(corner==='fl')?1:-1;
    const hubFace=inward>0?range.max:range.min;
    const expectedMountLocal=inward*iface.mountOffsetMeters;
    const gap=Math.abs(expectedMountLocal-hubFace);
    assert.ok(gap<0.025,`${corner} wheel mount plane should sit within 25 mm of hub face, gap=${gap}`);
    assert.ok(Math.abs(hubFace)>0.10,`${corner} hub face must remain materially offset from wheel center`);
  }
});

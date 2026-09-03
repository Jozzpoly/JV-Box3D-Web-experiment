import Box3D from '../src/physics/vendor/box3d-mode5.inline.mjs';

const b3 = await Box3D();
const names = [
  'b3World_SetPreSolveCallback',
  'b3Shape_GetCapsule',
  'b3Shape_GetType',
  'b3Shape_GetBody',
  'b3Body_GetLocalVector',
  'b3Body_GetLocalPoint',
  'b3Body_GetWorldCenterOfMass',
];
const exports = Object.fromEntries(names.map((name) => [name, typeof b3[name]]));
console.log('TORUS_PRESOLVE_CAPABILITY', JSON.stringify(exports));
for (const name of names) {
  if (typeof b3[name] !== 'function') {
    console.log('TORUS_PRESOLVE_MISSING', name);
  }
}
console.log('TORUS_PRESOLVE_CAPABILITY_OK');

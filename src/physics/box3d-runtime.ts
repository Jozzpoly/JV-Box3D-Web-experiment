import type { Box3DModule, b3Quat } from 'box3d.js';

export type JvBox3DModule = Box3DModule & {
  b3MulQuat(q1: b3Quat, q2: b3Quat): b3Quat;
};

const REQUIRED_RUNTIME_FUNCTIONS = [
  'b3GetVersion',
  'b3DefaultWorldDef',
  'b3CreateWorld',
  'b3DestroyWorld',
  'b3World_Step',
  'b3World_GetCounters',
  'b3World_GetProfile',
  'b3DefaultBodyDef',
  'b3CreateBody',
  'b3DestroyBody',
  'b3DefaultShapeDef',
  'b3CreateBoxShape',
  'b3CreateSphereShape',
  'b3CreateCapsuleShape',
  'b3CreateHull',
  'b3DestroyHull',
  'b3CreateHullShape',
  'b3CreateTransformedHullShape',
  'b3MakeQuatFromAxisAngle',
  'b3RotateVector',
  'b3DefaultDistanceJointDef',
  'b3CreateDistanceJoint',
  'b3DefaultPrismaticJointDef',
  'b3CreatePrismaticJoint',
  'b3DefaultRevoluteJointDef',
  'b3CreateRevoluteJoint',
  'b3DefaultSphericalJointDef',
  'b3CreateSphericalJoint',
  'b3Body_GetPosition',
  'b3Body_GetRotation',
  'b3Body_GetLinearVelocity',
] as const;

/**
 * Establishes the explicit boundary between native Box3D and box3d.js.
 *
 * Native inline helpers are not automatically exported by Emscripten. JV uses
 * b3MulQuat in the C++ map builder, while box3d.js@0.0.2 does not export it.
 * The adapter provides the exact Box3D formula locally and validates the core
 * runtime surface before any world state is allocated.
 */
export function prepareBox3dRuntime(module: Box3DModule): JvBox3DModule {
  let runtime = module as JvBox3DModule;

  if (typeof runtime.b3MulQuat !== 'function') {
    if (Object.isExtensible(module)) {
      Object.defineProperty(module, 'b3MulQuat', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: multiplyQuaternions,
      });
      runtime = module as JvBox3DModule;
    } else {
      runtime = new Proxy(module as JvBox3DModule, {
        get(target, property) {
          if (property === 'b3MulQuat') return multiplyQuaternions;
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    }
  }

  const missing = REQUIRED_RUNTIME_FUNCTIONS.filter(
    (name) => typeof (runtime as unknown as Record<string, unknown>)[name] !== 'function',
  );
  if (missing.length > 0) {
    throw new Error(
      `Niekompatybilny runtime box3d.js. Brak eksportów: ${missing.join(', ')}. ` +
      'Sprawdź przypiętą wersję paczki i test tools/check-box3d-runtime.mjs.',
    );
  }

  return runtime;
}

/** Exact equivalent of native Box3D b3MulQuat(q1, q2). */
export function multiplyQuaternions(q1: b3Quat, q2: b3Quat): b3Quat {
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

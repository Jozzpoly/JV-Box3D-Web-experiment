import type {
  Box3DModule,
  b3BodyId,
  b3ShapeId,
  b3Vec3,
} from "../box3d-runtime-contract.js";

type B3ShapeDef = Parameters<Box3DModule["b3CreateSphereShape"]>[1];
type B3WheelProfilePoint = Readonly<{ x: number; y: number }>;

interface Mode5VendorModule extends Box3DModule {
  b3CreateWheelShapeFlat(
    bodyId: b3BodyId,
    shapeDef: B3ShapeDef,
    center: b3Vec3,
    axis: b3Vec3,
    radius: number,
    halfWidth: number,
    cornerRadius: number,
  ): b3ShapeId;
  b3CreateWheelShapeProfile(
    bodyId: b3BodyId,
    shapeDef: B3ShapeDef,
    center: b3Vec3,
    axis: b3Vec3,
    profile: readonly B3WheelProfilePoint[],
    cornerRadius: number,
  ): b3ShapeId;
  b3DestroyShape(shapeId: b3ShapeId, updateBodyMass: boolean): void;
}

declare const factory: () => Promise<Mode5VendorModule>;
export default factory;

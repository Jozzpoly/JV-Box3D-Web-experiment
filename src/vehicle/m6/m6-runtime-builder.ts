import type {
  Box3DModule,
  b3BodyId,
  b3JointId,
  b3Quat,
  b3ShapeId,
  b3Vec3,
  b3WorldId,
} from "../../physics/box3d-runtime-contract.js";
import {
  createM6Wheel,
  m6WheelBackendId,
  m6WheelSelectionForRuntime,
} from "./m6-wheel-backend.js";
import {
  M6_DEGREES_TO_RADIANS,
  add3,
  clone3,
  distance3,
  isFrontCorner,
  isLeftCorner,
  m6CornerOffset,
  m6FrontLeftSourceRegisteredHardpoints,
  m6HingeSwingLimit,
  m6OffsetBoxPoints,
  m6SteeringLinkDroopLift,
  m6WishboneHardpoints,
  normalize3,
  scale3,
  sub3,
  vec3,
} from "./m6-geometry.js";
import type { M6TopologyConfig } from "./m6-topology-config.js";
import {
  m6TopologyCountsForWheelBackend,
  type M6CornerRuntime,
  type M6VehicleRuntime,
} from "./m6-topology-contract.js";

const IDENTITY_QUAT: b3Quat = { v: { x: 0, y: 0, z: 0 }, s: 1 };
const FRONT_LEFT_CORNER = 0;

function diagonalMassData(
  mass: number,
  inertia: b3Vec3,
  center = vec3(),
) {
  return {
    mass,
    center,
    inertia: {
      cx: vec3(inertia.x, 0, 0),
      cy: vec3(0, inertia.y, 0),
      cz: vec3(0, 0, inertia.z),
    },
  };
}

function createDynamicBody(
  b3: Box3DModule,
  worldId: b3WorldId,
  position: b3Vec3,
  rotation = IDENTITY_QUAT,
): b3BodyId {
  const bodyDef = b3.b3DefaultBodyDef();
  bodyDef.type = b3.b3BodyType.b3_dynamicBody;
  bodyDef.position = position;
  bodyDef.rotation = rotation;
  return b3.b3CreateBody(worldId, bodyDef);
}

function setKnuckleLikeMass(
  b3: Box3DModule,
  bodyId: b3BodyId,
  mass: number,
): void {
  const inertia = 0.4 * mass * 0.2 * 0.2;
  b3.b3Body_SetMassData(
    bodyId,
    diagonalMassData(mass, vec3(inertia, inertia, inertia)),
  );
}

export function destroyM6VehicleRuntime(
  b3: Box3DModule,
  jointIds: readonly b3JointId[],
  bodyIds: readonly b3BodyId[],
): void {
  for (const jointId of [...jointIds].reverse()) {
    if (b3.b3Joint_IsValid(jointId)) {
      b3.b3DestroyJoint(jointId, false);
    }
  }
  for (const bodyId of [...bodyIds].reverse()) {
    if (b3.b3Body_IsValid(bodyId)) {
      b3.b3DestroyBody(bodyId);
    }
  }
}

function createControlArm(
  b3: Box3DModule,
  worldId: b3WorldId,
  chassisId: b3BodyId,
  knuckleId: b3BodyId,
  config: M6TopologyConfig,
  chassisSpawn: b3Vec3,
  frontMount: b3Vec3,
  rearMount: b3Vec3,
  ball: b3Vec3,
  knuckleOrigin: b3Vec3,
  kingpinFrame: b3Quat,
  armLength: number,
  twistFence: number,
): Readonly<{
  armId: b3BodyId;
  hingeId: b3JointId;
  ballId: b3JointId;
}> {
  const hingeMid = scale3(0.5, add3(frontMount, rearMount));
  const ballFromHinge = sub3(ball, hingeMid);
  const armId = createDynamicBody(
    b3,
    worldId,
    add3(chassisSpawn, hingeMid),
    IDENTITY_QUAT,
  );

  try {
    const safeLength = Math.max(armLength, 0.1);
    const mountSpread = Math.max(
      2 * config.wishbone.armHalfSpread,
      0.1,
    );
    const mass = Math.max(config.armMass, 0.5);
    b3.b3Body_SetMassData(
      armId,
      diagonalMassData(
        mass,
        vec3(
          (mass * safeLength * safeLength) / 12,
          (mass *
            (safeLength * safeLength + mountSpread * mountSpread)) /
            12,
          (mass * mountSpread * mountSpread) / 12,
        ),
        scale3(0.5, ballFromHinge),
      ),
    );

    const hingeFrame = b3.b3ComputeQuatBetweenUnitVectors(
      vec3(0, 0, 1),
      vec3(1, 0, 0),
    );
    const hingeDef = b3.b3DefaultRevoluteJointDef();
    hingeDef.base.bodyIdA = chassisId;
    hingeDef.base.bodyIdB = armId;
    hingeDef.base.localFrameA = { p: hingeMid, q: hingeFrame };
    hingeDef.base.localFrameB = { p: vec3(), q: hingeFrame };
    hingeDef.base.collideConnected = false;
    hingeDef.enableLimit = true;
    const swing = m6HingeSwingLimit(config, armLength);
    hingeDef.lowerAngle = -swing;
    hingeDef.upperAngle = swing;
    const hingeId = b3.b3CreateRevoluteJoint(worldId, hingeDef);

    try {
      const ballDef = b3.b3DefaultSphericalJointDef();
      ballDef.base.bodyIdA = armId;
      ballDef.base.bodyIdB = knuckleId;
      ballDef.base.localFrameA = {
        p: ballFromHinge,
        q: kingpinFrame,
      };
      ballDef.base.localFrameB = {
        p: sub3(ball, knuckleOrigin),
        q: kingpinFrame,
      };
      ballDef.base.collideConnected = false;
      ballDef.enableConeLimit = true;
      ballDef.coneAngle =
        swing + 15 * M6_DEGREES_TO_RADIANS;
      ballDef.enableTwistLimit = true;
      ballDef.lowerTwistAngle = -twistFence;
      ballDef.upperTwistAngle = twistFence;
      const ballId = b3.b3CreateSphericalJoint(worldId, ballDef);
      return { armId, hingeId, ballId };
    } catch (error: unknown) {
      if (b3.b3Joint_IsValid(hingeId)) {
        b3.b3DestroyJoint(hingeId, false);
      }
      throw error;
    }
  } catch (error: unknown) {
    if (b3.b3Body_IsValid(armId)) {
      b3.b3DestroyBody(armId);
    }
    throw error;
  }
}

export function createM6VehicleRuntime(
  b3: Box3DModule,
  worldId: b3WorldId,
  config: M6TopologyConfig,
  spawn: b3Vec3,
  collisionGroupIndex: number,
): M6VehicleRuntime {
  const bodyIds: b3BodyId[] = [];
  const jointIds: b3JointId[] = [];
  const shapeIds: b3ShapeId[] = [];
  const wheelSelection = m6WheelSelectionForRuntime(b3);
  const wheelBackendId = m6WheelBackendId(wheelSelection);
  const topologyCounts = m6TopologyCountsForWheelBackend(wheelBackendId);

  try {
    const chassisId = createDynamicBody(
      b3,
      worldId,
      spawn,
      IDENTITY_QUAT,
    );
    bodyIds.push(chassisId);

    const chassisShapeDef = b3.b3DefaultShapeDef();
    chassisShapeDef.density = config.chassisDensity;
    chassisShapeDef.baseMaterial.friction = 0.6;
    chassisShapeDef.filter.groupIndex = collisionGroupIndex;
    const chassisHull = b3.b3CreateHull(
      m6OffsetBoxPoints(
        config.chassisHalfExtents,
        -config.cgVerticalOffset,
      ),
    );
    if (chassisHull === null) {
      throw new Error("Box3D rejected the M6 chassis hull.");
    }
    let chassisShapeId: b3ShapeId;
    try {
      chassisShapeId = b3.b3CreateHullShape(
        chassisId,
        chassisShapeDef,
        chassisHull,
      );
    } finally {
      chassisHull.delete();
    }
    shapeIds.push(chassisShapeId);

    const rackRest = vec3(
      config.axleHalfSpacing - config.wishbone.steeringArmBack,
      -config.restDrop + m6SteeringLinkDroopLift(config),
      0,
    );
    const rackId = createDynamicBody(
      b3,
      worldId,
      add3(spawn, rackRest),
      IDENTITY_QUAT,
    );
    bodyIds.push(rackId);
    const rackLength = 2 * config.rackHalfWidth;
    const rackInertia =
      (config.rackMass * rackLength * rackLength) / 12;
    b3.b3Body_SetMassData(
      rackId,
      diagonalMassData(
        config.rackMass,
        vec3(
          rackInertia,
          rackInertia,
          0.002 * config.rackMass,
        ),
      ),
    );

    const rackFrame = b3.b3ComputeQuatBetweenUnitVectors(
      vec3(1, 0, 0),
      vec3(0, 0, 1),
    );
    const rackDef = b3.b3DefaultPrismaticJointDef();
    rackDef.base.bodyIdA = chassisId;
    rackDef.base.bodyIdB = rackId;
    rackDef.base.localFrameA = { p: rackRest, q: rackFrame };
    rackDef.base.localFrameB = { p: vec3(), q: rackFrame };
    rackDef.base.collideConnected = false;
    rackDef.enableSpring = false;
    rackDef.enableLimit = true;
    rackDef.lowerTranslation = -config.rackTravel;
    rackDef.upperTranslation = config.rackTravel;
    rackDef.enableMotor = true;
    rackDef.motorSpeed = 0;
    rackDef.maxMotorForce = config.rackFrictionBase;
    const rackJointId = b3.b3CreatePrismaticJoint(
      worldId,
      rackDef,
    );
    jointIds.push(rackJointId);

    const corners: M6CornerRuntime[] = [];
    for (
      let corner = 0;
      corner < topologyCounts.corners;
      corner += 1
    ) {
      const restLocal = m6CornerOffset(config, corner);
      const restWorld = add3(spawn, restLocal);
      const isSourceRegisteredFrontLeft = corner === FRONT_LEFT_CORNER;
      const sourceRegisteredHardpoints = isSourceRegisteredFrontLeft
        ? m6FrontLeftSourceRegisteredHardpoints(config, restLocal)
        : null;
      const hardpoints =
        sourceRegisteredHardpoints ??
        m6WishboneHardpoints(config, corner, restLocal);

      const knuckleId = createDynamicBody(
        b3,
        worldId,
        restWorld,
        IDENTITY_QUAT,
      );
      bodyIds.push(knuckleId);
      const knuckleMass = isSourceRegisteredFrontLeft
        ? config.knuckleMass * 0.5
        : config.knuckleMass;
      setKnuckleLikeMass(b3, knuckleId, knuckleMass);

      let suspensionCarrierId = knuckleId;
      let steeringJointId: b3JointId | null = null;
      let steeringCenterCarrierLocal: b3Vec3 | null = null;
      let steeringCenterKnuckleLocal: b3Vec3 | null = null;
      let steeringAxisCarrierLocal: b3Vec3 | null = null;
      if (sourceRegisteredHardpoints !== null) {
        suspensionCarrierId = createDynamicBody(
          b3,
          worldId,
          restWorld,
          IDENTITY_QUAT,
        );
        bodyIds.push(suspensionCarrierId);
        setKnuckleLikeMass(
          b3,
          suspensionCarrierId,
          config.knuckleMass * 0.5,
        );

        const steeringFrame = b3.b3ComputeQuatBetweenUnitVectors(
          vec3(0, 0, 1),
          sourceRegisteredHardpoints.steeringAxisDirection,
        );
        const steeringJointDef = b3.b3DefaultRevoluteJointDef();
        steeringJointDef.base.bodyIdA = suspensionCarrierId;
        steeringJointDef.base.bodyIdB = knuckleId;
        steeringCenterCarrierLocal = sub3(
          sourceRegisteredHardpoints.steeringCenter,
          restLocal,
        );
        steeringCenterKnuckleLocal = clone3(
          steeringCenterCarrierLocal,
        );
        steeringAxisCarrierLocal = clone3(
          sourceRegisteredHardpoints.steeringAxisDirection,
        );
        steeringJointDef.base.localFrameA = {
          p: steeringCenterCarrierLocal,
          q: steeringFrame,
        };
        steeringJointDef.base.localFrameB = {
          p: steeringCenterKnuckleLocal,
          q: steeringFrame,
        };
        steeringJointDef.base.collideConnected = false;
        steeringJointDef.enableSpring = false;
        steeringJointDef.enableLimit = true;
        steeringJointDef.lowerAngle = 0;
        steeringJointDef.upperAngle = 0;
        steeringJointId = b3.b3CreateRevoluteJoint(
          worldId,
          steeringJointDef,
        );
        jointIds.push(steeringJointId);
      }

      const wheel = createM6Wheel(
        wheelSelection,
        b3,
        worldId,
        config,
        restWorld,
        collisionGroupIndex,
      );
      bodyIds.push(wheel.bodyId);
      shapeIds.push(...wheel.shapeIds);

      const suspensionAxis = normalize3(
        sub3(
          hardpoints.upperBallJoint,
          hardpoints.lowerBallJoint,
        ),
      );
      const suspensionFrame =
        b3.b3ComputeQuatBetweenUnitVectors(
          vec3(0, 0, 1),
          suspensionAxis,
        );
      const twistFence =
        (isSourceRegisteredFrontLeft
          ? 0
          : isFrontCorner(corner)
          ? config.maxSteeringAngleDegrees + 10
          : 15) * M6_DEGREES_TO_RADIANS;
      const upper = createControlArm(
        b3,
        worldId,
        chassisId,
        suspensionCarrierId,
        config,
        spawn,
        hardpoints.upperFrontChassis,
        hardpoints.upperRearChassis,
        hardpoints.upperBallJoint,
        restLocal,
        suspensionFrame,
        config.wishbone.upperArmLength,
        twistFence,
      );
      bodyIds.push(upper.armId);
      jointIds.push(upper.hingeId, upper.ballId);

      const lower = createControlArm(
        b3,
        worldId,
        chassisId,
        suspensionCarrierId,
        config,
        spawn,
        hardpoints.lowerFrontChassis,
        hardpoints.lowerRearChassis,
        hardpoints.lowerBallJoint,
        restLocal,
        suspensionFrame,
        config.wishbone.lowerArmLength,
        twistFence,
      );
      bodyIds.push(lower.armId);
      jointIds.push(lower.hingeId, lower.ballId);

      const axleScale = isFrontCorner(corner)
        ? config.frontSuspensionScale
        : config.rearSuspensionScale;
      const designLength = distance3(
        hardpoints.coiloverChassis,
        hardpoints.coiloverKnuckle,
      );
      const preload = isFrontCorner(corner)
        ? config.suspensionPreloadFront
        : config.suspensionPreloadRear;
      const coiloverAnchorA = clone3(hardpoints.coiloverChassis);
      const coiloverAnchorB = sub3(
        hardpoints.coiloverKnuckle,
        restLocal,
      );
      const coiloverDef = b3.b3DefaultDistanceJointDef();
      coiloverDef.base.bodyIdA = chassisId;
      coiloverDef.base.bodyIdB = suspensionCarrierId;
      coiloverDef.base.localFrameA.p = coiloverAnchorA;
      coiloverDef.base.localFrameB.p = coiloverAnchorB;
      coiloverDef.base.collideConnected = false;
      coiloverDef.length = designLength + preload;
      coiloverDef.enableSpring = true;
      coiloverDef.hertz =
        config.suspensionHertz * axleScale;
      coiloverDef.dampingRatio =
        config.suspensionDampingRatio * axleScale;
      coiloverDef.enableLimit = true;
      coiloverDef.minLength = Math.max(
        0.05,
        designLength - config.compressionTravel,
      );
      coiloverDef.maxLength =
        designLength + config.reboundTravel;
      const coiloverJointId = b3.b3CreateDistanceJoint(
        worldId,
        coiloverDef,
      );
      jointIds.push(coiloverJointId);

      const steeringArmKnuckle = sub3(
        hardpoints.steeringArm,
        restLocal,
      );
      const steeringDef = b3.b3DefaultDistanceJointDef();
      let steeringLinkJointId: b3JointId | null = null;
      if (isSourceRegisteredFrontLeft) {
        // S2: the authored #7 member is a live rack-center -> knuckle visual
        // segment, while the centered carrier->knuckle revolute owns steering
        // physically. Making #7 a rigid distance joint here would let
        // suspension travel back-drive steering (bump-steer), contradicting
        // the owner-accepted neutral-suspension DOF split.
        steeringDef.base.bodyIdA = rackId;
        steeringDef.base.bodyIdB = knuckleId;
        steeringDef.base.localFrameA.p = vec3();
        steeringDef.base.localFrameB.p = steeringArmKnuckle;
      } else if (isFrontCorner(corner)) {
        const rackEndZ = isLeftCorner(corner)
          ? -config.rackHalfWidth
          : config.rackHalfWidth;
        const rackEndLocal = vec3(0, 0, rackEndZ);
        steeringDef.base.bodyIdA = rackId;
        steeringDef.base.bodyIdB = knuckleId;
        steeringDef.base.localFrameA.p = rackEndLocal;
        steeringDef.base.localFrameB.p = steeringArmKnuckle;
        steeringDef.length = distance3(
          add3(rackRest, rackEndLocal),
          hardpoints.steeringArm,
        );
      } else {
        const inward = isLeftCorner(corner) ? 1 : -1;
        const toeChassis = add3(
          hardpoints.steeringArm,
          vec3(
            0,
            m6SteeringLinkDroopLift(config),
            inward * config.wishbone.lowerArmLength,
          ),
        );
        steeringDef.base.bodyIdA = chassisId;
        steeringDef.base.bodyIdB = knuckleId;
        steeringDef.base.localFrameA.p = toeChassis;
        steeringDef.base.localFrameB.p = steeringArmKnuckle;
        steeringDef.length = distance3(
          toeChassis,
          hardpoints.steeringArm,
        );
      }
      // R1 temporary driving bridge: keep the accepted FL centered steering
      // behavior and remove only the historical FR physical tie-rod constraint.
      // FR remains on its existing body/suspension topology; this does NOT
      // promote those hardpoints or that steering axis to future authority.
      // Both front wheels are commanded kinematically below so the R1 product
      // no longer mixes one-way FL steering with a back-drivable FR linkage.
      if (!isSourceRegisteredFrontLeft && corner !== 1) {
        steeringDef.base.collideConnected = false;
        steeringDef.enableSpring = false;
        steeringLinkJointId =
          b3.b3CreateDistanceJoint(worldId, steeringDef);
        jointIds.push(steeringLinkJointId);
      }

      const spinDef = b3.b3DefaultRevoluteJointDef();
      spinDef.base.bodyIdA = knuckleId;
      spinDef.base.bodyIdB = wheel.bodyId;
      spinDef.base.localFrameA = {
        p: vec3(),
        q: IDENTITY_QUAT,
      };
      spinDef.base.localFrameB = {
        p: vec3(),
        q: b3.b3ComputeQuatBetweenUnitVectors(
          vec3(0, 0, 1),
          vec3(0, 1, 0),
        ),
      };
      spinDef.base.collideConnected = false;
      spinDef.enableMotor = true;
      spinDef.maxMotorTorque = 0;
      spinDef.motorSpeed = 0;
      const spinJointId = b3.b3CreateRevoluteJoint(
        worldId,
        spinDef,
      );
      jointIds.push(spinJointId);

      corners.push({
        wheel,
        knuckleId,
        suspensionCarrierId,
        steeringJointId,
        steeringCenterCarrierLocal,
        steeringCenterKnuckleLocal,
        steeringAxisCarrierLocal,
        upperArmId: upper.armId,
        lowerArmId: lower.armId,
        spinJointId,
        upperHingeId: upper.hingeId,
        lowerHingeId: lower.hingeId,
        upperBallId: upper.ballId,
        lowerBallId: lower.ballId,
        coiloverJointId,
        steeringLinkJointId,
        coiloverVisual: {
          bodyIdA: chassisId,
          localAnchorA: clone3(coiloverAnchorA),
          bodyIdB: suspensionCarrierId,
          localAnchorB: clone3(coiloverAnchorB),
        },
        steeringLinkVisual: {
          bodyIdA: steeringDef.base.bodyIdA,
          localAnchorA: clone3(steeringDef.base.localFrameA.p),
          bodyIdB: steeringDef.base.bodyIdB,
          localAnchorB: clone3(steeringDef.base.localFrameB.p),
        },
      });
    }

    if (
      bodyIds.length !== topologyCounts.bodies ||
      jointIds.length !== topologyCounts.joints ||
      shapeIds.length !== topologyCounts.shapes
    ) {
      throw new Error(
        `M6 topology mismatch: bodies=${bodyIds.length}, joints=${jointIds.length}, shapes=${shapeIds.length}.`,
      );
    }

    return {
      wheelBackendId,
      topologyCounts,
      chassisId,
      chassisShapeId,
      rackId,
      rackJointId,
      corners,
      bodyIds,
      jointIds,
      shapeIds,
    };
  } catch (error: unknown) {
    destroyM6VehicleRuntime(b3, jointIds, bodyIds);
    throw error;
  }
}

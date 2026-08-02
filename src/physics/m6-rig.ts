import type { DriveInput } from '../input';
import {
  ALL_CATEGORIES,
  DEFAULT_M6_CONFIG,
  OBJECT_CATEGORY,
  TERRAIN_CATEGORY,
  type M6RigConfig,
  type Vec3,
  type WishboneGeometry,
} from './rig-config';
import {
  AXIS_X,
  AXIS_Y,
  AXIS_Z,
  DEG,
  VEC3_ZERO,
  add,
  clamp,
  distance,
  dot,
  length,
  normalize,
  scale,
  sub,
} from './math';

const CORNER_COUNT = 4;
const FRONT_LEFT = 0;
const FRONT_RIGHT = 1;
const REAR_LEFT = 2;
const REAR_RIGHT = 3;

interface WishboneHardpoints {
  upperBallJoint: Vec3;
  lowerBallJoint: Vec3;
  steeringArm: Vec3;
  upperFrontChassis: Vec3;
  upperRearChassis: Vec3;
  lowerFrontChassis: Vec3;
  lowerRearChassis: Vec3;
  coiloverChassis: Vec3;
  coiloverKnuckle: Vec3;
}

interface CornerRuntime {
  isFront: boolean;
  isLeft: boolean;
  restWheelCenterLocal: Vec3;
  hardpoints: WishboneHardpoints;
  knuckleId: any;
  upperArmId: any;
  lowerArmId: any;
  wheelId: any;
  upperHingeId: any;
  lowerHingeId: any;
  upperBallId: any;
  lowerBallId: any;
  coiloverJointId: any;
  steerLinkJointId: any;
  spinJointId: any;
  wheelShapeIds: any[];
}

export interface VisualBodyBinding {
  bodyId: any;
  object: any;
}

export interface RigTelemetry {
  speedMs: number;
  speedKmh: number;
  rackTravel: number;
  bodyCount: number;
  jointCount: number;
  contactCount: number;
  physicsMs: number;
}

export class M6WebRig {
  readonly config: M6RigConfig;
  readonly bindings: VisualBodyBinding[] = [];
  chassisId: any;
  rackId: any;
  rackJointId: any;
  readonly corners: CornerRuntime[] = [];
  private readonly spawn: Vec3;

  constructor(
    private readonly b3: any,
    private readonly worldId: any,
    config: M6RigConfig = DEFAULT_M6_CONFIG,
    spawn: Vec3 = { x: 0, y: 1.12, z: 0 },
  ) {
    this.config = structuredClone(config);
    this.spawn = { ...spawn };
    this.config.rackTravel = computeRackStroke(
      this.config.wishbone,
      2 * this.config.axleHalfSpacing,
      this.config.trackHalfWidth,
      this.config.rackHalfWidth,
      this.config.maxSteeringAngleDegrees * DEG,
    );
    this.create();
  }

  update(input: DriveInput): void {
    const b3 = this.b3;
    const cfg = this.config;
    const handsOn = Math.abs(input.steer) > cfg.steerInputDeadzone;
    const rackAngle = clamp(input.steer, -1, 1) * cfg.maxSteeringAngleDegrees * DEG;

    if (handsOn) {
      const stroke = computeRackStroke(
        cfg.wishbone,
        2 * cfg.axleHalfSpacing,
        cfg.trackHalfWidth,
        cfg.rackHalfWidth,
        Math.abs(rackAngle),
      );
      const target = clamp(Math.sign(rackAngle || 1) * stroke, -cfg.rackTravel, cfg.rackTravel);
      b3.b3PrismaticJoint_EnableSpring(this.rackJointId, true);
      b3.b3PrismaticJoint_SetSpringHertz(this.rackJointId, cfg.steeringHertz);
      b3.b3PrismaticJoint_SetSpringDampingRatio(this.rackJointId, cfg.steeringDampingRatio);
      b3.b3PrismaticJoint_SetTargetTranslation(this.rackJointId, target);
      const error = target - b3.b3PrismaticJoint_GetTranslation(this.rackJointId);
      const speed = clamp(cfg.rackServoSpeedGain * error, -cfg.rackServoMaxSpeed, cfg.rackServoMaxSpeed);
      b3.b3PrismaticJoint_SetMotorSpeed(this.rackJointId, speed);
      b3.b3PrismaticJoint_SetMaxMotorForce(this.rackJointId, cfg.rackServoForce);
    } else {
      b3.b3PrismaticJoint_EnableSpring(this.rackJointId, false);
      b3.b3PrismaticJoint_SetMotorSpeed(this.rackJointId, 0);
      b3.b3PrismaticJoint_SetMaxMotorForce(this.rackJointId, cfg.rackFrictionBase);
    }

    const commandedSpinSpeed = input.drive >= 0 ? -cfg.maxDriveSpeed : cfg.maxDriveSpeed;
    for (const corner of this.corners) {
      let targetSpeed = 0;
      let torque = cfg.coastTorque;
      if (input.brake) {
        torque = cfg.brakeTorque;
      } else if (input.drive !== 0) {
        targetSpeed = commandedSpinSpeed;
        const wheelRotation = b3.b3Body_GetRotation(corner.wheelId);
        const axle = b3.b3RotateVector(wheelRotation, AXIS_Y);
        const wheelAngular = b3.b3Body_GetAngularVelocity(corner.wheelId);
        const carrierAngular = b3.b3Body_GetAngularVelocity(corner.knuckleId);
        const spinSpeed = dot(sub(wheelAngular, carrierAngular), axle);
        torque = taperedDriveTorque(cfg, spinSpeed, commandedSpinSpeed, input.drive);
      }
      b3.b3RevoluteJoint_SetMotorSpeed(corner.spinJointId, targetSpeed);
      b3.b3RevoluteJoint_SetMaxMotorTorque(corner.spinJointId, torque);
    }

    this.applyAntiRollBar(FRONT_LEFT, FRONT_RIGHT, cfg.arbFrontStiffness);
    this.applyAntiRollBar(REAR_LEFT, REAR_RIGHT, cfg.arbRearStiffness);
    this.applyAeroDrag();

    if (input.drive !== 0 || input.steer !== 0 || input.brake) {
      b3.b3Body_SetAwake(this.chassisId, true);
      b3.b3Joint_WakeBodies(this.rackJointId);
    }
  }

  syncVisuals(): void {
    for (const binding of this.bindings) {
      const position = this.b3.b3Body_GetPosition(binding.bodyId);
      const rotation = this.b3.b3Body_GetRotation(binding.bodyId);
      binding.object.position.set(position.x, position.y, position.z);
      binding.object.quaternion.set(rotation.v.x, rotation.v.y, rotation.v.z, rotation.s);
    }
  }

  getForwardSpeed(): number {
    const velocity = this.b3.b3Body_GetLinearVelocity(this.chassisId);
    const rotation = this.b3.b3Body_GetRotation(this.chassisId);
    const forward = this.b3.b3RotateVector(rotation, AXIS_X);
    return dot(velocity, forward);
  }

  getTelemetry(): RigTelemetry {
    const counters = this.b3.b3World_GetCounters(this.worldId);
    const profile = this.b3.b3World_GetProfile(this.worldId);
    const speed = this.getForwardSpeed();
    return {
      speedMs: speed,
      speedKmh: speed * 3.6,
      rackTravel: this.b3.b3PrismaticJoint_GetTranslation(this.rackJointId),
      bodyCount: counters.bodyCount,
      jointCount: counters.jointCount,
      contactCount: counters.contactCount,
      physicsMs: profile.step,
    };
  }

  destroy(): void {
    const bodyIds = [
      ...this.corners.flatMap((corner) => [corner.wheelId, corner.knuckleId, corner.upperArmId, corner.lowerArmId]),
      this.rackId,
      this.chassisId,
    ];
    for (const id of bodyIds) {
      if (id) this.b3.b3DestroyBody(id);
    }
    this.bindings.length = 0;
    this.corners.length = 0;
  }

  private create(): void {
    this.chassisId = this.createChassis();
    const rack = this.createRack();
    this.rackId = rack.bodyId;
    this.rackJointId = rack.jointId;
    for (let cornerIndex = 0; cornerIndex < CORNER_COUNT; cornerIndex += 1) {
      this.corners.push(this.createWishboneCorner(cornerIndex));
    }
  }

  private createChassis(): any {
    const b3 = this.b3;
    const cfg = this.config;
    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = { ...this.spawn };
    const bodyId = b3.b3CreateBody(this.worldId, bodyDef);
    b3.b3Body_SetName(bodyId, 'jv_m6_web_chassis');

    const { x: hx, y: hy, z: hz } = cfg.chassisHalfExtents;
    const cy = -cfg.cgVerticalOffset;
    const points = new Float32Array([
      -hx, cy - hy, -hz,  hx, cy - hy, -hz,  hx, cy + hy, -hz, -hx, cy + hy, -hz,
      -hx, cy - hy,  hz,  hx, cy - hy,  hz,  hx, cy + hy,  hz, -hx, cy + hy,  hz,
    ]);
    const hull = b3.b3CreateHull(points);
    if (!hull) throw new Error('Box3D failed to create the chassis hull.');
    const shapeDef = b3.b3DefaultShapeDef();
    shapeDef.density = cfg.chassisDensity;
    shapeDef.baseMaterial.friction = 0.6;
    shapeDef.filter.groupIndex = cfg.filterGroupIndex;
    b3.b3CreateHullShape(bodyId, shapeDef, hull);
    b3.b3DestroyHull(hull);
    return bodyId;
  }

  private createRack(): { bodyId: any; jointId: any } {
    const b3 = this.b3;
    const cfg = this.config;
    const rackRestLocal = {
      x: cfg.axleHalfSpacing - cfg.wishbone.steeringArmBack,
      y: -cfg.restDrop + steeringLinkDroopLift(cfg),
      z: 0,
    };
    const rackRestWorld = add(this.spawn, rackRestLocal);
    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = rackRestWorld;
    const bodyId = b3.b3CreateBody(this.worldId, bodyDef);
    b3.b3Body_SetName(bodyId, 'jv_m6_web_rack');

    const rodLength = 2 * cfg.rackHalfWidth;
    const rodInertia = (cfg.rackMass * rodLength * rodLength) / 12;
    b3.b3Body_SetMassData(bodyId, diagonalMass(cfg.rackMass, {
      x: rodInertia,
      y: rodInertia,
      z: 0.002 * cfg.rackMass,
    }));

    const jointDef = b3.b3DefaultPrismaticJointDef();
    jointDef.base.bodyIdA = this.chassisId;
    jointDef.base.bodyIdB = bodyId;
    jointDef.base.localFrameA.p = rackRestLocal;
    jointDef.base.localFrameB.p = { ...VEC3_ZERO };
    const axisFrame = b3.b3ComputeQuatBetweenUnitVectors(AXIS_X, AXIS_Z);
    jointDef.base.localFrameA.q = axisFrame;
    jointDef.base.localFrameB.q = axisFrame;
    jointDef.base.collideConnected = false;
    jointDef.enableSpring = true;
    jointDef.hertz = cfg.steeringHertz;
    jointDef.dampingRatio = cfg.steeringDampingRatio;
    jointDef.targetTranslation = 0;
    jointDef.enableLimit = true;
    jointDef.lowerTranslation = -cfg.rackTravel;
    jointDef.upperTranslation = cfg.rackTravel;
    jointDef.enableMotor = true;
    jointDef.motorSpeed = 0;
    jointDef.maxMotorForce = cfg.rackServoForce;
    return { bodyId, jointId: b3.b3CreatePrismaticJoint(this.worldId, jointDef) };
  }

  private createWishboneCorner(index: number): CornerRuntime {
    const b3 = this.b3;
    const cfg = this.config;
    const isFront = index === FRONT_LEFT || index === FRONT_RIGHT;
    const isLeft = index === FRONT_LEFT || index === REAR_LEFT;
    const restWheelCenterLocal: Vec3 = {
      x: isFront ? cfg.axleHalfSpacing : -cfg.axleHalfSpacing,
      y: -cfg.restDrop,
      z: isLeft ? -cfg.trackHalfWidth : cfg.trackHalfWidth,
    };
    const restWheelCenterWorld = add(this.spawn, restWheelCenterLocal);
    const hardpoints = makeWishboneHardpoints(
      cfg.wishbone,
      restWheelCenterLocal,
      isLeft,
      2 * cfg.axleHalfSpacing,
      cfg.trackHalfWidth,
    );

    const knuckleId = this.createKnuckle(restWheelCenterWorld);
    const wheel = this.createWheel(restWheelCenterWorld);
    const kingpinDirection = normalize(sub(hardpoints.upperBallJoint, hardpoints.lowerBallJoint));
    const kingpinFrame = b3.b3ComputeQuatBetweenUnitVectors(AXIS_Z, kingpinDirection);
    const twistFence = (isFront ? cfg.maxSteeringAngleDegrees + 10 : 15) * DEG;

    const upper = this.createControlArm(
      hardpoints.upperFrontChassis,
      hardpoints.upperRearChassis,
      hardpoints.upperBallJoint,
      restWheelCenterLocal,
      cfg.wishbone.upperArmLength,
      kingpinFrame,
      twistFence,
      knuckleId,
      'upper',
    );
    const lower = this.createControlArm(
      hardpoints.lowerFrontChassis,
      hardpoints.lowerRearChassis,
      hardpoints.lowerBallJoint,
      restWheelCenterLocal,
      cfg.wishbone.lowerArmLength,
      kingpinFrame,
      twistFence,
      knuckleId,
      'lower',
    );

    const coiloverKnuckle = sub(hardpoints.coiloverKnuckle, restWheelCenterLocal);
    const designLength = distance(hardpoints.coiloverChassis, hardpoints.coiloverKnuckle);
    const scaleByAxle = isFront ? cfg.frontSuspensionScale : cfg.rearSuspensionScale;
    const preload = isFront ? cfg.suspensionPreloadFront : cfg.suspensionPreloadRear;
    const coiloverDef = b3.b3DefaultDistanceJointDef();
    coiloverDef.base.bodyIdA = this.chassisId;
    coiloverDef.base.bodyIdB = knuckleId;
    coiloverDef.base.localFrameA.p = hardpoints.coiloverChassis;
    coiloverDef.base.localFrameB.p = coiloverKnuckle;
    coiloverDef.base.collideConnected = false;
    coiloverDef.length = designLength + preload;
    coiloverDef.enableSpring = true;
    coiloverDef.hertz = cfg.suspensionHertz * scaleByAxle;
    coiloverDef.dampingRatio = cfg.suspensionDampingRatio * scaleByAxle;
    coiloverDef.enableLimit = true;
    coiloverDef.minLength = Math.max(0.05, designLength - cfg.compressionTravel);
    coiloverDef.maxLength = designLength + cfg.reboundTravel;
    const coiloverJointId = b3.b3CreateDistanceJoint(this.worldId, coiloverDef);

    const steeringArmKnuckle = sub(hardpoints.steeringArm, restWheelCenterLocal);
    const linkDef = b3.b3DefaultDistanceJointDef();
    linkDef.base.bodyIdB = knuckleId;
    linkDef.base.localFrameB.p = steeringArmKnuckle;
    linkDef.base.collideConnected = false;
    linkDef.enableSpring = false;
    if (isFront) {
      const rackEndLocal = { x: 0, y: 0, z: isLeft ? -cfg.rackHalfWidth : cfg.rackHalfWidth };
      const rackRestLocal = {
        x: cfg.axleHalfSpacing - cfg.wishbone.steeringArmBack,
        y: -cfg.restDrop + steeringLinkDroopLift(cfg),
        z: 0,
      };
      const rackEndChassisLocal = add(rackRestLocal, rackEndLocal);
      linkDef.base.bodyIdA = this.rackId;
      linkDef.base.localFrameA.p = rackEndLocal;
      linkDef.length = distance(rackEndChassisLocal, hardpoints.steeringArm);
    } else {
      const inward = isLeft ? 1 : -1;
      const toeChassis = add(hardpoints.steeringArm, {
        x: 0,
        y: steeringLinkDroopLift(cfg),
        z: inward * cfg.wishbone.lowerArmLength,
      });
      linkDef.base.bodyIdA = this.chassisId;
      linkDef.base.localFrameA.p = toeChassis;
      linkDef.length = distance(toeChassis, hardpoints.steeringArm);
    }
    const steerLinkJointId = b3.b3CreateDistanceJoint(this.worldId, linkDef);

    const spinDef = b3.b3DefaultRevoluteJointDef();
    spinDef.base.bodyIdA = knuckleId;
    spinDef.base.bodyIdB = wheel.bodyId;
    spinDef.base.localFrameA.p = { ...VEC3_ZERO };
    spinDef.base.localFrameB.p = { ...VEC3_ZERO };
    spinDef.base.localFrameA.q = identityQuat();
    spinDef.base.localFrameB.q = b3.b3ComputeQuatBetweenUnitVectors(AXIS_Z, AXIS_Y);
    spinDef.base.collideConnected = false;
    spinDef.enableMotor = true;
    spinDef.maxMotorTorque = 0;
    spinDef.motorSpeed = 0;
    const spinJointId = b3.b3CreateRevoluteJoint(this.worldId, spinDef);

    return {
      isFront,
      isLeft,
      restWheelCenterLocal,
      hardpoints,
      knuckleId,
      upperArmId: upper.bodyId,
      lowerArmId: lower.bodyId,
      wheelId: wheel.bodyId,
      upperHingeId: upper.hingeId,
      lowerHingeId: lower.hingeId,
      upperBallId: upper.ballId,
      lowerBallId: lower.ballId,
      coiloverJointId,
      steerLinkJointId,
      spinJointId,
      wheelShapeIds: wheel.shapeIds,
    };
  }

  private createKnuckle(position: Vec3): any {
    const bodyDef = this.b3.b3DefaultBodyDef();
    bodyDef.type = this.b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = position;
    const bodyId = this.b3.b3CreateBody(this.worldId, bodyDef);
    this.b3.b3Body_SetName(bodyId, 'jv_m6_web_knuckle');
    const inertia = 0.4 * this.config.knuckleMass * 0.2 * 0.2;
    this.b3.b3Body_SetMassData(bodyId, diagonalMass(this.config.knuckleMass, {
      x: inertia,
      y: inertia,
      z: inertia,
    }));
    return bodyId;
  }

  private createWheel(position: Vec3): { bodyId: any; shapeIds: any[] } {
    const b3 = this.b3;
    const cfg = this.config;
    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = position;
    bodyDef.rotation = b3.b3ComputeQuatBetweenUnitVectors(AXIS_Y, AXIS_Z);
    bodyDef.allowFastRotation = true;
    const bodyId = b3.b3CreateBody(this.worldId, bodyDef);
    b3.b3Body_SetName(bodyId, 'jv_m6_web_wheel');

    const rollingDef = b3.b3DefaultShapeDef();
    rollingDef.density = cfg.wheelDensity;
    rollingDef.baseMaterial.friction = cfg.wheelFriction;
    rollingDef.baseMaterial.restitution = 0.02;
    rollingDef.baseMaterial.rollingResistance = cfg.wheelRollingResistance;
    rollingDef.filter.groupIndex = cfg.filterGroupIndex;
    rollingDef.filter.categoryBits = OBJECT_CATEGORY;
    rollingDef.filter.maskBits = TERRAIN_CATEGORY;
    const rollingShape = b3.b3CreateSphereShape(bodyId, rollingDef, {
      center: { ...VEC3_ZERO },
      radius: cfg.wheelRadius,
    });

    const sidewallDef = b3.b3DefaultShapeDef();
    sidewallDef.density = 0;
    sidewallDef.baseMaterial.friction = cfg.wheelFriction;
    sidewallDef.baseMaterial.restitution = 0.02;
    sidewallDef.filter.groupIndex = cfg.filterGroupIndex;
    sidewallDef.filter.categoryBits = OBJECT_CATEGORY;
    sidewallDef.filter.maskBits = ALL_CATEGORIES ^ TERRAIN_CATEGORY;
    const sidewallHull = b3.b3CreateCylinder(cfg.wheelWidth, cfg.wheelRadius, -0.5 * cfg.wheelWidth, 32);
    if (!sidewallHull) throw new Error('Box3D failed to create a wheel sidewall hull.');
    const sidewallShape = b3.b3CreateHullShape(bodyId, sidewallDef, sidewallHull);
    b3.b3DestroyHull(sidewallHull);
    return { bodyId, shapeIds: [rollingShape, sidewallShape] };
  }

  private createControlArm(
    frontMountLocal: Vec3,
    rearMountLocal: Vec3,
    ballLocal: Vec3,
    knuckleOriginLocal: Vec3,
    armLength: number,
    ballFrameRotation: any,
    twistLimit: number,
    knuckleId: any,
    name: string,
  ): { bodyId: any; hingeId: any; ballId: any } {
    const b3 = this.b3;
    const hingeMidLocal = scale(add(frontMountLocal, rearMountLocal), 0.5);
    const ballFromHinge = sub(ballLocal, hingeMidLocal);
    const bodyDef = b3.b3DefaultBodyDef();
    bodyDef.type = b3.b3BodyType.b3_dynamicBody;
    bodyDef.position = add(this.spawn, hingeMidLocal);
    const bodyId = b3.b3CreateBody(this.worldId, bodyDef);
    b3.b3Body_SetName(bodyId, `jv_m6_web_${name}_arm`);

    const spread = Math.max(2 * this.config.wishbone.armHalfSpread, 0.1);
    const mass = Math.max(this.config.armMass, 0.5);
    const l = Math.max(armLength, 0.1);
    b3.b3Body_SetMassData(bodyId, diagonalMass(
      mass,
      {
        x: (mass * l * l) / 12,
        y: (mass * (l * l + spread * spread)) / 12,
        z: (mass * spread * spread) / 12,
      },
      scale(ballFromHinge, 0.5),
    ));

    const swing = hingeSwingLimit(this.config.compressionTravel, this.config.reboundTravel, armLength);
    const hingeDef = b3.b3DefaultRevoluteJointDef();
    hingeDef.base.bodyIdA = this.chassisId;
    hingeDef.base.bodyIdB = bodyId;
    hingeDef.base.localFrameA.p = hingeMidLocal;
    hingeDef.base.localFrameB.p = { ...VEC3_ZERO };
    const hingeFrame = b3.b3ComputeQuatBetweenUnitVectors(AXIS_Z, AXIS_X);
    hingeDef.base.localFrameA.q = hingeFrame;
    hingeDef.base.localFrameB.q = hingeFrame;
    hingeDef.base.collideConnected = false;
    hingeDef.enableLimit = true;
    hingeDef.lowerAngle = -swing;
    hingeDef.upperAngle = swing;
    const hingeId = b3.b3CreateRevoluteJoint(this.worldId, hingeDef);

    const ballDef = b3.b3DefaultSphericalJointDef();
    ballDef.base.bodyIdA = bodyId;
    ballDef.base.bodyIdB = knuckleId;
    ballDef.base.localFrameA.p = ballFromHinge;
    ballDef.base.localFrameA.q = ballFrameRotation;
    ballDef.base.localFrameB.p = sub(ballLocal, knuckleOriginLocal);
    ballDef.base.localFrameB.q = ballFrameRotation;
    ballDef.base.collideConnected = false;
    ballDef.enableConeLimit = true;
    ballDef.coneAngle = swing + 15 * DEG;
    ballDef.enableTwistLimit = true;
    ballDef.lowerTwistAngle = -twistLimit;
    ballDef.upperTwistAngle = twistLimit;
    const ballId = b3.b3CreateSphericalJoint(this.worldId, ballDef);
    return { bodyId, hingeId, ballId };
  }

  private applyAntiRollBar(leftIndex: number, rightIndex: number, stiffness: number): void {
    if (stiffness <= 0) return;
    const left = this.corners[leftIndex];
    const right = this.corners[rightIndex];
    if (!left || !right) return;
    const chassisRotation = this.b3.b3Body_GetRotation(this.chassisId);
    const chassisUp = this.b3.b3RotateVector(chassisRotation, AXIS_Y);
    const leftRest = this.b3.b3Body_GetWorldPoint(this.chassisId, left.restWheelCenterLocal);
    const rightRest = this.b3.b3Body_GetWorldPoint(this.chassisId, right.restWheelCenterLocal);
    const leftTravel = dot(sub(this.b3.b3Body_GetPosition(left.wheelId), leftRest), chassisUp);
    const rightTravel = dot(sub(this.b3.b3Body_GetPosition(right.wheelId), rightRest), chassisUp);
    const force = stiffness * (leftTravel - rightTravel);
    if (Math.abs(force) < 1) return;
    const down = scale(chassisUp, -force);
    const up = scale(chassisUp, force);
    this.b3.b3Body_ApplyForce(left.knuckleId, down, this.b3.b3Body_GetPosition(left.knuckleId), false);
    this.b3.b3Body_ApplyForce(right.knuckleId, up, this.b3.b3Body_GetPosition(right.knuckleId), false);
    this.b3.b3Body_ApplyForce(this.chassisId, up, leftRest, false);
    this.b3.b3Body_ApplyForce(this.chassisId, down, rightRest, false);
  }

  private applyAeroDrag(): void {
    if (this.config.aeroDragArea <= 0) return;
    const velocity = this.b3.b3Body_GetLinearVelocity(this.chassisId);
    const speed = length(velocity);
    if (speed < 0.1) return;
    const forceScale = -0.5 * 1.225 * this.config.aeroDragArea * speed;
    this.b3.b3Body_ApplyForceToCenter(this.chassisId, scale(velocity, forceScale), false);
  }
}

function makeWishboneHardpoints(
  geometry: WishboneGeometry,
  restWheelCenter: Vec3,
  isLeft: boolean,
  wheelbase: number,
  track: number,
): WishboneHardpoints {
  const inward = isLeft ? 1 : -1;
  const casterTangent = Math.tan(geometry.casterDeg * DEG);
  const kpiTangent = Math.tan(geometry.kingpinInclinationDeg * DEG);
  const h = geometry.uprightHalfHeight;
  const upperBallJoint = add(restWheelCenter, {
    x: -casterTangent * h,
    y: h,
    z: inward * (geometry.kingpinOffset + kpiTangent * h),
  });
  const lowerBallJoint = add(restWheelCenter, {
    x: casterTangent * h,
    y: -h,
    z: inward * (geometry.kingpinOffset - kpiTangent * h),
  });
  const droopTan = Math.tan(geometry.restArmDroopDeg * DEG);
  const upperInboard = add(upperBallJoint, {
    x: 0,
    y: geometry.upperArmLength * droopTan,
    z: inward * geometry.upperArmLength,
  });
  const lowerInboard = add(lowerBallJoint, {
    x: 0,
    y: geometry.lowerArmLength * droopTan,
    z: inward * geometry.lowerArmLength,
  });
  let armInboard = geometry.kingpinOffset;
  if (geometry.ackermannTrapezoid && wheelbase > 0.01) {
    armInboard += geometry.ackermannFraction * geometry.steeringArmBack * (track / wheelbase);
  }
  return {
    upperBallJoint,
    lowerBallJoint,
    steeringArm: add(restWheelCenter, {
      x: -geometry.steeringArmBack,
      y: 0,
      z: inward * armInboard,
    }),
    upperFrontChassis: add(upperInboard, { x: geometry.armHalfSpread, y: 0, z: 0 }),
    upperRearChassis: add(upperInboard, { x: -geometry.armHalfSpread, y: 0, z: 0 }),
    lowerFrontChassis: add(lowerInboard, { x: geometry.armHalfSpread, y: 0, z: 0 }),
    lowerRearChassis: add(lowerInboard, { x: -geometry.armHalfSpread, y: 0, z: 0 }),
    coiloverChassis: add(restWheelCenter, {
      x: 0,
      y: geometry.coiloverTopHeight,
      z: inward * geometry.coiloverTopInboard,
    }),
    coiloverKnuckle: lowerBallJoint,
  };
}

function computeRackStroke(
  geometry: WishboneGeometry,
  wheelbase: number,
  trackHalfWidth: number,
  rackHalfWidth: number,
  steerAngle: number,
): number {
  const steeringArm = geometry.steeringArmBack;
  const ackermann = geometry.ackermannTrapezoid && wheelbase > 0.01
    ? geometry.ackermannFraction * steeringArm * ((2 * trackHalfWidth) / wheelbase)
    : 0;
  const kingpinZ = -trackHalfWidth + geometry.kingpinOffset;
  const armX = -steeringArm * Math.cos(steerAngle) + ackermann * Math.sin(steerAngle);
  const armZ = steeringArm * Math.sin(steerAngle) + ackermann * Math.cos(steerAngle);
  const restArmZ = kingpinZ + ackermann;
  const tieRodLength = Math.abs(-rackHalfWidth - restArmZ);
  const deltaX = armX + steeringArm;
  const reach = Math.sqrt(Math.max(tieRodLength * tieRodLength - deltaX * deltaX, 1e-6));
  const rackEndZ = kingpinZ + armZ + reach;
  return Math.max(0, rackEndZ + rackHalfWidth);
}

function steeringLinkDroopLift(config: M6RigConfig): number {
  return config.wishbone.lowerArmLength * Math.tan(config.wishbone.restArmDroopDeg * DEG);
}

function hingeSwingLimit(compression: number, rebound: number, armLength: number): number {
  const travel = Math.max(compression, rebound);
  const sine = clamp((1.25 * travel) / Math.max(armLength, 0.05), 0.05, 0.95);
  return Math.min(Math.asin(sine), 55 * DEG);
}

function taperedDriveTorque(
  config: M6RigConfig,
  spinSpeed: number,
  commandedSpinSpeed: number,
  driveInput: number,
): number {
  const sign = commandedSpinSpeed >= 0 ? 1 : -1;
  const forwardSpin = Math.max(spinSpeed * sign, 0);
  const taperStart = clamp(config.driveTaperStart, 0, 0.99) * config.maxDriveSpeed;
  const taper = config.maxDriveSpeed > taperStart + 0.001
    ? clamp((config.maxDriveSpeed - forwardSpin) / (config.maxDriveSpeed - taperStart), 0, 1)
    : 1;
  return Math.abs(driveInput) * config.maxDriveTorque * taper;
}

function identityQuat(): any {
  return { v: { ...VEC3_ZERO }, s: 1 };
}

function diagonalMass(mass: number, inertia: Vec3, center: Vec3 = VEC3_ZERO): any {
  return {
    mass,
    center: { ...center },
    inertia: {
      cx: { x: inertia.x, y: 0, z: 0 },
      cy: { x: 0, y: inertia.y, z: 0 },
      cz: { x: 0, y: 0, z: inertia.z },
    },
  };
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { M6WebRig } from '../physics/m6-rig';
import type { Vec3 } from '../physics/rig-config';
import { VehicleOrbitCamera } from './vehicle-camera';

export interface RenderContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  updateCamera(target: THREE.Object3D, deltaSeconds: number): void;
  dispose(): void;
}

interface DynamicSegment {
  mesh: THREE.Mesh;
  radius: number;
  endpoints(): [THREE.Vector3, THREE.Vector3];
}

interface WheelVisualTarget {
  root: THREE.Group;
  fallback: THREE.Object3D;
}

export function createRenderContext(canvas: HTMLCanvasElement): RenderContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101923);
  scene.fog = new THREE.Fog(0x101923, 80, 360);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 1200);
  camera.position.set(-9, 5, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const orbitCamera = new VehicleOrbitCamera(canvas, camera);

  const hemisphere = new THREE.HemisphereLight(0xbfdfff, 0x29311f, 1.35);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-35, 55, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90;
  sun.shadow.camera.bottom = -90;
  scene.add(sun);

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const targetWidth = Math.round(width * renderer.getPixelRatio());
    const targetHeight = Math.round(height * renderer.getPixelRatio());
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }
  };

  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  resize();

  return {
    scene,
    camera,
    renderer,
    updateCamera(target, deltaSeconds) {
      orbitCamera.update(target, deltaSeconds);
    },
    dispose() {
      window.removeEventListener('resize', onResize);
      orbitCamera.dispose();
      renderer.dispose();
    },
  };
}

export function createRigVisuals(scene: THREE.Scene, rig: M6WebRig): THREE.Group {
  const b3 = (rig as unknown as { b3: any }).b3;
  const chassisRoot = new THREE.Group();
  chassisRoot.name = 'JV chassis visual root';

  const fallbackChassis = new THREE.Mesh(
    new THREE.BoxGeometry(
      rig.config.chassisHalfExtents.x * 2,
      rig.config.chassisHalfExtents.y * 2,
      rig.config.chassisHalfExtents.z * 2,
    ),
    new THREE.MeshStandardMaterial({
      color: 0x28647a,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
    }),
  );
  fallbackChassis.position.y = -rig.config.cgVerticalOffset;
  fallbackChassis.castShadow = true;
  fallbackChassis.receiveShadow = true;
  chassisRoot.add(fallbackChassis);
  scene.add(chassisRoot);
  rig.bindings.push({ bodyId: rig.chassisId, object: chassisRoot });

  if (rig.config.bodyVisualModel === 'rama_rurowa') {
    void loadRealJvBody(chassisRoot, fallbackChassis, rig.config.bodyVisualOffset);
  } else if (rig.config.bodyVisualModel !== 'brak') {
    console.warn(`Unknown JV bodyVisualModel "${rig.config.bodyVisualModel}"; using the collider fallback.`);
  }

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x131518, roughness: 0.96 });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0x8d979e, roughness: 0.38, metalness: 0.68 });
  const knuckleMaterial = new THREE.MeshStandardMaterial({ color: 0x9aa3aa, roughness: 0.48, metalness: 0.5 });
  const upperArmMaterial = new THREE.MeshStandardMaterial({ color: 0xd76537, roughness: 0.62, metalness: 0.18 });
  const lowerArmMaterial = new THREE.MeshStandardMaterial({ color: 0x397db4, roughness: 0.62, metalness: 0.18 });
  const steeringMaterial = new THREE.MeshStandardMaterial({ color: 0xd8be64, roughness: 0.5, metalness: 0.42 });
  const damperMaterial = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, roughness: 0.35, metalness: 0.75 });
  const wheelTargets: WheelVisualTarget[] = [];

  for (const corner of rig.corners as any[]) {
    const wheelGroup = new THREE.Group();
    const fallback = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(rig.config.wheelRadius, rig.config.wheelRadius, rig.config.wheelWidth, 36),
      wheelMaterial,
    );
    tire.castShadow = true;
    tire.receiveShadow = true;
    fallback.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(
        rig.config.wheelRadius * 0.43,
        rig.config.wheelRadius * 0.43,
        rig.config.wheelWidth * 1.02,
        24,
      ),
      rimMaterial,
    );
    rim.castShadow = true;
    fallback.add(rim);
    wheelGroup.add(fallback);
    scene.add(wheelGroup);
    rig.bindings.push({ bodyId: corner.wheelId, object: wheelGroup });
    wheelTargets.push({ root: wheelGroup, fallback });
  }
  void loadRealJvWheels(wheelTargets);

  const rack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, rig.config.rackHalfWidth * 2, 12),
    steeringMaterial,
  );
  rack.rotation.x = Math.PI / 2;
  rack.castShadow = true;
  scene.add(rack);
  rig.bindings.push({ bodyId: rig.rackId, object: rack });

  const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
  const segments: DynamicSegment[] = [];
  const addSegment = (
    radius: number,
    material: THREE.Material,
    endpoints: DynamicSegment['endpoints'],
  ) => {
    const mesh = new THREE.Mesh(unitCylinder, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    segments.push({ mesh, radius, endpoints });
  };

  const worldPoint = (bodyId: any, local: any) => toThree(b3.b3Body_GetWorldPoint(bodyId, local));
  for (const corner of rig.corners as any[]) {
    const hp = corner.hardpoints;
    const wheelCenter = corner.restWheelCenterLocal;
    const upperBallLocal = subtract(hp.upperBallJoint, wheelCenter);
    const lowerBallLocal = subtract(hp.lowerBallJoint, wheelCenter);
    const steeringArmLocal = subtract(hp.steeringArm, wheelCenter);
    const coiloverKnuckleLocal = subtract(hp.coiloverKnuckle, wheelCenter);

    addSegment(0.032, upperArmMaterial, () => [
      worldPoint(rig.chassisId, hp.upperFrontChassis),
      worldPoint(corner.knuckleId, upperBallLocal),
    ]);
    addSegment(0.032, upperArmMaterial, () => [
      worldPoint(rig.chassisId, hp.upperRearChassis),
      worldPoint(corner.knuckleId, upperBallLocal),
    ]);
    addSegment(0.038, lowerArmMaterial, () => [
      worldPoint(rig.chassisId, hp.lowerFrontChassis),
      worldPoint(corner.knuckleId, lowerBallLocal),
    ]);
    addSegment(0.038, lowerArmMaterial, () => [
      worldPoint(rig.chassisId, hp.lowerRearChassis),
      worldPoint(corner.knuckleId, lowerBallLocal),
    ]);
    addSegment(0.052, knuckleMaterial, () => [
      worldPoint(corner.knuckleId, lowerBallLocal),
      worldPoint(corner.knuckleId, upperBallLocal),
    ]);
    addSegment(0.043, damperMaterial, () => [
      worldPoint(rig.chassisId, hp.coiloverChassis),
      worldPoint(corner.knuckleId, coiloverKnuckleLocal),
    ]);

    if (corner.isFront) {
      const rackEndLocal = {
        x: 0,
        y: 0,
        z: corner.isLeft ? -rig.config.rackHalfWidth : rig.config.rackHalfWidth,
      };
      addSegment(0.026, steeringMaterial, () => [
        worldPoint(rig.rackId, rackEndLocal),
        worldPoint(corner.knuckleId, steeringArmLocal),
      ]);
    } else {
      const inward = corner.isLeft ? 1 : -1;
      const droopLift = rig.config.wishbone.lowerArmLength
        * Math.tan(rig.config.wishbone.restArmDroopDeg * Math.PI / 180);
      const toeChassis = {
        x: hp.steeringArm.x,
        y: hp.steeringArm.y + droopLift,
        z: hp.steeringArm.z + inward * rig.config.wishbone.lowerArmLength,
      };
      addSegment(0.026, steeringMaterial, () => [
        worldPoint(rig.chassisId, toeChassis),
        worldPoint(corner.knuckleId, steeringArmLocal),
      ]);
    }
  }

  const updateRigVisuals = () => {
    for (const segment of segments) updateSegment(segment);
  };
  chassisRoot.userData.updateRigVisuals = updateRigVisuals;
  rig.syncVisuals();
  updateRigVisuals();
  return chassisRoot;
}

async function loadRealJvBody(
  chassisRoot: THREE.Group,
  fallback: THREE.Object3D,
  sessionOffset: Vec3,
): Promise<void> {
  try {
    const gltf = await new GLTFLoader().loadAsync('./assets/vehicle/Nadwozie.gltf');
    const body = gltf.scene;
    body.name = 'JV rama_rurowa · Nadwozie.gltf';
    body.scale.setScalar(0.35);
    body.rotation.y = -Math.PI / 2;
    body.position.set(sessionOffset.x, -0.60 + sessionOffset.y, sessionOffset.z);
    configureJvMaterials(body);
    chassisRoot.add(body);
    fallback.visible = false;
  } catch (error) {
    console.warn('JV rama_rurowa could not be loaded; using the collider fallback.', error);
  }
}

async function loadRealJvWheels(targets: WheelVisualTarget[]): Promise<void> {
  try {
    const gltf = await new GLTFLoader().loadAsync('./assets/vehicle/Offroad_Big_Wheels.gltf');
    const source = gltf.scene;
    source.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(source);
    if (bounds.isEmpty()) throw new Error('wheel GLTF has empty bounds');
    const authoredCenter = bounds.getCenter(new THREE.Vector3());

    const xToBodyY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    const upToBodyRadial = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    const correction = new THREE.Quaternion().multiplyQuaternions(upToBodyRadial, xToBodyY);

    for (const target of targets) {
      const correctionRoot = new THREE.Group();
      correctionRoot.name = 'JV wheel visual correction';
      correctionRoot.quaternion.copy(correction);

      const wheel = source.clone(true);
      wheel.name = 'JV Offroad_Big_Wheels.gltf';
      wheel.scale.setScalar(0.35);
      wheel.position.copy(authoredCenter).multiplyScalar(-0.35);
      configureJvMaterials(wheel);
      correctionRoot.add(wheel);
      target.root.add(correctionRoot);
      target.fallback.visible = false;
    }
  } catch (error) {
    console.warn('JV wheel model could not be loaded; using primitive wheel visuals.', error);
  }
}

function configureJvMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if ('map' in material && material.map instanceof THREE.Texture) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.magFilter = THREE.NearestFilter;
        material.map.minFilter = THREE.NearestFilter;
        material.map.needsUpdate = true;
      }
    }
  });
}

function updateSegment(segment: DynamicSegment): void {
  const [a, b] = segment.endpoints();
  const direction = new THREE.Vector3().subVectors(b, a);
  const segmentLength = direction.length();
  if (segmentLength < 1e-5) {
    segment.mesh.visible = false;
    return;
  }
  segment.mesh.visible = true;
  segment.mesh.position.copy(a).add(b).multiplyScalar(0.5);
  segment.mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.multiplyScalar(1 / segmentLength),
  );
  segment.mesh.scale.set(segment.radius, segmentLength, segment.radius);
}

function toThree(value: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(value.x, value.y, value.z);
}

function subtract(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

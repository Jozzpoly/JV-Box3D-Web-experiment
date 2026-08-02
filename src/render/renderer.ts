import * as THREE from 'three';
import type { M6WebRig } from '../physics/m6-rig';

export interface RenderContext {
  scene: any;
  camera: any;
  renderer: any;
  updateCamera(target: any, deltaSeconds: number): void;
  dispose(): void;
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

  const chasePosition = new THREE.Vector3();
  const desiredPosition = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const behind = new THREE.Vector3(-8.5, 4.2, 0);

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * renderer.getPixelRatio()) || canvas.height !== Math.round(height * renderer.getPixelRatio())) {
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
    updateCamera(target: any, deltaSeconds: number) {
      target.getWorldPosition(lookTarget);
      desiredPosition.copy(behind).applyQuaternion(target.quaternion).add(lookTarget);
      const blend = 1 - Math.exp(-5 * deltaSeconds);
      chasePosition.lerp(desiredPosition, blend);
      camera.position.copy(chasePosition);
      camera.lookAt(lookTarget.x, lookTarget.y + 0.55, lookTarget.z);
    },
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}

export function createRigVisuals(scene: any, rig: M6WebRig): any {
  const chassisRoot = new THREE.Group();
  const chassisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      rig.config.chassisHalfExtents.x * 2,
      rig.config.chassisHalfExtents.y * 2,
      rig.config.chassisHalfExtents.z * 2,
    ),
    new THREE.MeshStandardMaterial({ color: 0x3085a3, roughness: 0.55, metalness: 0.12 }),
  );
  chassisMesh.position.y = -rig.config.cgVerticalOffset;
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  chassisRoot.add(chassisMesh);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.58, 0.95),
    new THREE.MeshStandardMaterial({ color: 0x1c3b49, roughness: 0.35, metalness: 0.2 }),
  );
  cabin.position.set(-0.25, 0.37, 0);
  cabin.castShadow = true;
  chassisRoot.add(cabin);
  scene.add(chassisRoot);
  rig.bindings.push({ bodyId: rig.chassisId, object: chassisRoot });

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.92 });
  const hubMaterial = new THREE.MeshStandardMaterial({ color: 0x87919a, roughness: 0.42, metalness: 0.55 });
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xb25d38, roughness: 0.68, metalness: 0.18 });

  for (const corner of rig.corners) {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(rig.config.wheelRadius, rig.config.wheelRadius, rig.config.wheelWidth, 32),
      wheelMaterial,
    );
    tire.castShadow = true;
    tire.receiveShadow = true;
    wheelGroup.add(tire);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(rig.config.wheelRadius * 0.42, rig.config.wheelRadius * 0.42, rig.config.wheelWidth * 1.04, 20),
      hubMaterial,
    );
    hub.castShadow = true;
    wheelGroup.add(hub);
    scene.add(wheelGroup);
    rig.bindings.push({ bodyId: corner.wheelId, object: wheelGroup });

    const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), hubMaterial);
    knuckle.castShadow = true;
    scene.add(knuckle);
    rig.bindings.push({ bodyId: corner.knuckleId, object: knuckle });

    for (const [bodyId, verticalOffset] of [[corner.upperArmId, 0.08], [corner.lowerArmId, -0.08]] as const) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.62), armMaterial);
      arm.position.y = verticalOffset;
      arm.castShadow = true;
      scene.add(arm);
      rig.bindings.push({ bodyId, object: arm });
    }
  }

  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, rig.config.rackHalfWidth * 2),
    new THREE.MeshStandardMaterial({ color: 0xd6bc65, roughness: 0.5, metalness: 0.42 }),
  );
  rack.castShadow = true;
  scene.add(rack);
  rig.bindings.push({ bodyId: rig.rackId, object: rack });
  rig.syncVisuals();
  return chassisRoot;
}

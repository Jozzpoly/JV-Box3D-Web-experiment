import * as THREE from 'three';

/**
 * Lightweight visual-only stand-in for a capsule.
 * Box3D still uses the exact rounded b3Capsule collider; this geometry only
 * draws its straight span and deliberately avoids another runtime dependency.
 */
export class CapsuleGeometry extends THREE.CylinderGeometry {
  constructor(
    radius = 1,
    length = 1,
    _capSegments = 3,
    radialSegments = 8,
  ) {
    super(radius, radius, length, radialSegments, 1, false);
  }
}

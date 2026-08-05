export type JvVec3 = Readonly<{ x: number; y: number; z: number }>;
export type JvQuat = Readonly<{ x: number; y: number; z: number; w: number }>;
export type JvColor = readonly [number, number, number, number];

export interface JvBounds {
  readonly minimum: JvVec3;
  readonly maximum: JvVec3;
}

export interface JvStaticBox {
  readonly center: JvVec3;
  readonly rotation: JvQuat;
  readonly halfExtents: JvVec3;
  readonly friction: number;
  readonly color: JvColor;
}

export interface JvStaticCapsule {
  readonly bodyCenter: JvVec3;
  readonly bodyRotation: JvQuat;
  readonly point1: JvVec3;
  readonly point2: JvVec3;
  readonly radius: number;
  readonly friction: number;
  readonly color: JvColor;
}

export interface JvIndexedMesh {
  readonly positions: Float32Array;
  readonly indices: Uint32Array;
  readonly normals?: Float32Array;
  readonly uvs?: Float32Array;
  readonly textureUrl?: string;
  readonly color: JvColor;
  readonly doubleSided?: boolean;
}

export interface JvScanWorld {
  readonly source: "JSPREV2";
  readonly packId: string;
  readonly origin: JvVec3;
  readonly worldBounds: JvBounds;
  readonly collision: JvIndexedMesh;
  readonly groups: readonly JvIndexedMesh[];
  readonly tileCount: number;
  readonly groupCount: number;
  readonly textureCount: number;
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly triangleCount: number;
  readonly manifestBytes: number;
  readonly binaryBytes: number;
  readonly textureBytes: number;
  readonly totalBytes: number;
  readonly estimatedCpuGeometryBytes: number;
  readonly estimatedGpuGeometryBytes: number;
}

export interface JvWorldData {
  readonly schema: "JV_WEB_E2R_WORLD_V1";
  readonly nativeAuthorityCommit: string;
  readonly spawn: JvVec3;
  readonly boxes: readonly JvStaticBox[];
  readonly capsules: readonly JvStaticCapsule[];
  readonly offroad: JvIndexedMesh;
  readonly scan: JvScanWorld | null;
  readonly scanStatus: "LOADED" | "NOT_AVAILABLE";
}

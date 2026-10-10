// Procedural, repeating detail texture for the Offroad terrain.
//
// The Offroad mesh used to render as one flat colour, which made its relief
// hard to read. This generates a small power-of-two RGBA tile (grass shades
// with dirt patches) and world-space UVs for it. Patterns are deliberately
// low frequency: the product's texture policy forces Pixel/Smooth filtering
// without mipmaps, so coarse blotches stay calm at distance and read as
// chunky pixels in Pixel mode. Deterministic for a given seed.

export const TERRAIN_DETAIL_SIZE = 64;
export const TERRAIN_DETAIL_METERS_PER_TILE = 24;

function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Tileable value noise on a `cells` x `cells` lattice over the unit square. */
function tileNoise(u: number, v: number, cells: number, seed: number): number {
  const x = u * cells;
  const y = v * cells;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const wrap = (n: number): number => ((n % cells) + cells) % cells;
  const a = hash(wrap(x0), wrap(y0), seed);
  const b = hash(wrap(x0 + 1), wrap(y0), seed);
  const c = hash(wrap(x0), wrap(y0 + 1), seed);
  const d = hash(wrap(x0 + 1), wrap(y0 + 1), seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

const GRASS_DARK = [58, 96, 48] as const;
const GRASS_LIGHT = [104, 146, 66] as const;
const DIRT = [122, 102, 72] as const;

function mix(a: readonly number[], b: readonly number[], t: number): number[] {
  return a.map((value, index) => value + (b[index]! - value) * t);
}

export function createTerrainDetailPixels(
  size = TERRAIN_DETAIL_SIZE,
  seed = 7,
): Uint8Array {
  if (!Number.isInteger(size) || size < 2 || (size & (size - 1)) !== 0) {
    throw new RangeError("Terrain detail size must be a power of two.");
  }
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const broad = tileNoise(u, v, 4, seed);
      const medium = tileNoise(u, v, 8, seed + 11);
      const grass = mix(GRASS_DARK, GRASS_LIGHT, Math.min(1, broad * 0.7 + medium * 0.45));
      const dirtMask = Math.max(0, Math.min(1, (tileNoise(u, v, 4, seed + 23) - 0.6) * 4));
      const colour = mix(grass, DIRT, dirtMask);
      const jitter = (hash(x, y, seed + 37) - 0.5) * 10;
      const offset = (y * size + x) * 4;
      pixels[offset] = Math.max(0, Math.min(255, Math.round(colour[0]! + jitter)));
      pixels[offset + 1] = Math.max(0, Math.min(255, Math.round(colour[1]! + jitter)));
      pixels[offset + 2] = Math.max(0, Math.min(255, Math.round(colour[2]! + jitter)));
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

/** Planar world-space UVs (x, z) for a repeating detail tile. */
export function createTerrainDetailUvs(
  positions: Float32Array,
  metersPerTile = TERRAIN_DETAIL_METERS_PER_TILE,
): Float32Array {
  if (!(metersPerTile > 0) || positions.length % 3 !== 0) {
    throw new RangeError("Terrain detail UVs need XYZ positions and a positive tile size.");
  }
  const vertexCount = positions.length / 3;
  const uvs = new Float32Array(vertexCount * 2);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    uvs[vertex * 2] = positions[vertex * 3]! / metersPerTile;
    uvs[vertex * 2 + 1] = positions[vertex * 3 + 2]! / metersPerTile;
  }
  return uvs;
}

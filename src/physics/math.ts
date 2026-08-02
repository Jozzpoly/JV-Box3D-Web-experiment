import type { Vec3 } from './rig-config';

export const DEG = Math.PI / 180;
export const VEC3_ZERO: Vec3 = { x: 0, y: 0, z: 0 };
export const AXIS_X: Vec3 = { x: 1, y: 0, z: 0 };
export const AXIS_Y: Vec3 = { x: 0, y: 1, z: 0 };
export const AXIS_Z: Vec3 = { x: 0, y: 0, z: 1 };

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
export function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}
export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
export function length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}
export function normalize(v: Vec3): Vec3 {
  const l = length(v);
  return l > 1e-8 ? scale(v, 1 / l) : { ...AXIS_Y };
}
export function distance(a: Vec3, b: Vec3): number {
  return length(sub(a, b));
}
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

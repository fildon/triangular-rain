export interface Point {
  readonly x: number;
  readonly y: number;
}
export interface Segment {
  readonly a: Point;
  readonly b: Point;
}

export const SQRT3_OVER_2 = Math.sqrt(3) / 2;

// Downward ray directions — 60° below horizontal, forming a 60° spread
export const LEFT_DIR: Point = { x: -0.5, y: SQRT3_OVER_2 };
export const RIGHT_DIR: Point = { x: 0.5, y: SQRT3_OVER_2 };

// Returns t >= 0 where ray (origin + t*dir) hits segment [a,b], or null
export function raySegmentT(
  origin: Point,
  dir: Point,
  a: Point,
  b: Point,
): number | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const determinant = dir.y * dx - dir.x * dy;
  // If the determinant is very small, the ray and segment are nearly parallel, so we treat it as no intersection
  if (Math.abs(determinant) < 1e-12) return null;

  const fpx = a.x - origin.x;
  const fpy = a.y - origin.y;
  const t = (dx * fpy - dy * fpx) / determinant;
  const s = (dir.x * fpy - dir.y * fpx) / determinant;

  if (t > 1e-9 && s >= -1e-9 && s <= 1 + 1e-9) return t;
  return null;
}

export function castRay(
  origin: Point,
  dir: Point,
  segments: Segment[],
): number {
  let minT = Infinity;
  for (const seg of segments) {
    const t = raySegmentT(origin, dir, seg.a, seg.b);
    if (t !== null && t < minT) minT = t;
  }
  return minT;
}

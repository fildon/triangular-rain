import type { Point, Segment } from "./geometry";
import { LEFT_DIR, RIGHT_DIR, castRay } from "./geometry";

export interface FilledTriangle {
  tip: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface Scene {
  topLeft: Point;
  topRight: Point;
  apex: Point;
  filled: FilledTriangle[];
  allSegments: Segment[];
  horizontalSegments: Segment[];
  consecutiveSkips: number;
  done: boolean;
}

const MIN_SIDE = 0.5    // pixels — triangles smaller than this are sub-pixel and invisible
const MAX_SKIPS = 50   // consecutive sub-pixel samples before declaring the scene complete

export function createScene(
  topLeft: Point,
  topRight: Point,
  apex: Point,
): Scene {
  const topEdge: Segment = { a: topLeft, b: topRight };
  return {
    topLeft,
    topRight,
    apex,
    filled: [],
    allSegments: [topEdge, { a: topLeft, b: apex }, { a: topRight, b: apex }],
    horizontalSegments: [topEdge],
    consecutiveSkips: 0,
    done: false,
  };
}

// Pick a point uniformly at random from the union of horizontal segments, weighted by length
function weightedRandomPoint(segs: Segment[]): Point {
  let total = 0;
  for (const s of segs) total += s.b.x - s.a.x;

  let r = Math.random() * total;
  for (const s of segs) {
    const len = s.b.x - s.a.x;
    if (r < len) return { x: s.a.x + r, y: s.a.y };
    r -= len;
  }

  const last = segs[segs.length - 1];
  return { x: (last.a.x + last.b.x) / 2, y: last.a.y };
}

// Advance the scene by one triangle. Returns the new triangle, or null if done.
export function step(scene: Scene): FilledTriangle | null {
  if (scene.done) return null;

  const tip = weightedRandomPoint(scene.horizontalSegments);

  const tLeft = castRay(tip, LEFT_DIR, scene.allSegments);
  const tRight = castRay(tip, RIGHT_DIR, scene.allSegments);
  const stopT = Math.min(tLeft, tRight);

  if (!isFinite(stopT) || stopT < MIN_SIDE) {
    if (++scene.consecutiveSkips >= MAX_SKIPS) scene.done = true;
    return null;
  }

  scene.consecutiveSkips = 0;

  const bottomLeft: Point = {
    x: tip.x + stopT * LEFT_DIR.x,
    y: tip.y + stopT * LEFT_DIR.y,
  };
  const bottomRight: Point = {
    x: tip.x + stopT * RIGHT_DIR.x,
    y: tip.y + stopT * RIGHT_DIR.y,
  };

  const tri: FilledTriangle = { tip, bottomLeft, bottomRight };
  scene.filled.push(tri);
  scene.allSegments.push(
    { a: bottomLeft, b: bottomRight },
    { a: tip, b: bottomLeft },
    { a: tip, b: bottomRight },
  );
  scene.horizontalSegments.push({ a: bottomLeft, b: bottomRight });

  return tri;
}

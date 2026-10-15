/**
 * A point on a Catmull-Rom spline through `points`, at `t` in 0..1.
 *
 * Catmull-Rom rather than a Bézier chain because it INTERPOLATES: the curve passes exactly through every waypoint, which
 * is what "move along these points" means. A Bézier would only be pulled toward them, so an author asking for a fish to
 * pass the middle of the screen would get one that passed near it.
 *
 * Its own file because two things walk a spline now -- a creature on a path (`hazards.ts`) and the invisible leader of a
 * school (`boids.ts`) -- and the second must not import the first, which imports it.
 */
export function pathPoint(points: readonly { x: number; y: number }[], t: number): { x: number; y: number } {
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  if (n === 1) return points[0]!;
  const span = (n - 1) * Math.min(1, Math.max(0, t));
  const i = Math.min(n - 2, Math.floor(span));
  const u = span - i;
  // The four control points, clamped at the ends: a path that is not closed has to borrow its neighbours' reflections.
  const p0 = points[Math.max(0, i - 1)]!;
  const p1 = points[i]!;
  const p2 = points[i + 1]!;
  const p3 = points[Math.min(n - 1, i + 2)]!;
  const u2 = u * u;
  const u3 = u2 * u;
  const axis = (a: number, b: number, c: number, d: number): number =>
    0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return { x: axis(p0.x, p1.x, p2.x, p3.x), y: axis(p0.y, p1.y, p2.y, p3.y) };
}

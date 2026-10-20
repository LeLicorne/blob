import type { Point } from '@/models/blob-geometry';

/** Contour fermé paramétré par son abscisse curviligne. */
export interface ClosedContour {
  readonly points: readonly Point[];
  /** Longueur cumulée au début de chaque segment, suivie de la longueur totale. */
  readonly cumulative: readonly number[];
  readonly total: number;
}

/** Calcule les longueurs cumulées d'un contour fermé. */
export function buildClosedContour(points: readonly Point[]): ClosedContour {
  const cumulative = [0];
  points.forEach((a, k) => {
    const b = points[(k + 1) % points.length] ?? a;
    cumulative.push((cumulative[k] ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]));
  });
  return { points, cumulative, total: cumulative.at(-1) ?? 0 };
}

/** Point du contour à l'abscisse curviligne `s`, avec bouclage. */
export function pointAtLength(contour: ClosedContour, s: number): Point {
  const { points, cumulative, total } = contour;
  const wrapped = ((s % total) + total) % total;
  let k = 0;
  while ((cumulative[k + 1] ?? total) < wrapped) k++;
  const a = points[k];
  const b = points[(k + 1) % points.length];
  if (!a || !b) throw new Error('Contour must contain at least two points');
  const span = (cumulative[k + 1] ?? total) - (cumulative[k] ?? 0);
  const u = (wrapped - (cumulative[k] ?? 0)) / (span || 1);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

/** Vecteur unitaire de `from` vers `to`. */
export function unitDirection(from: Point, to: Point): Point {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  return [dx / length, dy / length];
}

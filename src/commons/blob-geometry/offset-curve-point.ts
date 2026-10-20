import type { BlobGeometryParams, Point } from '@/models/blob-geometry';
import { separatorX } from '@/commons/blob-geometry/waves';

/** Pente locale `dx/dy` d'une courbe `x = f(y)` et longueur du vecteur `(pente, 1)`. */
export function curveSlope(
  xAt: (y: number) => number,
  y: number,
): { dxdy: number; length: number } {
  const dxdy = (xAt(y + 1) - xAt(y - 1)) / 2;
  return { dxdy, length: Math.hypot(1, dxdy) };
}

/**
 * Point de la courbe `x = f(y)` décalé de `distance` le long de sa normale.
 * Un décalage de `+gap/2` d'un côté et de `-gap/2` de l'autre laisse un écart constant de `gap`.
 */
export function offsetCurvePoint(xAt: (y: number) => number, y: number, distance: number): Point {
  const { dxdy, length } = curveSlope(xAt, y);
  return [xAt(y) + distance / length, y + (distance * -dxdy) / length];
}

/** Point du séparateur `index` décalé de `gap/2` vers la droite (`direction = 1`) ou la gauche (`-1`). */
export function offsetSeparatorPoint(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  y: number,
  t: number,
  direction: 1 | -1,
): Point {
  return offsetCurvePoint(
    (yy) => separatorX(geometry, index, yy, t),
    y,
    (geometry.gap / 2) * direction,
  );
}

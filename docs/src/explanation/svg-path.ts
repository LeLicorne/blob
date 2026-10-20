import type { Point } from '@/models/blob-geometry';
import { fixed } from '@docs/explanation/format';

/** Chemin SVG ouvert `M…L…` passant par tous les points. */
export function pathFromPoints(points: readonly Point[]): string {
  return points.map(([x, y], k) => `${k ? 'L' : 'M'}${fixed(x)} ${fixed(y)}`).join('');
}

/** Points `(x(y), y)` pour `y` de `from` à `to` inclus, tous les `step` pixels. */
export function sampleVertical(
  xAt: (y: number) => number,
  from: number,
  to: number,
  step: number,
): Point[] {
  const points: Point[] = [];
  for (let y = from; y <= to; y += step) points.push([xAt(y), y]);
  return points;
}

import type { GaussianKernel, Point } from '@/models/blob-geometry';
import { buildClosedContour } from '@/commons/blob-geometry/closed-contour';

/** Noyau gaussien discret d'écart-type `sigma` (px) pour des points espacés de `step` (px). */
export function gaussianKernel(sigma: number, step: number): GaussianKernel {
  if (sigma <= 0) return { weights: [1], radius: 0, sum: 1 };
  const radius = Math.ceil((3 * sigma) / step);
  const weights = Array.from({ length: 2 * radius + 1 }, (_, k) =>
    Math.exp(-(((k - radius) * step) ** 2) / (2 * sigma * sigma)),
  );
  return { weights, radius, sum: weights.reduce((a, b) => a + b, 0) };
}

function resample(poly: readonly Point[], step: number): { points: Point[]; spacing: number } {
  const contour = buildClosedContour(poly);
  const count = Math.max(3, Math.round(contour.total / step));
  const spacing = contour.total / count;
  const points: Point[] = [];
  let segment = 0;
  for (let k = 0; k < count; k++) {
    const s = k * spacing;
    while ((contour.cumulative[segment + 1] ?? contour.total) < s) segment++;
    const a = poly[segment];
    const b = poly[(segment + 1) % poly.length];
    if (!a || !b) throw new Error('Polygon must contain at least two points');
    const start = contour.cumulative[segment] ?? 0;
    const span = (contour.cumulative[segment + 1] ?? contour.total) - start;
    const u = (s - start) / (span || 1);
    points.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return { points, spacing };
}

/**
 * Rééchantillonne un contour fermé à pas régulier puis le lisse par moyenne gaussienne le long
 * du contour. Renvoie le chemin SVG fermé correspondant.
 */
export function smoothClosedPath(poly: readonly Point[], step: number, sigma: number): string {
  const { points, spacing } = resample(poly, step);
  const { weights, radius, sum } = gaussianKernel(sigma, spacing);
  const count = points.length;
  let path = '';
  for (let k = 0; k < count; k++) {
    let sx = 0;
    let sy = 0;
    for (let j = -radius; j <= radius; j++) {
      const p = points[(((k + j) % count) + count) % count];
      const w = weights[j + radius] ?? 0;
      sx += (p?.[0] ?? 0) * w;
      sy += (p?.[1] ?? 0) * w;
    }
    path += `${k ? 'L' : 'M'}${(sx / sum).toFixed(1)} ${(sy / sum).toFixed(1)}`;
  }
  return `${path}Z`;
}

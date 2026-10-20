import type {
  BlobGeometryParams,
  BlobShapeConfig,
  CornerFillet,
  GridGeometryParams,
  Point,
  SharpOutline,
} from '@/models/blob-geometry';
import { SMOOTH_RESAMPLE_STEP } from '@/const/blob-carousel';
import { buildClosedContour } from '@/commons/blob-geometry/closed-contour';
import { buildGridOutline } from '@/commons/blob-geometry/grid-outline';
import { computeCornerFillet } from '@/commons/blob-geometry/corner-fillet';
import { buildSharpOutline } from '@/commons/blob-geometry/sharp-outline';
import { smoothClosedPath } from '@/commons/blob-geometry/smooth-closed';

const FILLET_SAMPLES = 16;

function sampleBezier(from: CornerFillet): Point[] {
  const { pointBefore: p0, handleBefore: p1, handleAfter: p2, pointAfter: p3 } = from;
  return Array.from({ length: FILLET_SAMPLES - 1 }, (_, k) => {
    const u = (k + 1) / FILLET_SAMPLES;
    const v = 1 - u;
    const w = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u] as const;
    return [
      w[0] * p0[0] + w[1] * p1[0] + w[2] * p2[0] + w[3] * p3[0],
      w[0] * p0[1] + w[1] * p1[1] + w[2] * p2[1] + w[3] * p3[1],
    ];
  });
}

/**
 * Arrondit les quatre coins d'un contour par des Béziers tangentes aux bords, puis le lisse par
 * moyenne gaussienne. Renvoie le chemin SVG fermé.
 */
export function roundOutline(
  { points, cornerIndices }: Readonly<SharpOutline>,
  { corner, smooth }: Readonly<Pick<BlobShapeConfig, 'corner' | 'smooth'>>,
): string {
  const contour = buildClosedContour(points);
  const cornerS = cornerIndices.map((k) => contour.cumulative[k] ?? 0);

  const fillets = cornerS.map((s, c) => {
    const previous = cornerS[(c + 3) % 4] ?? 0;
    const next = c === 3 ? contour.total : (cornerS[c + 1] ?? 0);
    const previousLength = s - previous + (c === 0 ? contour.total : 0);
    return computeCornerFillet(contour, s, previousLength, next - s, corner);
  });

  const polygon: Point[] = [];
  fillets.forEach((current, c) => {
    const following = fillets[(c + 1) % 4];
    if (!following) return;
    polygon.push(current.pointAfter);
    points.forEach((p, k) => {
      const s = contour.cumulative[k] ?? 0;
      if (s > current.sAfter && s < following.sBefore) polygon.push(p);
    });
    polygon.push(following.pointBefore, ...sampleBezier(following));
  });
  return smoothClosedPath(polygon, SMOOTH_RESAMPLE_STEP, smooth);
}

/** Chemin SVG fermé du blob `index` du carrousel au temps `t` (ms). */
export function buildBlobPath(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  t: number,
): string {
  return roundOutline(buildSharpOutline(geometry, index, t), geometry);
}

/** Chemin SVG fermé du blob de la cellule (`column`, `row`) d'une grille au temps `t` (ms). */
export function buildGridBlobPath(
  grid: Readonly<GridGeometryParams>,
  column: number,
  row: number,
  t: number,
): string {
  return roundOutline(buildGridOutline(grid, column, row, t), grid);
}

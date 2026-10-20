import type {
  BlobGeometryParams,
  EdgeEndTrial,
  HorizontalEdge,
  Point,
  SharpOutline,
} from '@/models/blob-geometry';
import { EDGE_END_TRIALS, OUTLINE_VERTEX_SPACING } from '@/const/blob-carousel';
import { offsetSeparatorPoint } from '@/commons/blob-geometry/offset-curve-point';
import { bottomEdgeY, topEdgeY } from '@/commons/blob-geometry/waves';

const EDGE_START_RATIO: Record<HorizontalEdge, number> = { top: 0.1, bottom: 0.9 };

function edgeY(
  geometry: Readonly<BlobGeometryParams>,
  edge: HorizontalEdge,
  x: number,
  t: number,
): number {
  return edge === 'top' ? topEdgeY(geometry, x, t) : bottomEdgeY(geometry, x, t);
}

/**
 * Suit la recherche, par itération de point fixe, de la hauteur où le bord vertical décalé du
 * séparateur `index` rencontre le bord horizontal `edge`.
 */
export function traceEdgeEnd(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  direction: 1 | -1,
  edge: HorizontalEdge,
  t: number,
  trialCount: number = EDGE_END_TRIALS,
): EdgeEndTrial[] {
  const trials: EdgeEndTrial[] = [];
  let y = geometry.height * EDGE_START_RATIO[edge];
  for (let k = 0; k < trialCount; k++) {
    const [x] = offsetSeparatorPoint(geometry, index, y, t, direction);
    const next = edgeY(geometry, edge, x, t);
    trials.push({ y, x, next });
    y = next;
  }
  return trials;
}

function findEdgeEnd(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  direction: 1 | -1,
  edge: HorizontalEdge,
  t: number,
): number {
  return traceEdgeEnd(geometry, index, direction, edge, t).at(-1)?.next ?? 0;
}

function horizontalEdgePoints(
  geometry: Readonly<BlobGeometryParams>,
  from: Point,
  to: Point,
  edge: HorizontalEdge,
  t: number,
): Point[] {
  const count = Math.ceil(geometry.pitch / OUTLINE_VERTEX_SPACING);
  const errorFrom = from[1] - edgeY(geometry, edge, from[0], t);
  const errorTo = to[1] - edgeY(geometry, edge, to[0], t);
  const points: Point[] = [];
  for (let k = 1; k < count; k++) {
    const u = k / count;
    const x = from[0] + (to[0] - from[0]) * u;
    points.push([x, edgeY(geometry, edge, x, t) + errorFrom * (1 - u) + errorTo * u]);
  }
  return points;
}

function verticalEdgePoints(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  direction: 1 | -1,
  yStart: number,
  yEnd: number,
  t: number,
): Point[] {
  const count = Math.ceil(geometry.height / OUTLINE_VERTEX_SPACING);
  return Array.from({ length: count + 1 }, (_, k) =>
    offsetSeparatorPoint(geometry, index, yStart + ((yEnd - yStart) * k) / count, t, direction),
  );
}

/**
 * Contour du blob `index` avec quatre coins vifs : bords verticaux = séparateurs décalés de
 * `gap/2`, bords horizontaux = courbes haute et basse recalées sur les coins.
 */
export function buildSharpOutline(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  t: number,
): SharpOutline {
  const left = verticalEdgePoints(
    geometry,
    index,
    1,
    findEdgeEnd(geometry, index, 1, 'top', t),
    findEdgeEnd(geometry, index, 1, 'bottom', t),
    t,
  );
  const right = verticalEdgePoints(
    geometry,
    index + 1,
    -1,
    findEdgeEnd(geometry, index + 1, -1, 'top', t),
    findEdgeEnd(geometry, index + 1, -1, 'bottom', t),
    t,
  );
  const last = left.length - 1;
  const [topLeft, bottomLeft] = [left[0], left[last]];
  const [topRight, bottomRight] = [right[0], right[last]];
  if (!topLeft || !bottomLeft || !topRight || !bottomRight) {
    throw new Error('Outline edges must contain at least two points');
  }

  const top = horizontalEdgePoints(geometry, topLeft, topRight, 'top', t);
  const bottom = horizontalEdgePoints(geometry, bottomLeft, bottomRight, 'bottom', t).reverse();
  const rightSide = right.slice(1, last);
  const leftSide = left.slice(1, last).reverse();

  const points = [
    topLeft,
    ...top,
    topRight,
    ...rightSide,
    bottomRight,
    ...bottom,
    bottomLeft,
    ...leftSide,
  ];
  const cornerIndices = [
    0,
    top.length + 1,
    top.length + 1 + rightSide.length + 1,
    top.length + 1 + rightSide.length + 1 + bottom.length + 1,
  ];
  return { points, cornerIndices };
}

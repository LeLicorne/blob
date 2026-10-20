import type { CornerFillet, Point } from '@/models/blob-geometry';
import { FILLET_ITERATIONS } from '@/const/blob-carousel';
import { clamp } from '@/commons/clamp';
import {
  type ClosedContour,
  pointAtLength,
  unitDirection,
} from '@/commons/blob-geometry/closed-contour';

const TANGENT_SAMPLE_DISTANCE = 6;
const MAX_CUT_RATIO = 0.45;
const MAX_TURN_FOR_CUT = 2.4;
const SHALLOW_TURN = 0.05;
const SHALLOW_TURN_FACTOR = 0.55;

/**
 * Facteur de poignée d'une Bézier cubique qui approche un arc de cercle d'angle `turn`
 * (0,5523 à 90°, plus court au-delà).
 */
export function handleFactor(turn: number): number {
  return turn < SHALLOW_TURN
    ? SHALLOW_TURN_FACTOR
    : ((4 / 3) * Math.tan(turn / 4)) / Math.tan(turn / 2);
}

function angleBetween(a: Point, b: Point): number {
  return Math.acos(clamp(a[0] * b[0] + a[1] * b[1], -1, 1));
}

interface Cut {
  readonly sBefore: number;
  readonly sAfter: number;
  readonly pointBefore: Point;
  readonly pointAfter: Point;
  readonly tangentBefore: Point;
  readonly tangentAfter: Point;
}

function cutAt(contour: ClosedContour, cornerS: number, distance: number): Cut {
  const sBefore = cornerS - distance;
  const sAfter = cornerS + distance;
  const pointBefore = pointAtLength(contour, sBefore);
  const pointAfter = pointAtLength(contour, sAfter);
  return {
    sBefore: sBefore < 0 ? sBefore + contour.total : sBefore,
    sAfter,
    pointBefore,
    pointAfter,
    tangentBefore: unitDirection(
      pointAtLength(contour, sBefore - TANGENT_SAMPLE_DISTANCE),
      pointBefore,
    ),
    tangentAfter: unitDirection(
      pointAfter,
      pointAtLength(contour, sAfter + TANGENT_SAMPLE_DISTANCE),
    ),
  };
}

/**
 * Longueur de coupe de chaque côté d'un coin pour obtenir un arrondi de rayon `radius`.
 * Les bords étant courbes, l'angle réel est mesuré aux points de coupe : on itère.
 */
export function iterateCutDistance(
  contour: ClosedContour,
  cornerS: number,
  radius: number,
  cap: number,
): { distance: number; cut: Cut } {
  let distance = Math.min(radius, cap);
  let cut = cutAt(contour, cornerS, distance);
  for (let it = 0; it < FILLET_ITERATIONS; it++) {
    const turn = angleBetween(cut.tangentBefore, cut.tangentAfter);
    distance =
      0.5 * distance + 0.5 * Math.min(radius * Math.tan(Math.min(turn, MAX_TURN_FOR_CUT) / 2), cap);
    cut = cutAt(contour, cornerS, distance);
  }
  return { distance, cut };
}

function tangentIntersection(cut: Cut, distance: number): Point {
  const { pointBefore, pointAfter, tangentBefore, tangentAfter } = cut;
  const dx = pointAfter[0] - pointBefore[0];
  const dy = pointAfter[1] - pointBefore[1];
  const det = -tangentBefore[0] * tangentAfter[1] + tangentAfter[0] * tangentBefore[1];
  const lambda = Math.abs(det) > 1e-6 ? (-dx * tangentAfter[1] + tangentAfter[0] * dy) / det : -1;
  return lambda > 0 && lambda < 3 * distance + 1
    ? [pointBefore[0] + tangentBefore[0] * lambda, pointBefore[1] + tangentBefore[1] * lambda]
    : [(pointBefore[0] + pointAfter[0]) / 2, (pointBefore[1] + pointAfter[1]) / 2];
}

/**
 * Remplace le coin d'abscisse curviligne `cornerS` par une Bézier cubique tangente aux deux
 * bords, avec deux poignées de même longueur pour une courbure régulière.
 */
export function computeCornerFillet(
  contour: ClosedContour,
  cornerS: number,
  previousCornerLength: number,
  nextCornerLength: number,
  radius: number,
): CornerFillet {
  const cap = MAX_CUT_RATIO * Math.min(previousCornerLength, nextCornerLength);
  const { distance, cut } = iterateCutDistance(contour, cornerS, radius, cap);
  const apex = tangentIntersection(cut, distance);
  const turn = angleBetween(cut.tangentBefore, cut.tangentAfter);
  const handle =
    (handleFactor(turn) *
      (Math.hypot(apex[0] - cut.pointBefore[0], apex[1] - cut.pointBefore[1]) +
        Math.hypot(apex[0] - cut.pointAfter[0], apex[1] - cut.pointAfter[1]))) /
    2;
  return {
    sBefore: cut.sBefore,
    sAfter: cut.sAfter,
    pointBefore: cut.pointBefore,
    pointAfter: cut.pointAfter,
    handleBefore: [
      cut.pointBefore[0] + cut.tangentBefore[0] * handle,
      cut.pointBefore[1] + cut.tangentBefore[1] * handle,
    ],
    handleAfter: [
      cut.pointAfter[0] - cut.tangentAfter[0] * handle,
      cut.pointAfter[1] - cut.tangentAfter[1] * handle,
    ],
  };
}

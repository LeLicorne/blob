import type { Point } from '@/models/blob-geometry';
import { handleFactor } from '@/commons/blob-geometry/corner-fillet';

const EDGE_LENGTH = 230;
const APEX: Point = [470, 80];
const MAX_CUT_RATIO = 0.45;

/** Valeurs calculées pour un coin d'angle de virage `degrees` arrondi au rayon `radius`. */
export interface CornerDemo {
  readonly radius: number;
  readonly degrees: number;
  readonly cap: number;
  readonly rawCut: number;
  readonly cut: number;
  readonly factor: number;
  readonly handle: number;
  readonly obtainedRadius: number;
  readonly apex: Point;
  readonly start: Point;
  readonly end: Point;
  readonly pointBefore: Point;
  readonly pointAfter: Point;
  readonly handleBefore: Point;
  readonly handleAfter: Point;
}

/** Calcule la découpe d'un coin droit-puis-penché, sur des bords droits de 230 px. */
export function computeCornerDemo(radius: number, degrees: number): CornerDemo {
  const turn = (degrees * Math.PI) / 180;
  const cap = MAX_CUT_RATIO * EDGE_LENGTH;
  const rawCut = radius * Math.tan(turn / 2);
  const cut = Math.min(rawCut, cap);
  const factor = handleFactor(turn);
  const handle = factor * cut;
  const after: Point = [Math.cos(turn), Math.sin(turn)];
  return {
    radius,
    degrees,
    cap,
    rawCut,
    cut,
    factor,
    handle,
    obtainedRadius: cut / Math.tan(turn / 2),
    apex: APEX,
    start: [APEX[0] - EDGE_LENGTH, APEX[1]],
    end: [APEX[0] + after[0] * EDGE_LENGTH, APEX[1] + after[1] * EDGE_LENGTH],
    pointBefore: [APEX[0] - cut, APEX[1]],
    pointAfter: [APEX[0] + after[0] * cut, APEX[1] + after[1] * cut],
    handleBefore: [APEX[0] - cut + handle, APEX[1]],
    handleAfter: [APEX[0] + after[0] * (cut - handle), APEX[1] + after[1] * (cut - handle)],
  };
}

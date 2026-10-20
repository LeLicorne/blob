import type { GaussianKernel, Point } from '@/models/blob-geometry';
import { clamp } from '@/commons/clamp';
import { gaussianKernel } from '@/commons/blob-geometry/smooth-closed';

/** Pas entre deux points du tracé de démonstration, en pixels. */
export const DEMO_STEP = 4;
/** Rayon de l'arrondi du tracé de démonstration, en pixels. */
export const DEMO_ARC_RADIUS = 30;

const STRAIGHT_BEFORE = 180;
const STRAIGHT_AFTER = 120;
const ORIGIN: Point = [30, 70];

/** Tracé de démonstration : un bord droit, un quart de cercle, puis un bord droit vertical. */
export function buildRawTrace(): Point[] {
  const arc = (DEMO_ARC_RADIUS * Math.PI) / 2;
  const total = STRAIGHT_BEFORE + arc + STRAIGHT_AFTER;
  const count = Math.round(total / DEMO_STEP);
  return Array.from({ length: count + 1 }, (_, k): Point => {
    const s = k * (total / count);
    if (s <= STRAIGHT_BEFORE) return [ORIGIN[0] + s, ORIGIN[1]];
    if (s <= STRAIGHT_BEFORE + arc) {
      const angle = (s - STRAIGHT_BEFORE) / DEMO_ARC_RADIUS;
      return [
        ORIGIN[0] + STRAIGHT_BEFORE + DEMO_ARC_RADIUS * Math.sin(angle),
        ORIGIN[1] + DEMO_ARC_RADIUS - DEMO_ARC_RADIUS * Math.cos(angle),
      ];
    }
    return [
      ORIGIN[0] + STRAIGHT_BEFORE + DEMO_ARC_RADIUS,
      ORIGIN[1] + DEMO_ARC_RADIUS + (s - STRAIGHT_BEFORE - arc),
    ];
  });
}

/** Angle (degrés) dont le tracé tourne en chacun de ses points intérieurs. */
export function turnAngles(points: readonly Point[]): number[] {
  const angles: number[] = [];
  for (let k = 1; k < points.length - 1; k++) {
    const a = points[k - 1];
    const b = points[k];
    const c = points[k + 1];
    if (!a || !b || !c) continue;
    let delta = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    angles.push((delta * 180) / Math.PI);
  }
  return angles;
}

/** Moyenne gaussienne de chaque point avec ses voisins (les extrémités sont prolongées). */
export function smoothOpenTrace(points: readonly Point[], kernel: GaussianKernel): Point[] {
  return points.map((_, k) => {
    let sx = 0;
    let sy = 0;
    for (let j = -kernel.radius; j <= kernel.radius; j++) {
      const p = points[clamp(k + j, 0, points.length - 1)];
      const w = kernel.weights[j + kernel.radius] ?? 0;
      sx += (p?.[0] ?? 0) * w;
      sy += (p?.[1] ?? 0) * w;
    }
    return [sx / kernel.sum, sy / kernel.sum];
  });
}

/** Nombre de pixels nécessaires pour passer de 10 % à 90 % du virage maximal. */
export function riseDistance(angles: readonly number[], peak: number): number {
  const from = angles.findIndex((v) => Math.abs(v) > 0.1 * peak);
  const to = angles.findIndex((v) => Math.abs(v) > 0.9 * peak);
  return (from >= 0 && to >= 0 ? Math.max(1, to - from) : 1) * DEMO_STEP;
}

/** Résultat complet de la démonstration de lissage pour un écart-type `sigma`. */
export interface SmoothingDemo {
  readonly raw: readonly Point[];
  readonly smooth: readonly Point[];
  readonly kernel: GaussianKernel;
  readonly rawAngles: readonly number[];
  readonly smoothAngles: readonly number[];
  readonly rawPeak: number;
  readonly smoothPeak: number;
  readonly rawRise: number;
  readonly smoothRise: number;
}

/** Lisse le tracé de démonstration et mesure l'effet sur les virages. */
export function computeSmoothingDemo(sigma: number): SmoothingDemo {
  const raw = buildRawTrace();
  const kernel = gaussianKernel(sigma, DEMO_STEP);
  const smooth = smoothOpenTrace(raw, kernel);
  const rawAngles = turnAngles(raw);
  const smoothAngles = turnAngles(smooth);
  const rawPeak = Math.max(...rawAngles.map(Math.abs));
  const smoothPeak = Math.max(...smoothAngles.map(Math.abs));
  return {
    raw,
    smooth,
    kernel,
    rawAngles,
    smoothAngles,
    rawPeak,
    smoothPeak,
    rawRise: riseDistance(rawAngles, rawPeak),
    smoothRise: riseDistance(smoothAngles, smoothPeak),
  };
}

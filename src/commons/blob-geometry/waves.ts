import type { BlobGeometryParams, BlobShapeConfig, WaveKey } from '@/models/blob-geometry';

const WAVES: Record<
  WaveKey,
  (shape: BlobShapeConfig, index: number, y: number, t: number) => number
> = {
  big: (shape, i, y) => shape.sepAmp * Math.sin(y * 0.012 + i * 1.7),
  mid: (shape, i, y) => shape.sepAmp * shape.detail * Math.sin(y * 0.031 + i * 2.9),
  liveA: (shape, i, y, t) => shape.liveAmp * Math.sin(y * 0.02 + t * shape.liveSpeed * 3 + i * 1.3),
  liveB: (shape, i, y, t) =>
    shape.liveAmp * 0.6 * Math.sin(y * 0.047 - t * shape.liveSpeed * 2 + i * 0.7),
};

/** Contribution d'une des quatre vagues à l'écart horizontal du séparateur `index` à la hauteur `y`. */
export function waveOffset(
  key: WaveKey,
  shape: Readonly<BlobShapeConfig>,
  index: number,
  y: number,
  t: number,
): number {
  return WAVES[key](shape, index, y, t);
}

/** Écart horizontal total du séparateur `index` par rapport à sa verticale : somme des quatre vagues. */
export function separatorDeviation(
  shape: Readonly<BlobShapeConfig>,
  index: number,
  y: number,
  t: number,
): number {
  return (
    waveOffset('big', shape, index, y, t) +
    waveOffset('mid', shape, index, y, t) +
    waveOffset('liveA', shape, index, y, t) +
    waveOffset('liveB', shape, index, y, t)
  );
}

/** Abscisse du séparateur `index` à la hauteur `y` et au temps `t` (ms). */
export function separatorX(
  geometry: Readonly<BlobGeometryParams>,
  index: number,
  y: number,
  t: number,
): number {
  return index * geometry.pitch + separatorDeviation(geometry, index, y, t);
}

/** Hauteur du bord supérieur des blobs à l'abscisse `x` et au temps `t` (ms). */
export function topEdgeY(geometry: Readonly<BlobGeometryParams>, x: number, t: number): number {
  return (
    geometry.height * 0.1 +
    12 * Math.sin(x * 0.011) +
    6 * Math.sin(x * 0.027 + 1) +
    geometry.liveAmp * Math.sin(x * 0.02 + t * geometry.liveSpeed * 2.5)
  );
}

/** Hauteur du bord inférieur des blobs à l'abscisse `x` et au temps `t` (ms). */
export function bottomEdgeY(geometry: Readonly<BlobGeometryParams>, x: number, t: number): number {
  return (
    geometry.height * 0.9 +
    12 * Math.sin(x * 0.013 + 2) +
    6 * Math.sin(x * 0.029 + 4) +
    geometry.liveAmp * Math.sin(x * 0.018 - t * geometry.liveSpeed * 2.2)
  );
}

import { BLOB_PITCH_RATIO, MAX_BLOB_PITCH, MIN_BLOB_PITCH } from '@/const/blob-carousel';
import { clamp } from '@/commons/clamp';
import { modulo } from '@/commons/modulo';

/** Distance entre deux séparateurs : 68 % de la largeur d'écran, bornée entre 230 et 340 px. */
export function blobPitchForWidth(width: number): number {
  return clamp(width * BLOB_PITCH_RATIO, MIN_BLOB_PITCH, MAX_BLOB_PITCH);
}

/** Intervalle d'index de blobs à dessiner autour de la position `offset`, avec une marge d'un blob. */
export function visibleIndexRange(
  offset: number,
  width: number,
  pitch: number,
): { first: number; last: number } {
  const half = Math.ceil(width / 2 / pitch) + 1;
  return { first: Math.floor(offset) - half, last: Math.ceil(offset) + half };
}

/** Déplacement signé le plus court, dans la boucle infinie, de la position `current` vers la diapositive `slide`. */
export function shortestLoopDelta(current: number, slide: number, count: number): number {
  const diff = slide - modulo(current, count);
  if (diff > count / 2) return diff - count;
  if (diff < -count / 2) return diff + count;
  return diff;
}

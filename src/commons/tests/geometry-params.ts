import type { BlobGeometryParams, GridGeometryParams } from '@/models/blob-geometry';
import { DEFAULT_BLOB_SHAPE, DEFAULT_GRID_SHAPE } from '@/const/blob-carousel';

/** Paramètres de géométrie standards pour les tests : blob de 420 px de haut, pas de 300 px. */
export const TEST_GEOMETRY: BlobGeometryParams = {
  ...DEFAULT_BLOB_SHAPE,
  height: 420,
  pitch: 300,
};

/** Paramètres de grille standards pour les tests : cellules de 300 × 300 px. */
export const TEST_GRID: GridGeometryParams = {
  ...DEFAULT_GRID_SHAPE,
  cellWidth: 300,
  cellHeight: 300,
  staggered: false,
};

/** Grille standard dont une rangée sur deux est décalée d'une demi-cellule. */
export const TEST_STAGGERED_GRID: GridGeometryParams = { ...TEST_GRID, staggered: true };

import { DESIGN_CELL_WIDTH, STAGGER_SHIFT } from '@/const/blob-carousel';
import type { BlobShapeConfig } from '@/models/blob-geometry';
import type { GridDimensions } from '@/models/blob-grid';

function atLeastOne(value: number): number {
  return Math.max(1, Math.floor(value));
}

/**
 * Déduit le nombre de colonnes et de lignes. Avec les deux, la grille est fixe et les
 * diapositives en trop sont ignorées. Avec un seul, l'autre s'adapte. Sans aucun, la grille est
 * la plus carrée possible.
 */
export function resolveGridDimensions(
  count: number,
  columns?: number,
  rows?: number,
): GridDimensions {
  if (columns !== undefined && rows !== undefined) {
    const fixed = { columns: atLeastOne(columns), rows: atLeastOne(rows) };
    return { ...fixed, visibleCount: Math.min(count, fixed.columns * fixed.rows) };
  }
  if (columns !== undefined) {
    const fixedColumns = atLeastOne(columns);
    return {
      columns: fixedColumns,
      rows: atLeastOne(Math.ceil(count / fixedColumns)),
      visibleCount: count,
    };
  }
  if (rows !== undefined) {
    const fixedRows = atLeastOne(rows);
    return {
      columns: atLeastOne(Math.ceil(count / fixedRows)),
      rows: fixedRows,
      visibleCount: count,
    };
  }
  const squareColumns = atLeastOne(Math.ceil(Math.sqrt(count)));
  return {
    columns: squareColumns,
    rows: atLeastOne(Math.ceil(count / squareColumns)),
    visibleCount: count,
  };
}

/**
 * Marge à laisser autour de la grille pour que les blobs de bord, dont les séparateurs ondulent,
 * restent dans leur parent : écart maximal des vagues moins le demi-espace déjà reculé. Exprimée
 * dans l'espace de conception de la grille.
 */
export function gridInset(shape: Readonly<BlobShapeConfig>): number {
  return Math.max(0, shape.sepAmp * (1 + shape.detail) + shape.liveAmp * 1.6 - shape.gap / 2);
}

/**
 * Dimensions du dessin de la grille, dans l'espace de conception où une cellule fait
 * `DESIGN_CELL_WIDTH` de large : cellules (plus une demi-cellule si les rangées sont décalées), plus
 * la marge `inset` de chaque côté.
 */
export function gridDesignSize(
  dimensions: Readonly<GridDimensions>,
  aspectRatio: number,
  inset: number,
  staggered = false,
): { width: number; height: number; cellWidth: number; cellHeight: number } {
  const cellWidth = DESIGN_CELL_WIDTH;
  const cellHeight = cellWidth / aspectRatio;
  return {
    width:
      dimensions.columns * cellWidth +
      (staggered && dimensions.rows > 1 ? STAGGER_SHIFT * cellWidth : 0) +
      2 * inset,
    height: dimensions.rows * cellHeight + 2 * inset,
    cellWidth,
    cellHeight,
  };
}

/** Colonne et ligne de la diapositive `index`, rangées de gauche à droite puis de haut en bas. */
export function cellPosition(index: number, columns: number): { column: number; row: number } {
  return { column: index % columns, row: Math.floor(index / columns) };
}

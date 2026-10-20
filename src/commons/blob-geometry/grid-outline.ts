import type { GridGeometryParams, Point, SharpOutline } from '@/models/blob-geometry';
import {
  GRID_INTERSECTION_ITERATIONS,
  HORIZONTAL_AMPLITUDE_RATIO,
  HORIZONTAL_INDEX_OFFSET,
  OUTLINE_VERTEX_SPACING,
  STAGGER_SHIFT,
  STAGGERED_ROW_STRIDE,
} from '@/const/blob-carousel';
import { offsetCurvePoint } from '@/commons/blob-geometry/offset-curve-point';
import { separatorDeviation } from '@/commons/blob-geometry/waves';

type Direction = 1 | -1;

/** Décalage horizontal de la rangée `row`, en cellules : une demi-cellule une rangée sur deux si décalée. */
export function rowShift(grid: Readonly<GridGeometryParams>, row: number): number {
  return grid.staggered && row % 2 === 1 ? STAGGER_SHIFT : 0;
}

/** Abscisse de l'origine de la cellule (`column`, `row`), décalage de rangée compris. */
export function cellOriginX(
  grid: Readonly<GridGeometryParams>,
  column: number,
  row: number,
): number {
  return (column + rowShift(grid, row)) * grid.cellWidth;
}

/**
 * Abscisse du séparateur vertical `column` de la rangée `row` à la hauteur `y` et au temps `t`
 * (ms). Dans une grille décalée, chaque rangée a ses propres séparateurs.
 */
export function verticalSeparatorX(
  grid: Readonly<GridGeometryParams>,
  column: number,
  row: number,
  y: number,
  t: number,
): number {
  const index = grid.staggered ? column + row * STAGGERED_ROW_STRIDE : column;
  return cellOriginX(grid, column, row) + separatorDeviation(grid, index, y, t);
}

/** Hauteur du séparateur horizontal `row` à l'abscisse `x` et au temps `t` (ms). */
export function horizontalSeparatorY(
  grid: Readonly<GridGeometryParams>,
  row: number,
  x: number,
  t: number,
): number {
  const flatter = { ...grid, sepAmp: grid.sepAmp * HORIZONTAL_AMPLITUDE_RATIO };
  return row * grid.cellHeight + separatorDeviation(flatter, row + HORIZONTAL_INDEX_OFFSET, x, t);
}

/** Point du séparateur vertical décalé de `gap/2` vers la droite (`1`) ou la gauche (`-1`). */
export function offsetVerticalPoint(
  grid: Readonly<GridGeometryParams>,
  column: number,
  row: number,
  y: number,
  t: number,
  direction: Direction,
): Point {
  return offsetCurvePoint(
    (yy) => verticalSeparatorX(grid, column, row, yy, t),
    y,
    (grid.gap / 2) * direction,
  );
}

/** Point du séparateur horizontal décalé de `gap/2` vers le bas (`1`) ou le haut (`-1`). */
export function offsetHorizontalPoint(
  grid: Readonly<GridGeometryParams>,
  row: number,
  x: number,
  t: number,
  direction: Direction,
): Point {
  const [y, alongX] = offsetCurvePoint(
    (xx) => horizontalSeparatorY(grid, row, xx, t),
    x,
    (grid.gap / 2) * direction,
  );
  return [alongX, y];
}

/** Coin d'une cellule : intersection d'un bord vertical et d'un bord horizontal décalés. */
export interface GridCorner {
  readonly point: Point;
  /** Paramètre `y` du bord vertical au coin. */
  readonly y: number;
  /** Paramètre `x` du bord horizontal au coin. */
  readonly x: number;
}

/**
 * Trouve par itération de point fixe où le bord vertical décalé du séparateur `column` (de la
 * rangée `cellRow`) rencontre le bord horizontal décalé du séparateur `row`.
 */
export function findGridCorner(
  grid: Readonly<GridGeometryParams>,
  column: number,
  cellRow: number,
  columnDirection: Direction,
  row: number,
  rowDirection: Direction,
  t: number,
): GridCorner {
  let y = row * grid.cellHeight;
  let x = cellOriginX(grid, column, cellRow);
  for (let k = 0; k < GRID_INTERSECTION_ITERATIONS; k++) {
    const vertical = offsetVerticalPoint(grid, column, cellRow, y, t, columnDirection);
    x += vertical[0] - offsetHorizontalPoint(grid, row, x, t, rowDirection)[0];
    y += offsetHorizontalPoint(grid, row, x, t, rowDirection)[1] - vertical[1];
  }
  return { point: offsetVerticalPoint(grid, column, cellRow, y, t, columnDirection), y, x };
}

function interiorPoints(from: number, to: number, at: (parameter: number) => Point): Point[] {
  const count = Math.max(1, Math.ceil(Math.abs(to - from) / OUTLINE_VERTEX_SPACING));
  return Array.from({ length: count - 1 }, (_, k) => at(from + ((to - from) * (k + 1)) / count));
}

/**
 * Contour à coins vifs de la cellule (`column`, `row`) : chaque bord est un séparateur partagé avec
 * la cellule voisine, décalé de `gap/2`, donc l'espace reste constant dans les deux directions.
 */
export function buildGridOutline(
  grid: Readonly<GridGeometryParams>,
  column: number,
  row: number,
  t: number,
): SharpOutline {
  const topLeft = findGridCorner(grid, column, row, 1, row, 1, t);
  const topRight = findGridCorner(grid, column + 1, row, -1, row, 1, t);
  const bottomRight = findGridCorner(grid, column + 1, row, -1, row + 1, -1, t);
  const bottomLeft = findGridCorner(grid, column, row, 1, row + 1, -1, t);

  const top = interiorPoints(topLeft.x, topRight.x, (x) =>
    offsetHorizontalPoint(grid, row, x, t, 1),
  );
  const right = interiorPoints(topRight.y, bottomRight.y, (y) =>
    offsetVerticalPoint(grid, column + 1, row, y, t, -1),
  );
  const bottom = interiorPoints(bottomRight.x, bottomLeft.x, (x) =>
    offsetHorizontalPoint(grid, row + 1, x, t, -1),
  );
  const left = interiorPoints(bottomLeft.y, topLeft.y, (y) =>
    offsetVerticalPoint(grid, column, row, y, t, 1),
  );

  return {
    points: [
      topLeft.point,
      ...top,
      topRight.point,
      ...right,
      bottomRight.point,
      ...bottom,
      bottomLeft.point,
      ...left,
    ],
    cornerIndices: [
      0,
      top.length + 1,
      top.length + right.length + 2,
      top.length + right.length + bottom.length + 3,
    ],
  };
}

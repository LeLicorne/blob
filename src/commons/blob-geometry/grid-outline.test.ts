import { TEST_GRID, TEST_STAGGERED_GRID } from '@/commons/tests/geometry-params';
import { buildGridBlobPath } from '@/commons/blob-geometry/blob-path';
import {
  buildGridOutline,
  findGridCorner,
  offsetHorizontalPoint,
  offsetVerticalPoint,
  rowShift,
} from '@/commons/blob-geometry/grid-outline';

function parsePoints(path: string): [number, number][] {
  return [...path.matchAll(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

function minimumDistance(a: [number, number][], b: [number, number][]): number {
  let best = Infinity;
  for (const [ax, ay] of a) {
    for (const [bx, by] of b) best = Math.min(best, Math.hypot(ax - bx, ay - by));
  }
  return best;
}

describe('findGridCorner', () => {
  test('tombe à la fois sur le bord vertical et sur le bord horizontal décalés', () => {
    const corner = findGridCorner(TEST_GRID, 1, 2, 1, 2, 1, 777);
    const onVertical = offsetVerticalPoint(TEST_GRID, 1, 2, corner.y, 777, 1);
    const onHorizontal = offsetHorizontalPoint(TEST_GRID, 2, corner.x, 777, 1);
    expect(
      Math.hypot(onVertical[0] - onHorizontal[0], onVertical[1] - onHorizontal[1]),
    ).toBeLessThan(0.01);
  });
});

describe('buildGridOutline', () => {
  const outline = buildGridOutline(TEST_GRID, 1, 1, 0);

  test('définit quatre coins dans l’ordre haut-gauche, haut-droit, bas-droit, bas-gauche', () => {
    const [topLeft, topRight, bottomRight, bottomLeft] = outline.cornerIndices.map(
      (k) => outline.points[k],
    );
    expect(topLeft?.[0]).toBeLessThan(topRight?.[0] ?? 0);
    expect(topLeft?.[1]).toBeLessThan(bottomLeft?.[1] ?? 0);
    expect(bottomLeft?.[0]).toBeLessThan(bottomRight?.[0] ?? 0);
    expect(topRight?.[1]).toBeLessThan(bottomRight?.[1] ?? 0);
  });

  test('reste autour de la cellule, à l’écart maximal des vagues près', () => {
    const reach = TEST_GRID.sepAmp * 1.4 + TEST_GRID.liveAmp * 1.6;
    for (const [x, y] of outline.points) {
      expect(x).toBeGreaterThan(300 - reach);
      expect(x).toBeLessThan(600 + reach);
      expect(y).toBeGreaterThan(300 - reach);
      expect(y).toBeLessThan(600 + reach);
    }
  });
});

describe('buildGridBlobPath', () => {
  test('produit un chemin fermé', () => {
    const path = buildGridBlobPath(TEST_GRID, 0, 0, 0);
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  test('laisse l’espace voulu entre deux blobs voisins horizontalement', () => {
    const left = parsePoints(buildGridBlobPath(TEST_GRID, 0, 1, 0));
    const right = parsePoints(buildGridBlobPath(TEST_GRID, 1, 1, 0));
    expect(minimumDistance(left, right)).toBeGreaterThan(TEST_GRID.gap - 1.5);
    expect(minimumDistance(left, right)).toBeLessThan(TEST_GRID.gap + 1.5);
  });

  test('laisse l’espace voulu entre deux blobs voisins verticalement', () => {
    const top = parsePoints(buildGridBlobPath(TEST_GRID, 1, 0, 0));
    const bottom = parsePoints(buildGridBlobPath(TEST_GRID, 1, 1, 0));
    expect(minimumDistance(top, bottom)).toBeGreaterThan(TEST_GRID.gap - 1.5);
    expect(minimumDistance(top, bottom)).toBeLessThan(TEST_GRID.gap + 1.5);
  });

  test('change au cours du temps', () => {
    expect(buildGridBlobPath(TEST_GRID, 0, 0, 0)).not.toBe(
      buildGridBlobPath(TEST_GRID, 0, 0, 2000),
    );
  });
});

describe('grille décalée', () => {
  const path = (column: number, row: number) =>
    parsePoints(buildGridBlobPath(TEST_STAGGERED_GRID, column, row, 0));

  test('décale une rangée sur deux d’une demi-cellule', () => {
    expect(rowShift(TEST_STAGGERED_GRID, 0)).toBe(0);
    expect(rowShift(TEST_STAGGERED_GRID, 1)).toBe(0.5);
    expect(rowShift(TEST_STAGGERED_GRID, 2)).toBe(0);
    expect(rowShift(TEST_GRID, 1)).toBe(0);
  });

  test('laisse l’espace voulu entre voisins d’une même rangée', () => {
    const distance = minimumDistance(path(0, 1), path(1, 1));
    expect(distance).toBeGreaterThan(TEST_GRID.gap - 1.5);
    expect(distance).toBeLessThan(TEST_GRID.gap + 1.5);
  });

  test('laisse l’espace voulu entre une cellule et chacune des deux cellules du dessus', () => {
    const sharpCorners = { ...TEST_STAGGERED_GRID, corner: 25 };
    const sharpPath = (column: number, row: number) =>
      parsePoints(buildGridBlobPath(sharpCorners, column, row, 0));
    for (const above of [sharpPath(0, 0), sharpPath(1, 0)]) {
      const distance = minimumDistance(sharpPath(0, 1), above);
      expect(distance).toBeGreaterThan(TEST_GRID.gap - 1.5);
      expect(distance).toBeLessThan(TEST_GRID.gap + 1.5);
    }
  });

  test('place le centre d’une cellule décalée une demi-cellule plus à droite', () => {
    const center = (points: [number, number][]) =>
      points.reduce((sum, [x]) => sum + x, 0) / points.length;
    expect(center(path(0, 1)) - center(path(0, 0))).toBeGreaterThan(100);
    expect(center(path(0, 1)) - center(path(0, 0))).toBeLessThan(200);
  });
});

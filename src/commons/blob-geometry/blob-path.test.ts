import { TEST_GEOMETRY } from '@/commons/tests/geometry-params';
import { buildBlobPath } from '@/commons/blob-geometry/blob-path';

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

describe('buildBlobPath', () => {
  test('produit un chemin fermé', () => {
    const path = buildBlobPath(TEST_GEOMETRY, 0, 0);
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  test('change au cours du temps', () => {
    expect(buildBlobPath(TEST_GEOMETRY, 0, 0)).not.toBe(buildBlobPath(TEST_GEOMETRY, 0, 2000));
  });

  test('est identique à chaque appel pour les mêmes entrées', () => {
    expect(buildBlobPath(TEST_GEOMETRY, 2, 500)).toBe(buildBlobPath(TEST_GEOMETRY, 2, 500));
  });

  test('laisse l’espace voulu entre deux blobs voisins', () => {
    const left = parsePoints(buildBlobPath(TEST_GEOMETRY, 0, 0));
    const right = parsePoints(buildBlobPath(TEST_GEOMETRY, 1, 0));
    expect(minimumDistance(left, right)).toBeGreaterThan(TEST_GEOMETRY.gap - 1.5);
    expect(minimumDistance(left, right)).toBeLessThan(TEST_GEOMETRY.gap + 1.5);
  });

  test('reste dans la scène en hauteur', () => {
    const ys = parsePoints(buildBlobPath(TEST_GEOMETRY, 0, 0)).map(([, y]) => y);
    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeLessThan(TEST_GEOMETRY.height);
  });
});

import type { Point } from '@/models/blob-geometry';
import { gaussianKernel, smoothClosedPath } from '@/commons/blob-geometry/smooth-closed';

describe('gaussianKernel', () => {
  test('ne regarde que le point lui-même sans lissage', () => {
    expect(gaussianKernel(0, 4)).toEqual({ weights: [1], radius: 0, sum: 1 });
  });

  test('prend en compte ±3σ avec un poids maximal au centre', () => {
    const { weights, radius } = gaussianKernel(12, 4);
    expect(radius).toBe(9);
    expect(weights).toHaveLength(19);
    expect(Math.max(...weights)).toBe(weights[radius]);
  });

  test('donne à un voisin à σ environ 61 % du poids du centre', () => {
    const { weights, radius } = gaussianKernel(12, 4);
    expect((weights[radius + 3] ?? 0) / (weights[radius] ?? 1)).toBeCloseTo(Math.exp(-0.5), 5);
  });
});

describe('smoothClosedPath', () => {
  const square: Point[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ];

  test('produit un chemin SVG fermé', () => {
    const path = smoothClosedPath(square, 4, 12);
    expect(path).toMatch(/^M[\d.\- ]+L/);
    expect(path.endsWith('Z')).toBe(true);
  });

  test('arrondit les coins d’un carré', () => {
    const path = smoothClosedPath(square, 4, 12);
    const coordinates = [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    const nearCorner = Math.min(...coordinates.map(([x = 0, y = 0]) => Math.hypot(x, y)));
    expect(nearCorner).toBeGreaterThan(5);
  });
});

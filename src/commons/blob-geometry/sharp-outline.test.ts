import { TEST_GEOMETRY } from '@/commons/tests/geometry-params';
import { buildSharpOutline, traceEdgeEnd } from '@/commons/blob-geometry/sharp-outline';
import { topEdgeY } from '@/commons/blob-geometry/waves';

describe('traceEdgeEnd', () => {
  test('commence à 10 % de la hauteur pour le bord haut', () => {
    expect(traceEdgeEnd(TEST_GEOMETRY, 0, 1, 'top', 0)[0]?.y).toBeCloseTo(42, 10);
  });

  test('converge vers un point où plus rien ne bouge', () => {
    const trials = traceEdgeEnd(TEST_GEOMETRY, 0, 1, 'top', 0);
    const last = trials.at(-1);
    expect(trials).toHaveLength(8);
    expect(Math.abs((last?.next ?? 0) - (last?.y ?? 0))).toBeLessThan(0.01);
  });

  test('aboutit sur la courbe du bord', () => {
    const last = traceEdgeEnd(TEST_GEOMETRY, 0, 1, 'top', 0).at(-1);
    expect(last?.next).toBeCloseTo(topEdgeY(TEST_GEOMETRY, last?.x ?? 0, 0), 1);
  });
});

describe('buildSharpOutline', () => {
  const outline = buildSharpOutline(TEST_GEOMETRY, 0, 0);

  test('définit quatre coins dans l’ordre haut-gauche, haut-droit, bas-droit, bas-gauche', () => {
    const [topLeft, topRight, bottomRight, bottomLeft] = outline.cornerIndices.map(
      (k) => outline.points[k],
    );
    expect(topLeft?.[0]).toBeLessThan(topRight?.[0] ?? 0);
    expect(topLeft?.[1]).toBeLessThan(bottomLeft?.[1] ?? 0);
    expect(bottomLeft?.[0]).toBeLessThan(bottomRight?.[0] ?? 0);
    expect(topRight?.[1]).toBeLessThan(bottomRight?.[1] ?? 0);
  });

  test('place les coins haut à proximité de la courbe du haut', () => {
    for (const k of outline.cornerIndices.slice(0, 2)) {
      const [x, y] = outline.points[k] ?? [0, 0];
      expect(Math.abs(y - topEdgeY(TEST_GEOMETRY, x, 0))).toBeLessThan(TEST_GEOMETRY.gap / 4);
    }
  });
});

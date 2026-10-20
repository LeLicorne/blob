import { TEST_GEOMETRY } from '@/commons/tests/geometry-params';
import {
  curveSlope,
  offsetCurvePoint,
  offsetSeparatorPoint,
} from '@/commons/blob-geometry/offset-curve-point';

describe('curveSlope', () => {
  test('vaut zéro pour une droite verticale', () => {
    expect(curveSlope(() => 100, 50)).toEqual({ dxdy: 0, length: 1 });
  });

  test('mesure la pente d’une droite penchée', () => {
    const { dxdy, length } = curveSlope((y) => 0.5 * y, 10);
    expect(dxdy).toBeCloseTo(0.5, 10);
    expect(length).toBeCloseTo(Math.hypot(1, 0.5), 10);
  });
});

describe('offsetCurvePoint', () => {
  test('décale horizontalement une droite verticale', () => {
    expect(offsetCurvePoint(() => 100, 50, 13)).toEqual([113, 50]);
  });

  test('décale perpendiculairement à une droite penchée', () => {
    const xAt = (y: number) => 0.5 * y;
    const [x, y] = offsetCurvePoint(xAt, 100, 10);
    expect(Math.hypot(x - xAt(100), y - 100)).toBeCloseTo(10, 5);
  });
});

describe('offsetSeparatorPoint', () => {
  test('laisse exactement `gap` entre les deux bords décalés d’un même séparateur', () => {
    for (let y = 20; y <= 400; y += 40) {
      const left = offsetSeparatorPoint(TEST_GEOMETRY, 1, y, 1234, -1);
      const right = offsetSeparatorPoint(TEST_GEOMETRY, 1, y, 1234, 1);
      expect(Math.hypot(right[0] - left[0], right[1] - left[1])).toBeCloseTo(TEST_GEOMETRY.gap, 5);
    }
  });
});

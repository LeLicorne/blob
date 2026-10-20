import type { Point } from '@/models/blob-geometry';
import { buildClosedContour } from '@/commons/blob-geometry/closed-contour';
import { computeCornerFillet, handleFactor } from '@/commons/blob-geometry/corner-fillet';

describe('handleFactor', () => {
  test('vaut 0,5523 pour un coin droit', () => {
    expect(handleFactor(Math.PI / 2)).toBeCloseTo(0.5523, 4);
  });

  test('reste constant pour un virage presque nul', () => {
    expect(handleFactor(0.01)).toBe(0.55);
  });
});

describe('computeCornerFillet', () => {
  const square: Point[] = [
    [0, 0],
    [200, 0],
    [200, 200],
    [0, 200],
  ];
  const contour = buildClosedContour(square);

  test('coupe le coin à la distance du rayon pour un coin droit', () => {
    const fillet = computeCornerFillet(contour, 200, 200, 200, 50);
    expect(fillet.pointBefore[0]).toBeCloseTo(150, 1);
    expect(fillet.pointAfter[1]).toBeCloseTo(50, 1);
  });

  test('plafonne la coupe à 45 % du bord', () => {
    const fillet = computeCornerFillet(contour, 200, 200, 200, 500);
    expect(200 - fillet.pointBefore[0]).toBeCloseTo(90, 1);
  });

  test('place les poignées sur les prolongements des bords', () => {
    const fillet = computeCornerFillet(contour, 200, 200, 200, 50);
    expect(fillet.handleBefore[1]).toBeCloseTo(0, 5);
    expect(fillet.handleAfter[0]).toBeCloseTo(200, 5);
  });
});

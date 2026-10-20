import { computeCornerDemo } from '@docs/explanation/corner-demo';

describe('computeCornerDemo', () => {
  test('coupe à la distance R × tan(φ/2) pour un coin droit', () => {
    const demo = computeCornerDemo(70, 90);
    expect(demo.rawCut).toBeCloseTo(70, 5);
    expect(demo.cut).toBeCloseTo(70, 5);
    expect(demo.obtainedRadius).toBeCloseTo(70, 5);
    expect(demo.factor).toBeCloseTo(0.5523, 4);
  });

  test('plafonne la coupe à 45 % du bord et réduit le rayon obtenu', () => {
    const demo = computeCornerDemo(120, 140);
    expect(demo.cut).toBeCloseTo(demo.cap, 5);
    expect(demo.obtainedRadius).toBeLessThan(120);
  });

  test('place les points de coupe de part et d’autre du sommet à la même distance', () => {
    const demo = computeCornerDemo(50, 90);
    const before = Math.hypot(
      demo.apex[0] - demo.pointBefore[0],
      demo.apex[1] - demo.pointBefore[1],
    );
    const after = Math.hypot(demo.apex[0] - demo.pointAfter[0], demo.apex[1] - demo.pointAfter[1]);
    expect(before).toBeCloseTo(after, 5);
  });
});

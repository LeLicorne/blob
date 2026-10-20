import { computeSmoothingDemo, turnAngles } from '@docs/explanation/smoothing-demo';

describe('computeSmoothingDemo', () => {
  test('ne change pas le tracé sans lissage', () => {
    const demo = computeSmoothingDemo(0);
    expect(demo.smooth).toEqual(demo.raw);
  });

  test('abaisse le virage maximal avec un lissage fort', () => {
    const demo = computeSmoothingDemo(12);
    expect(demo.smoothPeak).toBeLessThan(demo.rawPeak);
  });

  test('rend la montée du virage plus progressive', () => {
    const demo = computeSmoothingDemo(12);
    expect(demo.smoothRise).toBeGreaterThan(demo.rawRise);
  });
});

describe('turnAngles', () => {
  test('vaut zéro sur une ligne droite', () => {
    expect(
      turnAngles([
        [0, 0],
        [1, 0],
        [2, 0],
      ]),
    ).toEqual([0]);
  });

  test('mesure un virage à angle droit', () => {
    expect(
      turnAngles([
        [0, 0],
        [1, 0],
        [1, 1],
      ])[0],
    ).toBeCloseTo(90, 5);
  });
});

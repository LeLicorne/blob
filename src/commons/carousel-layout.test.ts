import { blobPitchForWidth, shortestLoopDelta, visibleIndexRange } from '@/commons/carousel-layout';

describe('blobPitchForWidth', () => {
  test.each([
    [200, 230],
    [390, 265.2],
    [500, 340],
    [1440, 340],
  ])('pour un écran de %i px, le blob mesure %f px', (width, expected) => {
    expect(blobPitchForWidth(width)).toBeCloseTo(expected, 5);
  });

  test('ne rétrécit jamais quand l’écran grandit', () => {
    const pitches = Array.from({ length: 120 }, (_, k) => blobPitchForWidth(320 + k * 10));
    expect(pitches).toEqual([...pitches].sort((a, b) => a - b));
  });
});

describe('visibleIndexRange', () => {
  test('couvre l’écran avec une marge d’un blob de chaque côté', () => {
    expect(visibleIndexRange(0, 600, 300)).toEqual({ first: -2, last: 2 });
  });

  test('suit le défilement', () => {
    expect(visibleIndexRange(3.4, 600, 300)).toEqual({ first: 1, last: 6 });
  });
});

describe('shortestLoopDelta', () => {
  test('avance directement vers une diapositive proche', () => {
    expect(shortestLoopDelta(0, 2, 8)).toBe(2);
  });

  test('prend le chemin par la gauche quand il est plus court', () => {
    expect(shortestLoopDelta(0, 7, 8)).toBe(-1);
  });

  test('tient compte de la position dans la boucle', () => {
    expect(shortestLoopDelta(-1, 0, 8)).toBe(1);
  });
});

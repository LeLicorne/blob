import { clamp } from '@/commons/clamp';

describe('clamp', () => {
  test('ramène une valeur trop petite à la borne basse', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test('ramène une valeur trop grande à la borne haute', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('laisse inchangée une valeur dans l’intervalle', () => {
    expect(clamp(4, 0, 10)).toBe(4);
  });
});

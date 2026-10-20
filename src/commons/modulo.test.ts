import { modulo } from '@/commons/modulo';

describe('modulo', () => {
  test('renvoie le reste pour un dividende positif', () => {
    expect(modulo(10, 8)).toBe(2);
  });

  test('renvoie un résultat positif pour un dividende négatif', () => {
    expect(modulo(-1, 8)).toBe(7);
  });
});

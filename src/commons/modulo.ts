/** Modulo mathématique : le résultat est toujours dans `[0, divisor)`, même pour un dividende négatif. */
export function modulo(dividend: number, divisor: number): number {
  return ((dividend % divisor) + divisor) % divisor;
}

/** Nombre en notation décimale fixe avec `digits` décimales. */
export function fixed(value: number, digits = 1): string {
  return value.toFixed(digits);
}

/** Nombre avec une virgule décimale française, sans « ,0 » final. */
export function french(value: number, digits = 1): string {
  return fixed(value, digits).replace(/\.0$/, '').replace('.', ',');
}

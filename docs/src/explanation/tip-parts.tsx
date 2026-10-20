import type { ReactNode } from 'react';

/** Titre en gras d'une infobulle. */
export function TipTitle({ children }: { readonly children: ReactNode }) {
  return <b className="tip__title">{children}</b>;
}

/** Bloc de calcul à chasse fixe d'une infobulle ; les retours à la ligne sont conservés. */
export function Calc({ children }: { readonly children: ReactNode }) {
  return <div className="calc">{children}</div>;
}

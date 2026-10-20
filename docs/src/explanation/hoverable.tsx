import type { ReactNode } from 'react';
import { type TipContent, useTip } from '@docs/explanation/tooltip-provider';

interface HoverableProps {
  readonly tip: TipContent;
  readonly children: ReactNode;
  readonly tone?: 'sep' | 'live' | 'gap' | 'corner' | 'smooth';
}

/** Mot ou expression soulignés en pointillés dont l'explication s'ouvre dans une infobulle. */
export function Hoverable({ tip, tone, children }: HoverableProps) {
  const triggerProps = useTip()(tip);
  return (
    <span className={tone ? `hv c-${tone}` : 'hv'} role="button" tabIndex={0} {...triggerProps}>
      {children}
    </span>
  );
}

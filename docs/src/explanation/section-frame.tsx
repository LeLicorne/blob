import type { ReactNode } from 'react';

interface SectionFrameProps {
  readonly id: string;
  readonly badge?: string;
  readonly title: string;
  readonly plain?: ReactNode;
  readonly children: ReactNode;
}

/** Cadre d'une étape de l'explication : numéro, titre, résumé « En clair » puis contenu. */
export function SectionFrame({ id, badge, title, plain, children }: SectionFrameProps) {
  return (
    <section className="step" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        {badge && <span className="badge">{badge}</span>}
        {title}
      </h2>
      {plain && (
        <div className="plain">
          <b className="tag">En clair</b>
          {plain}
        </div>
      )}
      {children}
    </section>
  );
}

import { BlobParamsProvider } from '@docs/explanation/blob-params-context';
import { CarouselSizingSection } from '@docs/explanation/carousel-sizing-section';
import { ConstantGapSection } from '@docs/explanation/constant-gap-section';
import { CornersSection } from '@docs/explanation/corners-section';
import { EdgeEndSection } from '@docs/explanation/edge-end-section';
import { Hoverable } from '@docs/explanation/hoverable';
import { GridSection } from '@docs/explanation/grid-section';
import { IdeaSection } from '@docs/explanation/idea-section';
import { KeyFiguresSection } from '@docs/explanation/key-figures-section';
import { SmoothingSection } from '@docs/explanation/smoothing-section';
import { TipTitle } from '@docs/explanation/tip-parts';
import { TooltipProvider } from '@docs/explanation/tooltip-provider';
import { WavesSection } from '@docs/explanation/waves-section';

const NAVIGATION = [
  ['idee', "1 · L'idée"],
  ['vague', '2 · La vague'],
  ['espace', "3 · L'espace constant"],
  ['haut-bas', '4 · Haut et bas'],
  ['coins', '5 · Les coins'],
  ['lissage', '6 · Le lissage'],
  ['carrousel', '7 · Le carrousel'],
  ['grille', '8 · En grille'],
  ['chiffres', 'Chiffres clés'],
] as const;

/** Page qui explique, étape par étape et avec les vrais calculs, la construction des blobs. */
export function ExplanationPage() {
  return (
    <TooltipProvider>
      <BlobParamsProvider>
        <nav className="top" aria-label="Étapes de l'explication">
          <div className="wrap">
            {NAVIGATION.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </div>
        </nav>
        <header className="hero">
          <div className="wrap">
            <div className="eyebrow">Comment ça marche</div>
            <h1>Comment un carrousel de blobs vivants fonctionne</h1>
            <p className="lead">
              Des formes organiques qui bougent un peu, qui s'emboîtent avec un espace parfaitement
              régulier, sans aucun angle pointu. Voici comment c'est construit, étape par étape,
              avec les vrais calculs et les vrais chiffres. Pas besoin d'être développeur.
            </p>
            <div className="hint">
              👆 Survole (ou touche) tout ce qui est{' '}
              <Hoverable
                tip={
                  <>
                    <TipTitle>Exactement ça !</TipTitle>
                    <p>
                      Les mots soulignés en pointillés, les formes des schémas et les cartes de
                      chiffres ouvrent une explication.
                    </p>
                  </>
                }
              >
                souligné en pointillés
              </Hoverable>
              , les schémas et les cartes.
            </div>
            <p className="hero__link">
              <a href="#demo">→ Voir le carrousel réel</a>
            </p>
          </div>
        </header>
        <main className="wrap">
          <IdeaSection />
          <WavesSection />
          <ConstantGapSection />
          <EdgeEndSection />
          <CornersSection />
          <SmoothingSection />
          <CarouselSizingSection />
          <GridSection />
          <KeyFiguresSection />
        </main>
        <footer className="page-footer">
          <div className="wrap">
            Tout ce qui est affiché ici est calculé avec les mêmes fonctions que le composant{' '}
            <code>BlobCarousel</code>. Pour changer l'allure des blobs, ce sont les réglages de la
            propriété <code>shape</code> qu'il faut modifier.
          </div>
        </footer>
      </BlobParamsProvider>
    </TooltipProvider>
  );
}

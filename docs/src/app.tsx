import { BlobCarousel, type BlobCarouselSlide } from '@/index';
import { GridDemo } from '@docs/grid-demo';
import { ExplanationPage } from '@docs/explanation/explanation-page';

const SLIDES: readonly BlobCarouselSlide[] = [
  { id: 'coral', label: 'Corail', color: '#ff6b6b' },
  { id: 'orange', label: 'Orange', color: '#ffa94d' },
  { id: 'yellow', label: 'Jaune', color: '#ffd43b' },
  { id: 'green', label: 'Vert', color: '#69db7c' },
  { id: 'teal', label: 'Turquoise', color: '#38d9a9' },
  { id: 'blue', label: 'Bleu', color: '#4dabf7' },
  { id: 'violet', label: 'Violet', color: '#9775fa' },
  { id: 'pink', label: 'Rose', color: '#f783ac' },
];

/** Page de documentation : carrousel de démonstration suivi de l'explication de son fonctionnement. */
export function App() {
  return (
    <>
      <header className="demo" id="demo">
        <p className="demo__intro">
          <strong>blob-carousel</strong> — glisser, flèches ← → ou boutons
        </p>
        <BlobCarousel
          className="demo__carousel"
          slides={SLIDES}
          labels={{
            region: 'Carrousel de blobs colorés',
            previous: 'Précédent',
            next: 'Suivant',
            goToSlide: (position) => `Aller à la diapositive ${position}`,
          }}
        />
      </header>
      <GridDemo />
      <ExplanationPage />
    </>
  );
}

import { useId } from 'react';
import type {
  BlobCarouselLabels,
  BlobCarouselOptions,
  BlobCarouselSlide,
} from '@/models/blob-carousel';
import { DEFAULT_LABELS } from '@/const/blob-carousel';
import { modulo } from '@/commons/modulo';
import { BlobCarouselControls } from '@/components/blob-carousel-controls';
import { BlobCell } from '@/components/blob-cell';
import { useBlobCarousel } from '@/hooks/use-blob-carousel';
import './blob-carousel.css';

/** Propriétés de {@link BlobCarousel}. */
export interface BlobCarouselProps extends BlobCarouselOptions {
  /** Diapositives affichées en boucle infinie ; une couleur unie ou une image par blob. */
  readonly slides: readonly BlobCarouselSlide[];
  /** Textes accessibles ; les valeurs absentes sont en anglais. */
  readonly labels?: Partial<BlobCarouselLabels> | undefined;
  /** Affiche les boutons précédent / suivant et les points de pagination (défaut : `true`). */
  readonly showControls?: boolean | undefined;
  /** Classe ajoutée à l'élément racine, dont la hauteur règle celle du carrousel. */
  readonly className?: string | undefined;
  /** Appelé quand la diapositive centrée change. */
  readonly onActiveIndexChange?: ((index: number) => void) | undefined;
}

/**
 * Carrousel infini de blobs vivants. Chaque blob est la zone comprise entre deux courbes
 * ondulantes partagées avec ses voisins : ils s'emboîtent avec un espace constant, les coins
 * sont arrondis et les contours respirent doucement.
 *
 * Se navigue en glissant, avec les flèches du clavier ou avec les boutons. La hauteur du
 * composant est celle de son élément racine (320 px minimum par défaut).
 */
export function BlobCarousel({
  slides,
  labels,
  showControls = true,
  className,
  shape,
  ease,
  maxHeight,
  onActiveIndexChange,
}: BlobCarouselProps) {
  const idPrefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const text = { ...DEFAULT_LABELS, ...labels };
  const {
    rootRef,
    viewportRef,
    worldRef,
    viewBox,
    indices,
    activeIndex,
    registerBlob,
    goBy,
    goToSlide,
    viewportHandlers,
  } = useBlobCarousel({
    slideCount: slides.length,
    shape,
    ease,
    maxHeight,
    onActiveIndexChange,
  });

  return (
    <div ref={rootRef} className={className ? `blob-carousel ${className}` : 'blob-carousel'}>
      <div
        ref={viewportRef}
        className="blob-carousel__viewport"
        role="group"
        aria-roledescription="carousel"
        aria-label={text.region}
        {...viewportHandlers}
      >
        <svg className="blob-carousel__stage" aria-hidden="true" viewBox={viewBox}>
          <g ref={worldRef}>
            {slides.length > 0 &&
              indices.map((index) => {
                const slide = slides[modulo(index, slides.length)];
                return slide ? (
                  <BlobCell
                    key={index}
                    clipId={`${idPrefix}-clip-${index}`}
                    index={index}
                    slide={slide}
                    register={registerBlob}
                  />
                ) : null;
              })}
          </g>
        </svg>
        <p className="blob-carousel__sr-only" aria-live="polite">
          {slides[activeIndex]?.label}
        </p>
      </div>
      {showControls && (
        <BlobCarouselControls
          slideCount={slides.length}
          activeIndex={activeIndex}
          labels={text}
          onPrevious={() => {
            goBy(-1);
          }}
          onNext={() => {
            goBy(1);
          }}
          onSelect={goToSlide}
        />
      )}
    </div>
  );
}

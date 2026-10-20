import type { BlobCarouselLabels } from '@/models/blob-carousel';

interface BlobCarouselControlsProps {
  readonly slideCount: number;
  readonly activeIndex: number;
  readonly labels: BlobCarouselLabels;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onSelect: (index: number) => void;
}

/** Boutons précédent / suivant et points de pagination du carrousel de blobs. */
export function BlobCarouselControls({
  slideCount,
  activeIndex,
  labels,
  onPrevious,
  onNext,
  onSelect,
}: BlobCarouselControlsProps) {
  return (
    <div className="blob-carousel__controls">
      <button type="button" className="blob-carousel__button" onClick={onPrevious}>
        <span className="blob-carousel__sr-only">{labels.previous}</span>
        <span aria-hidden="true">←</span>
      </button>
      <div className="blob-carousel__dots">
        {Array.from({ length: slideCount }, (_, index) => (
          <button
            key={index}
            type="button"
            className="blob-carousel__dot"
            aria-label={labels.goToSlide(index + 1)}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => {
              onSelect(index);
            }}
          />
        ))}
      </div>
      <button type="button" className="blob-carousel__button" onClick={onNext}>
        <span className="blob-carousel__sr-only">{labels.next}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

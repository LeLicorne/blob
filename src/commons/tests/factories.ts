import type { BlobCarouselSlide } from '@/models/blob-carousel';

/** Fabrique `count` diapositives de couleur unie aux identifiants distincts. */
export function buildSlides(count: number): BlobCarouselSlide[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slide-${index + 1}`,
    label: `Slide ${index + 1}`,
    color: `hsl(${index * 40} 80% 60%)`,
  }));
}

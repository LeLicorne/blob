import { useLayoutEffect, useRef } from 'react';
import type { BlobCarouselSlide } from '@/models/blob-carousel';
import type { BlobCellElements } from '@/hooks/use-blob-carousel';

interface BlobCellProps {
  readonly clipId: string;
  readonly index: number;
  readonly slide: Readonly<BlobCarouselSlide>;
  readonly register: (index: number, elements: BlobCellElements | null) => void;
}

const FALLBACK_COLOR = '#888';

/**
 * Un blob du carrousel : un `clipPath` dont le contour est animé par le parent, appliqué à un
 * remplissage (image recadrée ou couleur unie).
 */
export function BlobCell({ clipId, index, slide, register }: BlobCellProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const imageRef = useRef<SVGImageElement>(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const fill = rectRef.current ?? imageRef.current;
    if (!path || !fill) return;
    register(index, { path, fill });
    return () => {
      register(index, null);
    };
  }, [index, register, slide.imageUrl]);

  return (
    <>
      <clipPath id={clipId}>
        <path ref={pathRef} />
      </clipPath>
      <g clipPath={`url(#${clipId})`} role="img" aria-label={slide.label}>
        {slide.imageUrl ? (
          <image ref={imageRef} href={slide.imageUrl} preserveAspectRatio="xMidYMid slice" />
        ) : (
          <rect ref={rectRef} fill={slide.color ?? FALLBACK_COLOR} />
        )}
      </g>
    </>
  );
}

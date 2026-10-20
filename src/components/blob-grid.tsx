import { useId } from 'react';
import type { BlobCarouselSlide } from '@/models/blob-carousel';
import type { BlobGridOptions } from '@/models/blob-grid';
import { DEFAULT_CELL_ASPECT_RATIO } from '@/const/blob-carousel';
import { BlobCell } from '@/components/blob-cell';
import { useBlobGrid } from '@/hooks/use-blob-grid';
import './blob-carousel.css';

/** Propriétés de {@link BlobGrid}. */
export interface BlobGridProps extends BlobGridOptions {
  /** Diapositives rangées de gauche à droite puis de haut en bas ; une couleur ou une image par blob. */
  readonly slides: readonly BlobCarouselSlide[];
  /** Nom de la grille lu par les lecteurs d'écran. */
  readonly label?: string | undefined;
  /** Classe ajoutée à l'élément racine, dont la largeur règle celle de la grille. */
  readonly className?: string | undefined;
}

/**
 * Grille de blobs vivants. Une div parente contient les blobs rangés en colonnes et en lignes ;
 * comme dans le carrousel, chaque blob est délimité par des courbes partagées avec ses voisins,
 * donc l'espace entre eux est constant, horizontalement comme verticalement.
 *
 * Avec `stagger`, une rangée sur deux est décalée d'une demi-cellule, comme des briques.
 *
 * Fixer `columns`, `rows` ou les deux : avec un seul, l'autre s'adapte au nombre de diapositives.
 * La grille occupe toute la largeur de son parent, les blobs restant à l'intérieur ; sa hauteur
 * découle du nombre de lignes et de `cellAspectRatio`. Le dessin est proportionnel à la taille de
 * la grille : les réglages de `shape` sont exprimés pour une cellule de 300 de large.
 */
export function BlobGrid({
  slides,
  label,
  className,
  columns,
  rows,
  cellAspectRatio = DEFAULT_CELL_ASPECT_RATIO,
  shape,
  stagger,
  animated,
}: BlobGridProps) {
  const idPrefix = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { dimensions, viewBox, aspectRatio, inset, registerBlob } = useBlobGrid({
    slideCount: slides.length,
    columns,
    rows,
    cellAspectRatio,
    shape,
    stagger,
    animated,
  });

  return (
    <div
      className={className ? `blob-grid ${className}` : 'blob-grid'}
      role="group"
      aria-label={label}
      style={{ aspectRatio }}
    >
      <svg className="blob-carousel__stage" viewBox={viewBox}>
        <g transform={`translate(${inset} ${inset})`}>
          {slides.slice(0, dimensions.visibleCount).map((slide, index) => (
            <BlobCell
              key={slide.id}
              clipId={`${idPrefix}-clip-${index}`}
              index={index}
              slide={slide}
              register={registerBlob}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

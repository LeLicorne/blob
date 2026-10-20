import type { BlobShapeConfig } from '@/models/blob-geometry';

/** Un élément du carrousel : une couleur unie ou une image, découpée dans un blob. */
export interface BlobCarouselSlide {
  /** Identifiant stable de la diapositive. */
  readonly id: string;
  /** Description lue par les lecteurs d'écran. */
  readonly label: string;
  /** Couleur de remplissage utilisée si `imageUrl` est absent. */
  readonly color?: string;
  /** Image affichée en remplissage, recadrée pour couvrir le blob. */
  readonly imageUrl?: string;
}

/** Textes accessibles du carrousel. */
export interface BlobCarouselLabels {
  /** Nom de la région du carrousel. */
  readonly region: string;
  /** Nom du bouton « précédent ». */
  readonly previous: string;
  /** Nom du bouton « suivant ». */
  readonly next: string;
  /** Nom du point de pagination de la diapositive `position` (à partir de 1). */
  readonly goToSlide: (position: number) => string;
}

/** Options de comportement et d'apparence du carrousel. */
export interface BlobCarouselOptions {
  /** Réglages de forme des blobs ; les valeurs absentes gardent leur défaut. */
  readonly shape?: Partial<BlobShapeConfig> | undefined;
  /** Part de la distance restante parcourue à chaque image, entre 0 et 1. */
  readonly ease?: number | undefined;
  /** Hauteur maximale d'un blob, en pixels. */
  readonly maxHeight?: number | undefined;
}

/** Dimensions mesurées de la zone d'affichage. */
export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

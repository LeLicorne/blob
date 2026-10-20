import type { BlobShapeConfig } from '@/models/blob-geometry';

/** Nombre de colonnes et de lignes d'une grille, et nombre de blobs réellement affichés. */
export interface GridDimensions {
  readonly columns: number;
  readonly rows: number;
  readonly visibleCount: number;
}

/** Options d'agencement et d'animation de la grille de blobs. */
export interface BlobGridOptions {
  /** Nombre de colonnes ; les lignes s'adaptent au nombre de diapositives si `rows` est absent. */
  readonly columns?: number | undefined;
  /** Nombre de lignes ; les colonnes s'adaptent au nombre de diapositives si `columns` est absent. */
  readonly rows?: number | undefined;
  /** Rapport largeur / hauteur d'une cellule (défaut : 1, des cellules carrées). */
  readonly cellAspectRatio?: number | undefined;
  /**
   * Réglages de forme des blobs, exprimés pour une cellule de 300 de large puis mis à l'échelle
   * avec la grille ; les valeurs absentes gardent le défaut de la grille (`DEFAULT_GRID_SHAPE`).
   */
  readonly shape?: Partial<BlobShapeConfig> | undefined;
  /** Décale une rangée sur deux d'une demi-cellule, comme des briques (défaut : `false`). */
  readonly stagger?: boolean | undefined;
  /** Anime le contour des blobs (défaut : `true`) ; sans animation, la grille est dessinée une fois. */
  readonly animated?: boolean | undefined;
}

/** Point 2D `[x, y]` en pixels. */
export type Point = readonly [number, number];

/** Réglages qui définissent l'allure des blobs (tous en pixels, sauf `liveSpeed`). */
export interface BlobShapeConfig {
  /** Espace constant entre deux blobs voisins, mesuré perpendiculairement à la courbe. */
  readonly gap: number;
  /** Rayon d'arrondi visé pour les quatre coins. */
  readonly corner: number;
  /** Écart-type du lissage gaussien final du contour. */
  readonly smooth: number;
  /** Amplitude des vagues fixes d'un séparateur, qui donnent sa forme. */
  readonly sepAmp: number;
  /** Poids, par rapport à `sepAmp`, de la vague fixe plus fine : 0 = formes lisses, 0,4 = plus irrégulières. */
  readonly detail: number;
  /** Amplitude des vagues animées, qui rendent le contour vivant. */
  readonly liveAmp: number;
  /** Vitesse des vagues animées, en radians par milliseconde et par unité de fréquence. */
  readonly liveSpeed: number;
}

/** Réglages de forme associés aux dimensions d'un blob. */
export interface BlobGeometryParams extends BlobShapeConfig {
  /** Hauteur de la scène dans laquelle les blobs sont dessinés. */
  readonly height: number;
  /** Distance horizontale entre deux séparateurs consécutifs. */
  readonly pitch: number;
}

/** Noms des quatre vagues superposées qui forment un séparateur. */
export type WaveKey = 'big' | 'mid' | 'liveA' | 'liveB';

/** Bord horizontal d'un blob. */
export type HorizontalEdge = 'top' | 'bottom';

/** Contour polygonal d'un blob avant arrondi des coins. */
export interface SharpOutline {
  /** Sommets du contour fermé, dans l'ordre haut-gauche, haut-droit, bas-droit, bas-gauche. */
  readonly points: readonly Point[];
  /** Index, dans `points`, des quatre coins vifs. */
  readonly cornerIndices: readonly number[];
}

/** Un essai de la recherche du point où un bord vertical rencontre un bord horizontal. */
export interface EdgeEndTrial {
  /** Hauteur testée. */
  readonly y: number;
  /** Abscisse du bord vertical à cette hauteur. */
  readonly x: number;
  /** Hauteur du bord horizontal à cette abscisse, point de départ de l'essai suivant. */
  readonly next: number;
}

/** Courbe de raccord (Bézier cubique) qui remplace un coin vif. */
export interface CornerFillet {
  /** Abscisse curviligne du point de coupe avant le coin. */
  readonly sBefore: number;
  /** Abscisse curviligne du point de coupe après le coin. */
  readonly sAfter: number;
  /** Point de coupe avant le coin. */
  readonly pointBefore: Point;
  /** Point de coupe après le coin. */
  readonly pointAfter: Point;
  /** Première poignée de la courbe de Bézier. */
  readonly handleBefore: Point;
  /** Seconde poignée de la courbe de Bézier. */
  readonly handleAfter: Point;
}

/** Noyau gaussien discret. */
export interface GaussianKernel {
  /** Poids de chaque voisin, de `-radius` à `+radius`. */
  readonly weights: readonly number[];
  /** Nombre de voisins pris en compte de chaque côté. */
  readonly radius: number;
  /** Somme des poids. */
  readonly sum: number;
}

/** Réglages de forme associés aux dimensions d'une cellule de grille. */
export interface GridGeometryParams extends BlobShapeConfig {
  /** Largeur d'une cellule : distance entre deux séparateurs verticaux. */
  readonly cellWidth: number;
  /** Hauteur d'une cellule : distance entre deux séparateurs horizontaux. */
  readonly cellHeight: number;
  /** Décale une rangée sur deux d'une demi-cellule, chaque rangée ayant ses propres séparateurs verticaux. */
  readonly staggered: boolean;
}

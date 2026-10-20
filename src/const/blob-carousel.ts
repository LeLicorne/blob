import type { BlobCarouselLabels } from '@/models/blob-carousel';
import type { BlobShapeConfig } from '@/models/blob-geometry';

export const DEFAULT_BLOB_SHAPE: BlobShapeConfig = {
  gap: 26,
  corner: 70,
  smooth: 12,
  sepAmp: 26,
  detail: 0.4,
  liveAmp: 5,
  liveSpeed: 0.0006,
};

export const DEFAULT_EASE = 0.1;
export const DEFAULT_MAX_BLOB_HEIGHT = 520;
export const VIEWPORT_VERTICAL_MARGIN = 20;
export const SETTLE_THRESHOLD = 0.0005;
export const FILL_BLEED = 80;

export const MIN_BLOB_PITCH = 230;
export const MAX_BLOB_PITCH = 340;
export const BLOB_PITCH_RATIO = 0.68;

export const DEFAULT_LABELS: BlobCarouselLabels = {
  region: 'Blob carousel',
  previous: 'Previous',
  next: 'Next',
  goToSlide: (position) => `Go to slide ${position}`,
};

export const WAVE_KEYS = ['big', 'mid', 'liveA', 'liveB'] as const;
export const EDGE_END_TRIALS = 8;
export const FILLET_ITERATIONS = 4;
export const OUTLINE_VERTEX_SPACING = 5;
export const SMOOTH_RESAMPLE_STEP = 4;

export const GRID_INTERSECTION_ITERATIONS = 12;
export const HORIZONTAL_INDEX_OFFSET = 50;
export const DEFAULT_CELL_ASPECT_RATIO = 1;
export const HORIZONTAL_AMPLITUDE_RATIO = 0.8;
export const DESIGN_CELL_WIDTH = 300;
export const STAGGER_SHIFT = 0.5;
export const STAGGERED_ROW_STRIDE = 17;

export const DEFAULT_GRID_SHAPE: BlobShapeConfig = {
  gap: 16,
  corner: 45,
  smooth: 8,
  sepAmp: 40,
  detail: 0.12,
  liveAmp: 4,
  liveSpeed: 0.0006,
};

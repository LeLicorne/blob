import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { BlobGridOptions } from '@/models/blob-grid';
import type { GridGeometryParams } from '@/models/blob-geometry';
import { DEFAULT_CELL_ASPECT_RATIO, DEFAULT_GRID_SHAPE, FILL_BLEED } from '@/const/blob-carousel';
import { buildGridBlobPath } from '@/commons/blob-geometry/blob-path';
import { cellOriginX } from '@/commons/blob-geometry/grid-outline';
import {
  cellPosition,
  gridDesignSize,
  gridInset,
  resolveGridDimensions,
} from '@/commons/grid-layout';
import type { BlobCellElements } from '@/hooks/use-blob-carousel';

interface UseBlobGridArguments extends BlobGridOptions {
  readonly slideCount: number;
}

/**
 * Pilote une grille de blobs : déduit colonnes et lignes, dessine chaque blob dans un espace de
 * conception indépendant de la taille à l'écran (le `viewBox` fait la mise à l'échelle) et anime
 * les contours sans repasser par React.
 *
 * @returns la disposition, le `viewBox`, son rapport largeur / hauteur, la marge intérieure et
 * l'enregistreur de blobs.
 */
export function useBlobGrid({
  slideCount,
  columns,
  rows,
  cellAspectRatio = DEFAULT_CELL_ASPECT_RATIO,
  shape,
  stagger = false,
  animated = true,
}: UseBlobGridArguments) {
  const cells = useRef(new Map<number, BlobCellElements>());
  const painter = useRef<((index: number, elements: BlobCellElements) => void) | null>(null);

  const dimensions = resolveGridDimensions(slideCount, columns, rows);
  const { gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed } = {
    ...DEFAULT_GRID_SHAPE,
    ...shape,
  };
  const inset = gridInset({ gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed });
  const design = gridDesignSize(dimensions, cellAspectRatio, inset, stagger);
  const { cellWidth, cellHeight } = design;
  const grid = useMemo<GridGeometryParams>(
    () => ({
      gap,
      corner,
      smooth,
      sepAmp,
      detail,
      liveAmp,
      liveSpeed,
      cellWidth,
      cellHeight,
      staggered: stagger,
    }),
    [gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed, cellWidth, cellHeight, stagger],
  );
  const { columns: columnCount } = dimensions;

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let clock = 0;
    const paint = (index: number, { path, fill }: BlobCellElements) => {
      const { column, row } = cellPosition(index, columnCount);
      path.setAttribute('d', buildGridBlobPath(grid, column, row, clock));
      fill.setAttribute('x', String(cellOriginX(grid, column, row) - FILL_BLEED));
      fill.setAttribute('y', String(row * grid.cellHeight - FILL_BLEED));
      fill.setAttribute('width', String(grid.cellWidth + 2 * FILL_BLEED));
      fill.setAttribute('height', String(grid.cellHeight + 2 * FILL_BLEED));
    };
    painter.current = paint;
    cells.current.forEach((elements, index) => {
      paint(index, elements);
    });

    if (!animated || reducedMotion) {
      return () => {
        painter.current = null;
      };
    }
    let previous = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      clock += now - previous;
      previous = now;
      cells.current.forEach((elements, index) => {
        paint(index, elements);
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      painter.current = null;
      cancelAnimationFrame(frameId);
    };
  }, [animated, columnCount, grid]);

  const registerBlob = useCallback((index: number, elements: BlobCellElements | null) => {
    if (!elements) {
      cells.current.delete(index);
      return;
    }
    cells.current.set(index, elements);
    painter.current?.(index, elements);
  }, []);

  return {
    dimensions,
    viewBox: `0 0 ${design.width} ${design.height}`,
    aspectRatio: `${design.width} / ${design.height}`,
    inset,
    registerBlob,
  };
}

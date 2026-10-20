import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BlobCarouselOptions, ViewportSize } from '@/models/blob-carousel';
import type { BlobGeometryParams } from '@/models/blob-geometry';
import {
  DEFAULT_BLOB_SHAPE,
  DEFAULT_EASE,
  DEFAULT_MAX_BLOB_HEIGHT,
  FILL_BLEED,
  MIN_BLOB_PITCH,
  SETTLE_THRESHOLD,
  VIEWPORT_VERTICAL_MARGIN,
} from '@/const/blob-carousel';
import { buildBlobPath } from '@/commons/blob-geometry/blob-path';
import { blobPitchForWidth, shortestLoopDelta, visibleIndexRange } from '@/commons/carousel-layout';
import { modulo } from '@/commons/modulo';

/** Éléments SVG d'un blob dont la forme est mise à jour à chaque image. */
export interface BlobCellElements {
  readonly path: SVGPathElement;
  readonly fill: SVGRectElement | SVGImageElement;
}

interface MotionState {
  offset: number;
  target: number;
  clock: number;
  drag: { readonly startX: number; readonly startTarget: number } | null;
}

interface UseBlobCarouselArguments extends BlobCarouselOptions {
  readonly slideCount: number;
  readonly onActiveIndexChange?: ((index: number) => void) | undefined;
}

/**
 * Pilote un carrousel de blobs : mesure la zone, anime l'inertie du défilement et la forme des
 * blobs (sans repasser par React à chaque image), gère le glissement, le clavier et la boucle infinie.
 *
 * @returns les refs à brancher, la géométrie courante, les index à rendre, l'index actif,
 * les commandes de navigation et les gestionnaires d'événements de la zone interactive.
 */
export function useBlobCarousel({
  slideCount,
  shape,
  ease = DEFAULT_EASE,
  maxHeight = DEFAULT_MAX_BLOB_HEIGHT,
  onActiveIndexChange,
}: UseBlobCarouselArguments) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const cells = useRef(new Map<number, BlobCellElements>());
  const motion = useRef<MotionState>({ offset: 0, target: 0, clock: 0, drag: null });
  const latestCallback = useRef(onActiveIndexChange);
  const [size, setSize] = useState<ViewportSize>({ width: 0, height: 0 });
  const [range, setRange] = useState(() => visibleIndexRange(0, 0, MIN_BLOB_PITCH));
  const [activeIndex, setActiveIndex] = useState(0);

  const { gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed } = {
    ...DEFAULT_BLOB_SHAPE,
    ...shape,
  };
  const blobHeight = Math.max(0, Math.min(size.height - VIEWPORT_VERTICAL_MARGIN, maxHeight));
  const pitch = blobPitchForWidth(size.width);
  const geometry = useMemo<BlobGeometryParams>(
    () => ({ gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed, height: blobHeight, pitch }),
    [gap, corner, smooth, sepAmp, detail, liveAmp, liveSpeed, blobHeight, pitch],
  );
  const viewBox = `0 ${-(size.height - blobHeight) / 2} ${size.width} ${size.height}`;

  useEffect(() => {
    latestCallback.current = onActiveIndexChange;
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    });
    observer.observe(viewport);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (slideCount === 0) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = motion.current;
    let previousTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      if (!reducedMotion) state.clock += now - previousTime;
      previousTime = now;
      state.offset += (state.target - state.offset) * ease;
      if (Math.abs(state.target - state.offset) < SETTLE_THRESHOLD) state.offset = state.target;

      const { first, last } = visibleIndexRange(state.offset, size.width, geometry.pitch);
      setRange((previous) =>
        previous.first === first && previous.last === last ? previous : { first, last },
      );
      const active = modulo(Math.round(state.offset), slideCount);
      setActiveIndex((previous) => {
        if (previous === active) return previous;
        latestCallback.current?.(active);
        return active;
      });

      const center = (state.offset + 0.5) * geometry.pitch;
      worldRef.current?.setAttribute('transform', `translate(${size.width / 2 - center} 0)`);
      if (geometry.height > 0) {
        cells.current.forEach(({ path, fill }, index) => {
          path.setAttribute('d', buildBlobPath(geometry, index, state.clock));
          fill.setAttribute('x', String(index * geometry.pitch - FILL_BLEED));
          fill.setAttribute('y', '0');
          fill.setAttribute('width', String(geometry.pitch + 2 * FILL_BLEED));
          fill.setAttribute('height', String(geometry.height));
        });
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [ease, geometry, size.width, slideCount]);

  const registerBlob = useCallback((index: number, elements: BlobCellElements | null) => {
    if (elements) cells.current.set(index, elements);
    else cells.current.delete(index);
  }, []);

  const goBy = useCallback((delta: number) => {
    motion.current.target = Math.round(motion.current.target) + delta;
  }, []);

  const goToSlide = useCallback(
    (slide: number) => {
      const current = Math.round(motion.current.target);
      motion.current.target = current + shortestLoopDelta(current, slide, slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      goBy(event.key === 'ArrowLeft' ? -1 : 1);
    };
    root.addEventListener('keydown', handleKeyDown);
    return () => {
      root.removeEventListener('keydown', handleKeyDown);
    };
  }, [goBy]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    motion.current.drag = { startX: event.clientX, startTarget: motion.current.target };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const { drag } = motion.current;
    if (!drag) return;
    motion.current.target = drag.startTarget - (event.clientX - drag.startX) / geometry.pitch;
  };

  const handlePointerEnd = () => {
    if (!motion.current.drag) return;
    motion.current.drag = null;
    motion.current.target = Math.round(motion.current.target);
  };

  return {
    rootRef,
    viewportRef,
    worldRef,
    viewBox,
    geometry,
    indices: Array.from({ length: range.last - range.first + 1 }, (_, k) => range.first + k),
    activeIndex,
    registerBlob,
    goBy,
    goToSlide,
    viewportHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
}

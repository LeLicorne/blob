import { useEffect, useState } from 'react';

/**
 * Horloge en millisecondes qui avance à chaque image d'animation, figée si l'utilisateur
 * préfère réduire les animations.
 */
export function useAnimationClock(): number {
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previous = performance.now();
    let elapsed = 0;
    let frameId = 0;
    const tick = (now: number) => {
      if (!reducedMotion) elapsed += now - previous;
      previous = now;
      setClock(elapsed);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return clock;
}

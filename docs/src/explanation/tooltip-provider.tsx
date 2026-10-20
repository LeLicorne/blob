import {
  createContext,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/** Position du pointeur au moment de l'affichage ; `null` quand l'infobulle vient du clavier. */
export interface TipPointer {
  readonly clientX: number;
  readonly clientY: number;
  readonly element: Element;
}

/** Contenu statique, ou calculé à chaque déplacement du pointeur. */
export type TipContent = ReactNode | ((pointer: TipPointer | null) => ReactNode);

/** Gestionnaires à étaler sur l'élément qui déclenche l'infobulle. */
export interface TipTriggerProps {
  readonly onPointerEnter: (event: PointerEvent) => void;
  readonly onPointerMove: (event: PointerEvent) => void;
  readonly onPointerLeave: (event: PointerEvent) => void;
  readonly onPointerUp: (event: PointerEvent) => void;
  readonly onFocus: (event: FocusEvent) => void;
  readonly onBlur: () => void;
}

interface TipState {
  readonly content: ReactNode;
  readonly x: number;
  readonly y: number;
}

const POINTER_OFFSET = 16;
const SCREEN_MARGIN = 10;

const TooltipContext = createContext<((content: TipContent) => TipTriggerProps) | null>(null);

function resolve(content: TipContent, pointer: TipPointer | null): ReactNode {
  return typeof content === 'function' ? content(pointer) : content;
}

/** Affiche une infobulle flottante au survol, au focus clavier et au toucher. */
export function TooltipProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<TipState | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const show = useCallback((content: TipContent, pointer: TipPointer | null, target: Element) => {
    if (pointer) {
      setState({
        content: resolve(content, pointer),
        x: pointer.clientX + POINTER_OFFSET,
        y: pointer.clientY + POINTER_OFFSET,
      });
      return;
    }
    const rect = target.getBoundingClientRect();
    setState({
      content: resolve(content, null),
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  }, []);

  const hide = useCallback(() => {
    setState(null);
  }, []);

  const triggerProps = useCallback(
    (content: TipContent): TipTriggerProps => {
      const showFromPointer = (event: PointerEvent) => {
        const { clientX, clientY, currentTarget } = event;
        show(content, { clientX, clientY, element: currentTarget }, currentTarget);
      };
      const ignoreTouch = (handler: (event: PointerEvent) => void) => (event: PointerEvent) => {
        if (event.pointerType !== 'touch') handler(event);
      };
      return {
        onPointerEnter: ignoreTouch(showFromPointer),
        onPointerMove: ignoreTouch(showFromPointer),
        onPointerLeave: ignoreTouch(hide),
        onPointerUp: (event) => {
          if (event.pointerType === 'touch') showFromPointer(event);
        },
        onFocus: (event) => {
          show(content, null, event.currentTarget);
        },
        onBlur: hide,
      };
    },
    [hide, show],
  );

  useEffect(() => {
    const hideOnTouch = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'touch') hide();
    };
    document.addEventListener('pointerdown', hideOnTouch);
    return () => {
      document.removeEventListener('pointerdown', hideOnTouch);
    };
  }, [hide]);

  useLayoutEffect(() => {
    const element = tipRef.current;
    if (!element || !state) return;
    let { x, y } = state;
    if (x + element.offsetWidth > innerWidth - SCREEN_MARGIN) {
      x = Math.max(SCREEN_MARGIN, x - element.offsetWidth - 2 * POINTER_OFFSET);
    }
    if (y + element.offsetHeight > innerHeight - SCREEN_MARGIN) {
      y = Math.max(SCREEN_MARGIN, y - element.offsetHeight - 2 * POINTER_OFFSET);
    }
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }, [state]);

  const value = useMemo(() => triggerProps, [triggerProps]);

  return (
    <TooltipContext value={value}>
      {children}
      <div ref={tipRef} role="tooltip" className={state ? 'tip tip--on' : 'tip'}>
        {state?.content}
      </div>
    </TooltipContext>
  );
}

/** Renvoie la fonction qui produit les gestionnaires d'infobulle d'un élément. */
export function useTip(): (content: TipContent) => TipTriggerProps {
  const value = useContext(TooltipContext);
  if (!value) throw new Error('useTip must be used inside TooltipProvider');
  return value;
}

import { useCallback, useEffect, useRef } from 'react';

export type OverlayName = 'bell' | 'user';

/**
 * Gestion d'un seul panneau ouvert à la fois (cloche ou menu avatar) :
 * un clic à l'extérieur ou Échap le ferme ; Échap rend le focus au bouton déclencheur.
 */
export function useOverlay(name: OverlayName, current: OverlayName | null, setCurrent: (value: OverlayName | null) => void) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = current === name;

  const close = useCallback(
    (restoreFocus = true) => {
      setCurrent(null);
      if (restoreFocus) buttonRef.current?.focus();
    },
    [setCurrent],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setCurrent(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close, setCurrent]);

  return { wrapRef, buttonRef, open, close };
}

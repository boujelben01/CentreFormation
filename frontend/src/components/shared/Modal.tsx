import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Contenu (.dialog__body). */
  children: ReactNode;
  /** Boutons du pied (.dialog__foot). */
  footer: ReactNode;
  /** Dialogue d'alerte (action destructive) : role="alertdialog" et focus initial sur « annuler ». */
  danger?: boolean;
  /** Sélecteur du premier élément à focaliser (par défaut : champ de formulaire, sinon bouton principal). */
  initialFocus?: string;
}

/**
 * Boîte de dialogue modale (composant « dialog » de la maquette) : piège de focus, Échap, voile cliquable,
 * retour du focus à l'élément qui l'a ouverte.
 */
export function Modal({ open, onClose, title, children, footer, danger = false, initialFocus }: ModalProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => setVisible(true));

    const panel = panelRef.current;
    const target = panel
      ? ((initialFocus ? panel.querySelector<HTMLElement>(initialFocus) : null) ??
        (danger ? panel.querySelector<HTMLElement>('[data-dialog-close].btn') : null) ??
        panel.querySelector<HTMLElement>('input,select,textarea') ??
        panel.querySelector<HTMLElement>('.btn--primary,.btn--danger') ??
        panel.querySelector<HTMLElement>('.icon-btn'))
      : null;
    target?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      if (opener && document.contains(opener)) opener.focus();
      else document.getElementById('main')?.focus({ preventScroll: true });
    };
    // initialFocus et danger sont figés à l'ouverture
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={visible ? 'dialog is-open' : 'dialog'}>
      <div className="dialog__overlay" onClick={onClose} />
      <div
        className="dialog__panel"
        ref={panelRef}
        role={danger ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
      >
        <div className="dialog__head">
          <h2 id={`${id}-t`}>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Fermer la boîte de dialogue" onClick={onClose}>
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <div className="dialog__body" id={`${id}-d`}>
          {children}
        </div>
        <div className="dialog__foot">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

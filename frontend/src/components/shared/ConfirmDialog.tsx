import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Texte simple du corps ; ignoré si `children` est fourni. */
  description?: string;
  /** Corps personnalisé (paragraphes, `<dl className="dialog__facts">`…). */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Libellé du bouton pendant l'opération. */
  busyLabel?: string;
  /** Action irréversible ou destructive : bouton rouge, rôle alertdialog. */
  destructive?: boolean;
  /**
   * Action confirmée. Si elle renvoie une promesse, la boîte reste ouverte (bouton « en cours »)
   * jusqu'à sa résolution, puis se ferme ; en cas d'échec elle reste ouverte.
   */
  onConfirm: () => void | Promise<unknown>;
}

/** Confirmation accessible (composant « dialog » de la maquette) : remplace window.confirm. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = 'Annuler',
  busyLabel = 'Veuillez patienter…',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const close = () => {
    if (!pending) onOpenChange(false);
  };

  const confirm = async () => {
    const result = onConfirm();
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setPending(true);
      try {
        await result;
        onOpenChange(false);
      } catch {
        // l'erreur est déjà signalée par l'appelant (toast) : la boîte reste ouverte
      } finally {
        setPending(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      danger={destructive}
      footer={
        <>
          <button type="button" className="btn btn--secondary" data-dialog-close onClick={close} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${destructive ? 'btn--danger' : 'btn--primary'}${pending ? ' is-loading' : ''}`}
            onClick={confirm}
            disabled={pending}
          >
            {pending && <span className="spinner" aria-hidden="true" />}
            <span className="btn-text">{pending ? busyLabel : confirmLabel}</span>
          </button>
        </>
      }
    >
      {children ?? <p>{description}</p>}
    </Modal>
  );
}

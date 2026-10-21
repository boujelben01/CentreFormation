import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectField } from './SelectField';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'name'> {
  id: string;
  label: string;
  hint?: ReactNode;
  /** Message d'erreur du champ (affiche l'état invalide de la maquette). */
  error?: string;
  /** Champ validé (bordure verte de la maquette). */
  valid?: boolean;
  /** Mention « (facultatif) » après le libellé. */
  optional?: boolean;
  /** Occupe les deux colonnes d'un `.form-grid--2`. */
  span?: boolean;
}

/** Champ de formulaire (composant « form-field » de la maquette) : libellé, contrôle, aide, erreur. */
export function FormField({ id, label, hint, error, valid, optional, span, type = 'text', required, ...rest }: FormFieldProps) {
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined;

  const input = (
    <input
      {...rest}
      className="input"
      id={id}
      name={id}
      type={isPassword && shown ? 'text' : type}
      required={required}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    />
  );

  return (
    <div className={cn('field', span && 'span-2', error ? 'is-invalid' : valid && 'is-valid')}>
      <label htmlFor={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        )}
        {optional && (
          <>
            {' '}
            <span className="opt">(facultatif)</span>
          </>
        )}
      </label>
      {isPassword ? (
        <div className="input-group">
          {input}
          <button
            type="button"
            className="icon-btn"
            aria-label={shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={shown}
            aria-controls={id}
            onClick={() => setShown((v) => !v)}
          >
            {shown ? <EyeOff className="icon" aria-hidden="true" /> : <Eye className="icon" aria-hidden="true" />}
          </button>
        </div>
      ) : (
        input
      )}
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`}>
          <AlertCircle className="icon icon--sm" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface SelectFormFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'name'> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  valid?: boolean;
  /** Occupe les deux colonnes d'un `.form-grid--2`. */
  span?: boolean;
  children: ReactNode;
}

/** Champ de formulaire à liste déroulante native (form-field + select de la maquette). */
export function SelectFormField({ id, label, hint, error, valid, span, required, children, ...rest }: SelectFormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('field', span && 'span-2', error ? 'is-invalid' : valid && 'is-valid')}>
      <label htmlFor={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      <SelectField {...rest} id={id} name={id} required={required} aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
        {children}
      </SelectField>
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`}>
          <AlertCircle className="icon icon--sm" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface TextareaFormFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'name'> {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  valid?: boolean;
  span?: boolean;
}

/** Champ de formulaire à zone de texte (form-field + textarea de la maquette). */
export function TextareaFormField({ id, label, hint, error, valid, span, required, ...rest }: TextareaFormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('field', span && 'span-2', error ? 'is-invalid' : valid && 'is-valid')}>
      <label htmlFor={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      <textarea
        {...rest}
        className="textarea"
        id={id}
        name={id}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      />
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`}>
          <AlertCircle className="icon icon--sm" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Résumé d'erreurs d'un formulaire (`.form-alert`, région role=alert toujours présente). */
export function FormAlert({ children, id, success }: { children?: ReactNode; id?: string; success?: boolean }) {
  return (
    <div className={cn('form-alert', success && 'is-success')} id={id} role={success ? 'status' : 'alert'}>
      {children}
    </div>
  );
}

/** Contenu standard d'un `.form-alert` : icône + message. */
export function FormAlertMessage({ children }: { children: ReactNode }) {
  return (
    <>
      <AlertCircle className="icon" aria-hidden="true" />
      <span>{children}</span>
    </>
  );
}

const NB = '\u00A0';

/** Indicateur de robustesse du mot de passe (composant « password-strength » de la maquette). */
export function PasswordStrength({ value }: { value: string }) {
  const rules = [
    { key: 'len', ok: value.length >= 6, text: '6 caractères minimum (obligatoire)' },
    { key: 'long', ok: value.length >= 8, text: '8 caractères ou plus (conseillé)' },
    { key: 'up', ok: /[A-Z]/.test(value), text: 'Une majuscule (conseillé)' },
    { key: 'num', ok: /\d/.test(value), text: 'Un chiffre (conseillé)' },
  ];
  const score = value ? Math.max(1, rules.filter((r) => r.ok).length) : 0;
  const label = value ? ['', 'faible', 'moyenne', 'bonne', 'excellente'][score] : 'non renseigné';

  return (
    <div className="strength" data-strength data-score={score}>
      <div className="strength__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <p className="strength__label" aria-live="polite">
        Robustesse du mot de passe{NB}: {label}
      </p>
      <ul className="rules" aria-label="Conseils pour un mot de passe robuste">
        {rules.map((r) => (
          <li key={r.key} className={r.ok ? 'ok' : undefined}>
            {r.ok ? <Check className="icon icon--sm" aria-hidden="true" /> : <Minus className="icon icon--sm" aria-hidden="true" />}
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Info, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { FormAlert, FormAlertMessage, FormField, SelectFormField, TextareaFormField } from '@/components/shared';
import { PublicPageHead } from '@/components/public/PublicPageHead';
import { usePageTitle } from '@/hooks/use-page-title';
import { getApiErrorMessage } from '@/lib/errors';
import { publicApi } from '@/services/api';

const NB = ' ';
const MESSAGE_MIN = 20;
const MESSAGE_MAX = 1000;
const SUJETS = ['Information sur une formation', 'Inscription', 'Autre demande'];

interface ContactForm {
  nom: string;
  email: string;
  sujet: string;
  message: string;
  /** Champ piège : masqué aux visiteurs, jamais rempli par un humain. */
  website: string;
}
type Field = 'nom' | 'email' | 'sujet' | 'message';
type Errors = Partial<Record<Field, string>>;

const EMPTY: ContactForm = { nom: '', email: '', sujet: '', message: '', website: '' };
const LABELS: Record<Field, string> = { nom: 'Nom complet', email: 'Adresse e-mail', sujet: 'Sujet', message: 'Message' };
const ORDER: Field[] = ['nom', 'email', 'sujet', 'message'];

function check(name: Field, v: ContactForm): string {
  const value = v[name].trim();
  switch (name) {
    case 'nom':
      return value ? '' : 'Saisissez votre nom.';
    case 'email':
      if (!value) return 'Saisissez votre adresse e-mail.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : 'Saisissez une adresse e-mail valide, par exemple prenom.nom@exemple.tn.';
    case 'sujet':
      return value ? '' : 'Choisissez un sujet.';
    case 'message':
      if (!value) return 'Écrivez votre message.';
      return value.length < MESSAGE_MIN ? `Votre message doit contenir au moins ${MESSAGE_MIN} caractères.` : '';
  }
}

/** Page de contact (maquette public/contact.html) : formulaire branché sur POST /api/public/contact. */
const Contact = () => {
  usePageTitle('Contact');
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [summary, setSummary] = useState('');
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const doneTitle = useRef<HTMLHeadingElement>(null);

  const change = (name: keyof ContactForm, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (name !== 'website' && (touched[name] || errors[name])) setErrors((e) => ({ ...e, [name]: check(name, next) }));
  };

  const blur = (name: Field) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: check(name, form) }));
  };

  const props = (name: Field) => ({
    value: form[name],
    error: errors[name],
    valid: !errors[name] && !!touched[name] && !!form[name].trim(),
    disabled: sending,
    onBlur: () => blur(name),
  });
  const onInput = (name: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(name, e.target.value);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    const found: Errors = {};
    for (const name of ORDER) {
      const message = check(name, form);
      if (message) found[name] = message;
    }
    setErrors(found);
    setTouched({ nom: true, email: true, sujet: true, message: true });
    const bad = ORDER.filter((n) => found[n]);
    setSummary(bad.length > 0 ? `${bad.length} ${bad.length > 1 ? 'champs à corriger' : 'champ à corriger'}${NB}: ${bad.map((n) => LABELS[n]).join(', ')}.` : '');
    if (bad.length > 0) {
      document.getElementById(`ct-${bad[0]}`)?.focus();
      return;
    }

    setSending(true);
    try {
      await publicApi.sendContact({
        nom: form.nom.trim(),
        email: form.email.trim(),
        sujet: form.sujet,
        message: form.message.trim(),
        website: form.website,
      });
      setSentTo(form.nom.trim().split(' ')[0]);
      toast.success('Message envoyé');
      setTimeout(() => doneTitle.current?.focus(), 0);
    } catch (err) {
      // 400, 429 et 503 : le message français de l'API est repris tel quel.
      setServerError(getApiErrorMessage(err, "Votre message n'a pas pu être envoyé. Veuillez réessayer plus tard."));
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    setForm(EMPTY);
    setErrors({});
    setTouched({});
    setSummary('');
    setServerError('');
    setSentTo(null);
    setTimeout(() => document.getElementById('ct-nom')?.focus(), 0);
  };

  const alertMessage = serverError || summary;

  return (
    <div className="container">
      <PublicPageHead
        crumbs={[{ label: 'Contact' }]}
        title="Contactez-nous"
        text="Une question sur une formation ou une inscription ? Écrivez-nous avec le formulaire ci-dessous."
      />
      <div className="contact">
        <aside aria-label="Pour aller plus vite">
          <ul className="contact-list">
            <li>
              <span className="feature__icon">
                <Info className="icon" aria-hidden="true" />
              </span>
              <div>
                <strong>Questions fréquentes</strong>
                <Link className="link-inline" to="/faq">
                  Consulter la FAQ
                </Link>
              </div>
            </li>
            <li>
              <span className="feature__icon">
                <BookOpen className="icon" aria-hidden="true" />
              </span>
              <div>
                <strong>Formations</strong>
                <Link className="link-inline" to="/formations">
                  Parcourir le catalogue
                </Link>
              </div>
            </li>
            <li>
              <span className="feature__icon">
                <LogIn className="icon" aria-hidden="true" />
              </span>
              <div>
                <strong>Espace personnel</strong>
                <Link className="link-inline" to="/login">
                  Se connecter
                </Link>
              </div>
            </li>
          </ul>
        </aside>

        <div className="card card--pad">
          {sentTo === null ? (
            <div>
              <h2 className="text-h3" style={{ marginBottom: 'var(--space-1)' }}>
                Envoyer un message
              </h2>
              <p className="muted" style={{ marginBottom: 'var(--space-5)' }}>
                Les champs marqués d'un astérisque sont obligatoires.
              </p>
              <form onSubmit={submit} noValidate>
                <FormAlert id="contact-summary">{alertMessage && <FormAlertMessage>{alertMessage}</FormAlertMessage>}</FormAlert>
                <div className="form-grid form-grid--2" style={{ marginTop: 'var(--space-4)' }}>
                  <FormField id="ct-nom" label="Nom complet" autoComplete="name" required maxLength={100} {...props('nom')} onChange={onInput('nom')} />
                  <FormField
                    id="ct-email"
                    label="Adresse e-mail"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={150}
                    {...props('email')}
                    onChange={onInput('email')}
                  />
                  <SelectFormField id="ct-sujet" label="Sujet" required span {...props('sujet')} onChange={onInput('sujet')}>
                    <option value="">Sélectionner…</option>
                    {SUJETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectFormField>
                  <TextareaFormField
                    id="ct-message"
                    label="Message"
                    required
                    span
                    maxLength={MESSAGE_MAX}
                    hint={`Précisez la formation concernée si possible (${MESSAGE_MIN} caractères minimum).`}
                    {...props('message')}
                    onChange={onInput('message')}
                  />
                </div>
                {/* Champ piège : hors écran, ignoré des lecteurs d'écran et du clavier. Rempli, le message est écarté par le serveur. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                  <label htmlFor="ct-website">Ne pas remplir ce champ</label>
                  <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => change('website', e.target.value)} />
                </div>
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <button className={`btn btn--primary btn--lg${sending ? ' is-loading' : ''}`} type="submit" disabled={sending} aria-busy={sending}>
                    {sending && <span className="spinner" aria-hidden="true" />}
                    <span className="btn-text">{sending ? 'Envoi en cours…' : 'Envoyer le message'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="success-panel" role="status">
              <span className="big">
                <CheckCircle className="icon icon--lg" aria-hidden="true" />
              </span>
              <h2 className="text-h3" tabIndex={-1} ref={doneTitle}>
                Message envoyé
              </h2>
              <p className="muted">Merci {sentTo}. Votre message a bien été transmis à l'équipe.</p>
              <button type="button" className="btn btn--secondary" onClick={again}>
                Envoyer un autre message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;

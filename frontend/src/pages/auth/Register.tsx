import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle } from 'lucide-react';
import { authApi } from '@/services/api';
import { getApiErrorMessage } from '@/lib/errors';
import { FormAlert, FormAlertMessage, FormField, PasswordStrength } from '@/components/shared';
import { AuthShell } from '@/components/public/AuthShell';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  matricule: string;
}

const initialFormData: RegisterFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nom: '',
  prenom: '',
  matricule: '',
};

type Errors = Partial<Record<keyof RegisterFormData, string>>;

const NB = '\u00A0';
const STEPS = ['Compte', 'Profil', 'Confirmation'] as const;
const FIELDS_BY_STEP: Array<Array<keyof RegisterFormData>> = [
  ['username', 'email', 'password', 'confirmPassword'],
  ['prenom', 'nom', 'matricule'],
  [],
];
const LABELS: Record<keyof RegisterFormData, string> = {
  username: "Nom d'utilisateur",
  email: 'Adresse e-mail',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  prenom: 'Prénom',
  nom: 'Nom',
  matricule: 'Matricule',
};

function check(name: keyof RegisterFormData, v: RegisterFormData): string {
  const value = v[name].trim();
  switch (name) {
    case 'username':
      return value ? '' : "Le nom d'utilisateur est requis.";
    case 'email':
      if (!value) return "L'email est requis.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
        ? ''
        : 'Saisissez une adresse e-mail valide, par exemple prenom.nom@exemple.tn.';
    case 'password':
      if (!v.password) return 'Le mot de passe est requis.';
      return v.password.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères.' : '';
    case 'confirmPassword':
      if (!v.confirmPassword) return 'Confirmez votre mot de passe.';
      return v.confirmPassword !== v.password ? 'Les deux mots de passe ne correspondent pas.' : '';
    case 'matricule':
      return value ? '' : 'Le matricule est requis.';
    default:
      return '';
  }
}

export default function Register() {
  usePageTitle('Créer un compte');
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [done, setDone] = useState(false);
  const doneTitle = useRef<HTMLHeadingElement>(null);

  const focusFirst = (n: number) => {
    // Après le rendu de l'étape : le champ n'existe qu'une fois le volet affiché.
    setTimeout(() => document.querySelector<HTMLElement>(`[data-pane="${n}"] input`)?.focus(), 0);
  };

  const change = (name: keyof RegisterFormData, value: string) => {
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name] || errors[name]) setErrors((e) => ({ ...e, [name]: check(name, next) }));
    if (name === 'password' && next.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: check('confirmPassword', next) }));
  };

  const blur = (name: keyof RegisterFormData) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: check(name, formData) }));
  };

  const fieldProps = (name: keyof RegisterFormData) => ({
    value: formData[name],
    error: errors[name],
    valid: !errors[name] && !!touched[name] && !!formData[name].trim(),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(name, e.target.value),
    onBlur: () => blur(name),
    disabled: loading,
  });

  const goTo = (n: number, focus = true) => {
    setStep(n);
    setSummary('');
    setError('');
    if (focus) focusFirst(n);
  };

  const validateStep = (): boolean => {
    const found: Errors = {};
    for (const name of FIELDS_BY_STEP[step - 1]) {
      const message = check(name, formData);
      if (message) found[name] = message;
    }
    setErrors((e) => ({ ...e, ...found }));
    setTouched((t) => ({ ...t, ...Object.fromEntries(FIELDS_BY_STEP[step - 1].map((n) => [n, true])) }));
    const bad = Object.keys(found) as Array<keyof RegisterFormData>;
    setSummary(
      bad.length > 0
        ? `${bad.length} ${bad.length > 1 ? 'champs à corriger' : 'champ à corriger'}${NB}: ${bad.map((n) => LABELS[n]).join(', ')}.`
        : '',
    );
    if (bad.length > 0) document.getElementById(`reg-${bad[0]}`)?.focus();
    return bad.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateStep()) return;
    if (step < 3) {
      goTo(step + 1);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        userType: 'ETUDIANT' as const,
        matricule: formData.matricule.trim(),
      });
      setDone(true);
      toast.success('Compte créé');
      setTimeout(() => doneTitle.current?.focus(), 0);
    } catch (err) {
      const message = getApiErrorMessage(err, 'La création du compte a échoué. Veuillez réessayer.');
      setError(message);
      toast.error("Échec de l'inscription", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${formData.prenom.trim()} ${formData.nom.trim()}`.trim() || 'Non renseigné';
  const alertMessage = error || summary;

  return (
    <AuthShell
      eyebrow="Inscription"
      title="Votre compte en trois étapes."
      points={[
        'Vous demandez ensuite votre inscription aux formations de votre choix',
        'Votre nom, votre prénom et votre mot de passe sont modifiables depuis votre profil',
        'Le catalogue des formations reste consultable sans compte',
      ]}
    >
      <div className="card card--pad auth-card">
        {!done ? (
          <div>
            <h1>Créer un compte</h1>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <ol className="stepper" style={{ '--steps': STEPS.length } as React.CSSProperties} aria-label="Étapes">
                {STEPS.map((label, i) => {
                  const n = i + 1;
                  return (
                    <li
                      key={label}
                      className={n < step ? 'is-done' : n === step ? 'is-current' : undefined}
                      aria-current={n === step ? 'step' : undefined}
                    >
                      <span className="dot">
                        <b>{n}</b>
                        <Check className="icon icon--sm" aria-hidden="true" />
                      </span>
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              Étape {step} sur 3{NB}: {STEPS[step - 1]}
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <FormAlert id="reg-summary">{alertMessage && <FormAlertMessage>{alertMessage}</FormAlertMessage>}</FormAlert>

              <fieldset data-pane="1" style={{ border: 0, padding: 0, margin: 'var(--space-4) 0 0' }} hidden={step !== 1}>
                <legend className="sr-only">Étape 1 sur 3{NB}: Compte</legend>
                <div className="form-grid">
                  <FormField {...fieldProps('username')} id="reg-username" label="Nom d'utilisateur" autoComplete="username" required />
                  <FormField
                    {...fieldProps('email')}
                    id="reg-email"
                    label="Adresse e-mail"
                    type="email"
                    autoComplete="email"
                    placeholder="prenom.nom@exemple.tn"
                    required
                  />
                  <FormField
                    {...fieldProps('password')}
                    id="reg-password"
                    label="Mot de passe"
                    type="password"
                    autoComplete="new-password"
                    required
                    hint="6 caractères minimum."
                  />
                  <PasswordStrength value={formData.password} />
                  <FormField
                    {...fieldProps('confirmPassword')}
                    id="reg-confirmPassword"
                    label="Confirmer le mot de passe"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </fieldset>

              <fieldset data-pane="2" style={{ border: 0, padding: 0, margin: 'var(--space-4) 0 0' }} hidden={step !== 2}>
                <legend className="sr-only">Étape 2 sur 3{NB}: Profil</legend>
                <div className="form-grid form-grid--2">
                  <FormField {...fieldProps('prenom')} id="reg-prenom" label="Prénom" autoComplete="given-name" optional />
                  <FormField {...fieldProps('nom')} id="reg-nom" label="Nom" autoComplete="family-name" optional />
                  <FormField
                    {...fieldProps('matricule')}
                    id="reg-matricule"
                    label="Matricule"
                    required
                    inputMode="numeric"
                    span
                    hint="Votre numéro de matricule étudiant."
                  />
                </div>
              </fieldset>

              <fieldset data-pane="3" style={{ border: 0, padding: 0, margin: 'var(--space-4) 0 0' }} hidden={step !== 3}>
                <legend className="sr-only">Étape 3 sur 3{NB}: Confirmation</legend>
                <p className="muted" style={{ marginBottom: 'var(--space-3)' }}>
                  Vérifiez vos informations avant de créer votre compte.
                </p>
                <dl className="summary">
                  {(
                    [
                      ["Nom d'utilisateur", formData.username],
                      ['Adresse e-mail', formData.email],
                      ['Prénom et nom', fullName],
                      ['Matricule', formData.matricule],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </fieldset>

              <div className="row-between" style={{ marginTop: 'var(--space-6)' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                  disabled={loading}
                  onClick={() => step > 1 && goTo(step - 1)}
                >
                  <ArrowLeft className="icon" aria-hidden="true" />
                  Retour
                </button>
                <button
                  type="submit"
                  className={`btn btn--primary btn--lg${loading ? ' is-loading' : ''}`}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading && <span className="spinner" aria-hidden="true" />}
                  <span className="btn-text">{loading ? 'Inscription…' : step === 3 ? 'Créer mon compte' : 'Continuer'}</span>
                </button>
              </div>
            </form>
            <p className="auth-card__foot">
              Vous avez déjà un compte{NB}?{' '}
              <Link className="link-inline" to="/login">
                Se connecter
              </Link>
            </p>
          </div>
        ) : (
          <div className="success-panel" role="status">
            <span className="big">
              <CheckCircle className="icon icon--lg" aria-hidden="true" />
            </span>
            <h2 className="text-h2" tabIndex={-1} ref={doneTitle}>
              Compte créé
            </h2>
            <p className="muted">
              Votre compte étudiant est créé. Vous pouvez maintenant vous connecter avec l'adresse {formData.email.trim()}.
            </p>
            <div className="state__actions">
              <Link className="btn btn--primary btn--lg" to="/login">
                Se connecter
              </Link>
              <Link className="btn btn--secondary btn--lg" to="/formations">
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

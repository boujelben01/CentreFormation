import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import { getApiErrorMessage } from '@/lib/errors';
import { FormAlert, FormAlertMessage, FormField } from '@/components/shared';
import { AuthShell } from '@/components/public/AuthShell';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';

const REQUIRED = 'Veuillez remplir tous les champs.';

export default function Login() {
  usePageTitle('Connexion');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [summary, setSummary] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found: { email?: string; password?: string } = {};
    if (!email.trim()) found.email = REQUIRED;
    if (!password.trim()) found.password = REQUIRED;
    setFieldErrors(found);
    setValidated(true);
    const bad = [found.email && 'Adresse e-mail', found.password && 'Mot de passe'].filter(Boolean);
    if (bad.length > 0) {
      setSummary(`${bad.length} ${bad.length > 1 ? 'champs à corriger' : 'champ à corriger'}\u00A0: ${bad.join(', ')}.`);
      document.getElementById(found.email ? 'login-id' : 'login-pw')?.focus();
      return;
    }
    setSummary('');

    setLoading(true);

    try {
      const response = await authApi.login({ email: email.trim(), password });
      const { token, username, role } = response.data;

      login(token, username, role);
      toast.success('Connexion réussie\u00A0!');

      // Redirection selon le rôle
      const normalizedRole = role.replace('ROLE_', '').toLowerCase();
      navigate(`/${normalizedRole}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'La connexion a échoué. Veuillez réessayer.'));
      toast.error('Échec de la connexion');
      document.getElementById('login-pw')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const message = error || summary;

  return (
    <AuthShell
      eyebrow="Connexion"
      title="Retrouvez votre espace."
      points={[
        'Étudiants : emploi du temps, notes, inscriptions aux cours et notifications',
        'Formateurs : groupes, séances, emploi du temps et saisie des notes',
      ]}
    >
      <div className="card card--pad auth-card">
        <h1>Connexion</h1>
        <p className="muted" style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-5)' }}>
          Heureux de vous revoir. Saisissez vos identifiants.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <FormAlert id="login-summary">{message && <FormAlertMessage>{message}</FormAlertMessage>}</FormAlert>
          <div className="form-grid" style={{ marginTop: 'var(--space-4)' }}>
            <FormField
              id="login-id"
              label="Adresse e-mail"
              type="email"
              autoComplete="username"
              placeholder="votre@email.fr"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
              error={fieldErrors.email}
              valid={validated && !fieldErrors.email && !!email.trim()}
              disabled={loading}
            />
            <FormField
              id="login-pw"
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              error={fieldErrors.password}
              valid={validated && !fieldErrors.password && !!password.trim()}
              disabled={loading}
            />
          </div>
          <button
            className={`btn btn--primary btn--lg btn--block${loading ? ' is-loading' : ''}`}
            type="submit"
            disabled={loading}
            aria-busy={loading}
            style={{ marginTop: 'var(--space-5)' }}
          >
            {loading && <span className="spinner" aria-hidden="true" />}
            <span className="btn-text">{loading ? 'Connexion…' : 'Se connecter'}</span>
          </button>
        </form>
        <p className="auth-card__foot">
          Pas encore de compte&nbsp;?{' '}
          <Link className="link-inline" to="/register">
            Créer un compte
          </Link>
        </p>
        <p className="auth-card__foot" style={{ marginTop: 'var(--space-3)', paddingTop: 0, borderTop: 0 }}>
          <Link className="link-inline" to="/">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

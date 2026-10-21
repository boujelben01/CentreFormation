import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FormAlert, FormAlertMessage, FormField, PageHeader, PageState, UserAvatar } from '@/components/shared';
import { formateurKeys, useProfilFormateur } from '@/hooks/use-formateur-data';
import { getCourseTheme } from '@/lib/courseTheme';
import { getApiErrorMessage } from '@/lib/errors';
import { fullName } from '@/lib/text';
import { formateurApi } from '@/services/api';
import type { UpdateProfileRequest } from '@/types/api';

interface FormState {
  nom: string;
  prenom: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const LABELS: Record<keyof FormState, string> = {
  nom: 'Nom',
  prenom: 'Prénom',
  password: 'Nouveau mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
};

const EMPTY: FormState = { nom: '', prenom: '', password: '', confirmPassword: '' };

export default function FormateurProfile() {
  const queryClient = useQueryClient();
  const profil = useProfilFormateur();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState<string[]>([]);
  const editRef = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef<'edit' | 'nom' | null>(null);

  useEffect(() => {
    if (profil.data) {
      setForm({ nom: profil.data.nom ?? '', prenom: profil.data.prenom ?? '', password: '', confirmPassword: '' });
    }
  }, [profil.data]);

  // Déplace le focus après le changement de mode (lecture / modification).
  useEffect(() => {
    if (focusAfter.current === 'edit') editRef.current?.focus();
    if (focusAfter.current === 'nom') document.getElementById('pf-nom')?.focus();
    focusAfter.current = null;
  }, [editing]);

  const leaveEditing = () => {
    setEditing(false);
    setErrors({});
    setTouched({});
    setSummary([]);
    focusAfter.current = 'edit';
  };

  const update = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => (await formateurApi.updateProfile(data)).data,
    onSuccess: (updated) => {
      queryClient.setQueryData(formateurKeys.profil, updated);
      void queryClient.invalidateQueries({ queryKey: ['identity'] });
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      leaveEditing();
      toast.success('Profil mis à jour', { description: 'Vos modifications ont été enregistrées.' });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Impossible de mettre à jour le profil.')),
  });

  const check = (name: keyof FormState, values: FormState): string => {
    switch (name) {
      case 'nom':
        return values.nom.trim() ? '' : 'Le nom est requis.';
      case 'prenom':
        return values.prenom.trim() ? '' : 'Le prénom est requis.';
      case 'password':
        if (!values.password) return values.confirmPassword ? 'Saisissez le nouveau mot de passe.' : '';
        return values.password.length < 6 ? 'Le mot de passe doit contenir au moins 6 caractères.' : '';
      case 'confirmPassword':
        if (!values.confirmPassword) return values.password ? 'Confirmez votre mot de passe.' : '';
        return values.password !== values.confirmPassword ? 'Les deux mots de passe ne correspondent pas.' : '';
    }
  };

  const change = (name: keyof FormState, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name] || errors[name]) setErrors((e) => ({ ...e, [name]: check(name, next) }));
    // La confirmation dépend du mot de passe : on la revalide si elle a déjà été saisie.
    if (name === 'password' && next.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: check('confirmPassword', next) }));
  };

  const blur = (name: keyof FormState) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: check(name, form) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const names = Object.keys(LABELS) as Array<keyof FormState>;
    const found: FormErrors = {};
    for (const n of names) {
      const message = check(n, form);
      if (message) found[n] = message;
    }
    setErrors(found);
    const bad = names.filter((n) => found[n]);
    setSummary(bad.map((n) => LABELS[n]));
    if (bad.length > 0) {
      document.getElementById(`pf-${bad[0]}`)?.focus();
      return;
    }

    const data: UpdateProfileRequest = { nom: form.nom.trim(), prenom: form.prenom.trim() };
    if (form.password) data.password = form.password;
    update.mutate(data);
  };

  const data = profil.data;
  const name = fullName(data?.prenom, data?.nom);
  const props = (n: keyof FormState) => ({
    id: `pf-${n}`,
    value: form[n],
    error: errors[n],
    valid: !errors[n] && touched[n] && !!form[n].trim(),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => change(n, e.target.value),
    onBlur: () => blur(n),
  });
  const specCategory = data?.specialite ? getCourseTheme({ titre: data.specialite.nom }).category : null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Mon profil" />

      <PageState
        isLoading={profil.isLoading}
        isError={profil.isError}
        onRetry={() => void profil.refetch()}
        errorWhat="votre profil"
        skeleton="list"
      >
        {data && (
          <div className="stack" style={{ maxWidth: 760 }}>
            <section className="card card--pad" aria-label="Résumé du profil">
              <div className="profile-head" style={{ marginBottom: 0 }}>
                <UserAvatar name={name} size="lg" />
                <div>
                  <p className="text-h3">{name || 'Formateur'}</p>
                  <p className="muted">@{data.username}</p>
                  <p className="badge-row" style={{ marginTop: 'var(--space-2)' }}>
                    <span className="badge badge--primary">
                      <UserCheck className="icon icon--sm" aria-hidden="true" />
                      Formateur
                    </span>
                    {data.specialite && (
                      <span className={specCategory ? `badge badge--wrap badge--cat-${specCategory}` : 'badge badge--wrap'}>{data.specialite.nom}</span>
                    )}
                  </p>
                </div>
              </div>
            </section>

            <section className="card card--pad" aria-labelledby="pf-title">
              <div className="panel-title">
                <h2 id="pf-title">Informations personnelles</h2>
                {!editing && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    ref={editRef}
                    onClick={() => {
                      focusAfter.current = 'nom';
                      setEditing(true);
                    }}
                  >
                    <Pencil className="icon icon--sm" aria-hidden="true" />
                    Modifier
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <FormAlert>
                  {summary.length > 0 && (
                    <FormAlertMessage>
                      {summary.length} {summary.length > 1 ? 'champs à corriger' : 'champ à corriger'}&nbsp;: {summary.join(', ')}.
                    </FormAlertMessage>
                  )}
                </FormAlert>
                <div className="form-grid form-grid--2" style={{ marginTop: 'var(--space-4)' }}>
                  <FormField {...props('nom')} label="Nom" autoComplete="family-name" required readOnly={!editing} />
                  <FormField {...props('prenom')} label="Prénom" autoComplete="given-name" required readOnly={!editing} />
                  <FormField id="pf-email" label="Adresse e-mail" type="email" value={data.email ?? ''} readOnly hint="Non modifiable." onChange={() => undefined} />
                  <FormField id="pf-user" label="Nom d'utilisateur" value={data.username} readOnly hint="Non modifiable." onChange={() => undefined} />
                </div>
                {editing && (
                  <>
                    <fieldset style={{ border: 0, padding: 0, margin: 'var(--space-6) 0 0' }}>
                      <legend className="text-h4" style={{ padding: 0, marginBottom: 'var(--space-1)' }}>
                        Changer le mot de passe{' '}
                        <span className="muted text-small" style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-regular)' }}>
                          (facultatif)
                        </span>
                      </legend>
                      <p className="muted text-small" style={{ marginBottom: 'var(--space-4)' }}>
                        Laissez ces champs vides pour conserver votre mot de passe actuel.
                      </p>
                      <div className="form-grid form-grid--2">
                        <FormField {...props('password')} label="Nouveau mot de passe" type="password" autoComplete="new-password" hint="6 caractères minimum." />
                        <FormField {...props('confirmPassword')} label="Confirmer le mot de passe" type="password" autoComplete="new-password" />
                      </div>
                    </fieldset>
                    <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <button
                        type="submit"
                        className={`btn btn--primary${update.isPending ? ' is-loading' : ''}`}
                        disabled={update.isPending}
                        aria-busy={update.isPending}
                      >
                        {update.isPending && <span className="spinner" aria-hidden="true" />}
                        <span className="btn-text">{update.isPending ? 'Enregistrement…' : 'Enregistrer'}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => {
                          setForm({ nom: data.nom ?? '', prenom: data.prenom ?? '', password: '', confirmPassword: '' });
                          leaveEditing();
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </form>
            </section>
          </div>
        )}
      </PageState>
    </div>
  );
}

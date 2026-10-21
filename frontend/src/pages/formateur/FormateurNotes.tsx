import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Award, CheckCircle2, Pencil, Plus, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  CategoryBadge,
  EmptyState,
  FormAlert,
  FormAlertMessage,
  FormField,
  Modal,
  PageHeader,
  PageState,
  SelectFormField,
} from '@/components/shared';
import {
  formateurKeys,
  useCoursFormateur,
  useGroupesFormateur,
  useNotesFormateur,
} from '@/hooks/use-formateur-data';
import { getCourseTheme } from '@/lib/courseTheme';
import { getApiErrorMessage } from '@/lib/errors';
import { formatNote } from '@/lib/notes';
import { fullName } from '@/lib/text';
import { formateurApi } from '@/services/api';
import type { NoteFormateur } from '@/types/api';

const NB = ' ';
const SESSIONS = ['Principale', 'Rattrapage', 'Contrôle continu'];

type DialogState = { mode: 'create' } | { mode: 'edit'; note: NoteFormateur } | null;

interface FormState {
  groupeId: string;
  coursId: string;
  etudiantId: string;
  valeur: string;
  session: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const LABELS: Record<keyof FormState, string> = {
  groupeId: 'Groupe',
  coursId: 'Cours',
  etudiantId: 'Étudiant',
  valeur: 'Note (/20)',
  session: 'Session',
};

const EMPTY_FORM: FormState = { groupeId: '', coursId: '', etudiantId: '', valeur: '', session: SESSIONS[0] };

const plural = (n: number, singulier: string, pluriel: string) => (n > 1 ? pluriel : singulier);

/** Notes saisies par le formateur (maquette formateur/notes.html) : cartes + dialogues d'ajout et de modification. */
export default function FormateurNotes() {
  const queryClient = useQueryClient();
  const notes = useNotesFormateur();
  const groupes = useGroupesFormateur();
  const cours = useCoursFormateur();

  const [dialog, setDialog] = useState<DialogState>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');

  const listeGroupes = useMemo(() => groupes.data ?? [], [groupes.data]);
  const groupe = listeGroupes.find((g) => String(g.id) === form.groupeId);

  // Cours proposés : ceux du formateur, plus ceux de ses groupes (sans doublon).
  const coursOptions = useMemo(() => {
    const byId = new Map<number, string>();
    for (const c of cours.data ?? []) byId.set(c.id, `${c.code} - ${c.titre}`);
    for (const g of listeGroupes) {
      if (g.coursId !== null && !byId.has(g.coursId)) byId.set(g.coursId, `${g.coursCode ?? ''} - ${g.coursTitre ?? ''}`);
    }
    return Array.from(byId, ([value, label]) => ({ value: String(value), label })).sort((a, b) =>
      a.label.localeCompare(b.label, 'fr'),
    );
  }, [cours.data, listeGroupes]);

  const save = useMutation({
    mutationFn: async () => {
      const valeur = Number(form.valeur.replace(',', '.'));
      if (dialog?.mode === 'edit') {
        return (await formateurApi.updateNote(dialog.note.id, { valeur, session: form.session })).data;
      }
      return (
        await formateurApi.createNote({
          etudiantId: Number(form.etudiantId),
          coursId: Number(form.coursId),
          valeur,
          session: form.session,
        })
      ).data;
    },
    onSuccess: async (saved) => {
      const edit = dialog?.mode === 'edit';
      const who = fullName(saved.etudiantPrenom, saved.etudiantNom) || "L'étudiant";
      toast.success(edit ? 'Note mise à jour' : 'Note ajoutée', {
        description: `${who}${NB}: ${formatNote(saved.valeur)} sur 20.`,
      });
      setDialog(null);
      await queryClient.invalidateQueries({ queryKey: formateurKeys.notes });
    },
    onError: (error) => setServerError(getApiErrorMessage(error, "Impossible d'enregistrer la note.")),
  });

  const reset = (next: FormState) => {
    setForm(next);
    setErrors({});
    setSummary([]);
    setServerError('');
  };

  const openCreate = () => {
    reset(EMPTY_FORM);
    setDialog({ mode: 'create' });
  };

  const openEdit = (note: NoteFormateur) => {
    reset({ ...EMPTY_FORM, valeur: String(note.valeur), session: note.session ?? SESSIONS[0] });
    setDialog({ mode: 'edit', note });
  };

  const closeDialog = () => {
    if (!save.isPending) setDialog(null);
  };

  const setField = (name: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
    setServerError('');
  };

  const onGroupeChange = (groupeId: string) => {
    const g = listeGroupes.find((x) => String(x.id) === groupeId);
    setForm((f) => ({ ...f, groupeId, etudiantId: '', coursId: g?.coursId != null ? String(g.coursId) : f.coursId }));
    setErrors((e) => ({ ...e, groupeId: undefined, coursId: undefined, etudiantId: undefined }));
    setServerError('');
    if (!g) return;
    if (g.coursId != null) {
      toast.info('Cours automatiquement sélectionné', { description: g.coursTitre ?? undefined });
    } else {
      toast.error('Aucun cours associé à ce groupe', { description: 'Veuillez sélectionner le cours manuellement.' });
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (dialog?.mode === 'create') {
      if (!form.groupeId) next.groupeId = 'Veuillez sélectionner un groupe.';
      if (!form.coursId) next.coursId = 'Veuillez sélectionner un cours.';
      // Le champ Étudiant est désactivé tant qu'aucun groupe n'est choisi : il n'est alors pas validé (comme la maquette).
      if (form.groupeId && !form.etudiantId) next.etudiantId = 'Veuillez sélectionner un étudiant.';
    }
    const raw = form.valeur.trim().replace(',', '.');
    const valeur = Number(raw);
    if (raw === '') {
      next.valeur = 'Veuillez saisir une note.';
    } else if (Number.isNaN(valeur) || valeur < 0 || valeur > 20) {
      next.valeur = 'La note doit être comprise entre 0 et 20.';
    } else if (Math.round(valeur * 2) / 2 !== valeur) {
      next.valeur = 'La note doit être un multiple de 0,5 (par exemple 12 ou 12,5).';
    }
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (save.isPending) return;
    setServerError('');
    const found = validate();
    setErrors(found);
    const bad = (Object.keys(LABELS) as Array<keyof FormState>).filter((k) => found[k]);
    setSummary(bad.map((k) => LABELS[k]));
    if (bad.length > 0) {
      document.getElementById(`n-${bad[0]}`)?.focus();
      return;
    }
    save.mutate();
  };

  const liste = [...(notes.data ?? [])].sort((a, b) => b.id - a.id);
  const isEdit = dialog?.mode === 'edit';
  const editNote = dialog?.mode === 'edit' ? dialog.note : null;
  const sessionOptions =
    editNote?.session && !SESSIONS.includes(editNote.session) ? [...SESSIONS, editNote.session] : SESSIONS;

  const addButton = (
    <button type="button" className="btn btn--primary" id="add-note" onClick={openCreate} disabled={groupes.isLoading || groupes.isError}>
      <Plus className="icon icon--sm" aria-hidden="true" />
      Ajouter une note
    </button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Notes" subtitle="Les notes que vous avez saisies, par étudiant." actions={addButton} />

      <PageState
        isLoading={notes.isLoading}
        isError={notes.isError}
        onRetry={() => void notes.refetch()}
        skeleton="cards"
        errorWhat="vos notes"
        isEmpty={liste.length === 0}
        empty={
          <EmptyState
            icon={Award}
            title="Aucune note enregistrée"
            description="Les notes que vous saisissez apparaîtront ici."
            action={
              <button type="button" className="btn btn--primary" onClick={openCreate}>
                Ajouter une note
              </button>
            }
          />
        }
      >
        <p className="f-count" id="n-count" tabIndex={-1}>
          {liste.length} {plural(liste.length, 'note enregistrée', 'notes enregistrées')}
        </p>
        <ul className="note-grid">
          {liste.map((n) => {
            const etudiant = fullName(n.etudiantPrenom, n.etudiantNom) || 'Étudiant inconnu';
            const theme = getCourseTheme({ code: n.coursCode, titre: n.coursNom });
            const ok = n.valeur >= 10;
            const Icon = ok ? CheckCircle2 : AlertTriangle;
            return (
              <li key={n.id}>
                <article className="card note-card" aria-label={`Note de ${etudiant}`}>
                  <div className="note-card__top">
                    <div>
                      <h3>{etudiant}</h3>
                      <p>{n.coursNom ?? 'Cours'}</p>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => openEdit(n)}
                      aria-label={`Modifier la note de ${etudiant}, ${formatNote(n.valeur)} sur 20${n.session ? `, session ${n.session}` : ''}`}
                    >
                      <Pencil className="icon" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="note-card__score">
                    <p className="note-card__value tnum">
                      {formatNote(n.valeur)}
                      <small>
                        {NB}/{NB}20
                      </small>
                    </p>
                    <span className={`badge badge--${ok ? 'success' : 'danger'}`}>
                      <Icon className="icon icon--sm" aria-hidden="true" />
                      {ok ? 'Réussi' : 'À améliorer'}
                    </span>
                  </div>
                  <div className="badge-row">
                    <CategoryBadge category={theme.category} />
                    {n.session && <span className="badge">{n.session}</span>}
                    {n.groupeNom && (
                      <span className="badge badge--secondary">
                        <Users className="icon icon--sm" aria-hidden="true" />
                        {n.groupeNom}
                      </span>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </PageState>

      <Modal
        open={dialog !== null}
        onClose={closeDialog}
        title={isEdit ? 'Modifier la note' : 'Ajouter une note'}
        footer={
          <>
            <button type="button" className="btn btn--secondary" data-dialog-close onClick={closeDialog} disabled={save.isPending}>
              Annuler
            </button>
            <button
              type="submit"
              form="note-form"
              className={`btn btn--primary${save.isPending ? ' is-loading' : ''}`}
              disabled={save.isPending}
              aria-busy={save.isPending}
            >
              {save.isPending && <span className="spinner" aria-hidden="true" />}
              <span className="btn-text">
                {save.isPending ? (isEdit ? 'Mise à jour…' : 'Ajout…') : isEdit ? 'Mettre à jour' : 'Ajouter la note'}
              </span>
            </button>
          </>
        }
      >
        <form id="note-form" onSubmit={handleSubmit} noValidate>
          <FormAlert id="note-summary">
            {serverError ? (
              <FormAlertMessage>{serverError}</FormAlertMessage>
            ) : (
              summary.length > 0 && (
                <FormAlertMessage>
                  {summary.length} {plural(summary.length, 'champ à corriger', 'champs à corriger')}&nbsp;: {summary.join(', ')}.
                </FormAlertMessage>
              )
            )}
          </FormAlert>
          <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
            {editNote && (
              <p className="dialog-context">
                <User className="icon icon--sm" aria-hidden="true" />{' '}
                <strong>{fullName(editNote.etudiantPrenom, editNote.etudiantNom)}</strong> · {editNote.coursNom ?? 'Cours'}
              </p>
            )}
            {!isEdit && (
              <>
                <SelectFormField
                  id="n-groupeId"
                  label="Groupe"
                  required
                  value={form.groupeId}
                  error={errors.groupeId}
                  onChange={(e) => onGroupeChange(e.target.value)}
                >
                  <option value="">Sélectionner un groupe</option>
                  {listeGroupes.map((g) => (
                    <option key={g.id} value={String(g.id)}>
                      {g.nom}
                    </option>
                  ))}
                </SelectFormField>
                <SelectFormField
                  id="n-coursId"
                  label="Cours"
                  required
                  value={form.coursId}
                  error={errors.coursId}
                  onChange={(e) => setField('coursId', e.target.value)}
                >
                  <option value="">Sélectionner un cours</option>
                  {coursOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectFormField>
                <SelectFormField
                  id="n-etudiantId"
                  label="Étudiant"
                  required
                  disabled={!groupe}
                  value={form.etudiantId}
                  error={errors.etudiantId}
                  onChange={(e) => setField('etudiantId', e.target.value)}
                >
                  <option value="">{groupe ? 'Sélectionner un étudiant' : "Sélectionnez d'abord un groupe"}</option>
                  {(groupe?.etudiants ?? []).map((e) => (
                    <option key={e.id} value={String(e.id)}>
                      {fullName(e.prenom, e.nom)}
                    </option>
                  ))}
                </SelectFormField>
              </>
            )}
            <FormField
              id="n-valeur"
              label="Note (/20)"
              type="number"
              required
              inputMode="decimal"
              min={0}
              max={20}
              step={0.5}
              value={form.valeur}
              error={errors.valeur}
              hint="Entre 0 et 20, par pas de 0,5."
              onChange={(e) => setField('valeur', e.target.value)}
            />
            <SelectFormField id="n-session" label="Session" value={form.session} onChange={(e) => setField('session', e.target.value)}>
              {sessionOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectFormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}

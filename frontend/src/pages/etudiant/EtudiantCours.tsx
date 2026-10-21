import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog, CoursCard, EmptyState, PageHeader, PageState, TabPanel, Tabs } from '@/components/shared';
import { useCoursDisponibles, useInscriptionActions, useInscriptions } from '@/hooks/use-etudiant-data';
import { formatDate, fullName, normalizeText } from '@/lib/text';
import type { CoursDisponible, InscriptionDetail } from '@/types/api';

const NB = ' ';
type Tab = 'mes' | 'inscrire';

function matches(query: string, ...fields: Array<string | null | undefined>) {
  const q = normalizeText(query.trim());
  return q === '' || normalizeText(fields.join(' ')).includes(q);
}

/** Cours de l'étudiant (maquette etudiant/cours.html) : « Mes cours » et « S'inscrire ». */
export default function EtudiantCours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'inscrire' ? 'inscrire' : 'mes';
  const setTab = (value: string) => setSearchParams(value === 'inscrire' ? { tab: 'inscrire' } : {}, { replace: true });

  const [q, setQ] = useState('');
  const [live, setLive] = useState('');
  const [inscrireCible, setInscrireCible] = useState<CoursDisponible | null>(null);
  const [annulerCible, setAnnulerCible] = useState<InscriptionDetail | null>(null);

  const inscriptions = useInscriptions();
  const disponibles = useCoursDisponibles();
  const { inscrire, annuler } = useInscriptionActions();

  // Une inscription annulée est définitive : elle n'apparaît plus ni dans « Mes cours » ni dans « S'inscrire ».
  const mine = (inscriptions.data ?? []).filter((i) => i.statut !== 'ANNULE');
  const mineFiltered = mine.filter((i) => matches(q, i.coursTitre, i.coursDescription, i.coursCode));
  const available = disponibles.data ?? [];
  const availableFiltered = available.filter((c) => matches(q, c.titre, c.description, c.code));

  const clearSearch = (
    <button type="button" className="btn btn--primary" onClick={() => setQ('')}>
      Effacer la recherche
    </button>
  );

  return (
    <div className="view">
      <PageHeader title="Mes cours" subtitle="Vos inscriptions et les cours auxquels vous pouvez vous inscrire." />

      <form
        className="toolbar"
        role="search"
        aria-label="Rechercher un cours"
        noValidate
        onSubmit={(e) => e.preventDefault()}
        style={{ marginBottom: 'var(--space-5)' }}
      >
        <div className="field">
          <label htmlFor="c-q" className="sr-only">
            Rechercher un cours
          </label>
          <div className="input-icon">
            <Search className="icon" aria-hidden="true" />
            <input
              className="input"
              id="c-q"
              type="search"
              placeholder="Rechercher un cours : titre, description ou code"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </form>

      <div>
        <Tabs
          label="Mes cours et inscription"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'mes', label: 'Mes cours ', count: mineFiltered.length },
            { id: 'inscrire', label: "S'inscrire ", count: availableFiltered.length },
          ]}
        />

        <TabPanel id="mes" active={tab === 'mes'}>
          <PageState
            isLoading={inscriptions.isLoading}
            isError={inscriptions.isError}
            onRetry={() => void inscriptions.refetch()}
            skeleton="cards"
            errorWhat="vos cours"
            isEmpty={mine.length === 0}
            empty={
              <EmptyState
                icon={BookOpen}
                title="Vous n'êtes inscrit à aucun cours"
                description="Parcourez les cours disponibles et demandez votre inscription."
                action={
                  <button type="button" className="btn btn--primary" onClick={() => setTab('inscrire')}>
                    Découvrir les cours disponibles
                  </button>
                }
              />
            }
          >
            {mineFiltered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Aucun cours ne correspond"
                description="Aucun de vos cours ne correspond à votre recherche."
                action={clearSearch}
              />
            ) : (
              <div className="cours-grid">
                {mineFiltered.map((i) => (
                  <CoursCard
                    key={i.inscriptionId}
                    code={i.coursCode}
                    titre={i.coursTitre}
                    description={i.coursDescription}
                    volumeHoraire={i.coursVolumeHoraire}
                    formateurNom={i.formateurNom}
                    formateurPrenom={i.formateurPrenom}
                    statut={i.statut}
                    footer={
                      i.statut === 'INSCRIT' ? (
                        <>
                          <span className="subtle text-small">Inscrit le {formatDate(i.dateInscription)}</span>
                          <button
                            type="button"
                            className="btn btn--secondary"
                            aria-label={`Annuler l'inscription à ${i.coursTitre}`}
                            onClick={() => setAnnulerCible(i)}
                          >
                            Annuler l'inscription
                          </button>
                        </>
                      ) : (
                        <span className="subtle text-small">En attente de validation par l'administration</span>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </PageState>
        </TabPanel>

        <TabPanel id="inscrire" active={tab === 'inscrire'}>
          <PageState
            isLoading={disponibles.isLoading}
            isError={disponibles.isError}
            onRetry={() => void disponibles.refetch()}
            skeleton="cards"
            errorWhat="les cours disponibles"
            isEmpty={available.length === 0}
            empty={
              <EmptyState
                icon={BookOpen}
                title="Aucun cours disponible pour le moment"
                description="Vous êtes déjà inscrit ou avez déjà fait une demande pour tous les cours du centre."
              />
            }
          >
            {availableFiltered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Aucun cours ne correspond à votre recherche"
                description="Essayez un autre mot-clé, un code de cours ou effacez la recherche."
                action={clearSearch}
              />
            ) : (
              <div className="cours-grid">
                {availableFiltered.map((c) => (
                  <CoursCard
                    key={c.coursId}
                    code={c.code}
                    titre={c.titre}
                    description={c.description}
                    volumeHoraire={c.volumeHoraire}
                    formateurNom={c.formateurNom}
                    formateurPrenom={c.formateurPrenom}
                    footer={
                      <>
                        <Link className="link-inline text-small" to={`/formations/${c.coursId}`}>
                          Voir la fiche
                        </Link>
                        <button
                          type="button"
                          className="btn btn--primary"
                          aria-label={`S'inscrire à ${c.titre}`}
                          onClick={() => setInscrireCible(c)}
                        >
                          S'inscrire
                        </button>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </PageState>
        </TabPanel>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {live}
      </p>

      <ConfirmDialog
        open={inscrireCible !== null}
        onOpenChange={(open) => {
          if (!open) setInscrireCible(null);
        }}
        title="Confirmer l'inscription"
        confirmLabel="Confirmer l'inscription"
        busyLabel="Inscription…"
        onConfirm={async () => {
          if (!inscrireCible) return;
          await inscrire.mutateAsync(inscrireCible.coursId);
          setLive(
            `Demande d'inscription envoyée pour ${inscrireCible.titre}. Elle apparaît dans Mes cours avec le statut En attente.`,
          );
        }}
      >
        {inscrireCible && (
          <>
            <p>
              <strong>{inscrireCible.titre}</strong>
            </p>
            {inscrireCible.description && <p>{inscrireCible.description}</p>}
            <dl className="dialog__facts">
              <div>
                <dt>Code</dt>
                <dd>{inscrireCible.code}</dd>
              </div>
              <div>
                <dt>Volume horaire</dt>
                <dd className="tnum">
                  {inscrireCible.volumeHoraire}
                  {NB}h
                </dd>
              </div>
              {fullName(inscrireCible.formateurPrenom, inscrireCible.formateurNom) && (
                <div>
                  <dt>Formateur</dt>
                  <dd>{fullName(inscrireCible.formateurPrenom, inscrireCible.formateurNom)}</dd>
                </div>
              )}
            </dl>
            <p className="text-small">
              Votre demande sera enregistrée avec le statut « En attente » jusqu'à sa validation par l'administration.
            </p>
          </>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={annulerCible !== null}
        onOpenChange={(open) => {
          if (!open) setAnnulerCible(null);
        }}
        title="Annuler l'inscription"
        destructive
        confirmLabel="Annuler l'inscription"
        cancelLabel="Conserver mon inscription"
        busyLabel="Annulation…"
        onConfirm={async () => {
          if (!annulerCible) return;
          await annuler.mutateAsync(annulerCible.inscriptionId);
          setLive(`Inscription annulée : ${annulerCible.coursTitre}.`);
        }}
      >
        {annulerCible && (
          <>
            <p>
              Vous allez annuler votre inscription à <strong>{annulerCible.coursTitre}</strong>.
            </p>
            <p className="text-small">
              Une fois annulée, il ne sera plus possible de vous réinscrire à ce cours depuis votre espace.
            </p>
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}

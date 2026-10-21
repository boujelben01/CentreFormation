// Thème visuel d'un cours : catégorie, photo et dégradé de repli.
// Mappage 100 % côté front (l'API ne fournit ni catégorie ni image), par mots-clés
// du titre puis de la description. Aucun cours inconnu n'est « deviné » : sans
// correspondance, il n'a ni catégorie ni photo et reçoit le dégradé neutre.

export type CategoryId = 'dev' | 'data' | 'design' | 'gestion' | 'langues' | 'reseaux';

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  dev: 'Développement',
  data: 'Data & IA',
  design: 'Design & UX',
  gestion: 'Gestion de projet',
  langues: 'Langues & communication',
  reseaux: 'Réseaux & sécurité',
};

/** Numéro du dégradé --course-N-a / --course-N-b associé à chaque catégorie. */
const CATEGORY_GRADIENT: Record<CategoryId, number> = {
  dev: 1,
  data: 2,
  langues: 3,
  gestion: 4,
  design: 5,
  reseaux: 6,
};

const NEUTRAL_GRADIENT = 6;

interface Visual {
  file: string;
  alt: string;
}

/** Photos de /public/images/formations (ratio 3:2). */
const VISUALS = {
  web: { file: '1.jpg', alt: 'Code source affiché sur un écran' },
  data: { file: '2.jpg', alt: "Tableau de bord statistique sur l'écran d'un ordinateur" },
  ia: { file: '3.jpg', alt: "Circuit électronique en forme de cerveau symbolisant l'intelligence artificielle" },
  design: { file: '4.jpg', alt: "Croquis de maquettes d'interface sur une table de travail" },
  agile: { file: '5.jpg', alt: 'Notes adhésives À faire, En cours, Terminé sur un tableau de projet' },
  compta: { file: '6.jpg', alt: 'Calculatrice, stylo et carnet posés sur un bureau' },
  anglais: { file: '7.jpg', alt: 'Réunion professionnelle dans une salle' },
  communication: { file: '8.jpg', alt: 'Carnet et stylo posés sur une table' },
  reseaux: { file: '9.jpg', alt: 'Panneau de brassage réseau et câbles' },
  securite: { file: '10.jpg', alt: 'Cadenas posé sur un clavier' },
} satisfies Record<string, Visual>;

type VisualKey = keyof typeof VISUALS;

interface Rule {
  pattern: RegExp;
  category: CategoryId;
  visual: VisualKey;
}

// L'ordre compte : la première règle qui correspond l'emporte.
const RULES: Rule[] = [
  { pattern: /securit|cryptograph|intrusion|pentest|cyber/, category: 'reseaux', visual: 'securite' },
  { pattern: /reseau|linux|virtualisation|cloud|docker|kubernetes|vlan|routage|tcp/, category: 'reseaux', visual: 'reseaux' },
  { pattern: /machine learning|deep learning|intelligence artificielle|apprentissage|neural|tensorflow/, category: 'data', visual: 'ia' },
  { pattern: /big data|donnees|\bsql\b|\bdata\b|statistique/, category: 'data', visual: 'data' },
  { pattern: /\bdesign\b|\bux\b|\bui\b|interface|maquet|multimedia|ergonomie|graphi/, category: 'design', visual: 'design' },
  { pattern: /agile|scrum|kanban|gestion de projet|management/, category: 'gestion', visual: 'agile' },
  { pattern: /comptab|financ/, category: 'gestion', visual: 'compta' },
  { pattern: /anglais|english/, category: 'langues', visual: 'anglais' },
  { pattern: /francais|communication|expression|redaction/, category: 'langues', visual: 'communication' },
  { pattern: /\bweb\b|java|programmation|developpement|algorithm|\buml\b|mobile|android|logiciel/, category: 'dev', visual: 'web' },
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export interface CourseTheme {
  category: CategoryId | null;
  categoryLabel: string | null;
  /** Chemin public de la photo, ou null (le visuel de repli prend le relais). */
  image: string | null;
  imageAlt: string;
  /** Numéro N du dégradé de repli --course-N-a / --course-N-b. */
  gradient: number;
}

interface CourseLike {
  code?: string | null;
  titre?: string | null;
  description?: string | null;
}

export function getCourseTheme(course: CourseLike): CourseTheme {
  const title = normalize(`${course.titre ?? ''}`);
  const description = normalize(`${course.description ?? ''}`);

  const rule =
    RULES.find((r) => r.pattern.test(title)) ?? RULES.find((r) => r.pattern.test(description));

  if (!rule) {
    return { category: null, categoryLabel: null, image: null, imageAlt: '', gradient: NEUTRAL_GRADIENT };
  }

  const visual = VISUALS[rule.visual];
  return {
    category: rule.category,
    categoryLabel: CATEGORY_LABELS[rule.category],
    image: `/images/formations/${visual.file}`,
    imageAlt: visual.alt,
    gradient: CATEGORY_GRADIENT[rule.category],
  };
}

/** Thème d'une catégorie seule (tuile de domaine) : dégradé et motif, sans photo. */
export function getCategoryTheme(category: CategoryId): CourseTheme {
  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    image: null,
    imageAlt: '',
    gradient: CATEGORY_GRADIENT[category],
  };
}

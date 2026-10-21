import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  CalendarDays,
  Clipboard,
  LayoutDashboard,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Correspondance exacte du chemin (tableau de bord). */
  end?: boolean;
}

interface RoleShell {
  /** Libellé de l'espace (fil d'Ariane, aria-label de la navigation). */
  space: string;
  home: string;
  items: NavItem[];
  /** Pages hors sidebar (cloche, menu avatar) : titre pour le fil d'Ariane et l'onglet. */
  extraTitles: Record<string, string>;
  /** Titres de page de la maquette quand ils diffèrent du libellé du menu (ex. « Mes cours »). */
  pageTitles: Record<string, string>;
}

export const ROLE_SHELL: Record<UserRole, RoleShell> = {
  ETUDIANT: {
    space: 'Espace étudiant',
    home: '/etudiant',
    items: [
      { label: 'Tableau de bord', to: '/etudiant', icon: LayoutDashboard, end: true },
      { label: 'Emploi du temps', to: '/etudiant/planning', icon: CalendarDays },
      { label: 'Notes', to: '/etudiant/notes', icon: Award },
      { label: 'Cours', to: '/etudiant/cours', icon: BookOpen },
      { label: 'Catalogue', to: '/etudiant/catalogue', icon: Search },
      { label: 'Formateurs', to: '/etudiant/formateurs', icon: UserCheck },
    ],
    extraTitles: {
      '/etudiant/notifications': 'Notifications',
      '/etudiant/profile': 'Mon profil',
    },
    pageTitles: {
      '/etudiant/cours': 'Mes cours',
      '/etudiant/notes': 'Mes notes',
      '/etudiant/catalogue': 'Catalogue des formations',
    },
  },
  FORMATEUR: {
    space: 'Espace formateur',
    home: '/formateur',
    items: [
      { label: 'Tableau de bord', to: '/formateur', icon: LayoutDashboard, end: true },
      { label: 'Groupes', to: '/formateur/groupes', icon: Users },
      { label: 'Séances', to: '/formateur/seances', icon: Clipboard },
      { label: 'Emploi du temps', to: '/formateur/planning', icon: CalendarDays },
      { label: 'Notes', to: '/formateur/notes', icon: Award },
    ],
    extraTitles: {
      '/formateur/notifications': 'Notifications',
      '/formateur/profile': 'Mon profil',
    },
    pageTitles: {},
  },
};

/** Titre de la page courante (hors tableau de bord, où il vaut null) ; « Page introuvable » pour un chemin inconnu de l'espace. */
export function pageTitleFor(role: UserRole, pathname: string): string | null {
  const shell = ROLE_SHELL[role];
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === shell.home) return null;
  const fromNav = shell.items.find((item) => item.to === path);
  return shell.pageTitles[path] ?? fromNav?.label ?? shell.extraTitles[path] ?? 'Page introuvable';
}

// Lien « Voir le site public » : VITE_PUBLIC_SITE_URL si défini (site hébergé ailleurs), sinon le site public de cette application.
export const PUBLIC_SITE_URL: string = import.meta.env.VITE_PUBLIC_SITE_URL?.trim() || '/';

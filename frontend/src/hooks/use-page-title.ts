import { useEffect } from 'react';

/** Titre de l'onglet : « {titre} — EduPortal » (ou « EduPortal » seul si `title` est vide). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — EduPortal` : 'EduPortal';
  }, [title]);
}

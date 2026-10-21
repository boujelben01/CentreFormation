import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { CourseTheme } from '@/lib/courseTheme';

interface CourseVisualProps {
  theme: CourseTheme;
  className?: string;
  /** Éléments posés sur le visuel (badges superposés de la carte de formation). */
  children?: ReactNode;
  /** Valeur stable (code du cours) : varie le cadrage de la photo pour que deux cours au même thème ne se ressemblent pas. */
  seed?: string;
}

/** Cadrage 0 à 3 déterministe (hachage djb2) : même cours, même cadrage. */
function cropOf(seed?: string): number | undefined {
  if (!seed) return undefined;
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % 4;
}

/**
 * Visuel d'un cours (composants « visual-frame » et « course-visual » de la maquette), ratio 3:2 :
 * l'illustration SVG du thème est TOUJOURS rendue (fond et repli) ; la photo, si elle existe, la recouvre.
 * Photo absente ou introuvable : elle est retirée et l'illustration reste visible (aucune icône cassée).
 */
export function CourseVisual({ theme, className, children, seed }: CourseVisualProps) {
  const [failed, setFailed] = useState(false);
  const n = theme.gradient;

  return (
    <div className={cn('visual-frame', className)} data-crop={cropOf(seed)}>
      <svg
        className="course-visual"
        viewBox="0 0 320 180"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="320" height="180" fill={`url(#cg${n})`} />
        <rect width="320" height="180" fill="url(#dots)" />
        <use href={`#motif-${n}`} />
      </svg>
      {theme.image && !failed && (
        <img
          className="course-photo"
          src={theme.image}
          alt={theme.imageAlt}
          width={1000}
          height={667}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </div>
  );
}
